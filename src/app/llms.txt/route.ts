import { categoriesWithProducts } from "@/lib/catalog";
import { BUSINESS, SITE_URL } from "@/lib/constants";
import { getCategories, getFreeDeliveryThreshold, getProducts } from "@/lib/data";
import { formatRwf } from "@/lib/format";

// A plain-text summary for AI assistants (llmstxt.org), generated from the
// same data as the site so the delivery threshold and departments never drift.
export const revalidate = 3600;

export async function GET() {
  const threshold = await getFreeDeliveryThreshold();
  let departments: string[] = [];
  try {
    const [categories, products] = await Promise.all([getCategories(), getProducts()]);
    departments = categoriesWithProducts(categories, products).map(
      ({ category, count }) =>
        `- [${category.name}](${SITE_URL}/shop/${category.slug}) — ${count} product${count === 1 ? "" : "s"}`,
    );
  } catch {
    // Catalogue unavailable: the facts below still stand.
  }

  const body = `# ${BUSINESS.name}

> ${BUSINESS.name} is a kitchenware shop at City Plaza, Kigali, Rwanda. It sells cookware, dinnerware, glassware and small kitchen appliances, delivers across Kigali, and is paid for on delivery or at the counter (cash or MTN Mobile Money). There is no online payment.

## Key facts

- Location: City Plaza, Kigali, Rwanda
- Phone / WhatsApp: ${BUSINESS.phoneDisplay}
- Opening hours: every day, 8:00 AM – 9:00 PM
- Delivery: anywhere in Kigali. Free on orders of ${formatRwf(threshold)} or more; below that, the fee for the customer's area is confirmed on WhatsApp before payment. Free pickup at the shop.
- Payment: cash or MTN Mobile Money (MoMo) on delivery, or at the counter when collecting.
- Ordering: add items to the cart on the website and check out; the order is then confirmed on WhatsApp. Customers can also message the shop on WhatsApp or visit in person.
- Businesses: restaurants, hotels, cafés and institutions can request a trade quote at ${SITE_URL}/business
- Currency: Rwandan franc (RWF)
${departments.length > 0 ? `\n## Departments\n\n${departments.join("\n")}\n` : ""}
## Links

- Shop: ${SITE_URL}/shop
- Delivery, payment & FAQ: ${SITE_URL}/faq
- Visit the shop: ${SITE_URL}/contact
- About: ${SITE_URL}/about
- Trade quotes: ${SITE_URL}/business
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
