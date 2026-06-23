import { create } from "zustand";
import { EmployeeStorageService } from "@/services/employee-storage";
import { LeaveStorageService } from "@/services/leave-storage";
import { TeamStorageService } from "@/services/team-storage";
import type { Employee, EmployeeFormData } from "@/types/employee";
import type { LeaveRequest, LeaveStatus } from "@/types/leave-request";
import type { LeaveRequestSchemaType } from "@/validators/leave-request-validator";
import type { Team } from "@/types/team";

interface AppState {
  employees: Employee[];
  leaveRequests: LeaveRequest[];
  teams: Team[];
  isLoaded: boolean;
  loadData: () => Promise<void>;
  addEmployee: (data: EmployeeFormData) => Promise<Employee>;
  updateEmployee: (id: string, data: EmployeeFormData) => Promise<boolean>;
  deleteEmployee: (id: string) => Promise<boolean>;
  addLeaveRequest: (data: LeaveRequestSchemaType) => Promise<LeaveRequest>;
  updateLeaveStatus: (id: string, status: LeaveStatus, processedBy: string, feedback?: string) => Promise<boolean>;
}

export const useAppStore = create<AppState>((set) => ({
  employees: [],
  leaveRequests: [],
  teams: [],
  isLoaded: false,

  loadData: async () => {
    const [employees, leaveRequests, teams] = await Promise.all([
      EmployeeStorageService.getEmployees(),
      LeaveStorageService.getLeaveRequests(),
      TeamStorageService.getTeams(),
    ]);
    set({ employees, leaveRequests, teams, isLoaded: true });
  },

  addEmployee: async (data) => {
    const newEmployee = await EmployeeStorageService.createEmployee(data);
    set((state) => ({ employees: [...state.employees, newEmployee] }));
    return newEmployee;
  },

  updateEmployee: async (id, data) => {
    const success = await EmployeeStorageService.updateEmployee(id, data);
    if (success) {
      set((state) => ({
        employees: state.employees.map((emp) =>
          emp.id === id ? { ...emp, ...data } : emp
        ),
      }));
    }
    return success;
  },

  deleteEmployee: async (id) => {
    const success = await EmployeeStorageService.deleteEmployee(id);
    if (success) {
      await LeaveStorageService.deleteLeavesByEmployeeId(id);
      set((state) => ({
        employees: state.employees.filter((emp) => emp.id !== id),
        leaveRequests: state.leaveRequests.filter((lr) => lr.employeeId !== id),
      }));
    }
    return success;
  },

  addLeaveRequest: async (data) => {
    const newRequest = await LeaveStorageService.createLeaveRequest(data);
    set((state) => ({ leaveRequests: [newRequest, ...state.leaveRequests] }));
    return newRequest;
  },

  updateLeaveStatus: async (id, status, processedBy, feedback) => {
    const success = await LeaveStorageService.updateLeaveStatus(
      id,
      status,
      processedBy,
      feedback
    );
    if (success) {
      // Reload all data to keep in sync (balance changes, etc.)
      const [employees, leaveRequests] = await Promise.all([
        EmployeeStorageService.getEmployees(),
        LeaveStorageService.getLeaveRequests(),
      ]);
      set({ employees, leaveRequests });
    }
    return success;
  },
}));
