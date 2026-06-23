"use client";

import { useState } from "react";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { StatCard } from "./StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Users, Clock, CheckCircle, XCircle, Calendar, CalendarDays, Filter, Search, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/store/app-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useAuth } from "@/hooks/use-auth";
import { LEAVE_STATUS } from "@/types/leave-request";

const STATUS_FILTERS = [
  { key: "ALL", label: "All" },
  { key: LEAVE_STATUS.PENDING, label: "Pending" },
  { key: LEAVE_STATUS.APPROVED, label: "Approved" },
  { key: LEAVE_STATUS.REJECTED, label: "Rejected" },
  { key: LEAVE_STATUS.CANCELLED, label: "Cancelled" },
] as const;

export function DashboardGrid() {
  const { stats, leaveRequests } = useDashboardStats();
  const { isAdmin, user } = useAuth();
  const store = useAppStore();
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const today = new Date().toISOString().split("T")[0];
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState("");

  const currentEmployee = store.employees.find(emp => emp.id === user?.userId);
  
  const upcomingLeaves = leaveRequests
    .filter(req => req.status === "APPROVED" && new Date(req.startDate) >= new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 5);

  // Prepare data for the Bar Chart
  const statusData = [
    { name: "Pending", count: stats.pendingLeaves, color: "#f59e0b" },
    { name: "Approved", count: stats.approvedLeaves, color: "#10b981" },
    { name: "Rejected", count: stats.rejectedLeaves, color: "#ef4444" },
  ];

  // Prepare data for Pie Chart
  const leaveTypesData = leaveRequests.reduce((acc, req) => {
    const existing = acc.find(item => item.name === req.type);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: req.type, value: 1 });
    }
    return acc;
  }, [] as { name: string, value: number }[]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Filter leave requests by status, date, and search
  const filteredRequests = leaveRequests
    .filter(req => {
      // Status filter
      if (statusFilter !== "ALL" && req.status !== statusFilter) return false;
      // Date filter
      if (dateFrom && req.startDate < dateFrom) return false;
      if (dateTo && req.endDate > dateTo) return false;
      // Search filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const empName = getEmployeeName(req.employeeId).toLowerCase();
        const empTeam = getEmployeeTeam(req.employeeId).toLowerCase();
        if (!empName.includes(q) && !empTeam.includes(q) && !req.type.toLowerCase().includes(q)) return false;
      }
      return true;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const getEmployeeName = (employeeId: string) => {
    const emp = store.employees.find(e => e.id === employeeId);
    return emp?.name || "Unknown";
  };

  const getEmployeeTeam = (employeeId: string) => {
    const emp = store.employees.find(e => e.id === employeeId);
    return emp?.team || "";
  };

  const countByStatus = (status: string) => {
    if (status === "ALL") return leaveRequests.length;
    return leaveRequests.filter(r => r.status === status).length;
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isAdmin && (
          <StatCard
            title="Total Employees"
            value={stats.totalEmployees}
            icon={Users}
            trend={{ value: 12, label: "from last month", isPositive: true }}
          />
        )}
        <StatCard
          title="Pending Requests"
          value={stats.pendingLeaves}
          icon={Clock}
          variant="warning"
        />
        <StatCard
          title="Approved Requests"
          value={stats.approvedLeaves}
          icon={CheckCircle}
          variant="success"
        />
        <StatCard
          title="Rejected Requests"
          value={stats.rejectedLeaves}
          icon={XCircle}
          variant="destructive"
        />
      </div>

      {/* Charts + Leave List - Admin */}
      {isAdmin && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Leave Requests Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px' }} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Leave Types Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                {leaveTypesData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={leaveTypesData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }: { name?: string; percent?: number }) => `${name || 'Unknown'} ${((percent || 0) * 100).toFixed(0)}%`}
                      >
                        {leaveTypesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '8px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    No leave data available yet.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Leave Request List with Filter */}
          <Card className="md:col-span-2">
            <CardHeader className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <CardTitle>Leave Requests</CardTitle>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {STATUS_FILTERS.map((filter) => {
                    const count = countByStatus(filter.key);
                    const isActive = statusFilter === filter.key;
                    return (
                      <Button
                        key={filter.key}
                        variant={isActive ? "default" : "outline"}
                        size="sm"
                        onClick={() => setStatusFilter(filter.key)}
                        className="gap-1.5 text-xs h-7"
                      >
                        {filter.label}
                        <Badge
                          variant={isActive ? "secondary" : "outline"}
                          className="h-4 min-w-4 px-1 text-[10px] font-semibold"
                        >
                          {count}
                        </Badge>
                      </Button>
                    );
                  })}
                </div>
              </div>
              {/* Search + Date Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, team, or leave type..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground whitespace-nowrap">From</Label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="h-9 w-[140px] text-xs"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground whitespace-nowrap">To</Label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="h-9 w-[140px] text-xs"
                  />
                </div>
                {(dateFrom || dateTo || searchQuery) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setDateFrom(today); setDateTo(""); setSearchQuery(""); }}
                    className="h-9 text-xs text-muted-foreground hover:text-foreground shrink-0"
                  >
                    <X className="h-3.5 w-3.5 mr-1" />
                    Reset
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Showing {filteredRequests.length} of {leaveRequests.length} requests
              </p>
            </CardHeader>
            <CardContent>
              {filteredRequests.length > 0 ? (
                <div className="space-y-3">
                  {filteredRequests.map((req) => (
                    <div
                      key={req.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <CalendarDays className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">
                            {getEmployeeName(req.employeeId)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {getEmployeeTeam(req.employeeId)} &bull; {req.type.charAt(0) + req.type.slice(1).toLowerCase()} Leave
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 sm:gap-4 pl-12 sm:pl-0">
                        <div className="text-xs text-muted-foreground whitespace-nowrap">
                          {req.startDate} → {req.endDate}
                        </div>
                        <Badge variant="outline" className="text-[10px] shrink-0">
                          {req.durationDays}d
                        </Badge>
                        <StatusBadge status={req.status} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-[120px] flex-col items-center justify-center text-muted-foreground">
                  <CalendarDays className="mb-2 h-8 w-8 opacity-20" />
                  <p className="text-sm">No leave requests with this status.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Employee Section */}
      {!isAdmin && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Leave Balance</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-8 border-primary/20">
                <div 
                  className="absolute inset-0 rounded-full border-8 border-primary border-t-transparent" 
                  style={{ transform: `rotate(${((currentEmployee?.leaveBalance || 0) / 12) * 360}deg)` }} 
                />
                <div className="text-center">
                  <span className="text-3xl font-bold">{currentEmployee?.leaveBalance || 0}</span>
                  <p className="text-xs text-muted-foreground">Days Left</p>
                </div>
              </div>
              <div className="mt-6 w-full text-center">
                <Link href="/leave/new">
                  <Button className="w-full sm:w-auto gap-2">
                    <Calendar className="h-4 w-4" />
                    Request Leave
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Leaves</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingLeaves.length > 0 ? (
                <div className="space-y-4">
                  {upcomingLeaves.map((leave) => (
                    <div key={leave.id} className="flex items-start gap-4 border-b pb-4 last:border-0 last:pb-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <CalendarDays className="h-5 w-5" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="font-medium">{leave.type} Leave</p>
                        <p className="text-sm text-muted-foreground">
                          {leave.startDate} to {leave.endDate}
                        </p>
                      </div>
                      <div className="font-medium text-sm">
                        {leave.durationDays} days
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-[200px] flex-col items-center justify-center text-muted-foreground">
                  <CalendarDays className="mb-2 h-8 w-8 opacity-20" />
                  <p>No upcoming leaves scheduled.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
