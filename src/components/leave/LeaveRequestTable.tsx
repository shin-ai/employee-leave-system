"use client";

import { useState, useMemo } from "react";
import {
  SortableHeader,
  SortConfig,
  getNextSort,
  sortData,
} from "@/components/shared/SortableHeader";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProcessLeaveDialog } from "./ProcessLeaveDialog";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { ROUTES } from "@/constants";
import type { LeaveRequest } from "@/types/leave-request";
import { LEAVE_STATUS, LEAVE_TYPES } from "@/types/leave-request";
import type { Employee } from "@/types/employee";
import { exportToCsv } from "@/lib/csv-export";
import {
  Check,
  X,
  CalendarOff,
  Download,
  ChevronLeft,
  ChevronRight,
  Paperclip,
  MessageSquare,
  Search,
  RotateCcw,
  Calendar,
  Clock,
  Shield,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { TeamStorageService } from "@/services/team-storage";
import { useAppStore } from "@/store/app-store";
import { parseISO, format } from "date-fns";

interface LeaveRequestTableProps {
  leaveRequests: LeaveRequest[];
  employees: Employee[];
  onApprove: (id: string, feedback?: string) => void;
  onReject: (id: string, feedback?: string) => void;
  onCancel?: (id: string) => void;
}

// ── Status badge with colors ──
function StatusBadgeStyled({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    PENDING: {
      label: "Pending",
      className:
        "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
    },
    APPROVED: {
      label: "Approved",
      className:
        "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
    },
    REJECTED: {
      label: "Rejected",
      className:
        "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800",
    },
    CANCELLED: {
      label: "Cancelled",
      className:
        "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700",
    },
  };
  const c = config[status] || config.CANCELLED;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${c.className}`}
    >
      {c.label}
    </span>
  );
}

// ── Leave type badge ──
function LeaveTypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    ANNUAL: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    SICK: "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
    UNPAID: "bg-slate-50 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400",
    MATERNITY: "bg-pink-50 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400",
    IMPORTANT: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
  };
  return (
    <span
      className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium ${
        colors[type] || colors.UNPAID
      }`}
    >
      {type.charAt(0) + type.slice(1).toLowerCase()}
    </span>
  );
}

