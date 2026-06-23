export const ROLES = {
  ADMIN: "ADMIN",
  EMPLOYEE: "EMPLOYEE",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const EMPLOYEE_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
} as const;

export type EmployeeStatus = (typeof EMPLOYEE_STATUS)[keyof typeof EMPLOYEE_STATUS];

export type Employee = {
  id: string;
  name: string;
  email: string;
  role: Role;
  team: string;
  position: string;
  joinDate: string; // ISO date format (YYYY-MM-DD)
  leaveBalance: number; // e.g., 12 days
  status: EmployeeStatus;
};

export type EmployeeFormData = Omit<Employee, "id" | "status" | "leaveBalance" | "role">;
