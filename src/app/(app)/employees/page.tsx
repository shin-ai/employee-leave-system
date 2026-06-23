"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchInput } from "@/components/shared/SearchInput";
import { EmployeeTable } from "@/components/employee/EmployeeTable";
import { EmployeeFormDialog } from "@/components/employee/EmployeeFormDialog";
import { useEmployees } from "@/hooks/use-employees";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function EmployeesPage() {
  const {
    employees,
    searchQuery,
    setSearchQuery,
    deleteEmployee,
    isLoading,
    refreshEmployees,
  } = useEmployees();

  const [createOpen, setCreateOpen] = useState(false);

  const handleDelete = async (id: string) => {
    const success = await deleteEmployee(id);
    if (success) {
      toast.success("Employee deleted successfully");
    } else {
      toast.error("Failed to delete employee");
    }
  };

  return (
    <>
      <PageHeader
          title="Employees"
          description="Manage your employee records"
          actionLabel="Add Employee"
          actionOnClick={() => setCreateOpen(true)}
          actionIcon={UserPlus}
        />
        <div className="mb-4">
          <SearchInput
            placeholder="Search employees by name..."
            value={searchQuery}
            onChange={setSearchQuery}
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
          <EmployeeTable
            employees={employees}
            onDelete={handleDelete}
            onRefresh={refreshEmployees}
          />
        )}

        <EmployeeFormDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          onSave={refreshEmployees}
        />
    </>
  );
}