export function LeaveRequestTable({
  leaveRequests,
  employees,
  onApprove,
  onReject,
  onCancel,
}: LeaveRequestTableProps) {
  const { isAdmin, user } = useAuth();
  const { teams } = useAppStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [sort, setSort] = useState<SortConfig>({ key: '', direction: null });
  const itemsPerPage = 10;

  // ── Filters ──
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find((emp) => emp.id === employeeId);
    return employee ? employee.name : "Unknown";
  };

  const getEmployeeTeam = (employeeId: string) => {
    const employee = employees.find((emp) => emp.id === employeeId);
    return employee ? employee.team : "-";
  };

  const getEmployeeInitials = (employeeId: string) => {
    const name = getEmployeeName(employeeId);
    const parts = name.split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();
  };

  const loggedInEmployee = employees.find((emp) => emp.id === user?.userId);

  // ── Filtered data ──
  const filteredRequests = useMemo(() => {
    let data = leaveRequests;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data.filter((req) => {
        const name = getEmployeeName(req.employeeId).toLowerCase();
        const team = getEmployeeTeam(req.employeeId).toLowerCase();
        const reason = req.reason.toLowerCase();
        return name.includes(q) || team.includes(q) || reason.includes(q);
      });
    }

    if (typeFilter !== "ALL") {
      data = data.filter((req) => req.type === typeFilter);
    }

    if (dateFrom) {
      const from = parseISO(dateFrom);
      from.setHours(0, 0, 0, 0);
      data = data.filter((req) => {
        const end = parseISO(req.endDate);
        end.setHours(23, 59, 59, 999);
        return end >= from;
      });
    }
    if (dateTo) {
      const to = parseISO(dateTo);
      to.setHours(23, 59, 59, 999);
      data = data.filter((req) => {
        const start = parseISO(req.startDate);
        start.setHours(0, 0, 0, 0);
        return start <= to;
      });
    }

    return data;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leaveRequests, searchQuery, typeFilter, dateFrom, dateTo, employees]);

  const sortedRequests = useMemo(() => {
    return sortData(filteredRequests, sort, (item, key) => {
      switch (key) {
        case 'employee': return getEmployeeName(item.employeeId);
        case 'team': return getEmployeeTeam(item.employeeId);
        case 'type': return item.type;
        case 'startDate': return item.startDate;
        case 'endDate': return item.endDate;
        case 'duration': return item.durationDays;
        case 'status': return item.status;
        case 'createdAt': return item.createdAt;
        default: return '';
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredRequests, sort, employees]);

  const handleSort = (key: string) => {
    setSort(getNextSort(sort, key));
    setCurrentPage(1);
  };

  const safeCurrentPage = Math.min(
    currentPage,
    Math.max(1, Math.ceil(sortedRequests.length / itemsPerPage))
  );

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    typeFilter !== "ALL" ||
    dateFrom !== "" ||
    dateTo !== "";

  const handleClearFilters = () => {
    setSearchQuery("");
    setDateFrom("");
    setDateTo("");
    setTypeFilter("ALL");
    setCurrentPage(1);
  };

  const handleExport = () => {
    const dataToExport = sortedRequests.map((req) => ({
      ...req,
      employeeName: getEmployeeName(req.employeeId),
    }));
    exportToCsv("leave_requests.csv", dataToExport, [
      { key: "employeeName", label: "Employee Name" },
      { key: "department", label: "Tim" },
      { key: "type", label: "Type" },
      { key: "startDate", label: "Start Date" },
      { key: "endDate", label: "End Date" },
      { key: "durationDays", label: "Duration (Days)" },
      { key: "status", label: "Status" },
      { key: "reason", label: "Reason" },
      { key: "createdAt", label: "Submitted On" },
    ]);
  };

  const totalPages = Math.ceil(sortedRequests.length / itemsPerPage);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const paginatedRequests = sortedRequests.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "dd MMM yyyy");
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-4">
      {/* ── Filter Bar ── */}
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-3">
          {/* Row 1: Search + Type */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari nama, tim, atau alasan..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9"
              />
            </div>
            <Select
              value={typeFilter}
              onValueChange={(v) => {
                setTypeFilter(v ?? "ALL");
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[160px]">
                {typeFilter !== "ALL" ? (
                  <span>
                    {typeFilter.charAt(0) + typeFilter.slice(1).toLowerCase()}
                  </span>
                ) : (
                  <SelectValue placeholder="Semua Tipe" />
                )}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Tipe</SelectItem>
                {Object.values(LEAVE_TYPES).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0) + type.slice(1).toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Row 2: Dates + Actions */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setCurrentPage(1);
                }}
                className="flex-1 min-w-0"
              />
              <span className="text-xs text-muted-foreground">—</span>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setCurrentPage(1);
                }}
                className="flex-1 min-w-0"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="gap-1.5 text-muted-foreground"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                Export
              </Button>
            </div>
          </div>

          {hasActiveFilters && (
            <p className="text-xs text-muted-foreground">
              Menampilkan <strong>{filteredRequests.length}</strong> dari{" "}
              <strong>{leaveRequests.length}</strong> data
            </p>
          )}
        </div>
      </div>

      {/* ── Table ── */}
      {sortedRequests.length === 0 ? (
        <EmptyState
          icon={CalendarOff}
          title="Tidak Ada Data"
          description={
            hasActiveFilters
              ? "Tidak ada data yang sesuai dengan filter. Coba ubah filter."
              : "Belum ada leave request."
          }
          action={
            hasActiveFilters ? (
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset Filter
              </Button>
            ) : (
              <Link href={ROUTES.LEAVE_NEW}>
                <Button>New Request</Button>
              </Link>
            )
          }
        />
      ) : (
        <>
          <div className="rounded-xl border shadow-sm overflow-hidden overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>
                    <SortableHeader label="Employee" sortKey="employee" currentSort={sort} onSort={handleSort} />
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    <SortableHeader label="Periode" sortKey="startDate" currentSort={sort} onSort={handleSort} />
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Alasan
                  </TableHead>
                  <TableHead className="text-center">
                    <SortableHeader label="Status" sortKey="status" currentSort={sort} onSort={handleSort} className="justify-center" />
                  </TableHead>
                  <TableHead className="font-semibold text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRequests.map((request) => (
                  <TableRow
                    key={request.id}
                    className="group transition-colors hover:bg-muted/30"
                  >
                    {/* ── Employee ── */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {getEmployeeInitials(request.employeeId)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate">
                              {getEmployeeName(request.employeeId)}
                            </p>
                            {request.attachment && (
                              <Paperclip className="h-3 w-3 text-muted-foreground shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Badge
                              variant="secondary"
                              className="text-[10px] px-1.5 py-0 h-4 font-normal"
                            >
                              {getEmployeeTeam(request.employeeId)}
                            </Badge>
                            <LeaveTypeBadge type={request.type} />
                          </div>
                          {request.requestedApproverId && (
                            <div className="flex items-center gap-1 mt-1">
                              <Shield className="h-3 w-3 text-emerald-500" />
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                                {getEmployeeName(
                                  request.requestedApproverId
                                )}
                              </span>
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground md:hidden">
                            {formatDate(request.startDate)} — {formatDate(request.endDate)}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* ── Periode ── */}
                    <TableCell className="hidden md:table-cell">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-sm">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{formatDate(request.startDate)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <span className="ml-5">
                            → {formatDate(request.endDate)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {request.durationDays} hari
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* ── Alasan ── */}
                    <TableCell className="hidden lg:table-cell">
                      <p
                        className="text-sm text-muted-foreground line-clamp-2 max-w-[250px]"
                        title={request.reason}
                      >
                        {request.reason}
                      </p>
                    </TableCell>

                    {/* ── Status ── */}
                    <TableCell className="text-center">
                      <StatusBadgeStyled status={request.status} />
                      {request.approverFeedback && (
                        <div
                          className="mt-1.5 flex items-start gap-1 text-[10px] text-muted-foreground justify-center"
                          title={request.approverFeedback}
                        >
                          <MessageSquare className="h-3 w-3 mt-0.5 shrink-0" />
                          <span className="truncate max-w-[80px] text-left">
                            {request.approverFeedback}
                          </span>
                        </div>
                      )}
                    </TableCell>

                    {/* ── Actions ── */}
                    <TableCell className="text-right">
                      {request.status === LEAVE_STATUS.PENDING ? (
                        <div className="flex flex-wrap items-center justify-end gap-1">
                          {(() => {
                            const canApprove = !!(
                              loggedInEmployee &&
                              TeamStorageService.isPicForTeam(
                                loggedInEmployee.id,
                                getEmployeeTeam(request.employeeId),
                                teams
                              )
                            );
                            return canApprove;
                          })() ? (
                            <>
                              <ProcessLeaveDialog
                                request={request}
                                employees={employees}
                                type="APPROVE"
                                trigger={
                                  <Button
                                    render={<span />}
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
                                  >
                                    <Check className="h-4 w-4" />
                                    <span className="sr-only">Approve</span>
                                  </Button>
                                }
                                onProcess={onApprove}
                              />
                              <ProcessLeaveDialog
                                request={request}
                                employees={employees}
                                type="REJECT"
                                trigger={
                                  <Button
                                    render={<span />}
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                  >
                                    <X className="h-4 w-4" />
                                    <span className="sr-only">Reject</span>
                                  </Button>
                                }
                                onProcess={onReject}
                              />
                            </>
                          ) : request.employeeId === user?.userId ? (
                            <ConfirmDialog
                              trigger={
                                <Button
                                  render={<span />}
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                  Cancel
                                </Button>
                              }
                              title="Cancel Leave Request"
                              description="Are you sure you want to cancel this leave request?"
                              onConfirm={() =>
                                onCancel && onCancel(request.id)
                              }
                            />
                          ) : (
                            <span className="text-xs text-muted-foreground italic">
                              —
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-muted-foreground italic">
                          Processed
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* ── Pagination ── */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Showing{" "}
              <strong>
                {startIndex + 1}–
                {Math.min(startIndex + itemsPerPage, sortedRequests.length)}
              </strong>{" "}
              of <strong>{sortedRequests.length}</strong> entries
            </p>
            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() =>
                    setCurrentPage((p) => Math.max(p - 1, 1))
                  }
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
        </>
      )}
    </div>
  );
}
