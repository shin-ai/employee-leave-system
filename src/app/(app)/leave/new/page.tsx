"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { PageHeader } from "@/components/shared/PageHeader";
import { LeaveRequestForm } from "@/components/leave/LeaveRequestForm";
import { LeaveStorageService } from "@/services/leave-storage";
import { EmployeeStorageService } from "@/services/employee-storage";
import type { LeaveRequestSchemaType } from "@/validators/leave-request-validator";
import type { Employee } from "@/types/employee";
import type { AuthSession } from "@/types/auth";
import { ROUTES } from "@/constants";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

export default function NewLeavePage() {
  const router = useRouter();
  const { user, isAdmin, isLoading: isAuthLoading } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadEmployees = async () => {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      const data = await EmployeeStorageService.getEmployees();
      setEmployees(data);
      setIsLoaded(true);
    };
    loadEmployees();
  }, []);

  const handleSubmit = (data: LeaveRequestSchemaType) => {
    setIsSubmitting(true);
    try {
      LeaveStorageService.createLeaveRequest(data);
      toast.success("Leave request submitted successfully");
      router.push(ROUTES.LEAVE);
    } catch {
      toast.error("Gagal mengajukan cuti. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader title="New Leave Request" />
        {(isLoaded && !isAuthLoading && user) && (
          <LeaveRequestForm
            employees={employees}
            loggedInUser={user}
            isAdmin={isAdmin}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )}
    </>
  );
}
