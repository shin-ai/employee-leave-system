import { STORAGE_KEYS } from "@/constants";

export interface ActivityLog {
  id: string;
  type: "CREATE" | "UPDATE" | "DELETE" | "APPROVE" | "REJECT" | "LOGIN";
  entity: "EMPLOYEE" | "LEAVE" | "AUTH";
  description: string;
  timestamp: string;
  userId: string;
}

export class ActivityStorageService {
  static getLogs(): ActivityLog[] {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOGS || "leave_system_activities");
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Failed to parse activity logs from localStorage", error);
      return [];
    }
  }

  static addLog(log: Omit<ActivityLog, "id" | "timestamp">): ActivityLog {
    const logs = this.getLogs();
    const newLog: ActivityLog = {
      ...log,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };
    
    // Keep only the last 100 logs to prevent localStorage bloat
    const updatedLogs = [newLog, ...logs].slice(0, 100);
    
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS || "leave_system_activities", JSON.stringify(updatedLogs));
    }
    return newLog;
  }
}
