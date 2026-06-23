"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmployeeStorageService } from "@/services/employee-storage";
import { LeaveStorageService } from "@/services/leave-storage";
import type { Employee } from "@/types/employee";
import type { LeaveRequest } from "@/types/leave-request";
import { User, Mail, Briefcase, CalendarDays, Key, ArrowLeft, CalendarOff } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants";

export default function EmployeeProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [leaveHistory, setLeaveHistory] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const loadData = async () => {
        const emp = await EmployeeStorageService.getEmployeeById(id);
        if (emp) {
          setEmployee(emp);
          const allLeaves = await LeaveStorageService.getLeaveRequests();
          const leaves = allLeaves
            .filter((req) => req.employeeId === id)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setLeaveHistory(leaves);
        } else {
          router.push(ROUTES.EMPLOYEES);
        }
        setIsLoading(false);
      };
      loadData();
    }
  }, [id, router]);

  if (isLoading || !employee) return null;

  return (
    <>
      <div className="mb-4">
          <Button variant="ghost" onClick={() => router.push(ROUTES.EMPLOYEES)} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Employees
          </Button>
        </div>
        <PageHeader title={`${employee.name}'s Profile`} description="View employee details and leave history" />
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Personal Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{employee.name}</h3>
                  <p className="text-muted-foreground">{employee.position} — {employee.team}</p>
                </div>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    Email
                  </div>
                  <p className="font-medium">{employee.email}</p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Key className="h-4 w-4" />
                    Role
                  </div>
                  <p className="font-medium">{employee.role}</p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Briefcase className="h-4 w-4" />
                    Tim
                  </div>
                  <p className="font-medium">{employee.team}</p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays className="h-4 w-4" />
                    Join Date
                  </div>
                  <p className="font-medium">{employee.joinDate}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Leave Balance</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-8 border-primary/20">
                <div className="absolute inset-0 rounded-full border-8 border-primary border-t-transparent" style={{ transform: `rotate(${(employee.leaveBalance / 12) * 360}deg)` }} />
                <div className="text-center">
                  <span className="text-3xl font-bold">{employee.leaveBalance}</span>
                  <p className="text-xs text-muted-foreground">Days Left</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Leave History</CardTitle>
          </CardHeader>
          <CardContent>
            {leaveHistory.length > 0 ? (
              <div className="space-y-4">
                {leaveHistory.map((leave) => (
                  <div key={leave.id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 last:border-0 last:pb-0 gap-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <CalendarDays className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium">{leave.type} Leave</p>
                        <p className="text-sm text-muted-foreground">
                          {leave.startDate} to {leave.endDate} ({leave.durationDays} days)
                        </p>
                        {leave.reason && (
                          <p className="text-sm italic mt-1 text-muted-foreground">"{leave.reason}"</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col sm:items-end gap-2">
                      <StatusBadge status={leave.status} />
                      <span className="text-xs text-muted-foreground">
                        Submitted: {new Date(leave.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-[200px] flex-col items-center justify-center text-muted-foreground">
                <CalendarOff className="mb-2 h-8 w-8 opacity-20" />
                <p>No leave history found for this employee.</p>
              </div>
            )}
          </CardContent>
      </Card>
    </>
  );
}
