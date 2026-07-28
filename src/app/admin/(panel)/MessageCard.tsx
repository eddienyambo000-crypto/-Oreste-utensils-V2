"use client";

import { useState, useTransition } from "react";
import { updateMessageStatus } from "@/app/admin/actions";
import { IconWhatsApp } from "@/components/ui/icons";
import type { Message, MessageStatus } from "@/lib/types";
import { whatsappLink } from "@/lib/whatsapp";

const STATUS_OPTIONS: { value: MessageStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "read", label: "Read" },
  { value: "replied", label: "Replied" },
];

const STATUS_STYLES: Record<MessageStatus, string> = {
  new: "bg-copper-tint text-copper-deep",
  read: "bg-ink/10 text-ink",
  replied: "bg-sage/20 text-sage",
};

export function MessageCard({ item }: { item: Message }) {
  const [status, setStatus] = useState<MessageStatus>(item.status);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function changeStatus(next: MessageStatus) {
    const previous = status;
    setStatus(next);
    setError(null);
    startTransition(async () => {
      const result = await updateMessageStatus(item.id, next);
      if (!result.ok) {
        setStatus(previous);
        setError(result.error);
      }
    });
  }

  const created = new Date(item.createdAt);

  return (
    <article className="rounded-2xl border border-line bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold">{item.name}</h3>
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

      <p className="mt-3 whitespace-pre-wrap rounded-lg bg-cream/60 px-3 py-2 text-sm text-ink-soft">
        {item.message}
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        {item.phone ? (
          <a
            href={whatsappLink(
              `Hello ${item.name}, thank you for messaging Oreste Utensils.`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-copper transition-colors duration-200 hover:text-copper-deep"
          >
            <IconWhatsApp className="h-4 w-4" />
            {item.phone}
          </a>
        ) : (
          <span className="text-sm text-ink-faint">No phone provided</span>
        )}
        <label className="flex items-center gap-2 text-sm">
          <span className="sr-only">Update status for {item.name}</span>
          <select
            value={status}
            disabled={pending}
            onChange={(event) => changeStatus(event.target.value as MessageStatus)}
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
