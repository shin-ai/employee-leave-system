import { supabase } from "@/lib/supabase";
import type { Team } from "@/types/team";

// Map DB rows to Team type (team_pics joined)
function mapTeamRows(
  teams: Record<string, unknown>[],
  pics: Record<string, unknown>[]
): Team[] {
  return teams.map((t) => ({
    id: t.id as string,
    name: t.name as string,
    picEmployeeIds: pics
      .filter((p) => p.team_id === t.id)
      .map((p) => p.employee_id as string),
  }));
}

export const TeamStorageService = {
  async getTeams(): Promise<Team[]> {
    const [teamsRes, picsRes] = await Promise.all([
      supabase.from("teams").select("*").order("name"),
      supabase.from("team_pics").select("*"),
    ]);
    if (teamsRes.error || picsRes.error) {
      console.error("Error fetching teams:", teamsRes.error || picsRes.error);
      return [];
    }
    return mapTeamRows(teamsRes.data || [], picsRes.data || []);
  },

  async getTeamById(id: string): Promise<Team | null> {
    const teams = await this.getTeams();
    return teams.find((t) => t.id === id) || null;
  },

  async getTeamByName(name: string): Promise<Team | null> {
    const teams = await this.getTeams();
    return teams.find((t) => t.name === name) || null;
  },

  async getTeamNames(): Promise<string[]> {
    const { data, error } = await supabase
      .from("teams")
      .select("name")
      .order("name");
    if (error) return [];
    return (data || []).map((t) => t.name as string);
  },

  async createTeam(name: string, picEmployeeIds: string[]): Promise<Team | null> {
    const trimmed = name.trim();
    if (!trimmed) return null;

    // Check duplicate
    const { data: existing } = await supabase
      .from("teams")
      .select("id")
      .ilike("name", trimmed)
      .maybeSingle();
    if (existing) return null;

    const { data: row, error } = await supabase
      .from("teams")
      .insert({ name: trimmed })
      .select()
      .single();
    if (error || !row) return null;

    // Insert PICs
    if (picEmployeeIds.length > 0) {
      await supabase.from("team_pics").insert(
        picEmployeeIds.map((empId) => ({
          team_id: row.id,
          employee_id: empId,
        }))
      );
    }

    return {
      id: row.id as string,
      name: row.name as string,
      picEmployeeIds,
    };
  },

  async updateTeam(
    id: string,
    data: Partial<Omit<Team, "id">>
  ): Promise<boolean> {
    if (data.name) {
      const trimmed = data.name.trim();
      // Check duplicate
      const { data: existing } = await supabase
        .from("teams")
        .select("id")
        .ilike("name", trimmed)
        .neq("id", id)
        .maybeSingle();
      if (existing) return false;

      const { error } = await supabase
        .from("teams")
        .update({ name: trimmed, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) return false;
    }

    if (data.picEmployeeIds !== undefined) {
      // Replace all PICs: delete old, insert new
      await supabase.from("team_pics").delete().eq("team_id", id);
      if (data.picEmployeeIds.length > 0) {
        await supabase.from("team_pics").insert(
          data.picEmployeeIds.map((empId) => ({
            team_id: id,
            employee_id: empId,
          }))
        );
      }
    }

    return true;
  },

  async deleteTeam(id: string): Promise<boolean> {
    const { error } = await supabase.from("teams").delete().eq("id", id);
    if (error) return false;
    return true;
  },

  async getPicIdsForTeam(teamName: string): Promise<string[]> {
    const team = await this.getTeamByName(teamName);
    return team?.picEmployeeIds || [];
  },

  // Synchronous version using cached data (for components that can't await)
  isPicForTeam(employeeId: string, teamName: string, cachedTeams?: Team[]): boolean {
    if (!cachedTeams) return false;
    const team = cachedTeams.find((t) => t.name === teamName);
    return team?.picEmployeeIds.includes(employeeId) || false;
  },
};
