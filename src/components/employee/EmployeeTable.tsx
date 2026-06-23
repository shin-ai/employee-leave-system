"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { EmployeeFormDialog } from "@/components/employee/EmployeeFormDialog";
import { EmployeeViewDialog } from "@/components/employee/EmployeeViewDialog";
import type { Employee } from "@/types/employee";
import { exportToCsv } from "@/lib/csv-export";
import {
  SortableHeader,
  SortConfig,
  getNextSort,
  sortData,
} from "@/components/shared/SortableHeader";
import {
  Pencil,
  Trash2,
  Users,
  Download,
  ChevronLeft,
  ChevronRight,
  Eye,
  Calendar,
  Mail,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { format, parseISO } from "date-fns";

// ── Position badge ──
function PositionBadge({ position }: { position: string }) {
  const colors: Record<string, string> = {
    Manager:
      "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
    Supervisor:
      "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    Administrator:
      "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
    Staff:
      "bg-slate-50 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400",
  };
  return (
    <span
      className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium ${
        colors[position] || colors.Staff
      }`}
    >
      {position}
    </span>
  );
}

// ── Status dot ──
function StatusDot({ status }: { status: string }) {
  const isActive = status === "ACTIVE";
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`inline-block h-2 w-2 rounded-full ${
          isActive
            ? "bg-emerald-500"
            : "bg-rose-500"
        }`}
      />
      <span className="text-xs text-muted-foreground">
        {isActive ? "Active" : "Inactive"}
      </span>
    </div>
  );
}

interface EmployeeTableProps {
  employees: Employee[];
  onDelete: (id: string) => void;
  onRefresh?: () => void;
}

export function EmployeeTable({
  employees,
  onDelete,
  onRefresh,
}: EmployeeTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [sort, setSort] = useState<SortConfig>({ key: "", direction: null });
  const { user } = useAuth();
  const itemsPerPage = 10;

  const handleSort = (key: string) => {
    setSort(getNextSort(sort, key));
    setCurrentPage(1);
  };

  if (employees.length === 0) {
    return (
      <>
        <EmptyState
          icon={Users}
          title="No Employees Found"
          description="Get started by adding your first employee."
          action={
            <Button
              onClick={() => {
                setSelectedEmployee(null);
                setFormOpen(true);
              }}
            >
              Add Employee
            </Button>
          }
        />
        <EmployeeFormDialog
          open={formOpen}
          onOpenChange={(open) => {
            setFormOpen(open);
            if (!open) setSelectedEmployee(null);
          }}
          employee={selectedEmployee}
          onSave={() => {
            onRefresh?.();
          }}
        />
      </>
    );
  }

  const getInitials = (name: string) => {
    const parts = name.split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "dd MMM yyyy");
    } catch {
      return dateStr;
    }
  };

  const handleExport = () => {
    exportToCsv("employees.csv", employees, [
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "role", label: "Role" },
      { key: "team", label: "Tim" },
      { key: "position", label: "Position" },
      { key: "joinDate", label: "Join Date" },
      { key: "leaveBalance", label: "Leave Balance" },
      { key: "status", label: "Status" },
    ]);
  };

  const sortedEmployees = useMemo(
    () =>
      sortData(employees, sort, (emp, key) => {
        switch (key) {
          case "name":
            return emp.name;
          case "email":
            return emp.email;
          case "team":
            return emp.team;
          case "position":
            return emp.position;
          case "joinDate":
            return emp.joinDate;
          case "balance":
            return emp.leaveBalance;
          case "status":
            return emp.status;
          default:
            return "";
        }
      }),
    [employees, sort]
  );

  const totalPages = Math.ceil(sortedEmployees.length / itemsPerPage);
  const safeCurrentPage = Math.min(currentPage, Math.max(1, totalPages));
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const paginatedEmployees = sortedEmployees.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className="space-y-4">
      {/* ── Table ── */}
      <div className="rounded-xl border shadow-sm overflow-hidden overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-[50px] font-semibold">#</TableHead>
              <TableHead>
                <SortableHeader label="Employee" sortKey="name" currentSort={sort} onSort={handleSort} />
              </TableHead>
              <TableHead className="hidden sm:table-cell">
                <SortableHeader label="Tim" sortKey="team" currentSort={sort} onSort={handleSort} />
              </TableHead>
              <TableHead className="hidden md:table-cell">
                <SortableHeader label="Position" sortKey="position" currentSort={sort} onSort={handleSort} />
              </TableHead>
              <TableHead className="hidden lg:table-cell">
                <SortableHeader label="Join Date" sortKey="joinDate" currentSort={sort} onSort={handleSort} />
              </TableHead>
              <TableHead className="hidden lg:table-cell">
                <SortableHeader label="Status" sortKey="status" currentSort={sort} onSort={handleSort} />
              </TableHead>
              <TableHead className="font-semibold text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedEmployees.map((employee, index) => (
              <TableRow
                key={employee.id}
                className="group transition-colors hover:bg-muted/30"
              >
                {/* # */}
                <TableCell className="font-medium text-muted-foreground">
                  {startIndex + index + 1}
                </TableCell>

                {/* Employee */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {getInitials(employee.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {employee.name}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground truncate">
                          {employee.email}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground sm:hidden">{employee.team}</p>
                    </div>
                  </div>
                </TableCell>

                {/* Tim */}
                <TableCell className="hidden sm:table-cell">
                  <Badge
                    variant="secondary"
                    className="text-[11px] font-normal"
                  >
                    {employee.team}
                  </Badge>
                </TableCell>

                {/* Position */}
                <TableCell className="hidden md:table-cell">
                  <PositionBadge position={employee.position} />
                </TableCell>

                {/* Join Date */}
                <TableCell className="hidden lg:table-cell">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {formatDate(employee.joinDate)}
                    </span>
                  </div>
                </TableCell>

                {/* Status */}
                <TableCell className="hidden lg:table-cell">
                  <StatusDot status={employee.status} />
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      title="View Profile & History"
                      onClick={() => {
                        setSelectedEmployee(employee);
                        setViewOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      title="Edit"
                      onClick={() => {
                        setSelectedEmployee(employee);
                        setFormOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    {employee.id !== user?.userId && (
                      <ConfirmDialog
                        trigger={
                          <Button
                            render={<span />}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        }
                        title="Delete Employee"
                        description={`Are you sure you want to delete ${employee.name}? This action cannot be undone.`}
                        onConfirm={() => onDelete(employee.id)}
                      />
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* ── Pagination ── */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <strong>
              {startIndex + 1}–
              {Math.min(startIndex + itemsPerPage, sortedEmployees.length)}
            </strong>{" "}
            of <strong>{sortedEmployees.length}</strong> entries
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="gap-1.5 h-8"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={safeCurrentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (page) => (
                <Button
                  key={page}
                  variant={page === safeCurrentPage ? "default" : "outline"}
                  size="icon"
                  className="h-8 w-8 text-xs"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              )
            )}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() =>
                setCurrentPage((p) => Math.min(p + 1, totalPages))
              }
              disabled={safeCurrentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <EmployeeFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setSelectedEmployee(null);
        }}
        employee={selectedEmployee}
        onSave={() => {
          onRefresh?.();
        }}
      />
      <EmployeeViewDialog
        open={viewOpen}
        onOpenChange={(open) => {
          setViewOpen(open);
          if (!open) setSelectedEmployee(null);
        }}
        employee={selectedEmployee}
      />
    </div>
  );
}
