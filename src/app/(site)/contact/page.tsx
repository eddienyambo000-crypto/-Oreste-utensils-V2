import type { Metadata } from "next";
import { ContactForm } from "@/components/layout/ContactForm";
import { Reveal } from "@/components/ui/Reveal";
import {
  IconClock,
  IconInstagram,
  IconMapPin,
  IconPhone,
  IconWhatsApp,
} from "@/components/ui/icons";
import { BUSINESS } from "@/lib/constants";
import { whatsappLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Visit Us — City Plaza, Kigali",
  description:
    "Find Oreste Utensils at City Plaza, Kigali, Rwanda. Open every day 8:00 AM – 9:00 PM. Call or WhatsApp +250 783 399 163 for kitchenware, orders and delivery across Kigali.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <Reveal>
        <header className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-copper">
            Come say hello
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-[-0.02em] sm:text-5xl">
            Visit the store
          </h1>
          {/* Consistent NAP block — matches footer, JSON-LD and llms.txt exactly. */}
          <p className="mt-4 leading-relaxed text-ink-soft">
            Oreste Utensils is located at {BUSINESS.address.street},{" "}
            {BUSINESS.address.city}, {BUSINESS.address.country}. We&apos;re open every
            day from {BUSINESS.hoursDisplay}. Drop in to browse, or reach us on
            WhatsApp to order for delivery anywhere in Kigali.
          </p>
        </header>
      </Reveal>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.3fr] lg:gap-12">
        <Reveal className="space-y-4">
          <a
            href={BUSINESS.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-4 rounded-2xl border border-line bg-surface p-5 transition-colors duration-200 hover:border-copper"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-copper-tint text-copper">
              <IconMapPin className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint">
                Address
              </span>
              <span className="mt-1 block font-medium text-ink">
                {BUSINESS.address.street}, {BUSINESS.address.city}, {BUSINESS.address.country}
              </span>
              <span className="mt-0.5 block text-sm text-copper">Open in Google Maps</span>
            </span>
          </a>

          <div className="flex items-start gap-4 rounded-2xl border border-line bg-surface p-5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-copper-tint text-copper">
              <IconClock className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint">
                Opening hours
              </span>
              <span className="mt-1 block font-medium text-ink">{BUSINESS.hours.days}</span>
              <span className="mt-0.5 block text-sm text-ink-soft">
                {BUSINESS.hoursDisplay}
              </span>
            </span>
          </div>

          <a
            href={`tel:${BUSINESS.phoneE164}`}
            className="flex items-start gap-4 rounded-2xl border border-line bg-surface p-5 transition-colors duration-200 hover:border-copper"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-copper-tint text-copper">
              <IconPhone className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint">
                Phone
              </span>
              <span className="mt-1 block font-medium text-ink">{BUSINESS.phoneDisplay}</span>
            </span>
          </a>

          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href={whatsappLink("Hello Oreste Utensils! I'd like to place an order / ask a question.")}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 font-medium text-white transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <IconWhatsApp className="h-5 w-5" />
              Message on WhatsApp
            </a>
            <a
              href={BUSINESS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full border border-line-strong bg-surface px-6 py-3.5 font-medium text-ink transition-colors duration-200 hover:border-copper hover:text-copper active:scale-[0.98]"
            >
              <IconInstagram className="h-5 w-5" />
              {BUSINESS.instagramHandle}
            </a>
          </div>
        </Reveal>

        {/* Map embed — lazy, no tracking cookies until interaction. A branded
            fallback sits behind it, so if the embed is ever blocked (some
            browsers block third-party frames) the panel still reads as a
            deliberate "find us" card instead of an empty box. */}
        <Reveal
          delay={120}
          className="relative min-h-80 overflow-hidden rounded-3xl border border-line shadow-card"
        >
          <a
            href={BUSINESS.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-0 z-0 flex flex-col items-center justify-center gap-3 bg-cream px-6 text-center"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-copper-tint text-copper">
              <IconMapPin className="h-6 w-6" />
            </span>
            <span className="font-display text-lg font-semibold text-ink">
              {BUSINESS.address.street}, {BUSINESS.address.city}
            </span>
            <span className="text-sm font-medium text-copper">
              Open in Google Maps →
            </span>
          </a>
          <iframe
            title="Oreste Utensils location — City Plaza, Kigali"
            src="https://www.google.com/maps?q=City%20Plaza%2C%20Kigali%2C%20Rwanda&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="relative z-10 h-full min-h-80 w-full bg-transparent"
          />
        </Reveal>
      </div>

      <Reveal className="mt-8 max-w-2xl">
        <ContactForm />
      </Reveal>
    </div>
  );
}
