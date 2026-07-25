"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "./CartProvider";
import { FreeDeliveryMeter } from "./FreeDeliveryMeter";
import {
  IconArrowRight,
  IconBag,
  IconMinus,
  IconPlus,
  IconTrash,
  IconWhatsApp,
} from "@/components/ui/icons";
import { KIGALI_AREAS } from "@/lib/constants";
import { formatRwf } from "@/lib/format";
import type { Fulfillment } from "@/lib/types";
import { buildOrderMessage, whatsappLink } from "@/lib/whatsapp";

interface CheckoutFormProps {
  freeDeliveryThreshold: number;
}

export function CheckoutForm({ freeDeliveryThreshold }: CheckoutFormProps) {
  const { items, subtotal, setQuantity, removeItem, clearCart } = useCart();

  const [customerName, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [fulfillment, setFulfillment] = useState<Fulfillment>("delivery");
  const [deliveryArea, setDeliveryArea] = useState<string>(KIGALI_AREAS[0]);
  const [note, setNote] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const freeDelivery = fulfillment === "pickup" || subtotal >= freeDeliveryThreshold;

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-line-strong bg-surface px-6 py-20 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cream text-ink-faint">
          <IconBag className="h-6 w-6" />
        </span>
        <h2 className="mt-5 font-display text-xl font-semibold">Your cart is empty</h2>
        <p className="mt-2 text-ink-soft">
          Once you add a few pieces, they&apos;ll show up here ready to order.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-full bg-copper px-6 py-3 font-medium text-white shadow-copper transition-[background-color,transform] duration-200 hover:bg-copper-deep active:scale-[0.98]"
        >
          Browse the shop
          <IconArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const payload = {
      customerName: customerName.trim(),
      phone: phone.trim(),
      fulfillment,
      deliveryArea: fulfillment === "delivery" ? deliveryArea : null,
      note: note.trim() || null,
      items,
      company,
    };

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        setError(data?.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      // Order recorded — hand off to WhatsApp with the full summary.
      const message = buildOrderMessage({
        items,
        customerName: payload.customerName,
        phone: payload.phone,
        fulfillment,
        deliveryArea: payload.deliveryArea,
        note: payload.note,
      });
      window.open(whatsappLink(message), "_blank", "noopener,noreferrer");
      clearCart();
    } catch {
      setError("Network error. Please check your connection and try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-12">
      {/* Left: line items + details */}
      <div className="space-y-10">
        <section aria-labelledby="items-heading">
          <h2 id="items-heading" className="font-display text-xl font-semibold">
            Your items
          </h2>
          <ul className="mt-4 divide-y divide-line rounded-2xl border border-line bg-surface">
            {items.map((item) => (
              <li key={item.productId} className="flex gap-4 p-4">
                <Link
                  href={`/product/${item.slug}`}
                  className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-cream"
                >
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  )}
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      href={`/product/${item.slug}`}
                      className="text-sm font-medium leading-snug text-ink transition-colors duration-200 hover:text-copper"
                    >
                      {item.name}
                    </Link>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      aria-label={`Remove ${item.name}`}
                      className="cursor-pointer rounded p-1 text-ink-faint transition-colors duration-200 hover:text-copper-deep active:scale-95"
                    >
                      <IconTrash className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="mt-0.5 text-sm text-ink-faint">
                    {formatRwf(item.priceRwf)} each
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <div className="flex items-center rounded-full border border-line-strong">
                      <button
                        type="button"
                        onClick={() => setQuantity(item.productId, item.quantity - 1)}
                        aria-label={`Decrease quantity of ${item.name}`}
                        className="cursor-pointer p-1.5 text-ink-soft transition-colors duration-200 hover:text-ink active:scale-90"
                      >
                        <IconMinus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity(item.productId, item.quantity + 1)}
                        aria-label={`Increase quantity of ${item.name}`}
                        className="cursor-pointer p-1.5 text-ink-soft transition-colors duration-200 hover:text-ink active:scale-90"
                      >
                        <IconPlus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="text-sm font-semibold tabular-nums">
                      {formatRwf(item.priceRwf * item.quantity)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="details-heading">
          <h2 id="details-heading" className="font-display text-xl font-semibold">
            Your details
          </h2>

          <div className="mt-4 space-y-5 rounded-2xl border border-line bg-surface p-5 sm:p-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="text-sm font-medium text-ink">
                  Full name <span className="text-copper">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  autoComplete="name"
                  value={customerName}
                  onChange={(event) => setName(event.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-line-strong bg-porcelain px-4 py-2.5 text-ink placeholder:text-ink-faint"
                  placeholder="e.g. Aline Uwase"
                />
              </div>
              <div>
                <label htmlFor="phone" className="text-sm font-medium text-ink">
                  Phone / WhatsApp <span className="text-copper">*</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  inputMode="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-line-strong bg-porcelain px-4 py-2.5 text-ink placeholder:text-ink-faint"
                  placeholder="e.g. 078 123 4567"
                />
              </div>
            </div>

            <fieldset>
              <legend className="text-sm font-medium text-ink">How would you like it?</legend>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                {(
                  [
                    { value: "delivery", title: "Deliver to me", sub: "Anywhere in Kigali" },
                    { value: "pickup", title: "I'll collect it", sub: "Free at City Plaza" },
                  ] as const
                ).map((option) => {
                  const active = fulfillment === option.value;
                  return (
                    <label
                      key={option.value}
                      className={`flex cursor-pointer flex-col rounded-xl border p-4 transition-colors duration-200 ${
                        active
                          ? "border-copper bg-copper-tint/40"
                          : "border-line-strong bg-porcelain hover:border-ink"
                      }`}
                    >
                      <input
                        type="radio"
                        name="fulfillment"
                        value={option.value}
                        checked={active}
                        onChange={() => setFulfillment(option.value)}
                        className="sr-only"
                      />
                      <span className="font-medium text-ink">{option.title}</span>
                      <span className="mt-0.5 text-sm text-ink-soft">{option.sub}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            {fulfillment === "delivery" && (
              <div>
                <label htmlFor="area" className="text-sm font-medium text-ink">
                  Delivery area <span className="text-copper">*</span>
                </label>
                <select
                  id="area"
                  value={deliveryArea}
                  onChange={(event) => setDeliveryArea(event.target.value)}
                  className="mt-1.5 w-full cursor-pointer rounded-xl border border-line-strong bg-porcelain px-4 py-2.5 text-ink"
                >
                  {KIGALI_AREAS.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
                <p className="mt-1.5 text-xs text-ink-faint">
                  We&apos;ll confirm the exact delivery fee on WhatsApp based on your
                  location{freeDelivery ? " — but this order already qualifies for free delivery." : "."}
                </p>
              </div>
            )}

            <div>
              <label htmlFor="note" className="text-sm font-medium text-ink">
                Note <span className="text-ink-faint">(optional)</span>
              </label>
              <textarea
                id="note"
                rows={2}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                className="mt-1.5 w-full resize-none rounded-xl border border-line-strong bg-porcelain px-4 py-2.5 text-ink placeholder:text-ink-faint"
                placeholder="Landmark, preferred time, gift wrap…"
              />
            </div>

            {/* Honeypot — hidden from users, catches bots. */}
            <div className="hidden" aria-hidden>
              <label htmlFor="company">Company (leave blank)</label>
              <input
                id="company"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={company}
                onChange={(event) => setCompany(event.target.value)}
              />
            </div>
          </div>
        </section>
      </div>

      {/* Right: summary + submit */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="space-y-5 rounded-2xl border border-line bg-surface p-6">
          <h2 className="font-display text-xl font-semibold">Order summary</h2>

          <FreeDeliveryMeter subtotal={subtotal} threshold={freeDeliveryThreshold} />

          <dl className="space-y-2.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-soft">Subtotal</dt>
              <dd className="font-medium tabular-nums">{formatRwf(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-soft">Delivery</dt>
              <dd className="font-medium">
                {fulfillment === "pickup" ? (
                  "Free pickup"
                ) : freeDelivery ? (
                  <span className="text-sage">Free</span>
                ) : (
                  <span className="text-ink-faint">Confirmed on WhatsApp</span>
                )}
              </dd>
            </div>
            <div className="flex justify-between border-t border-line pt-3 text-base">
              <dt className="font-semibold">Total</dt>
              <dd className="font-display text-lg font-semibold tabular-nums">
                {formatRwf(subtotal)}
              </dd>
            </div>
          </dl>

          {error && (
            <p
              role="alert"
              className="rounded-xl border border-copper/30 bg-copper-tint/40 px-4 py-3 text-sm text-copper-deep"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-copper px-6 py-4 font-medium text-white shadow-copper transition-[background-color,transform] duration-200 hover:bg-copper-deep active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
          >
            {submitting ? (
              "Placing order…"
            ) : (
              <>
                <IconWhatsApp className="h-5 w-5" />
                Place order via WhatsApp
              </>
            )}
          </button>

          <p className="text-center text-xs leading-relaxed text-ink-faint">
            We&apos;ll open WhatsApp with your order ready to send, then confirm
            everything and arrange payment — cash or MoMo on delivery. No online
            payment needed.
          </p>
        </div>
      </div>
    </form>
  );
}
