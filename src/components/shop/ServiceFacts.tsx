import { IconShield, IconStore, IconTruck } from "@/components/ui/icons";
import { formatRwf } from "@/lib/format";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * The shop's confirmed service terms — delivery, payment, pickup — in one
 * place, fed the admin-controlled free-delivery threshold so every page
 * states the same number.
 */
export function ServiceFacts({
  dict,
  threshold,
  className = "",
}: {
  dict: Dictionary;
  threshold: number;
  className?: string;
}) {
  const t = dict.facts;
  const items = [
    {
      icon: IconTruck,
      title: t.deliveryTitle.replace("{amount}", formatRwf(threshold)),
      body: t.deliveryBody,
    },
    { icon: IconShield, title: t.paymentTitle, body: t.paymentBody },
    // Hours are written into each language's string (localised format).
    { icon: IconStore, title: t.pickupTitle, body: t.pickupBody },
  ];

  return (
    <ul role="list" className={`divide-y divide-line rounded-2xl border border-line bg-surface ${className}`}>
      {items.map((item) => (
        <li key={item.title} className="flex gap-3.5 p-4">
          <item.icon aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-copper" />
          <div>
            <p className="text-sm font-semibold text-ink">{item.title}</p>
            <p className="mt-0.5 text-sm leading-relaxed text-ink-soft">{item.body}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
