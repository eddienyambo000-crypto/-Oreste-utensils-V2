"use client";

import { useState, useTransition } from "react";
import { updateLeadStatus } from "@/app/admin/actions";
import { IconWhatsApp } from "@/components/ui/icons";
import type { Lead, LeadStatus } from "@/lib/types";
import { whatsappLink } from "@/lib/whatsapp";

const STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "quoted", label: "Quoted" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
];

const STATUS_STYLES: Record<LeadStatus, string> = {
  new: "bg-copper-tint text-copper-deep",
  contacted: "bg-ink/10 text-ink",
  quoted: "bg-sage/15 text-sage",
  won: "bg-sage/25 text-sage",
  lost: "bg-ink/8 text-ink-faint",
};

export function LeadCard({ lead }: { lead: Lead }) {
  const [status, setStatus] = useState<LeadStatus>(lead.status);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function changeStatus(next: LeadStatus) {
    const previous = status;
    setStatus(next);
    setError(null);
    startTransition(async () => {
      const result = await updateLeadStatus(lead.id, next);
      if (!result.ok) {
        setStatus(previous);
        setError(result.error);
      }
    });
  }

  const created = new Date(lead.createdAt);

  return (
    <article className="rounded-2xl border border-line bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold">{lead.businessName}</h3>
          <p className="mt-0.5 text-sm text-ink-soft">
            {lead.businessType} · {lead.contactName}
          </p>
          <p className="mt-0.5 text-xs text-ink-faint">
            {created.toLocaleString("en-GB", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[status]}`}>
          {STATUS_OPTIONS.find((o) => o.value === status)?.label}
        </span>
      </div>

      {lead.message && (
        <p className="mt-3 rounded-lg bg-cream/60 px-3 py-2 text-sm text-ink-soft">
          {lead.message}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <a
          href={whatsappLink(
            `Hello ${lead.contactName}, thank you for your wholesale enquiry to Oreste Utensils. Here is our trade pricing…`,
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-copper transition-colors duration-200 hover:text-copper-deep"
        >
          <IconWhatsApp className="h-4 w-4" />
          {lead.phone}
        </a>
        <label className="flex items-center gap-2 text-sm">
          <span className="sr-only">Update status for {lead.businessName}</span>
          <select
            value={status}
            disabled={pending}
            onChange={(event) => changeStatus(event.target.value as LeadStatus)}
            className="cursor-pointer rounded-full border border-line-strong bg-porcelain px-4 py-1.5 text-sm font-medium disabled:opacity-60"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-copper-deep">
          {error}
        </p>
      )}
    </article>
  );
}
