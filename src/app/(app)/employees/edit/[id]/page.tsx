"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";

import { PageHeader } from "@/components/shared/PageHeader";
import { EmployeeForm } from "@/components/employee/EmployeeForm";
import { EmployeeStorageService } from "@/services/employee-storage";
import type { EmployeeSchemaType } from "@/validators/employee-validator";
import type { Employee } from "@/types/employee";
import { ROUTES } from "@/constants";
import { toast } from "sonner";

export default function EditEmployeePage(
  props: { params: Promise<{ id: string }> }
) {
  const { id } = use(props.params);
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadEmployee = async () => {
      const emp = await EmployeeStorageService.getEmployeeById(id);
      if (emp) {
        setEmployee(emp);
      } else {
        toast.error("Employee not found");
        router.replace(ROUTES.EMPLOYEES);
      }
      setIsLoading(false);
    };
    loadEmployee();
  }, [id, router]);

  const handleSubmit = async (data: EmployeeSchemaType) => {
    setIsSubmitting(true);
    try {
      await EmployeeStorageService.updateEmployee(id, data);
      toast.success("Employee updated successfully");
      router.push(ROUTES.EMPLOYEES);
    } catch {
      toast.error("Failed to update employee");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!employee) return null;

  return (
    <>
      <PageHeader title="Edit Employee" />
        <EmployeeForm
          defaultValues={{
            name: employee.name,
            team: employee.team,
            position: employee.position,
          }}
          isEditing
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
    </>
  );
}
