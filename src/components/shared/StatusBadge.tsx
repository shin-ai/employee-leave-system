import { Badge } from "@/components/ui/badge";
import { LEAVE_STATUS, type LeaveStatus } from "@/types/leave-request";

const statusConfig: Record<
  LeaveStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  [LEAVE_STATUS.PENDING]: { label: "Pending", variant: "secondary" },
  [LEAVE_STATUS.APPROVED]: { label: "Approved", variant: "default" },
  [LEAVE_STATUS.REJECTED]: { label: "Rejected", variant: "destructive" },
  [LEAVE_STATUS.CANCELLED]: { label: "Cancelled", variant: "outline" },
};

interface StatusBadgeProps {
  status: LeaveStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
