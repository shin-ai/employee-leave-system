export const LEAVE_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED", // Added cancelled status
} as const;

export type LeaveStatus = (typeof LEAVE_STATUS)[keyof typeof LEAVE_STATUS];

export const LEAVE_TYPES = {
  ANNUAL: "ANNUAL",
  SICK: "SICK",
  UNPAID: "UNPAID",
  MATERNITY: "MATERNITY",
  IMPORTANT: "IMPORTANT", // Wedding, Bereavement, etc.
} as const;

export type LeaveType = (typeof LEAVE_TYPES)[keyof typeof LEAVE_TYPES];

export type LeaveRequest = {
  id: string;
  employeeId: string;
  type: LeaveType;
  startDate: string; // ISO format YYYY-MM-DD
  endDate: string; // ISO format YYYY-MM-DD
  durationDays: number; // Calculated field (excluding weekends ideally, but simple difference for now)
  reason: string;
  status: LeaveStatus;
  createdAt: string; // ISO timestamp
  approvedBy?: string; // Admin employeeId
  approvedAt?: string; // ISO timestamp
  approverFeedback?: string; // Optional feedback from approver
  requestedApproverId?: string; // PIC selected by requester
  attachment?: {
    name: string;
    url: string; // Data URL for local storage
    size: number;
  };
};

export type LeaveRequestFormData = Omit<
  LeaveRequest,
  "id" | "status" | "durationDays" | "createdAt" | "approvedBy" | "approvedAt" | "approverFeedback"
>;
