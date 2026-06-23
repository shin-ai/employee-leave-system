"use client";

import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/shared/PageHeader";
import { LeaveRequestTable } from "@/components/leave/LeaveRequestTable";
import { LeaveStatusFilter } from "@/components/leave/LeaveStatusFilter";
import { LeaveRequestFormDialog } from "@/components/leave/LeaveRequestFormDialog";
import { useLeaveRequests } from "@/hooks/use-leave-requests";
import { useAppStore } from "@/store/app-store";
import { LEAVE_STATUS } from "@/types/leave-request";
import {
  CalendarPlus,
  List,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect, useMemo } from "react";
import type { Employee } from "@/types/employee";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isWithinInterval,
  parseISO,
} from "date-fns";

type ViewMode = "list" | "calendar";

export default function LeavePage() {
  const {
    leaveRequests,
    statusFilter,
    setStatusFilter,
    approveRequest,
    rejectRequest,
    cancelRequest,
    isLoading,
    refreshRequests,
  } = useLeaveRequests();

  const { user, isAdmin } = useAuth();

  const store = useAppStore();
  const employees = store.employees;
  const [createOpen, setCreateOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [currentDate, setCurrentDate] = useState(new Date());

  const handleApprove = async (id: string, feedback?: string) => {
    const result = await approveRequest(id, feedback);
    if (result) {
      toast.success("Leave request approved");
    } else {
      toast.error("Failed to approve request");
    }
  };

  const handleReject = async (id: string, feedback?: string) => {
    const result = await rejectRequest(id, feedback);
    if (result) {
      toast.success("Leave request rejected");
    } else {
      toast.error("Failed to reject request");
    }
  };

  const handleCancel = async (id: string) => {
    if (!user) return;
    const result = await cancelRequest(id, user.userId);
    if (result) {
      toast.success("Leave request cancelled");
    } else {
      toast.error("Failed to cancel request");
    }
  };

  // ── Calendar logic ──
  const displayLeaves = useMemo(() => {
    return leaveRequests.filter(
      (req) => req.status !== LEAVE_STATUS.CANCELLED
    );
  }, [leaveRequests]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calStartDate = startOfWeek(monthStart);
  const calEndDate = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calStartDate, end: calEndDate });

  const getLeavesForDay = (day: Date) => {
    return displayLeaves.filter((leave) => {
      const start = parseISO(leave.startDate);
      const end = parseISO(leave.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return isWithinInterval(day, { start, end });
    });
  };

  const getEmployeeName = (id: string) => {
    return employees.find((e) => e.id === id)?.name || "Unknown";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case LEAVE_STATUS.APPROVED:
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
      case LEAVE_STATUS.PENDING:
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border-amber-200 dark:border-amber-800";
      case LEAVE_STATUS.REJECTED:
        return "bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300 border-rose-200 dark:border-rose-800";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700";
    }
  };

  return (
    <>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Leave Requests
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage employee leave requests
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center rounded-lg border bg-muted p-0.5">
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-all sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-sm ${
                viewMode === "list"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              List
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-all sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-sm ${
                viewMode === "calendar"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <CalendarIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Calendar
            </button>
          </div>
          <Button
            className="gap-2"
            size="sm"
            onClick={() => setCreateOpen(true)}
          >
            <CalendarPlus className="h-4 w-4" />
            <span className="hidden sm:inline">New Leave Request</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>
      </div>

      {/* ── List View ── */}
      {viewMode === "list" && (
        <>
          <div className="mb-4">
            <LeaveStatusFilter
              value={statusFilter}
              onChange={setStatusFilter}
            />
          </div>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : (
            <LeaveRequestTable
              leaveRequests={leaveRequests}
              employees={employees}
              onApprove={handleApprove}
              onReject={handleReject}
              onCancel={handleCancel}
            />
          )}
        </>
      )}

      {/* ── Calendar View ── */}
      {viewMode === "calendar" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-4">
            <CardTitle className="text-base font-bold sm:text-xl">
              {format(currentDate, "MMMM yyyy")}
            </CardTitle>
            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 sm:h-9 sm:w-9"
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 sm:h-9 sm:w-9"
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-px rounded-lg bg-border overflow-hidden">
              {[
                { short: "S", full: "Sun" },
                { short: "M", full: "Mon" },
                { short: "T", full: "Tue" },
                { short: "W", full: "Wed" },
                { short: "T", full: "Thu" },
                { short: "F", full: "Fri" },
                { short: "S", full: "Sat" },
              ].map((day, idx) => (
                  <div
                    key={idx}
                    className="bg-muted p-1.5 text-center text-xs font-medium sm:p-2 sm:text-sm"
                  >
                    <span className="sm:hidden">{day.short}</span>
                    <span className="hidden sm:inline">{day.full}</span>
                  </div>
                )
              )}

              {days.map((day) => {
                const dayLeaves = getLeavesForDay(day);
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isToday = isSameDay(day, new Date());

                return (
                  <div
                    key={day.toString()}
                    className={`min-h-[72px] bg-background p-1 transition-colors sm:min-h-[120px] sm:p-2 ${
                      !isCurrentMonth
                        ? "bg-muted/30 text-muted-foreground/50"
                        : ""
                    } ${
                      isToday
                        ? "bg-primary/5 ring-1 ring-inset ring-primary"
                        : ""
                    }`}
                  >
                    <div
                      className={`text-right text-sm font-semibold mb-1.5 ${
                        isToday ? "text-primary" : ""
                      }`}
                    >
                      {format(day, "d")}
                    </div>
                    <div className="flex flex-col gap-1 overflow-y-auto max-h-[80px] pr-0.5">
                      {dayLeaves.map((leave) => (
                        <div
                          key={leave.id}
                          className={`truncate rounded-md border px-1.5 py-0.5 text-[11px] font-medium shadow-sm transition-transform hover:scale-[1.02] cursor-default ${getStatusColor(
                            leave.status
                          )}`}
                          title={`${getEmployeeName(leave.employeeId)} - ${
                            leave.type
                          } (${leave.status})`}
                        >
                          <span className="opacity-75 mr-0.5 font-normal uppercase text-[9px] tracking-wider hidden sm:inline">
                            {leave.status.charAt(0)}
                          </span>
                          {getEmployeeName(leave.employeeId)}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* New Leave Request Dialog */}
      {user && (
        <LeaveRequestFormDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          loggedInUser={user}
          isAdmin={isAdmin}
          onSave={refreshRequests}
        />
      )}
    </>
  );
}
