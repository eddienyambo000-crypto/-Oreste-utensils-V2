import { MessageCard } from "../MessageCard";
import { requireAdmin } from "@/lib/supabase/adminGuard";
import { fetchMessages } from "@/lib/admin/messages";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const { supabase } = await requireAdmin();
  if (!supabase) return null;

  const { messages, pendingMigration } = await fetchMessages(supabase);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-[-0.02em]">
          Messages <span className="text-ink-faint">({messages.length})</span>
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Messages sent through the Contact page form.
        </p>
      </div>

      {pendingMigration ? (
        <div className="rounded-2xl border border-copper/30 bg-copper-tint/30 p-6 text-sm text-copper-deep">
          <p className="font-medium">One quick step to enable messages.</p>
          <p className="mt-1">
            Run{" "}
            <code className="rounded bg-porcelain px-1.5 py-0.5">
              supabase/migrations/0005_messages.sql
            </code>{" "}
            in the Supabase SQL editor. Until then, contact-form messages are
            accepted but not recorded here.
          </p>
        </div>
      ) : messages.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line-strong bg-surface p-10 text-center text-ink-soft">
          No messages yet. Anything sent from the Contact page lands here.
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {messages.map((item) => (
            <MessageCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
