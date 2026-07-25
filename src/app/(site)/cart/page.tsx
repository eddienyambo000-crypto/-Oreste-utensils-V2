import type { Metadata } from "next";
import { CheckoutForm } from "@/components/cart/CheckoutForm";
import { getFreeDeliveryThreshold } from "@/lib/data";

export const metadata: Metadata = {
  title: "Your Cart & Checkout",
  description:
    "Review your Oreste Utensils order and check out via WhatsApp. Pay cash or MoMo on delivery. Free delivery across Kigali on orders over 500,000 RWF.",
  alternates: { canonical: "/cart" },
  robots: { index: false },
};

export default async function CartPage() {
  const threshold = await getFreeDeliveryThreshold();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <header>
        <h1 className="font-display text-4xl font-bold tracking-[-0.02em] sm:text-5xl">
          Your cart
        </h1>
        <p className="mt-3 text-ink-soft">
          Almost there. Confirm your order below and we&apos;ll take it from here on
          WhatsApp.
        </p>
      </header>

      <div className="mt-10">
        <CheckoutForm freeDeliveryThreshold={threshold} />
      </div>
    </div>
  );
}
