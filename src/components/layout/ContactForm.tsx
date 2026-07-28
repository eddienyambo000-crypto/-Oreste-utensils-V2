"use client";

import { useState } from "react";
import { IconArrowRight, IconCheck } from "@/components/ui/icons";

export function ContactForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim() || null,
          message: message.trim(),
          company,
        }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      setSent(true);
    } catch {
      setError("Network error. Please check your connection and try again.");
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-sage/30 bg-sage/8 p-8 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sage/15 text-sage">
          <IconCheck className="h-6 w-6" />
        </span>
        <h2 className="mt-4 font-display text-xl font-semibold">Message sent</h2>
        <p className="mt-2 text-ink-soft">
          Thanks for reaching out — we&apos;ve got your message and will get back to
          you shortly, usually within opening hours.
        </p>
      </div>
    );
  }

  const fieldClass =
    "mt-1.5 w-full rounded-xl border border-line-strong bg-porcelain px-4 py-2.5 text-ink placeholder:text-ink-faint";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-line bg-surface p-6">
      <div>
        <h2 className="font-display text-xl font-semibold">Send us a message</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Fill this in and we&apos;ll get back to you — usually within opening hours.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="cf-name" className="text-sm font-medium text-ink">
            Your name <span className="text-copper">*</span>
          </label>
          <input
            id="cf-name"
            type="text"
            required
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={fieldClass}
            placeholder="e.g. Oreste"
          />
        </div>
        <div>
          <label htmlFor="cf-phone" className="text-sm font-medium text-ink">
            Phone <span className="text-ink-faint">(optional)</span>
          </label>
          <input
            id="cf-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className={fieldClass}
            placeholder="+250 783 399 163"
          />
        </div>
      </div>
      <div>
        <label htmlFor="cf-message" className="text-sm font-medium text-ink">
          Message <span className="text-copper">*</span>
        </label>
        <textarea
          id="cf-message"
          required
          rows={4}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className={`${fieldClass} resize-y`}
          placeholder="How can we help?"
        />
      </div>

      {/* Honeypot */}
      <div className="hidden" aria-hidden>
        <label htmlFor="cf-company">Company (leave blank)</label>
        <input
          id="cf-company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={company}
          onChange={(event) => setCompany(event.target.value)}
        />
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-copper-tint/50 px-4 py-3 text-sm text-copper-deep">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-copper px-6 py-3.5 font-medium text-white shadow-copper transition-[background-color,transform] duration-200 hover:bg-copper-deep active:scale-[0.98] disabled:cursor-wait disabled:opacity-70 sm:w-auto"
      >
        {submitting ? (
          "Sending…"
        ) : (
          <>
            Send message
            <IconArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  );
}
