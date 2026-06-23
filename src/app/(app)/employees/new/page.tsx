"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { PageHeader } from "@/components/shared/PageHeader";
import { EmployeeForm } from "@/components/employee/EmployeeForm";
import { EmployeeStorageService } from "@/services/employee-storage";
import type { EmployeeSchemaType } from "@/validators/employee-validator";
import { ROUTES } from "@/constants";
import { toast } from "sonner";

export default function NewEmployeePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: EmployeeSchemaType) => {
    setIsSubmitting(true);
    try {
      await EmployeeStorageService.createEmployee(data);
      toast.success("Employee created successfully");
      router.push(ROUTES.EMPLOYEES);
    } catch {
      toast.error("Failed to create employee");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader title="Add New Employee" />
      <EmployeeForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </>
  );
}
