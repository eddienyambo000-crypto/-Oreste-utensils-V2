import type { SupabaseClient } from "@supabase/supabase-js";
import type { Message } from "@/lib/types";

interface MessageRow {
  id: string;
  name: string;
  phone: string | null;
  message: string;
  status: Message["status"];
  created_at: string;
}

function mapMessage(row: MessageRow): Message {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
  };
}

export interface MessagesResult {
  messages: Message[];
  /** True when the messages table hasn't been created yet (migration 0005). */
  pendingMigration: boolean;
}

export async function fetchMessages(
  supabase: SupabaseClient,
): Promise<MessagesResult> {
  const { data, error } = await supabase
    .from("ou_messages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    if (error.code === "42P01") return { messages: [], pendingMigration: true };
    throw new Error(error.message);
  }
  return { messages: (data as MessageRow[]).map(mapMessage), pendingMigration: false };
}
