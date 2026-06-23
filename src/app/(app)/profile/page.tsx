"use client";

import { useEffect, useState } from "react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { EmployeeStorageService } from "@/services/employee-storage";
import type { Employee } from "@/types/employee";
import { User, Mail, Briefcase, CalendarDays, Key, Download, Upload, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRef } from "react";
import { STORAGE_KEYS } from "@/constants";

export default function ProfilePage() {
  const { user, isAdmin } = useAuth();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.userId) {
      const loadEmployee = async () => {
        const emp = await EmployeeStorageService.getEmployeeById(user.userId);
        setEmployee(emp);
      };
      loadEmployee();
    }
  }, [user]);

  if (!employee) return null;

  const handleExport = () => {
    const data = {
      [STORAGE_KEYS.EMPLOYEES]: localStorage.getItem(STORAGE_KEYS.EMPLOYEES),
      [STORAGE_KEYS.LEAVE_REQUESTS]: localStorage.getItem(STORAGE_KEYS.LEAVE_REQUESTS),
      [STORAGE_KEYS.ACTIVITY_LOGS]: localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOGS),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leave-sys-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Data exported successfully");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content);
        
        if (data[STORAGE_KEYS.EMPLOYEES]) localStorage.setItem(STORAGE_KEYS.EMPLOYEES, data[STORAGE_KEYS.EMPLOYEES]);
        if (data[STORAGE_KEYS.LEAVE_REQUESTS]) localStorage.setItem(STORAGE_KEYS.LEAVE_REQUESTS, data[STORAGE_KEYS.LEAVE_REQUESTS]);
        if (data[STORAGE_KEYS.ACTIVITY_LOGS]) localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, data[STORAGE_KEYS.ACTIVITY_LOGS]);
        
        toast.success("Data imported successfully. Reloading...");
        setTimeout(() => window.location.reload(), 1000);
      } catch (error) {
        toast.error("Failed to import data. Invalid file format.");
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsText(file);
  };

  return (
    <>
      <PageHeader title="My Profile" description="View your personal information and leave balance" />
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Personal Details</CardTitle>
              <CardDescription>Your current details</CardDescription>
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
              <p className="mt-6 text-center text-sm text-muted-foreground">
                Your annual leave quota refreshes every year. Unused leaves do not carry over.
              </p>
            </CardContent>
          </Card>
        </div>

        {isAdmin && (
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Data Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Backup & Restore</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Export all system data to a JSON file or restore from a previous backup.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Button variant="outline" onClick={handleExport} className="flex-1 sm:flex-none gap-2">
                      <Download className="h-4 w-4" />
                      Export
                    </Button>
                    <div>
                      <input
                        type="file"
                        accept=".json"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleImport}
                      />
                      <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full sm:w-auto gap-2">
                        <Upload className="h-4 w-4" />
                        Import
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
    </>
  );
}
