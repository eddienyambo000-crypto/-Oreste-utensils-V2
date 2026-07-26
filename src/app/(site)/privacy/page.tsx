import type { Metadata } from "next";
import { LegalLayout } from "@/components/layout/LegalLayout";
import { BUSINESS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Oreste Utensils collects, uses and protects your information when you shop with us in Kigali.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" updated="July 2026">
      <section>
        <p>
          This policy explains what information {BUSINESS.name} collects when you
          use our website or place an order, how we use it, and the choices you
          have. We keep it plain and we keep it minimal — we only ask for what we
          need to get your order to you.
        </p>
      </section>

      <section>
        <h2>What we collect</h2>
        <p>
          When you place an order we collect your name, phone number, chosen
          delivery area or pickup preference, and the items in your order. If you
          submit a business or wholesale enquiry, we also collect your business
          name and type. We do not collect or store card or Mobile Money details —
          payment happens in person on delivery or at our store.
        </p>
        <p>
          Like most websites, we collect basic, anonymous usage data (pages
          visited, device type) through analytics to understand what&apos;s useful
          and improve the site.
        </p>
      </section>

      <section>
        <h2>How we use it</h2>
        <p>
          We use your details only to process and deliver your order, to contact
          you about it (usually over WhatsApp or phone), to respond to enquiries,
          and to improve our products and service. We never sell your information.
        </p>
      </section>

      <section>
        <h2>Who we share it with</h2>
        <p>
          We share your details only with the people who need them to fulfil your
          order — for example a delivery rider bringing your items to you. Our
          website and database are hosted by reputable providers (Vercel and
          Supabase) who process data on our behalf under their own security
          standards.
        </p>
      </section>

      <section>
        <h2>How we protect it</h2>
        <p>
          Order and enquiry data is stored in a secured database with strict
          access controls — only authorised {BUSINESS.name} staff can view it.
          Customer contact details are never exposed publicly on the website.
        </p>
      </section>

      <section>
        <h2>Your choices</h2>
        <p>
          You can ask us what information we hold about you, correct it, or ask us
          to delete it, at any time. Just message us on WhatsApp at{" "}
          {BUSINESS.phoneDisplay} or visit us at {BUSINESS.address.street},{" "}
          {BUSINESS.address.city}.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          Questions about this policy? Reach {BUSINESS.name} on WhatsApp at{" "}
          {BUSINESS.phoneDisplay}, or in person at {BUSINESS.address.street},{" "}
          {BUSINESS.address.city}, {BUSINESS.address.country}.
        </p>
      </section>
    </LegalLayout>
  );
}
