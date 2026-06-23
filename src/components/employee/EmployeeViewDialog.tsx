"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LeaveStorageService } from "@/services/leave-storage";
import type { Employee } from "@/types/employee";
import type { LeaveRequest } from "@/types/leave-request";
import { User, Mail, Calendar, Briefcase, Users, FileText } from "lucide-react";
import { format, parseISO } from "date-fns";

interface EmployeeViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
}

export function EmployeeViewDialog({
  open,
  onOpenChange,
  employee,
}: EmployeeViewDialogProps) {
  const [leaveHistory, setLeaveHistory] = useState<LeaveRequest[]>([]);

  useEffect(() => {
    if (open && employee) {
      const loadLeaves = async () => {
        const allLeaves = await LeaveStorageService.getLeaveRequests();
        const employeeLeaves = allLeaves
          .filter((leave) => leave.employeeId === employee.id)
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        setLeaveHistory(employeeLeaves);
      };
      loadLeaves();
    }
  }, [open, employee]);

  if (!employee) return null;

  const initial = employee.name.charAt(0).toUpperCase();
  const maxLeave = 12;
  const usedLeave = maxLeave - employee.leaveBalance;
  const leavePercent = Math.max(0, Math.min(100, (employee.leaveBalance / maxLeave) * 100));

  // SVG circle calculations
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (leavePercent / 100) * circumference;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Employee Profile</DialogTitle>
        </DialogHeader>
        <div className="max-h-[80vh] overflow-y-auto space-y-6 pr-1">
          {/* Header Section */}
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <span className="text-2xl font-bold">{initial}</span>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-xl font-semibold truncate">{employee.name}</h3>
              <p className="text-sm text-muted-foreground">
                {employee.position} — {employee.team}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant={employee.role === "ADMIN" ? "default" : "secondary"}>
                  {employee.role === "ADMIN" ? "Admin" : "Employee"}
                </Badge>
                <Badge variant={employee.status === "ACTIVE" ? "outline" : "destructive"}>
                  {employee.status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-2 rounded-lg border p-3">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium truncate">{employee.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg border p-3">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Join Date</p>
                <p className="text-sm font-medium">
                  {format(parseISO(employee.joinDate), "dd MMM yyyy")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg border p-3">
              <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Position</p>
                <p className="text-sm font-medium">{employee.position}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg border p-3">
              <Users className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Team</p>
                <p className="text-sm font-medium">{employee.team}</p>
              </div>
            </div>
          </div>

          {/* Leave Balance */}
          <div className="rounded-lg border p-4">
            <h4 className="text-sm font-semibold mb-3">Leave Balance</h4>
            <div className="flex items-center gap-6">
              <div className="relative h-24 w-24 shrink-0">
                <svg className="h-24 w-24 -rotate-90" viewBox="0 0 80 80">
                  <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    className="text-muted/30"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="text-primary transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold">{employee.leaveBalance}</span>
                </div>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Total Allocation</span>
                  <span className="font-medium">{maxLeave} days</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Used</span>
                  <span className="font-medium">{usedLeave} days</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Remaining</span>
                  <span className="font-medium text-primary">
                    {employee.leaveBalance} days
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Leave History */}
          <div className="rounded-lg border p-4">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Leave History
            </h4>
            {leaveHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calendar className="h-10 w-10 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">
                  No leave history found.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {leaveHistory.map((leave) => (
                  <div
                    key={leave.id}
                    className="flex items-center justify-between gap-3 rounded-md border p-3 text-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{leave.type}</span>
                        <StatusBadge status={leave.status} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(parseISO(leave.startDate), "dd MMM yyyy")} —{" "}
                        {format(parseISO(leave.endDate), "dd MMM yyyy")}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-semibold">{leave.durationDays}</span>
                      <span className="text-xs text-muted-foreground ml-1">
                        {leave.durationDays === 1 ? "day" : "days"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
