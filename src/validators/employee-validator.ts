import { z } from "zod";

export const employeeSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  email: z.string().email("Invalid email address"),
  team: z.string().min(1, "Please select a team"),
  position: z.string().min(2, "Position must be at least 2 characters long"),
  joinDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid join date",
  }),
});

export type EmployeeSchemaType = z.infer<typeof employeeSchema>;
