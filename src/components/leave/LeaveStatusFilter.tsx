"use client";

import { Button } from "@/components/ui/button";
import { LEAVE_STATUS, type LeaveStatus } from "@/types/leave-request";
import { cn } from "@/lib/utils";

interface LeaveStatusFilterProps {
  value: LeaveStatus | "ALL";
  onChange: (value: LeaveStatus | "ALL") => void;
}

const filterOptions: { label: string; value: LeaveStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: LEAVE_STATUS.PENDING },
  { label: "Approved", value: LEAVE_STATUS.APPROVED },
  { label: "Rejected", value: LEAVE_STATUS.REJECTED },
];

export function LeaveStatusFilter({ value, onChange }: LeaveStatusFilterProps) {
  return (
    <div className="flex flex-wrap gap-1 rounded-lg border bg-muted/50 p-1">
      {filterOptions.map((option) => (
        <Button
          key={option.value}
          variant="ghost"
          size="sm"
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-md text-xs font-medium transition-all",
            value === option.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
