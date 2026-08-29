import Image from "next/image";
import Link from "next/link";
import { BUSINESS } from "@/lib/constants";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { whatsappLink } from "@/lib/whatsapp";
import {
  IconClock,
  IconInstagram,
  IconMapPin,
  IconPhone,
  IconWhatsApp,
} from "@/components/ui/icons";

const SHOP_LINKS = [
  { href: "/shop/cookware", label: "Cookware" },
  { href: "/shop/dinnerware", label: "Dinnerware" },
  { href: "/shop/cutlery", label: "Cutlery & Tools" },
  { href: "/shop/serveware", label: "Serveware & Glassware" },
  { href: "/shop/storage", label: "Storage" },
  { href: "/shop/small-appliances", label: "Small Appliances" },
] as const;

export function Footer({
  logoUrl,
  dict,
}: {
  logoUrl?: string | null;
  dict: Dictionary;
}) {
  const companyLinks = [
    { href: "/about", label: dict.footer.aboutOreste },
    { href: "/faq", label: dict.footer.deliveryFaq },
    { href: "/contact", label: dict.footer.visitStore },
    { href: "/cart", label: dict.footer.yourCart },
  ];

  return (
    <footer className="border-t border-line bg-cream/50">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1.4fr]">
          <div>
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt="Oreste Utensils"
                width={180}
                height={44}
                className="h-10 w-auto object-contain"
              />
            ) : (
              <p className="font-display text-2xl font-bold tracking-tight">
                Oreste{" "}
                <span className="text-[0.6em] font-semibold uppercase tracking-[0.22em] text-copper">
                  Utensils
                </span>
              </p>
            )}
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-soft">
              {dict.footer.description}
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href={BUSINESS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Oreste Utensils on Instagram"
                className="cursor-pointer rounded-full border border-line-strong p-2.5 text-ink-soft transition-colors duration-200 hover:border-copper hover:text-copper active:scale-95"
              >
                <IconInstagram className="h-4 w-4" />
              </a>
              <a
                href={whatsappLink("Hello Oreste Utensils! I found you through your website.")}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat with Oreste Utensils on WhatsApp"
                className="cursor-pointer rounded-full border border-line-strong p-2.5 text-ink-soft transition-colors duration-200 hover:border-copper hover:text-copper active:scale-95"
              >
                <IconWhatsApp className="h-4 w-4" />
              </a>
            </div>
          </div>

          <nav aria-label="Shop links">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-faint">
              {dict.footer.shopHeading}
            </h2>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link
                  href="/shop"
                  className="text-sm text-ink-soft transition-colors duration-200 hover:text-copper"
                >
                  {dict.footer.allProducts}
                </Link>
              </li>
              {SHOP_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-ink-soft transition-colors duration-200 hover:text-copper"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Company links">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-faint">
              {dict.footer.companyHeading}
            </h2>
            <ul className="mt-4 space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-ink-soft transition-colors duration-200 hover:text-copper"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-faint">
              {dict.footer.findUsHeading}
            </h2>
            <address className="mt-4 space-y-3 text-sm not-italic text-ink-soft">
              <p className="flex items-start gap-2.5">
                <IconMapPin className="mt-0.5 h-4 w-4 shrink-0 text-copper" />
                <a
                  href={BUSINESS.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors duration-200 hover:text-copper"
                >
                  {BUSINESS.address.street}, {BUSINESS.address.city},{" "}
                  {BUSINESS.address.country}
                </a>
              </p>
              <p className="flex items-start gap-2.5">
                <IconClock className="mt-0.5 h-4 w-4 shrink-0 text-copper" />
                <span>{BUSINESS.hoursDisplay}</span>
              </p>
              <p className="flex items-start gap-2.5">
                <IconPhone className="mt-0.5 h-4 w-4 shrink-0 text-copper" />
                <a
                  href={`tel:${BUSINESS.phoneE164}`}
                  className="transition-colors duration-200 hover:text-copper"
                >
                  {BUSINESS.phoneDisplay}
                </a>
              </p>
            </address>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-line pt-6 text-xs text-ink-faint sm:flex-row">
          <p>
            © {new Date().getFullYear()} {BUSINESS.legalName}. {dict.footer.rights}
          </p>
          <nav aria-label="Legal" className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link
              href="/privacy"
              className="transition-colors duration-200 hover:text-copper"
            >
              {dict.footer.privacy}
            </Link>
            <Link
              href="/terms"
              className="transition-colors duration-200 hover:text-copper"
            >
              {dict.footer.terms}
            </Link>
          </nav>
        </div>

        <p className="mt-6 text-center text-xs text-ink-faint">
          {dict.footer.builtBy}{" "}
          <a
            href="https://eddie-portfolio-gamma.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-ink-soft underline underline-offset-2 transition-colors duration-200 hover:text-copper"
          >
            Eddie Nyambo
          </a>
        </p>
      </div>
    </footer>
  );
}
