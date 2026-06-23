"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { SortableHeader, SortConfig, getNextSort, sortData } from "@/components/shared/SortableHeader";
import { TeamFormDialog } from "@/components/team/TeamFormDialog";
import { TeamPicDialog } from "@/components/team/TeamPicDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { TeamStorageService } from "@/services/team-storage";
import { EmployeeStorageService } from "@/services/employee-storage";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Users, UserCheck, Shield } from "lucide-react";
import type { Team } from "@/types/team";
import type { Employee } from "@/types/employee";

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [picDialogOpen, setPicDialogOpen] = useState(false);
  const [picTeam, setPicTeam] = useState<Team | null>(null);
  const [sort, setSort] = useState<SortConfig>({ key: '', direction: null });

  const handleSort = (key: string) => {
    setSort(getNextSort(sort, key));
  };

  const sortedTeams = useMemo(
    () =>
      sortData(teams, sort, (team, key) => {
        switch (key) {
          case 'name':
            return team.name;
          case 'members':
            return getMemberCount(team.name);
          case 'pics':
            return team.picEmployeeIds.length;
          default:
            return '';
        }
      }),
    [teams, sort, employees]
  );

  const loadData = useCallback(async () => {
    const [loadedTeams, loadedEmployees] = await Promise.all([
      TeamStorageService.getTeams(),
      EmployeeStorageService.getEmployees(),
    ]);
    setTeams(loadedTeams);
    setEmployees(loadedEmployees);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getEmployeeNames = (employeeIds: string[]): string[] => {
    if (!employeeIds || employeeIds.length === 0) return [];
    return employeeIds
      .map((id) => employees.find((e) => e.id === id)?.name)
      .filter((name): name is string => !!name);
  };

  const getMemberCount = (teamName: string): number => {
    return employees.filter((e) => e.team === teamName).length;
  };

  const handleCreate = async (name: string): Promise<boolean> => {
    const result = await TeamStorageService.createTeam(name, []);
    if (result) {
      toast.success(`Team "${name}" created successfully`);
      loadData();
      return true;
    }
    return false;
  };

  const handleUpdate = async (name: string): Promise<boolean> => {
    if (!editingTeam) return false;
    const success = await TeamStorageService.updateTeam(editingTeam.id, { name });
    if (success) {
      toast.success(`Team "${name}" updated successfully`);
      loadData();
      return true;
    }
    return false;
  };

  const handleDelete = async (team: Team) => {
    const success = await TeamStorageService.deleteTeam(team.id);
    if (success) {
      toast.success(`Team "${team.name}" deleted successfully`);
      loadData();
    } else {
      toast.error("Failed to delete team");
    }
  };

  const handleOpenCreate = () => {
    setEditingTeam(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (team: Team) => {
    setEditingTeam(team);
    setDialogOpen(true);
  };

  const handleOpenPic = (team: Team) => {
    setPicTeam(team);
    setPicDialogOpen(true);
  };

  return (
    <>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Team Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your teams and PIC assignments
          </p>
        </div>
        <Button className="w-full sm:w-auto gap-2" onClick={handleOpenCreate}>
          <Plus className="h-4 w-4" />
          Add Team
        </Button>
      </div>

      {/* Stats Cards */}
      {!isLoading && (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{teams.length}</p>
              <p className="text-xs text-muted-foreground">Total Teams</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {teams.filter((t) => t.picEmployeeIds.length > 0).length}
              </p>
              <p className="text-xs text-muted-foreground">PIC Assigned</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md sm:col-span-2 lg:col-span-1">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {teams.filter((t) => t.picEmployeeIds.length === 0).length}
              </p>
              <p className="text-xs text-muted-foreground">Unassigned PIC</p>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : teams.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Users className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No teams yet</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Get started by creating your first team. Teams help organize
            employees and assign leave approvers.
          </p>
          <Button className="mt-4 gap-2" onClick={handleOpenCreate}>
            <Plus className="h-4 w-4" />
            Add Your First Team
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border shadow-sm overflow-x-auto">
          <Table className="min-w-[500px]">
            <TableHeader>
      <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-[50px] font-semibold">#</TableHead>
                <TableHead className="font-semibold">
                  <SortableHeader label="Team Name" sortKey="name" currentSort={sort} onSort={handleSort} />
                </TableHead>
                <TableHead className="text-center font-semibold hidden sm:table-cell">
                  <SortableHeader label="Members" sortKey="members" currentSort={sort} onSort={handleSort} className="justify-center" />
                </TableHead>
                <TableHead className="font-semibold hidden md:table-cell">
                  <SortableHeader label="PIC" sortKey="pics" currentSort={sort} onSort={handleSort} />
                </TableHead>
                <TableHead className="w-[120px] sm:w-[160px] text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTeams.map((team, index) => {
                const picNames = getEmployeeNames(team.picEmployeeIds);
                const memberCount = getMemberCount(team.name);
                return (
                  <TableRow key={team.id} className="group transition-colors hover:bg-muted/30">
                    <TableCell className="font-medium text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                          {team.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-medium">{team.name}</span>
                          <div className="flex items-center gap-2 sm:hidden mt-0.5">
                            <Badge variant="secondary" className="text-[10px] h-4">
                              {memberCount} members
                            </Badge>
                            {picNames.length > 0 && (
                              <span className="text-[10px] text-muted-foreground">
                                {picNames.length} PIC
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center hidden sm:table-cell">
                      <Badge variant="secondary" className="text-xs">
                        {memberCount}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {picNames.length > 0 ? (
                        <div className="flex flex-wrap items-center gap-1.5">
                          {picNames.length <= 2 ? (
                            picNames.map((pName, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400"
                              >
                                <Shield className="h-3 w-3" />
                                {pName}
                              </span>
                            ))
                          ) : (
                            <>
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                                <Shield className="h-3 w-3" />
                                {picNames[0]}
                              </span>
                              <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                                +{picNames.length - 1} lainnya
                              </span>
                            </>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground italic">
                          Not Assigned
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/50"
                          onClick={() => handleOpenPic(team)}
                          title="Manage PIC"
                        >
                          <Shield className="h-4 w-4" />
                          <span className="sr-only">Manage PIC {team.name}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => handleOpenEdit(team)}
                          title="Edit Team"
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit {team.name}</span>
                        </Button>
                        <ConfirmDialog
                          trigger={
                            <Button
                              render={<span />}
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">
                                Delete {team.name}
                              </span>
                            </Button>
                          }
                          title={`Delete "${team.name}"?`}
                          description="This action cannot be undone. Employees in this team will not be reassigned automatically."
                          confirmLabel="Delete"
                          variant="destructive"
                          onConfirm={() => handleDelete(team)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Form Dialog (Create/Edit team name only) */}
      <TeamFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingTeam(null);
        }}
        onSubmit={editingTeam ? handleUpdate : handleCreate}
        editingTeam={editingTeam}
      />

      {/* PIC Management Dialog */}
      <TeamPicDialog
        open={picDialogOpen}
        onOpenChange={(open) => {
          setPicDialogOpen(open);
          if (!open) setPicTeam(null);
        }}
        team={picTeam}
        employees={employees}
        onUpdate={loadData}
      />
    </>
  );
}
