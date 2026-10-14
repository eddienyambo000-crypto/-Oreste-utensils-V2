import "server-only";
import { createHmac } from "node:crypto";
import { SITE_URL } from "./constants";

/**
 * Tells the owner something happened (new order, trade lead, message) by
 * POSTing a signed JSON summary to OWNER_WEBHOOK_URL, e.g. an n8n workflow
 * that sends a WhatsApp message or email. Optional: with no URL set this does
 * nothing. It never throws and never delays the customer (call it inside
 * next/server `after()`).
 *
 * Receivers verify `X-Oreste-Signature: sha256=<hex>`, an HMAC-SHA256 of the
 * raw body with OWNER_WEBHOOK_SECRET.
 */

export type OwnerEvent =
  | {
      type: "order";
      reference: string | null;
      customerName: string;
      phone: string;
      fulfillment: "delivery" | "pickup";
      deliveryArea: string | null;
      note: string | null;
      items: { name: string; quantity: number; priceRwf: number }[];
      subtotalRwf: number;
      deliveryFree: boolean;
    }
  | { type: "lead"; businessName: string; contactName: string; phone: string; businessType: string; need: string | null }
  | { type: "message"; name: string; phone: string | null; message: string };

const ADMIN_PATHS: Record<OwnerEvent["type"], string> = {
  order: "/admin/orders",
  lead: "/admin/leads",
  message: "/admin/messages",
};

export function signPayload(body: string, secret: string): string {
  return `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`;
}

export async function notifyOwner(event: OwnerEvent): Promise<void> {
  const url = process.env.OWNER_WEBHOOK_URL?.trim();
  if (!url) return;
  const body = JSON.stringify({
    ...event,
    adminUrl: `${SITE_URL}${ADMIN_PATHS[event.type]}`,
    sentAt: new Date().toISOString(),
  });
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const secret = process.env.OWNER_WEBHOOK_SECRET?.trim();
  if (secret) headers["X-Oreste-Signature"] = signPayload(body, secret);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body,
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) console.error(`[notify] owner webhook answered ${response.status}`);
  } catch (error) {
    console.error("[notify] owner webhook failed:", error instanceof Error ? error.message : error);
  }
}
