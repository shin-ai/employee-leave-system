"use client";

import { useState, useEffect, useMemo } from "react";
import { useAppStore } from "@/store/app-store";
import { LEAVE_STATUS } from "@/types/leave-request";
import { useAuth } from "@/hooks/use-auth";
import { ActivityStorageService, type ActivityLog } from "@/services/activity-storage";

export function useDashboardStats() {
  const { user, isAdmin } = useAuth();
  const store = useAppStore();
  const [activities, setActivities] = useState<ActivityLog[]>([]);

  useEffect(() => {
    if (!store.isLoaded) {
      store.loadData();
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActivities(ActivityStorageService.getLogs());
  }, [store]);

  const { stats, leaveRequests } = useMemo(() => {
    const allRequests = store.leaveRequests;
    
    let filteredRequests = allRequests;
    if (!isAdmin && user) {
      filteredRequests = allRequests.filter(req => req.employeeId === user.userId);
    }

    return {
      stats: {
        totalEmployees: store.employees.length,
        pendingLeaves: filteredRequests.filter((req) => req.status === LEAVE_STATUS.PENDING).length,
        approvedLeaves: filteredRequests.filter((req) => req.status === LEAVE_STATUS.APPROVED).length,
        rejectedLeaves: filteredRequests.filter((req) => req.status === LEAVE_STATUS.REJECTED).length,
      },
      leaveRequests: filteredRequests
    };
  }, [store.employees.length, store.leaveRequests, isAdmin, user]);

  return { stats, leaveRequests, activities };
}
