"use client";

import { useState, useEffect, useMemo } from "react";
import { useAppStore } from "@/store/app-store";
import type { LeaveStatus } from "@/types/leave-request";
import { AuthStorageService } from "@/services/auth-storage";

export function useLeaveRequests() {
  const store = useAppStore();
  const [statusFilter, setStatusFilter] = useState<LeaveStatus | "ALL">("ALL");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsClient(true);
    if (!store.isLoaded) {
      store.loadData();
    }
  }, [store]);

  const filteredRequests = useMemo(() => {
    const session = AuthStorageService.getSession();
    let data = store.leaveRequests;

    // RBAC: If not admin, only show own requests
    if (session && session.role !== "ADMIN") {
      data = data.filter((req) => req.employeeId === session.userId);
    }

    if (statusFilter !== "ALL") {
      data = data.filter((req) => req.status === statusFilter);
    }

    return [...data].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [store.leaveRequests, statusFilter]);

  const approveRequest = async (
    id: string,
    feedback?: string,
    adminId: string = "system"
  ): Promise<boolean> => {
    return await store.updateLeaveStatus(id, "APPROVED", adminId, feedback);
  };

  const rejectRequest = async (
    id: string,
    feedback?: string,
    adminId: string = "system"
  ): Promise<boolean> => {
    return await store.updateLeaveStatus(id, "REJECTED", adminId, feedback);
  };

  const cancelRequest = async (
    id: string,
    userId: string
  ): Promise<boolean> => {
    return await store.updateLeaveStatus(id, "CANCELLED", userId);
  };

  return {
    leaveRequests: filteredRequests,
    statusFilter,
    setStatusFilter,
    approveRequest,
    rejectRequest,
    cancelRequest,
    refreshRequests: store.loadData,
    isLoading: !isClient || !store.isLoaded,
  };
}
