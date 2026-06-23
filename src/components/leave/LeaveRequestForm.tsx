"use client";

import { useEffect } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import DOMPurify from "dompurify";
import {
  leaveRequestSchema,
  type LeaveRequestSchemaType,
} from "@/validators/leave-request-validator";
import { LEAVE_TYPES } from "@/types/leave-request";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Employee } from "@/types/employee";
import { ROUTES } from "@/constants";
import { CalendarIcon, User, Briefcase, FileText, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import type { AuthSession } from "@/types/auth";

interface LeaveRequestFormProps {
  employees: Employee[];
  onSubmit: (data: LeaveRequestSchemaType) => void;
  isSubmitting?: boolean;
  loggedInUser: AuthSession;
  isAdmin: boolean;
}

export function LeaveRequestForm({
  employees,
  onSubmit,
  isSubmitting = false,
  loggedInUser,
  isAdmin,
}: LeaveRequestFormProps) {
  
  const form = useForm<LeaveRequestSchemaType>({
    resolver: zodResolver(leaveRequestSchema),
    defaultValues: {
      employeeId: isAdmin ? "" : loggedInUser.userId || "", // Auto-fill for employees
      type: LEAVE_TYPES.ANNUAL,
      startDate: "",
      endDate: "",
      reason: "",
      approverId: "",
    },
  });

  // Prevent accidental navigation if form has unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (form.formState.isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [form.formState.isDirty]);

  const handleSafeSubmit = (data: LeaveRequestSchemaType) => {
    // Sanitize the reason input to prevent XSS
    const sanitizedReason = DOMPurify.sanitize(data.reason);
    
    onSubmit({
      ...data,
      reason: sanitizedReason,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024) {
      alert("File size exceeds 500KB limit.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      form.setValue("attachment", {
        name: file.name,
        url: result,
        size: file.size,
      }, { shouldValidate: true });
    };
    reader.readAsDataURL(file);
  };

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>New Leave Request</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSafeSubmit)} className="space-y-6">
            
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
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            {field.value ? (
                              <SelectValue placeholder="Select an employee">
                                {(() => {
                                  const emp = employees.find((e) => e.id === field.value);
                                  return emp ? `${emp.name} — ${emp.team}` : field.value;
                                })()}
                              </SelectValue>
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
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          {field.value ? (
                            <SelectValue placeholder="Select type">
                              {field.value.charAt(0) + field.value.slice(1).toLowerCase()}
                            </SelectValue>
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
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <Label htmlFor="attachment">Supporting Document (Optional)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="attachment"
                  type="file"
                  accept=".pdf,image/*"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Max file size: 500KB. Allowed types: PDF, Images.
              </p>
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Link href={ROUTES.LEAVE}>
                <Button variant="outline" className="gap-2" type="button">
                  <ArrowLeft className="h-4 w-4" />
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                {isSubmitting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
