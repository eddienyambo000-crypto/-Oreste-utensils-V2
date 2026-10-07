/**
 * Short, human-friendly order reference shown to the customer at checkout,
 * written into their WhatsApp message, and shown on the admin order card so
 * the two can be matched: "OU-1A2B3C".
 */
export function orderReference(id: string): string {
  return `OU-${id.replace(/-/g, "").slice(0, 6).toUpperCase()}`;
}

/**
 * Turns a phone number as customers type it ("0788 123 456", "+250 788…",
 * "788123456") into wa.me digits ("250788123456"). Returns null when it
 * doesn't look like a usable number.
 */
export function whatsappDigits(phone: string): string | null {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.length === 10 && digits.startsWith("0")) digits = `250${digits.slice(1)}`;
  if (digits.length === 9 && digits.startsWith("7")) digits = `250${digits}`;
  return digits.length >= 10 && digits.length <= 15 ? digits : null;
}

/** Order times in the shop's own timezone, identical on server and phone. */
export function formatOrderTime(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    timeZone: "Africa/Kigali",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
