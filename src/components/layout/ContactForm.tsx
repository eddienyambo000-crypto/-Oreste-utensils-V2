"use client";

import { useState } from "react";
import { IconWhatsApp } from "@/components/ui/icons";
import { whatsappLink } from "@/lib/whatsapp";

export function ContactForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const lines = [
      "Message from oresteutensils.com",
      "",
      `Name: ${name.trim()}`,
      phone.trim() ? `Phone: ${phone.trim()}` : null,
      "",
      message.trim(),
    ].filter(Boolean);
    window.open(
      whatsappLink(lines.join("\n")),
      "_blank",
      "noopener,noreferrer",
    );
  }

  const fieldClass =
    "mt-1.5 w-full rounded-xl border border-line-strong bg-porcelain px-4 py-2.5 text-ink placeholder:text-ink-faint";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-line bg-surface p-6">
      <div>
        <h2 className="font-display text-xl font-semibold">Send us a message</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Fill this in and we&apos;ll open WhatsApp with your message ready to send —
          we reply fast during opening hours.
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
            placeholder="e.g. Aline Uwase"
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
            placeholder="e.g. 078 123 4567"
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
      <button
        type="submit"
        className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 font-medium text-white transition-transform duration-200 hover:scale-[1.01] active:scale-[0.98] sm:w-auto"
      >
        <IconWhatsApp className="h-5 w-5" />
        Send via WhatsApp
      </button>
    </form>
  );
}
