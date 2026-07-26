import type { Metadata } from "next";
import { LegalLayout } from "@/components/layout/LegalLayout";
import { BUSINESS, FREE_DELIVERY_THRESHOLD_RWF } from "@/lib/constants";
import { formatRwf } from "@/lib/format";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "The terms that apply when you order from Oreste Utensils — pricing, delivery, payment on delivery, and returns.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalLayout title="Terms & Conditions" updated="July 2026">
      <section>
        <p>
          These terms apply when you order from {BUSINESS.name}, whether online,
          over WhatsApp, or in our store at {BUSINESS.address.street},{" "}
          {BUSINESS.address.city}. Placing an order means you agree to them.
        </p>
      </section>

      <section>
        <h2>Orders</h2>
        <p>
          Adding items to your cart and checking out sends us an order request —
          it is not final until we confirm it with you (usually on WhatsApp) and
          confirm stock availability. We may decline or adjust an order if an item
          is out of stock, and we&apos;ll always tell you before proceeding.
        </p>
      </section>

      <section>
        <h2>Prices</h2>
        <p>
          All prices are in Rwandan Francs (RWF) and include the item only.
          Delivery may be charged separately depending on your location, and is
          free on orders of {formatRwf(FREE_DELIVERY_THRESHOLD_RWF)} or more within
          Kigali. We confirm any delivery fee with you before dispatch. Prices may
          change over time, but the price we confirm for your order is the price
          you pay.
        </p>
      </section>

      <section>
        <h2>Payment</h2>
        <p>
          Payment is made on delivery or at pickup — cash or MTN Mobile Money
          (MoMo). There is no online payment. You only pay once your order is in
          your hands, so you can confirm everything is correct first.
        </p>
      </section>

      <section>
        <h2>Delivery &amp; pickup</h2>
        <p>
          We deliver across Kigali and aim to reach you promptly, usually within
          the same week. You can also collect your order for free at our City Plaza
          store during opening hours ({BUSINESS.hoursDisplay}). Delivery times are
          estimates and may vary with location and demand.
        </p>
      </section>

      <section>
        <h2>Returns &amp; exchanges</h2>
        <p>
          Because you inspect your order before you pay, you can decline anything
          that isn&apos;t right on the spot. If an issue appears after delivery,
          contact us within 7 days and we&apos;ll arrange an exchange or
          replacement, provided the item is unused and in its original packaging.
        </p>
      </section>

      <section>
        <h2>Wholesale &amp; business orders</h2>
        <p>
          Bulk and trade orders for restaurants, hotels and institutions may be
          subject to separate pricing and terms agreed with you directly. Contact
          us to set up a trade account.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          Questions about these terms? Reach {BUSINESS.name} on WhatsApp at{" "}
          {BUSINESS.phoneDisplay}, or visit {BUSINESS.address.street},{" "}
          {BUSINESS.address.city}, {BUSINESS.address.country}.
        </p>
      </section>
    </LegalLayout>
  );
}
