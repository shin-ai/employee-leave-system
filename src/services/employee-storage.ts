import { supabase } from "@/lib/supabase";
import type { Employee, EmployeeStatus, Role } from "@/types/employee";
import { ROLES, EMPLOYEE_STATUS } from "@/types/employee";
import type { EmployeeSchemaType } from "@/validators/employee-validator";

// Map DB row (snake_case) to App type (camelCase)
function mapRow(row: Record<string, unknown>): Employee {
  return {
    id: row.id as string,
    name: row.name as string,
    email: row.email as string,
    role: row.role as Role,
    team: row.team as string,
    position: row.position as string,
    joinDate: row.join_date as string,
    leaveBalance: row.leave_balance as number,
    status: row.status as EmployeeStatus,
  };
}

export const EmployeeStorageService = {
  async getEmployees(): Promise<Employee[]> {
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .order("name");
    if (error) {
      console.error("Error fetching employees:", error);
      return [];
    }
    return (data || []).map(mapRow);
  },

  async getEmployeeById(id: string): Promise<Employee | null> {
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !data) return null;
    return mapRow(data);
  },

  async getEmployeeByEmail(email: string): Promise<Employee | null> {
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .eq("email", email)
      .single();
    if (error || !data) return null;
    return mapRow(data);
  },

  async createEmployee(
    data: EmployeeSchemaType & { role?: Role; status?: EmployeeStatus }
  ): Promise<Employee> {
    const { data: row, error } = await supabase
      .from("employees")
      .insert({
        name: data.name,
        email: data.email,
        role: data.role || ROLES.EMPLOYEE,
        team: data.team,
        position: data.position,
        join_date: data.joinDate,
        leave_balance: 12,
        status: data.status || EMPLOYEE_STATUS.ACTIVE,
      })
      .select()
      .single();

    if (error || !row) {
      throw new Error(error?.message || "Failed to create employee");
    }
    return mapRow(row);
  },

  async updateEmployee(id: string, data: Partial<Employee>): Promise<boolean> {
    // Convert camelCase to snake_case for DB
    const dbData: Record<string, unknown> = {};
    if (data.name !== undefined) dbData.name = data.name;
    if (data.email !== undefined) dbData.email = data.email;
    if (data.role !== undefined) dbData.role = data.role;
    if (data.team !== undefined) dbData.team = data.team;
    if (data.position !== undefined) dbData.position = data.position;
    if (data.joinDate !== undefined) dbData.join_date = data.joinDate;
    if (data.leaveBalance !== undefined) dbData.leave_balance = data.leaveBalance;
    if (data.status !== undefined) dbData.status = data.status;
    dbData.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from("employees")
      .update(dbData)
      .eq("id", id);

    if (error) {
      console.error("Error updating employee:", error);
      return false;
    }
    return true;
  },

  async deleteEmployee(id: string): Promise<boolean> {
    const { error } = await supabase
      .from("employees")
      .delete()
      .eq("id", id);
    if (error) {
      console.error("Error deleting employee:", error);
      return false;
    }
    return true;
  },
};
