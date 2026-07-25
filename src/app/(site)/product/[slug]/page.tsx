import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { ProductCard } from "@/components/shop/ProductCard";
import { ProductGallery } from "@/components/shop/ProductGallery";
import { Reveal } from "@/components/ui/Reveal";
import {
  IconCheck,
  IconShield,
  IconStore,
  IconTruck,
  IconWhatsApp,
} from "@/components/ui/icons";
import { BUSINESS, FREE_DELIVERY_THRESHOLD_RWF, SITE_URL } from "@/lib/constants";
import {
  getCategories,
  getProductBySlug,
  getProducts,
  getRelatedProducts,
} from "@/lib/data";
import { formatRwf } from "@/lib/format";
import { productInquiryLink } from "@/lib/whatsapp";

export const revalidate = 300;

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.shortDescription,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title: `${product.name} — Oreste Utensils`,
      description: product.shortDescription,
      images: product.images[0] ? [{ url: product.images[0] }] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [categories, related] = await Promise.all([
    getCategories(),
    getRelatedProducts(product),
  ]);
  const category = categories.find((c) => c.slug === product.categorySlug);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((img) => `${SITE_URL}${img}`),
    category: category?.name,
    brand: { "@type": "Brand", name: BUSINESS.name },
    offers: {
      "@type": "Offer",
      priceCurrency: "RWF",
      price: product.priceRwf,
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${SITE_URL}/product/${product.slug}`,
      seller: { "@type": "Organization", name: BUSINESS.name },
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Shop", item: `${SITE_URL}/shop` },
      category && {
        "@type": "ListItem",
        position: 2,
        name: category.name,
        item: `${SITE_URL}/shop/${category.slug}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: `${SITE_URL}/product/${product.slug}`,
      },
    ].filter(Boolean),
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <nav aria-label="Breadcrumb" className="text-sm text-ink-faint">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/shop" className="transition-colors duration-200 hover:text-copper">
              Shop
            </Link>
          </li>
          <li aria-hidden>/</li>
          {category && (
            <>
              <li>
                <Link
                  href={`/shop/${category.slug}`}
                  className="transition-colors duration-200 hover:text-copper"
                >
                  {category.name}
                </Link>
              </li>
              <li aria-hidden>/</li>
            </>
          )}
          <li className="font-medium text-ink-soft">{product.name}</li>
        </ol>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-14">
        <ProductGallery images={product.images} name={product.name} />

        <div className="lg:py-4">
          {category && (
            <Link
              href={`/shop/${category.slug}`}
              className="text-xs font-semibold uppercase tracking-[0.16em] text-copper transition-colors duration-200 hover:text-copper-deep"
            >
              {category.name}
            </Link>
          )}
          <h1 className="mt-3 font-display text-3xl font-bold leading-tight tracking-[-0.02em] sm:text-4xl">
            {product.name}
          </h1>
          <p className="mt-4 font-display text-2xl font-semibold tabular-nums text-ink">
            {formatRwf(product.priceRwf)}
          </p>

          <div className="mt-3 flex items-center gap-2 text-sm">
            {product.inStock ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sage/12 px-3 py-1 font-medium text-sage">
                <IconCheck className="h-3.5 w-3.5" />
                In stock at City Plaza
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-ink/8 px-3 py-1 font-medium text-ink-soft">
                Currently out of stock
              </span>
            )}
          </div>

          <p className="mt-6 leading-relaxed text-ink-soft">{product.description}</p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <AddToCartButton product={product} size="large" />
            <a
              href={productInquiryLink(product.name)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-line-strong bg-surface px-8 py-4 font-medium text-ink transition-colors duration-200 hover:border-copper hover:text-copper active:scale-[0.98]"
            >
              <IconWhatsApp className="h-5 w-5" />
              Ask about this item
            </a>
          </div>

          {/* Trust row */}
          <ul className="mt-8 grid gap-3 rounded-2xl border border-line bg-surface p-5 text-sm sm:grid-cols-3">
            <li className="flex items-center gap-2.5 text-ink-soft">
              <IconTruck className="h-5 w-5 shrink-0 text-copper" />
              Free delivery over {formatRwf(FREE_DELIVERY_THRESHOLD_RWF)}
            </li>
            <li className="flex items-center gap-2.5 text-ink-soft">
              <IconShield className="h-5 w-5 shrink-0 text-copper" />
              Pay cash or MoMo on delivery
            </li>
            <li className="flex items-center gap-2.5 text-ink-soft">
              <IconStore className="h-5 w-5 shrink-0 text-copper" />
              Or collect free at City Plaza
            </li>
          </ul>

          {/* Specs */}
          {Object.keys(product.specs).length > 0 && (
            <div className="mt-8">
              <h2 className="font-display text-lg font-semibold">Specifications</h2>
              <dl className="mt-4 divide-y divide-line rounded-2xl border border-line bg-surface">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="flex justify-between gap-4 px-5 py-3 text-sm">
                    <dt className="text-ink-faint">{key}</dt>
                    <dd className="text-right font-medium text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="mt-20">
          <Reveal>
            <h2 id="related-heading" className="font-display text-2xl font-bold tracking-[-0.02em]">
              You might also like
            </h2>
          </Reveal>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {related.map((item, index) => (
              <Reveal key={item.id} delay={index * 60}>
                <ProductCard product={item} />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
