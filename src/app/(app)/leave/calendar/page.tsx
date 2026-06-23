"use client";

import { useState, useEffect } from "react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLeaveRequests } from "@/hooks/use-leave-requests";
import { EmployeeStorageService } from "@/services/employee-storage";
import { LEAVE_STATUS } from "@/types/leave-request";
import type { Employee } from "@/types/employee";
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
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

export default function CalendarPage() {
  const { leaveRequests } = useLeaveRequests();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    const loadEmployees = async () => {
      const data = await EmployeeStorageService.getEmployees();
      setEmployees(data);
    };
    loadEmployees();
  }, []);
  
  // Show all leaves except maybe cancelled, or show all to be safe
  const displayLeaves = leaveRequests.filter(req => req.status !== LEAVE_STATUS.CANCELLED);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const dateFormat = "d";
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const getLeavesForDay = (day: Date) => {
    return displayLeaves.filter((leave) => {
      const start = parseISO(leave.startDate);
      const end = parseISO(leave.endDate);
      // Set hours to 0 to compare just dates properly
      start.setHours(0,0,0,0);
      end.setHours(23,59,59,999);
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
      <PageHeader 
          title="Leave Calendar" 
          description="Visual overview of all employee leave schedules" 
          actionLabel="View as List"
          actionHref="/leave"
          actionIcon={CalendarIcon}
        />

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-xl font-bold">
              {format(currentDate, "MMMM yyyy")}
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-px rounded-lg bg-border overflow-hidden">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="bg-muted p-2 text-center text-sm font-medium">
                  {day}
                </div>
              ))}
              
              {days.map((day, dayIdx) => {
                const dayLeaves = getLeavesForDay(day);
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isToday = isSameDay(day, new Date());

                return (
                    <div
                      key={day.toString()}
                      className={`min-h-[140px] bg-background p-2 transition-colors border-b border-r last:border-r-0 ${
                        !isCurrentMonth ? "bg-muted/30 text-muted-foreground/50" : ""
                      } ${isToday ? "bg-primary/5 ring-1 ring-inset ring-primary" : ""}`}
                    >
                      <div className={`text-right text-sm font-semibold mb-2 ${isToday ? "text-primary" : ""}`}>
                        {format(day, dateFormat)}
                      </div>
                    <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[100px] pr-1 custom-scrollbar">
                      {dayLeaves.map((leave) => (
                        <div
                          key={leave.id}
                          className={`truncate rounded-md border px-2 py-1 text-xs font-medium shadow-sm transition-transform hover:scale-[1.02] cursor-default ${getStatusColor(leave.status)}`}
                          title={`${getEmployeeName(leave.employeeId)} - ${leave.type} (${leave.status})`}
                        >
                          <span className="opacity-75 mr-1 font-normal uppercase text-[10px] tracking-wider hidden sm:inline">
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
    </>
  );
}
