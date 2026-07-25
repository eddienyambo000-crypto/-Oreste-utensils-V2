import { BUSINESS, FREE_DELIVERY_THRESHOLD_RWF } from "./constants";
import { formatRwf } from "./format";

/**
 * FAQ content lives here so the same data feeds both the visible page and the
 * FAQPage JSON-LD — the questions are phrased the way people ask AI assistants.
 */
export const FAQS: { question: string; answer: string }[] = [
  {
    question: "Where can I buy kitchenware in Kigali?",
    answer: `Oreste Utensils is a premium kitchenware shop at ${BUSINESS.address.street}, ${BUSINESS.address.city}, ${BUSINESS.address.country}. We stock cookware, dinnerware, cutlery, glassware, storage and small appliances, and we deliver across Kigali. Visit the store any day between ${BUSINESS.hoursDisplay}, or order online and pay on delivery.`,
  },
  {
    question: "Does Oreste Utensils deliver in Kigali?",
    answer: `Yes. We deliver anywhere in Kigali. Delivery is free on orders over ${formatRwf(FREE_DELIVERY_THRESHOLD_RWF)}. Below that, a small delivery fee applies and we confirm it on WhatsApp based on your exact location. You can also collect your order for free at our City Plaza store.`,
  },
  {
    question: "Is there free delivery?",
    answer: `Free delivery applies automatically to any order of ${formatRwf(FREE_DELIVERY_THRESHOLD_RWF)} or more, anywhere in Kigali. For smaller orders we charge a modest delivery fee depending on your area, confirmed over WhatsApp before we dispatch.`,
  },
  {
    question: "How do I pay?",
    answer: "You pay when your order arrives — cash or MTN Mobile Money (MoMo) on delivery, or at the counter if you collect in store. There is no online payment; you only pay once you have your items in hand.",
  },
  {
    question: "How do I place an order?",
    answer: "Add the items you want to your cart on our website and check out — we'll open WhatsApp with your order details ready to send. Confirm it with our team and we'll arrange delivery or pickup. You can also message us directly on WhatsApp or visit the store.",
  },
  {
    question: "What are your opening hours?",
    answer: `We're open every day, ${BUSINESS.hoursDisplay}, at ${BUSINESS.address.street}, ${BUSINESS.address.city}.`,
  },
  {
    question: "Can I return or exchange an item?",
    answer: "Yes. If something isn't right, contact us within 7 days of receiving it and we'll arrange an exchange or replacement, provided the item is unused and in its original packaging. Because you inspect and pay on delivery, you can always check your order before accepting it.",
  },
  {
    question: "Do you supply hotels, restaurants and businesses?",
    answer: "We do. Many of our cookware, dinnerware and glassware ranges are well suited to hospitality and we can arrange bulk pricing. Message us on WhatsApp with what you need and we'll put together a quote.",
  },
];
