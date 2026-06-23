"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  employeeSchema,
  type EmployeeSchemaType,
} from "@/validators/employee-validator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { POSITIONS, ROUTES } from "@/constants";
import { Save, ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { TeamStorageService } from "@/services/team-storage";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface EmployeeFormProps {
  defaultValues?: Partial<EmployeeSchemaType>;
  onSubmit: (data: EmployeeSchemaType) => void;
  isSubmitting?: boolean;
  isEditing?: boolean;
}

export function EmployeeForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  isEditing = false,
}: EmployeeFormProps) {
  const [teams, setTeams] = useState<string[]>([]);
  const [newTeamName, setNewTeamName] = useState("");
  const [isAddDeptOpen, setIsAddDeptOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      const names = await TeamStorageService.getTeamNames();
      setTeams(names);
      setIsLoaded(true);
    };
    load();
  }, []);

  const handleAddTeam = async () => {
    if (!newTeamName.trim()) return;
    
    const created = await TeamStorageService.createTeam(newTeamName.trim(), []);
    if (created !== null) {
      const names = await TeamStorageService.getTeamNames();
      setTeams(names);
      form.setValue("team", newTeamName.trim(), { shouldValidate: true });
      toast.success("New team added successfully");
    } else {
      toast.error("Team already exists");
    }
    setNewTeamName("");
    setIsAddDeptOpen(false);
  };

  const form = useForm<EmployeeSchemaType>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      email: defaultValues?.email || "",
      team: defaultValues?.team || "",
      position: defaultValues?.position || "",
      joinDate: defaultValues?.joinDate || new Date().toISOString().split("T")[0],
    },
  });

  if (!isLoaded) {
    return null; // Prevent Select rendering before teams are loaded
  }

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Employee" : "New Employee"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@company.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="team"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Tim</FormLabel>
                      <Dialog open={isAddDeptOpen} onOpenChange={setIsAddDeptOpen}>
                        <DialogTrigger render={<Button render={<span />} variant="ghost" size="sm" className="h-auto p-0 text-xs text-primary hover:text-primary hover:bg-transparent" />}>
                          <Plus className="h-3 w-3 mr-1" />
                          New Unit
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Add New Team</DialogTitle>
                            <DialogDescription>
                              Create a new team for your organization.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <FormLabel className="text-right">Name</FormLabel>
                              <Input
                                value={newTeamName}
                                onChange={(e) => setNewTeamName(e.target.value)}
                                placeholder="e.g. Research & Development"
                                className="col-span-3"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button type="button" onClick={handleAddTeam}>Save Team</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a team" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {teams.map((team) => (
                          <SelectItem key={team} value={team}>
                            {team}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position / Jabatan</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a position" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {POSITIONS.map((pos) => (
                          <SelectItem key={pos} value={pos}>
                            {pos}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
                control={form.control}
                name="joinDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Join Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Link href={ROUTES.EMPLOYEES}>
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
                {isSubmitting ? "Saving..." : "Save Employee"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
