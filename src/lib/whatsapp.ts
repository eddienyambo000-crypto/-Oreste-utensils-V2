import { BUSINESS, FREE_DELIVERY_THRESHOLD_RWF } from "./constants";
import { formatRwf } from "./format";
import type { CartItem, Fulfillment } from "./types";

export function whatsappLink(message: string): string {
  return `https://wa.me/${BUSINESS.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function productInquiryLink(productName: string): string {
  return whatsappLink(
    `Hello Oreste Utensils! I'd like to ask about the ${productName} I saw on your website.`,
  );
}

export function buildTradeMessage(input: {
  businessName: string;
  contactName: string;
  phone: string;
  businessType: string;
  message: string | null;
}): string {
  const lines = [
    "Wholesale / trade enquiry — oresteutensils.com",
    "",
    `Business: ${input.businessName} (${input.businessType})`,
    `Contact: ${input.contactName}`,
    `Phone: ${input.phone}`,
  ];
  if (input.message) lines.push(`Details: ${input.message}`);
  lines.push("", "Please send wholesale pricing.");
  return lines.join("\n");
}

export function buildOrderMessage(input: {
  items: CartItem[];
  customerName: string;
  phone: string;
  fulfillment: Fulfillment;
  deliveryArea: string | null;
  note: string | null;
}): string {
  const subtotal = input.items.reduce(
    (sum, item) => sum + item.priceRwf * item.quantity,
    0,
  );
  const freeDelivery =
    input.fulfillment === "delivery" && subtotal >= FREE_DELIVERY_THRESHOLD_RWF;

  const lines = [
    "New order — oresteutensils.com",
    "",
    ...input.items.map(
      (item) =>
        `• ${item.name} × ${item.quantity} — ${formatRwf(item.priceRwf * item.quantity)}`,
    ),
    "",
    `Subtotal: ${formatRwf(subtotal)}`,
  ];

  if (input.fulfillment === "pickup") {
    lines.push("Fulfillment: Pickup at City Plaza (free)");
  } else if (freeDelivery) {
    lines.push(`Delivery: FREE (order over ${formatRwf(FREE_DELIVERY_THRESHOLD_RWF)})`);
    lines.push(`Delivery area: ${input.deliveryArea ?? "—"}`);
  } else {
    lines.push("Delivery: fee to confirm based on location");
    lines.push(`Delivery area: ${input.deliveryArea ?? "—"}`);
  }

  lines.push("", `Name: ${input.customerName}`, `Phone: ${input.phone}`);
  if (input.note) lines.push(`Note: ${input.note}`);
  lines.push("", "Payment: cash or MoMo on delivery/pickup");

  return lines.join("\n");
}
