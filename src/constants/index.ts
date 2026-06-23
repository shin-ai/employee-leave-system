export const STORAGE_KEYS = {
  EMPLOYEES: "employees",
  LEAVE_REQUESTS: "leaveRequests",
  AUTH_SESSION: "authSession",
  ACTIVITY_LOGS: "activityLogs",
  TEAMS: "teams",
} as const;

export const AUTH_CREDENTIALS = {
  USERNAME: "admin",
  PASSWORD: "admin123",
} as const;

export const DEFAULT_TEAMS = [
  "RPA",
  "ELCAP",
  "ECM",
] as const;

export const POSITIONS = [
  "Staff",
  "Supervisor",
  "Manager",
] as const;

export const ROUTES = {
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  EMPLOYEES: "/employees",
  EMPLOYEES_NEW: "/employees/new",
  EMPLOYEES_EDIT: (id: string) => `/employees/edit/${id}`,
  EMPLOYEES_VIEW: (id: string) => `/employees/${id}`,
  TEAMS: "/teams",
  LEAVE: "/leave",
  LEAVE_NEW: "/leave/new",
  LEAVE_CALENDAR: "/leave/calendar",
  PROFILE: "/profile",
  ABOUT: "/about",
  CODE_REVIEW: "/code-review",
} as const;
