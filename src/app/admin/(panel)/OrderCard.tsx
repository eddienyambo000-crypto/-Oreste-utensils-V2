"use client";

import { useState, useTransition } from "react";
import { updateOrderStatus } from "@/app/admin/actions";
import { formatRwf } from "@/lib/format";
import type { CartItem, OrderStatus } from "@/lib/types";

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "confirmed", label: "Confirmed" },
  { value: "out_for_delivery", label: "Out for delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const STATUS_STYLES: Record<OrderStatus, string> = {
  new: "bg-copper-tint text-copper-deep",
  confirmed: "bg-sage/15 text-sage",
  out_for_delivery: "bg-ink/10 text-ink",
  delivered: "bg-sage/20 text-sage",
  cancelled: "bg-ink/8 text-ink-faint",
};

export interface AdminOrder {
  id: string;
  customerName: string;
  phone: string;
  fulfillment: "delivery" | "pickup";
  deliveryArea: string | null;
  note: string | null;
  items: CartItem[];
  subtotalRwf: number;
  deliveryFree: boolean;
  status: OrderStatus;
  createdAt: string;
}

export function OrderCard({ order }: { order: AdminOrder }) {
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function changeStatus(next: OrderStatus) {
    const previous = status;
    setStatus(next);
    setError(null);
    startTransition(async () => {
      const result = await updateOrderStatus(order.id, next);
      if (!result.ok) {
        setStatus(previous);
        setError(result.error);
      }
    });
  }

  const created = new Date(order.createdAt);

  return (
    <article className="rounded-2xl border border-line bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold">{order.customerName}</h3>
          <p className="mt-0.5 text-sm text-ink-soft">
            <a
              href={`tel:${order.phone}`}
              className="transition-colors duration-200 hover:text-copper"
            >
              {order.phone}
            </a>
            {" · "}
            {order.fulfillment === "delivery"
              ? `Delivery — ${order.deliveryArea ?? "Kigali"}`
              : "Pickup at City Plaza"}
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
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[status]}`}
        >
          {STATUS_OPTIONS.find((option) => option.value === status)?.label}
        </span>
      </div>

      <ul className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm">
        {order.items.map((item) => (
          <li key={item.productId} className="flex justify-between gap-4">
            <span className="text-ink-soft">
              {item.name} <span className="text-ink-faint">× {item.quantity}</span>
            </span>
            <span className="tabular-nums text-ink">
              {formatRwf(item.priceRwf * item.quantity)}
            </span>
          </li>
        ))}
      </ul>

      {order.note && (
        <p className="mt-3 rounded-lg bg-cream/60 px-3 py-2 text-sm text-ink-soft">
          <span className="font-medium text-ink">Note:</span> {order.note}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <div className="text-sm">
          <span className="text-ink-soft">Total </span>
          <span className="font-display text-base font-semibold tabular-nums">
            {formatRwf(order.subtotalRwf)}
          </span>
          <span className="ml-2 text-xs text-ink-faint">
            {order.fulfillment === "pickup"
              ? "pickup"
              : order.deliveryFree
                ? "+ free delivery"
                : "+ delivery fee"}
          </span>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <span className="sr-only">Update status for {order.customerName}</span>
          <select
            value={status}
            disabled={pending}
            onChange={(event) => changeStatus(event.target.value as OrderStatus)}
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
