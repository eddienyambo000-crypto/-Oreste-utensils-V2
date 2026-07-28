"use client";

import { useState } from "react";
import { IconCheck, IconWhatsApp } from "@/components/ui/icons";
import { BUSINESS_TYPES, type BusinessType } from "@/lib/types";
import { buildTradeMessage, whatsappLink } from "@/lib/whatsapp";

export function TradeQuoteForm() {
  const [businessName, setBusinessName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [businessType, setBusinessType] = useState<BusinessType>(BUSINESS_TYPES[0]);
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const payload = {
      businessName: businessName.trim(),
      contactName: contactName.trim(),
      phone: phone.trim(),
      businessType,
      message: message.trim() || null,
      company,
    };

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      window.open(
        whatsappLink(buildTradeMessage(payload)),
        "_blank",
        "noopener,noreferrer",
      );
      setDone(true);
    } catch {
      setError("Network error. Please check your connection and try again.");
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-3xl border border-sage/30 bg-sage/8 p-8 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sage/15 text-sage">
          <IconCheck className="h-6 w-6" />
        </span>
        <h3 className="mt-4 font-display text-xl font-semibold">Request received</h3>
        <p className="mt-2 text-ink-soft">
          We&apos;ve opened WhatsApp with your details — send the message and our
          trade team will come back with pricing, usually within one business day.
        </p>
      </div>
    );
  }

  const fieldClass =
    "mt-1.5 w-full rounded-xl border border-line-strong bg-porcelain px-4 py-2.5 text-ink placeholder:text-ink-faint";

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl border border-line bg-surface p-6 shadow-card sm:p-8">
      <div>
        <h3 className="font-display text-2xl font-semibold tracking-[-0.01em]">
          Get wholesale pricing
        </h3>
        <p className="mt-1.5 text-sm text-ink-soft">
          Tell us about your business and we&apos;ll send a trade quote. No
          obligation, no account fees.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="businessName" className="text-sm font-medium text-ink">
            Business name <span className="text-copper">*</span>
          </label>
          <input
            id="businessName"
            type="text"
            required
            autoComplete="organization"
            value={businessName}
            onChange={(event) => setBusinessName(event.target.value)}
            className={fieldClass}
            placeholder="e.g. Hôtel des Mille Collines"
          />
        </div>
        <div>
          <label htmlFor="businessType" className="text-sm font-medium text-ink">
            Business type <span className="text-copper">*</span>
          </label>
          <select
            id="businessType"
            value={businessType}
            onChange={(event) => setBusinessType(event.target.value as BusinessType)}
            className={`${fieldClass} cursor-pointer`}
          >
            {BUSINESS_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="contactName" className="text-sm font-medium text-ink">
            Your name <span className="text-copper">*</span>
          </label>
          <input
            id="contactName"
            type="text"
            required
            autoComplete="name"
            value={contactName}
            onChange={(event) => setContactName(event.target.value)}
            className={fieldClass}
            placeholder="e.g. Oreste"
          />
        </div>
        <div>
          <label htmlFor="tradePhone" className="text-sm font-medium text-ink">
            Phone / WhatsApp <span className="text-copper">*</span>
          </label>
          <input
            id="tradePhone"
            type="tel"
            required
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
        <label htmlFor="tradeMessage" className="text-sm font-medium text-ink">
          What do you need? <span className="text-ink-faint">(optional)</span>
        </label>
        <textarea
          id="tradeMessage"
          rows={3}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className={`${fieldClass} resize-none`}
          placeholder="e.g. 40 dinner plates, 20 chef's knives, monthly restock…"
        />
      </div>

      <div className="hidden" aria-hidden>
        <label htmlFor="tradeCompany">Company (leave blank)</label>
        <input
          id="tradeCompany"
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
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-copper px-6 py-3.5 font-medium text-white shadow-copper transition-[background-color,transform] duration-200 hover:bg-copper-deep active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
      >
        {submitting ? (
          "Sending…"
        ) : (
          <>
            <IconWhatsApp className="h-5 w-5" />
            Request my trade quote
          </>
        )}
      </button>
      <p className="text-center text-xs text-ink-faint">
        We reply on WhatsApp, usually within one business day.
      </p>
    </form>
  );
}
