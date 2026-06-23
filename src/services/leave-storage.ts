import { supabase } from "@/lib/supabase";
import type { LeaveRequest, LeaveStatus } from "@/types/leave-request";
import { LEAVE_STATUS, LEAVE_TYPES } from "@/types/leave-request";
import type { LeaveRequestSchemaType } from "@/validators/leave-request-validator";
import { EmployeeStorageService } from "./employee-storage";
import { parseISO, isWeekend, eachDayOfInterval, format } from "date-fns";

const PUBLIC_HOLIDAYS = [
  "2026-01-01", "2026-08-17", "2026-12-25",
];

function mapRow(row: Record<string, unknown>): LeaveRequest {
  const lr: LeaveRequest = {
    id: row.id as string,
    employeeId: row.employee_id as string,
    type: row.type as LeaveRequest["type"],
    startDate: row.start_date as string,
    endDate: row.end_date as string,
    durationDays: row.duration_days as number,
    reason: row.reason as string,
    status: row.status as LeaveRequest["status"],
    createdAt: row.created_at as string,
  };
  if (row.approved_by) lr.approvedBy = row.approved_by as string;
  if (row.approved_at) lr.approvedAt = row.approved_at as string;
  if (row.approver_feedback) lr.approverFeedback = row.approver_feedback as string;
  if (row.requested_approver_id) lr.requestedApproverId = row.requested_approver_id as string;
  if (row.attachment_name) {
    lr.attachment = {
      name: row.attachment_name as string,
      url: row.attachment_url as string,
      size: row.attachment_size as number,
    };
  }
  return lr;
}

export const LeaveStorageService = {
  async getLeaveRequests(): Promise<LeaveRequest[]> {
    const { data, error } = await supabase
      .from("leave_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Error fetching leave requests:", error);
      return [];
    }
    return (data || []).map(mapRow);
  },

  calculateDuration(startDate: string, endDate: string): number {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    if (end < start) return 0;
    const daysInInterval = eachDayOfInterval({ start, end });
    let duration = 0;
    daysInInterval.forEach((day) => {
      if (isWeekend(day)) return;
      const dateString = format(day, "yyyy-MM-dd");
      if (PUBLIC_HOLIDAYS.includes(dateString)) return;
      duration++;
    });
    return duration;
  },

  async createLeaveRequest(data: LeaveRequestSchemaType): Promise<LeaveRequest> {
    // Check overlap
    const { data: existing } = await supabase
      .from("leave_requests")
      .select("id, start_date, end_date")
      .eq("employee_id", data.employeeId)
      .not("status", "in", "(REJECTED,CANCELLED)");

    if (existing) {
      const newStart = parseISO(data.startDate);
      const newEnd = parseISO(data.endDate);
      const overlap = existing.some((req) => {
        const s = parseISO(req.start_date as string);
        const e = parseISO(req.end_date as string);
        return newStart <= e && newEnd >= s;
      });
      if (overlap) {
        throw new Error("You already have an active leave request during this period.");
      }
    }

    const durationDays = this.calculateDuration(data.startDate, data.endDate);

    const { data: row, error } = await supabase
      .from("leave_requests")
      .insert({
        employee_id: data.employeeId,
        type: data.type,
        start_date: data.startDate,
        end_date: data.endDate,
        duration_days: durationDays,
        reason: data.reason,
        status: LEAVE_STATUS.PENDING,
        requested_approver_id: data.approverId || null,
      })
      .select()
      .single();

    if (error || !row) {
      throw new Error(error?.message || "Failed to create leave request");
    }
    return mapRow(row);
  },

  async updateLeaveStatus(
    id: string,
    status: LeaveStatus,
    adminId?: string,
    feedback?: string
  ): Promise<boolean> {
    // Get the current request
    const { data: reqRow } = await supabase
      .from("leave_requests")
      .select("*")
      .eq("id", id)
      .single();
    if (!reqRow) return false;

    const request = mapRow(reqRow);

    // Handle balance deduction/refund for ANNUAL leave
    if (status === LEAVE_STATUS.APPROVED && request.status !== LEAVE_STATUS.APPROVED) {
      if (request.type === LEAVE_TYPES.ANNUAL) {
        const employee = await EmployeeStorageService.getEmployeeById(request.employeeId);
        if (employee) {
          if (employee.leaveBalance < request.durationDays) return false;
          await EmployeeStorageService.updateEmployee(employee.id, {
            leaveBalance: employee.leaveBalance - request.durationDays,
          });
        }
      }
    }

    if (request.status === LEAVE_STATUS.APPROVED && status !== LEAVE_STATUS.APPROVED) {
      if (request.type === LEAVE_TYPES.ANNUAL) {
        const employee = await EmployeeStorageService.getEmployeeById(request.employeeId);
        if (employee) {
          await EmployeeStorageService.updateEmployee(employee.id, {
            leaveBalance: employee.leaveBalance + request.durationDays,
          });
        }
      }
    }

    const updateData: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (adminId) updateData.approved_by = adminId;
    if (status === LEAVE_STATUS.APPROVED || status === LEAVE_STATUS.REJECTED) {
      updateData.approved_at = new Date().toISOString();
    }
    if (feedback) updateData.approver_feedback = feedback;

    const { error } = await supabase
      .from("leave_requests")
      .update(updateData)
      .eq("id", id);

    if (error) {
      console.error("Error updating leave status:", error);
      return false;
    }
    return true;
  },

  async deleteLeavesByEmployeeId(employeeId: string): Promise<void> {
    await supabase
      .from("leave_requests")
      .delete()
      .eq("employee_id", employeeId);
  },
};
