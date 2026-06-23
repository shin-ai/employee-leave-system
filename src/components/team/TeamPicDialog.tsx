"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus, X, Search, Shield } from "lucide-react";
import type { Team } from "@/types/team";
import type { Employee } from "@/types/employee";
import { TeamStorageService } from "@/services/team-storage";
import { toast } from "sonner";

interface TeamPicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team: Team | null;
  employees: Employee[];
  onUpdate: () => void;
}

export function TeamPicDialog({
  open,
  onOpenChange,
  team,
  employees,
  onUpdate,
}: TeamPicDialogProps) {
  const [picIds, setPicIds] = useState<string[]>([]);
  const [selectedAddId, setSelectedAddId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Reset state when dialog opens
  useEffect(() => {
    if (open && team) {
      setPicIds(team.picEmployeeIds ?? []);
      setSelectedAddId("");
      setSearchQuery("");
    }
  }, [open, team]);

  // Team members: employees who belong to this team
  const teamMembers = useMemo(() => {
    if (!team) return [];
    return employees.filter((emp) => emp.team === team.name);
  }, [employees, team]);

  // Current PICs with full info
  const currentPics = useMemo(() => {
    return picIds
      .map((id) => teamMembers.find((emp) => emp.id === id))
      .filter((emp): emp is Employee => !!emp);
  }, [picIds, teamMembers]);

  // Available employees to add (not yet PIC)
  const availableToAdd = useMemo(() => {
    let available = teamMembers.filter((emp) => !picIds.includes(emp.id));
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      available = available.filter(
        (emp) =>
          emp.name.toLowerCase().includes(q) ||
          emp.position.toLowerCase().includes(q)
      );
    }
    return available;
  }, [teamMembers, picIds, searchQuery]);

  const handleAddPic = async () => {
    if (!selectedAddId || !team) return;
    const newPicIds = [...picIds, selectedAddId];
    setPicIds(newPicIds);
    setSelectedAddId("");

    // Save immediately
    await TeamStorageService.updateTeam(team.id, { picEmployeeIds: newPicIds });
    const emp = employees.find((e) => e.id === selectedAddId);
    toast.success(`${emp?.name || "Employee"} added as PIC`);
    onUpdate();
  };

  const handleRemovePic = async (employeeId: string) => {
    if (!team) return;
    const newPicIds = picIds.filter((id) => id !== employeeId);
    setPicIds(newPicIds);

    // Save immediately
    await TeamStorageService.updateTeam(team.id, { picEmployeeIds: newPicIds });
    const emp = employees.find((e) => e.id === employeeId);
    toast.success(`${emp?.name || "Employee"} removed from PIC`);
    onUpdate();
  };

  if (!team) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Manage PIC — {team.name}
          </DialogTitle>
          <DialogDescription>
            Person In Charge (PIC) bertanggung jawab untuk approve cuti anggota
            tim. Hanya anggota tim {team.name} yang bisa ditambahkan sebagai PIC.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Add PIC Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tambah PIC</label>
            {availableToAdd.length > 0 ? (
              <div className="flex gap-2">
                <Select value={selectedAddId} onValueChange={(v) => setSelectedAddId(v ?? "")}>
                  <SelectTrigger className="flex-1">
                    {selectedAddId ? (
                      <span>{employees.find((e) => e.id === selectedAddId)?.name || "Pilih anggota tim..."}</span>
                    ) : (
                      <SelectValue placeholder="Pilih anggota tim..." />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    {/* Search inside dropdown */}
                    <div className="px-2 pb-2">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Cari..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="h-8 pl-8 text-xs"
                        />
                      </div>
                    </div>
                    {availableToAdd.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        <div className="flex flex-col">
                          <span>{emp.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {emp.position}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleAddPic}
                  disabled={!selectedAddId}
                  size="default"
                  className="gap-1.5 shrink-0"
                >
                  <UserPlus className="h-4 w-4" />
                  Tambah
                </Button>
              </div>
            ) : teamMembers.length === 0 ? (
              <div className="rounded-lg border border-dashed p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Belum ada anggota di tim ini. Tambahkan employee dengan tim{" "}
                  <strong>{team.name}</strong> terlebih dahulu.
                </p>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-3 text-center">
                <p className="text-sm text-muted-foreground">
                  Semua anggota tim sudah menjadi PIC.
                </p>
              </div>
            )}
          </div>

          {/* Current PICs List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                PIC Saat Ini
              </label>
              <Badge variant="secondary" className="text-xs">
                {currentPics.length} PIC
              </Badge>
            </div>

            {currentPics.length > 0 ? (
              <div className="max-h-[280px] space-y-2 overflow-y-auto rounded-lg border p-2">
                {currentPics.map((emp) => (
                  <div
                    key={emp.id}
                    className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2.5 transition-colors hover:bg-muted"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {emp.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{emp.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {emp.position} &bull; {emp.email}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemovePic(emp.id)}
                      title={`Remove ${emp.name} from PIC`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-8 text-center">
                <Shield className="mb-2 h-8 w-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">
                  Belum ada PIC yang ditugaskan.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Tambahkan minimal 1 PIC untuk approve cuti.
                </p>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
            <strong>Info:</strong> Total anggota tim:{" "}
            <strong>{teamMembers.length}</strong> orang, PIC:{" "}
            <strong>{currentPics.length}</strong> orang
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
