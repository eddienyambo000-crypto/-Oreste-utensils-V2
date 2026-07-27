import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/shop/ProductCard";
import { Reveal } from "@/components/ui/Reveal";
import {
  IconArrowRight,
  IconCheck,
  IconClock,
  IconMapPin,
  IconShield,
  IconStore,
  IconTruck,
  IconWhatsApp,
} from "@/components/ui/icons";
import { BUSINESS, FREE_DELIVERY_THRESHOLD_RWF } from "@/lib/constants";
import { getCategories, getProducts } from "@/lib/data";
import { formatRwf } from "@/lib/format";
import { whatsappLink } from "@/lib/whatsapp";

export const revalidate = 300;

export default async function HomePage() {
  const [categories, featured] = await Promise.all([
    getCategories(),
    getProducts({ featuredOnly: true }),
  ]);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:px-8 lg:pb-24 lg:pt-20">
          <div>
            <p className="animate-fade-in text-xs font-semibold uppercase tracking-[0.22em] text-copper">
              Premium kitchenware · City Plaza, Kigali
            </p>
            <h1 className="mt-5 animate-fade-up font-display text-[2.75rem] font-bold leading-[1.05] tracking-[-0.03em] text-ink sm:text-6xl lg:text-[4.25rem]">
              Everything your
              <br />
              kitchen{" "}
              <em className="font-display italic text-copper">deserves.</em>
            </h1>
            <p
              className="mt-6 max-w-md animate-fade-up text-lg leading-relaxed text-ink-soft"
              style={{ animationDelay: "120ms" }}
            >
              Cookware, dinnerware and the tools that make cooking a pleasure —
              hand-picked in Kigali, delivered across the city.
            </p>
            <div
              className="mt-8 flex flex-wrap items-center gap-4 animate-fade-up"
              style={{ animationDelay: "220ms" }}
            >
              <Link
                href="/shop"
                className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-copper px-7 py-3.5 font-medium text-white shadow-copper transition-[background-color,transform] duration-200 hover:bg-copper-deep active:scale-[0.98]"
              >
                Shop the collection
                <IconArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={whatsappLink("Hello Oreste Utensils! I'd like to know more about your kitchenware.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-line-strong bg-surface px-7 py-3.5 font-medium text-ink transition-colors duration-200 hover:border-copper hover:text-copper active:scale-[0.98]"
              >
                <IconWhatsApp className="h-4 w-4" />
                Chat with us
              </a>
            </div>
            <dl
              className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-ink-soft animate-fade-up"
              style={{ animationDelay: "320ms" }}
            >
              <div className="flex items-center gap-2">
                <IconTruck className="h-4 w-4 text-copper" />
                <dt className="sr-only">Delivery</dt>
                <dd>
                  Free delivery over{" "}
                  <span className="font-semibold text-ink">
                    {formatRwf(FREE_DELIVERY_THRESHOLD_RWF)}
                  </span>
                </dd>
              </div>
              <div className="flex items-center gap-2">
                <IconShield className="h-4 w-4 text-copper" />
                <dt className="sr-only">Payment</dt>
                <dd>Pay on delivery — cash or MoMo</dd>
              </div>
              <div className="flex items-center gap-2">
                <IconStore className="h-4 w-4 text-copper" />
                <dt className="sr-only">Store</dt>
                <dd>Open daily, 8 AM – 9 PM</dd>
              </div>
            </dl>
          </div>

          <div className="relative animate-fade-in" style={{ animationDelay: "150ms" }}>
            <div className="relative aspect-[5/6] overflow-hidden rounded-3xl shadow-card-hover sm:aspect-[4/3] lg:aspect-[5/6]">
              <Image
                src="/images/hero-kitchen.webp"
                alt="A bright kitchen counter with stainless cookware at Oreste Utensils"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-5 left-6 rounded-2xl border border-line bg-surface/95 px-5 py-4 shadow-card-hover backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint">
                Visit the store
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-ink">
                <IconMapPin className="h-4 w-4 text-copper" />
                {BUSINESS.address.street}, {BUSINESS.address.city}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────────── */}
      <section aria-labelledby="categories-heading" className="bg-surface py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-copper">
                  The collection
                </p>
                <h2
                  id="categories-heading"
                  className="mt-3 font-display text-3xl font-bold tracking-[-0.02em] sm:text-4xl"
                >
                  Shop by room in the kitchen
                </h2>
              </div>
              <Link
                href="/shop"
                className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-copper transition-colors duration-200 hover:text-copper-deep"
              >
                View all products
                <IconArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>

          <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3">
            {categories.slice(0, 6).map((category, index) => (
              <Reveal key={category.id} delay={index * 60}>
                <Link
                  href={`/shop/${category.slug}`}
                  className="group relative block overflow-hidden rounded-2xl"
                >
                  <div className="relative aspect-[4/3]">
                    {category.image ? (
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
                      />
                    ) : (
                      // Branded fallback when a category has no photo yet.
                      <div className="absolute inset-0 bg-gradient-to-br from-ink via-ink to-copper-deep transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/15 to-transparent" />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                    <h3 className="font-display text-lg font-semibold text-white sm:text-xl">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="mt-0.5 hidden text-sm text-white/75 sm:block">
                        {category.description}
                      </p>
                    )}
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured products ────────────────────────────────── */}
      <section aria-labelledby="featured-heading" className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-copper">
                  Customer favourites
                </p>
                <h2
                  id="featured-heading"
                  className="mt-3 font-display text-3xl font-bold tracking-[-0.02em] sm:text-4xl"
                >
                  The pieces Kigali keeps coming back for
                </h2>
              </div>
            </div>
          </Reveal>

          <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {featured.slice(0, 8).map((product, index) => (
              <Reveal key={product.id} delay={index * 60}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Guarantees ───────────────────────────────────────── */}
      <section aria-labelledby="promise-heading" className="border-y border-line bg-surface py-14 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="promise-heading" className="sr-only">
            Why shop with Oreste Utensils
          </h2>
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {[
              {
                icon: IconShield,
                title: "Inspect before you pay",
                body: "Check your order at the door. Not right? Don't pay for it.",
              },
              {
                icon: IconTruck,
                title: "Free delivery over 500K",
                body: "Across Kigali. Below that, a small fee confirmed upfront.",
              },
              {
                icon: IconStore,
                title: "A real store, real stock",
                body: "Come see and hold everything at City Plaza, open daily.",
              },
              {
                icon: IconCheck,
                title: "7-day exchange",
                body: "Something off after delivery? We swap it, no drama.",
              },
            ].map((item) => (
              <div key={item.title}>
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-copper-tint text-copper">
                  <item.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-base font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── B2B strip ────────────────────────────────────────── */}
      <section aria-labelledby="b2b-heading" className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-ink px-6 py-12 sm:px-12 lg:py-16">
              <div className="relative grid items-center gap-8 lg:grid-cols-[1.5fr_1fr]">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-copper-tint">
                    Oreste for Business
                  </p>
                  <h2
                    id="b2b-heading"
                    className="mt-3 font-display text-3xl font-bold tracking-[-0.02em] text-porcelain sm:text-4xl"
                  >
                    Run a restaurant or hotel? Buy at trade prices.
                  </h2>
                  <p className="mt-4 max-w-xl leading-relaxed text-porcelain/70">
                    We supply Kigali&apos;s restaurants, hotels, cafés and
                    institutions with cookware, tableware and cutlery — one
                    supplier, wholesale pricing, consistent restock, delivered.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
                  <Link
                    href="/business"
                    className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-copper px-7 py-3.5 font-medium text-white shadow-copper transition-[background-color,transform] duration-200 hover:bg-copper-deep active:scale-[0.98]"
                  >
                    Get wholesale pricing
                    <IconArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Story strip ──────────────────────────────────────── */}
      <section aria-labelledby="story-heading" className="bg-ink py-16 text-porcelain lg:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <Reveal>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
                <Image
                  src="/images/story-cooking.webp"
                  alt="A couple cooking together with quality cookware"
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover"
                />
              </div>
              <div className="relative mt-8 aspect-[3/4] overflow-hidden rounded-2xl">
                <Image
                  src="/images/story-searing.webp"
                  alt="Spices being added to a stainless steel pan"
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover"
                />
              </div>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-copper-tint">
              Why Oreste
            </p>
            <h2
              id="story-heading"
              className="mt-3 font-display text-3xl font-bold tracking-[-0.02em] text-porcelain sm:text-4xl"
            >
              Good tools change how you cook.
            </h2>
            <p className="mt-5 max-w-lg leading-relaxed text-porcelain/70">
              A pan that heats evenly. A knife that stays sharp. A plate that makes
              Tuesday dinner feel considered. We test everything we stock in real
              kitchens before it earns a place on our shelves — because in Kigali,
              quality kitchenware shouldn&apos;t require an import errand.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                "Hand-picked ranges — no filler stock, no fakes",
                "Fair Kigali prices, in RWF, no surprises",
                "See and touch everything at our City Plaza store",
                "Same-week delivery anywhere in Kigali",
              ].map((point) => (
                <li key={point} className="flex items-start gap-3 text-porcelain/85">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-copper" aria-hidden />
                  {point}
                </li>
              ))}
            </ul>
            <Link
              href="/about"
              className="mt-9 inline-flex cursor-pointer items-center gap-2 rounded-full border border-porcelain/25 px-6 py-3 text-sm font-medium text-porcelain transition-colors duration-200 hover:border-copper hover:text-copper-tint active:scale-[0.98]"
            >
              Our story
              <IconArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ── Visit the store ──────────────────────────────────── */}
      <section aria-labelledby="visit-heading" className="py-16 lg:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-copper">
              In person
            </p>
            <h2
              id="visit-heading"
              className="mt-3 font-display text-3xl font-bold tracking-[-0.02em] sm:text-4xl"
            >
              Come hold it in your hands.
            </h2>
            <p className="mt-5 max-w-md leading-relaxed text-ink-soft">
              Photos only get you so far — the weight of a good knife has to be
              felt. Find us at {BUSINESS.address.street} in the heart of Kigali,
              open every single day.
            </p>
            <div className="mt-8 space-y-4 text-sm">
              <p className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-copper-tint text-copper">
                  <IconMapPin className="h-4.5 w-4.5" />
                </span>
                <a
                  href={BUSINESS.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-ink transition-colors duration-200 hover:text-copper"
                >
                  {BUSINESS.address.street}, {BUSINESS.address.city}, {BUSINESS.address.country}
                </a>
              </p>
              <p className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-copper-tint text-copper">
                  <IconClock className="h-4.5 w-4.5" />
                </span>
                <span className="font-medium text-ink">{BUSINESS.hoursDisplay}</span>
              </p>
              <p className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-copper-tint text-copper">
                  <IconWhatsApp className="h-4.5 w-4.5" />
                </span>
                <a
                  href={whatsappLink("Hello Oreste Utensils! I'm planning to visit your City Plaza store.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-ink transition-colors duration-200 hover:text-copper"
                >
                  {BUSINESS.phoneDisplay}
                </a>
              </p>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-card-hover">
              <Image
                src="/images/visit-kitchen.webp"
                alt="A bright kitchen styled with cookware from Oreste Utensils"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Closing CTA ──────────────────────────────────────── */}
      <section className="pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-copper px-6 py-14 text-center text-white sm:px-12">
            <h2 className="font-display text-3xl font-bold tracking-[-0.02em] sm:text-4xl">
              Your kitchen deserves better. Start today.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-white/80">
              Browse the collection, order in minutes, and pay on delivery. Free
              across Kigali over {formatRwf(FREE_DELIVERY_THRESHOLD_RWF)}.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/shop"
                className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-ink px-7 py-3.5 font-medium text-porcelain transition-[background-color,transform] duration-200 hover:bg-ink/85 active:scale-[0.98]"
              >
                Shop the collection
                <IconArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={whatsappLink("Hello Oreste Utensils! I'd like to place an order.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/40 px-7 py-3.5 font-medium text-white transition-colors duration-200 hover:bg-white/10 active:scale-[0.98]"
              >
                <IconWhatsApp className="h-4 w-4" />
                Order on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
