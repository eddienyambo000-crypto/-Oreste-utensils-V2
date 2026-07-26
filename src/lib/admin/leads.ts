import type { SupabaseClient } from "@supabase/supabase-js";
import type { Lead } from "@/lib/types";

interface LeadRow {
  id: string;
  business_name: string;
  contact_name: string;
  phone: string;
  business_type: string;
  message: string | null;
  status: Lead["status"];
  created_at: string;
}

function mapLead(row: LeadRow): Lead {
  return {
    id: row.id,
    businessName: row.business_name,
    contactName: row.contact_name,
    phone: row.phone,
    businessType: row.business_type,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
  };
}

export interface LeadsResult {
  leads: Lead[];
  /** True when the leads table hasn't been created yet (migration 0003). */
  pendingMigration: boolean;
}

export async function fetchLeads(supabase: SupabaseClient): Promise<LeadsResult> {
  const { data, error } = await supabase
    .from("ou_leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    if (error.code === "42P01") return { leads: [], pendingMigration: true };
    throw new Error(error.message);
  }
  return { leads: (data as LeadRow[]).map(mapLead), pendingMigration: false };
}
