import type { Metadata } from "next";
import Link from "next/link";
import { notFound, unstable_rethrow } from "next/navigation";
import { PurchasePanel } from "@/components/cart/PurchasePanel";
import { CatalogNotice } from "@/components/shop/CatalogNotice";
import { ProductCard } from "@/components/shop/ProductCard";
import { ProductGallery } from "@/components/shop/ProductGallery";
import { ServiceFacts } from "@/components/shop/ServiceFacts";
import { absoluteUrl, relatedProducts } from "@/lib/catalog";
import { BUSINESS, SITE_URL } from "@/lib/constants";
import { getFreeDeliveryThreshold, getProductBySlug, getProducts } from "@/lib/data";
import { formatRwf } from "@/lib/format";
import { getDictionary } from "@/lib/i18n/server";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug).catch(() => null);
  if (!product) return {};
  return {
    title: product.name,
    description: product.shortDescription || undefined,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title: `${product.name} — Oreste Utensils`,
      description: product.shortDescription || undefined,
      images: product.images[0] ? [{ url: absoluteUrl(product.images[0]) }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const dict = await getDictionary();
  const t = dict.product;

  let loaded;
  try {
    const product = await getProductBySlug(slug);
    if (!product) notFound();
    const [products, threshold] = await Promise.all([getProducts(), getFreeDeliveryThreshold()]);
    loaded = { product, related: relatedProducts(products, product), threshold };
  } catch (error) {
    unstable_rethrow(error); // let notFound() reach Next
    console.error("[product] failed to load:", error);
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <CatalogNotice kind="unavailable" retryHref={`/product/${slug}`} dict={dict} />
      </div>
    );
  }

  const { product, related, threshold } = loaded;
  const productUrl = `${SITE_URL}/product/${product.slug}`;

  // Structured data mirrors only what the page shows: no ratings or reviews
  // are claimed here because none are verified.
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || product.shortDescription,
    image: product.images.map(absoluteUrl),
    sku: product.slug,
    brand: { "@type": "Brand", name: BUSINESS.name },
    offers: {
      "@type": "Offer",
      priceCurrency: "RWF",
      price: product.priceRwf,
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      url: productUrl,
      seller: { "@type": "Organization", name: BUSINESS.name },
    },
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: dict.nav.shop, item: `${SITE_URL}/shop` },
      { "@type": "ListItem", position: 2, name: product.name, item: productUrl },
    ],
  };

  const specs = Object.entries(product.specs);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pt-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <nav aria-label={t.breadcrumb} className="text-sm text-ink-faint">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/shop" className="transition-colors duration-200 hover:text-copper">
              {dict.nav.shop}
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="line-clamp-1 font-medium text-ink-soft">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="mt-5 grid gap-8 md:grid-cols-2 lg:gap-14">
        <ProductGallery images={product.images} name={product.name} />

        <div>
          <h1 className="font-display text-3xl font-semibold leading-[1.1] tracking-[-0.02em] text-balance sm:text-4xl">
            {product.name}
          </h1>
          <p className="mt-3 font-display text-2xl font-semibold tabular-nums">
            {formatRwf(product.priceRwf)}
          </p>
          <p
            className={`mt-2 flex items-center gap-2 text-sm font-medium ${
              product.inStock ? "text-sage" : "text-ink-faint"
            }`}
          >
            <span aria-hidden className={`h-2 w-2 rounded-full ${product.inStock ? "bg-sage" : "bg-ink-faint"}`} />
            {product.inStock ? t.inStockAt : t.outOfStock}
          </p>

          {(product.description || product.shortDescription) && (
            <p className="mt-6 max-w-prose leading-relaxed text-ink-soft">
              {product.description || product.shortDescription}
            </p>
          )}

          <div className="mt-8">
            <PurchasePanel product={product} />
          </div>

          <ServiceFacts dict={dict} threshold={threshold} className="mt-8" />

          {specs.length > 0 && (
            <div className="mt-8">
              <h2 className="font-display text-lg font-semibold">{t.specifications}</h2>
              <dl className="mt-3 divide-y divide-line rounded-2xl border border-line bg-surface">
                {specs.map(([key, value]) => (
                  <div key={key} className="flex justify-between gap-4 px-4 py-3 text-sm">
                    <dt className="text-ink-faint">{key}</dt>
                    <dd className="text-right font-medium text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="mt-20">
          <h2 id="related-heading" className="font-display text-2xl font-semibold tracking-[-0.02em]">
            {t.related}
          </h2>
          <ul role="list" className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-4">
            {related.map((item) => (
              <li key={item.id}>
                <ProductCard product={item} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
