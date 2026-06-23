"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import DOMPurify from "dompurify";
import {
  leaveRequestSchema,
  type LeaveRequestSchemaType,
} from "@/validators/leave-request-validator";
import { LEAVE_TYPES } from "@/types/leave-request";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EmployeeStorageService } from "@/services/employee-storage";
import { LeaveStorageService } from "@/services/leave-storage";
import { useAppStore } from "@/store/app-store";
import type { Employee } from "@/types/employee";
import type { AuthSession } from "@/types/auth";
import { toast } from "sonner";
import { Save, Shield } from "lucide-react";

interface LeaveRequestFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loggedInUser: AuthSession;
  isAdmin: boolean;
  onSave: () => void;
}

export function LeaveRequestFormDialog({
  open,
  onOpenChange,
  loggedInUser,
  isAdmin,
  onSave,
}: LeaveRequestFormDialogProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LeaveRequestSchemaType>({
    resolver: zodResolver(leaveRequestSchema),
    defaultValues: {
      employeeId: isAdmin ? "" : loggedInUser.userId || "",
      type: LEAVE_TYPES.ANNUAL,
      startDate: "",
      endDate: "",
      reason: "",
      approverId: "",
    },
  });

  // Watch employeeId to get PICs for that employee's team
  const selectedEmployeeId = form.watch("employeeId");
  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId);
  const { teams } = useAppStore();
  const teamPicIds = selectedEmployee
    ? (teams.find((t) => t.name === selectedEmployee.team)?.picEmployeeIds || [])
    : [];
  const teamPics = employees.filter((e) => teamPicIds.includes(e.id));

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      const loadEmps = async () => {
        const emps = await EmployeeStorageService.getEmployees();
        setEmployees(emps);
      };
      loadEmps();
      form.reset({
        employeeId: isAdmin ? "" : loggedInUser.userId || "",
        type: LEAVE_TYPES.ANNUAL,
        startDate: "",
        endDate: "",
        reason: "",
        approverId: "",
      });
    }
  }, [open, form, isAdmin, loggedInUser.userId]);

  // Auto-select approver if only 1 PIC
  useEffect(() => {
    if (teamPics.length === 1) {
      form.setValue("approverId", teamPics[0].id, { shouldValidate: true });
    }
  }, [teamPics, form]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024) {
      toast.error("File size exceeds 500KB limit.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      form.setValue(
        "attachment",
        { name: file.name, url: result, size: file.size },
        { shouldValidate: true }
      );
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (data: LeaveRequestSchemaType) => {
    setIsSubmitting(true);
    try {
      const sanitizedReason = DOMPurify.sanitize(data.reason);
      await LeaveStorageService.createLeaveRequest({ ...data, reason: sanitizedReason });
      toast.success("Leave request submitted successfully");
      onSave();
      onOpenChange(false);
    } catch {
      toast.error("Gagal mengajukan cuti. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Leave Request</DialogTitle>
          <DialogDescription>
            Fill in the details below to submit a leave request.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee</FormLabel>
                    {!isAdmin ? (
                      <div>
                        <Input
                          disabled
                          value={(() => {
                            const emp = employees.find((e) => e.id === loggedInUser.userId);
                            return emp ? `${emp.name} — ${emp.team}` : "Loading...";
                          })()}
                        />
                        <input type="hidden" {...field} />
                      </div>
                    ) : (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            {field.value ? (
                              <span>
                                {(() => {
                                  const emp = employees.find((e) => e.id === field.value);
                                  return emp ? `${emp.name} — ${emp.team}` : "Select employee";
                                })()}
                              </span>
                            ) : (
                              <SelectValue placeholder="Select an employee" />
                            )}
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {employees.map((emp) => (
                            <SelectItem key={emp.id} value={emp.id}>
                              {`${emp.name} — ${emp.team}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Leave Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          {field.value ? (
                            <span>{field.value.charAt(0) + field.value.slice(1).toLowerCase()}</span>
                          ) : (
                            <SelectValue placeholder="Select type" />
                          )}
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(LEAVE_TYPES).map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0) + type.slice(1).toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Approver Dropdown */}
            <FormField
              control={form.control}
              name="approverId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-emerald-600" />
                    Approver (PIC)
                  </FormLabel>
                  {!selectedEmployeeId ? (
                    <div className="rounded-md border border-dashed p-3 text-center">
                      <p className="text-sm text-muted-foreground">
                        Pilih employee terlebih dahulu.
                      </p>
                    </div>
                  ) : teamPics.length === 0 ? (
                    <div className="rounded-md border border-dashed border-amber-300 bg-amber-50 dark:bg-amber-950/20 p-3 text-center">
                      <p className="text-sm text-amber-700 dark:text-amber-400">
                        Belum ada PIC di tim {selectedEmployee?.team}. Hubungi admin.
                      </p>
                    </div>
                  ) : (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          {field.value ? (
                            <span>
                              {(() => {
                                const pic = employees.find((e) => e.id === field.value);
                                return pic ? `${pic.name} — ${pic.position}` : "Select approver";
                              })()}
                            </span>
                          ) : (
                            <SelectValue placeholder="Pilih approver..." />
                          )}
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {teamPics.map((pic) => (
                          <SelectItem key={pic.id} value={pic.id}>
                            {pic.name} — {pic.position}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter the reason for leave"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <Label htmlFor="attachment-dialog">Supporting Document (Optional)</Label>
              <Input
                id="attachment-dialog"
                type="file"
                accept=".pdf,image/*"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground">
                Max file size: 500KB. Allowed: PDF, Images.
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                {isSubmitting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
