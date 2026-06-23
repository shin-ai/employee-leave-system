import { z } from "zod";
import { LEAVE_TYPES } from "@/types/leave-request";

export const leaveRequestSchema = z
  .object({
    employeeId: z.string().min(1, "Employee is required"),
    type: z.nativeEnum(LEAVE_TYPES, {
      message: "Please select a valid leave type",
    }),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    reason: z.string().min(10, "Reason must be at least 10 characters long"),
    approverId: z.string().min(1, "Approver is required"),
    attachment: z.object({
      name: z.string(),
      url: z.string(),
      size: z.number(),
    }).optional(),
  })
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return start <= end;
    },
    {
      message: "End date cannot be before start date",
      path: ["endDate"],
    }
  );

export type LeaveRequestSchemaType = z.infer<typeof leaveRequestSchema>;
