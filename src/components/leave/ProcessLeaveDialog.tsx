import { useState, useMemo } from "react";
import { parseISO, isWithinInterval } from "date-fns";
import { Check, X, Paperclip, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { LeaveRequest } from "@/types/leave-request";
import { LEAVE_STATUS } from "@/types/leave-request";
import type { Employee } from "@/types/employee";
import { useAppStore } from "@/store/app-store";

interface ProcessLeaveDialogProps {
  request: LeaveRequest;
  employees: Employee[];
  type: "APPROVE" | "REJECT";
  trigger: React.ReactNode;
  onProcess: (id: string, feedback?: string) => void;
}

export function ProcessLeaveDialog({
  request,
  employees,
  type,
  trigger,
  onProcess,
}: ProcessLeaveDialogProps) {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const store = useAppStore();

  const isApprove = type === "APPROVE";
  const employee = employees.find((e) => e.id === request.employeeId);

  // Find overlapping APPROVED leaves
  const overlaps = useMemo(() => {
    if (!open) return [];
    
    const reqStart = parseISO(request.startDate);
    const reqEnd = parseISO(request.endDate);

    return store.leaveRequests.filter((otherReq) => {
      // Don't compare with self
      if (otherReq.id === request.id) return false;
      // Only care about approved leaves
      if (otherReq.status !== LEAVE_STATUS.APPROVED) return false;

      const otherStart = parseISO(otherReq.startDate);
      const otherEnd = parseISO(otherReq.endDate);

      // Check if dates overlap
      return (
        isWithinInterval(otherStart, { start: reqStart, end: reqEnd }) ||
        isWithinInterval(otherEnd, { start: reqStart, end: reqEnd }) ||
        isWithinInterval(reqStart, { start: otherStart, end: otherEnd })
      );
    });
  }, [open, request, store.leaveRequests]);

  const handleProcess = () => {
    onProcess(request.id, feedback.trim() ? feedback : undefined);
    setOpen(false);
    setFeedback("");
  };

  const handleDownload = () => {
    if (request.attachment) {
      const a = document.createElement("a");
      a.href = request.attachment.url;
      a.download = request.attachment.name;
      a.click();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isApprove ? "Approve Leave Request" : "Reject Leave Request"}
          </DialogTitle>
          <DialogDescription>
            {employee?.name} has requested {request.durationDays} day(s) of {request.type.toLowerCase()} leave.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="rounded-lg bg-muted p-3 text-sm">
            <p className="font-semibold text-foreground">Reason:</p>
            <p className="text-muted-foreground">{request.reason}</p>
            
            {request.attachment && (
              <div className="mt-3">
                <Button variant="outline" size="sm" className="gap-2" onClick={handleDownload}>
                  <Paperclip className="h-4 w-4" />
                  {request.attachment.name}
                </Button>
              </div>
            )}
          </div>

          {isApprove && overlaps.length > 0 && (
            <div className="rounded-lg border border-warning bg-warning/10 p-3 text-sm text-warning-foreground">
              <div className="flex items-center gap-2 font-semibold">
                <AlertTriangle className="h-4 w-4" />
                Overlapping Leaves Detected
              </div>
              <ul className="mt-2 list-inside list-disc text-muted-foreground">
                {overlaps.map((overlap) => {
                  const emp = employees.find((e) => e.id === overlap.employeeId);
                  return (
                    <li key={overlap.id}>
                      {emp?.name} ({overlap.startDate} to {overlap.endDate})
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="feedback">
              Approver Feedback (Optional)
            </Label>
            <Textarea
              id="feedback"
              placeholder={isApprove ? "e.g., Have a great time!" : "e.g., We need you for the upcoming release."}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant={isApprove ? "default" : "destructive"}
            onClick={handleProcess}
            className={isApprove ? "bg-emerald-600 hover:bg-emerald-700" : ""}
          >
            {isApprove ? (
              <>
                <Check className="mr-2 h-4 w-4" /> Approve
              </>
            ) : (
              <>
                <X className="mr-2 h-4 w-4" /> Reject
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
