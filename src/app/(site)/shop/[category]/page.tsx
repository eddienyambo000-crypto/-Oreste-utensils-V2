import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CatalogNotice } from "@/components/shop/CatalogNotice";
import { ProductCard } from "@/components/shop/ProductCard";
import { IconArrowRight } from "@/components/ui/icons";
import { absoluteUrl, categoriesWithProducts } from "@/lib/catalog";
import { SITE_URL } from "@/lib/constants";
import { getCategories, getCategoryBySlug, getProducts } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/server";

type Params = Promise<{ category: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { category: slug } = await params;
  const category = await getCategoryBySlug(slug).catch(() => null);
  if (!category) return {};
  const products = await getProducts({ categorySlug: category.slug }).catch(() => []);
  return {
    title: `${category.name} in Kigali`,
    description: category.intro || category.description || undefined,
    alternates: { canonical: `/shop/${category.slug}` },
    // An empty category is a thin page — keep it out of search results until stocked.
    robots: products.length === 0 ? { index: false, follow: true } : undefined,
    openGraph: {
      title: `${category.name} — Oreste Utensils, Kigali`,
      description: category.intro || category.description || undefined,
      images: category.image ? [{ url: absoluteUrl(category.image) }] : undefined,
    },
  };
}

export default async function CategoryPage({ params }: { params: Params }) {
  const { category: slug } = await params;
  const dict = await getDictionary();

  let loaded;
  try {
    const [category, categories, allProducts] = await Promise.all([
      getCategoryBySlug(slug),
      getCategories(),
      getProducts(),
    ]);
    loaded = { category, categories, allProducts };
  } catch (error) {
    console.error("[category] catalogue failed to load:", error);
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <CatalogNotice kind="unavailable" retryHref={`/shop/${slug}`} dict={dict} />
      </div>
    );
  }

  const { category, categories, allProducts } = loaded;
  if (!category) notFound();

  const products = allProducts.filter((product) => product.categorySlug === category.slug);
  const others = categoriesWithProducts(categories, allProducts).filter(
    (entry) => entry.category.slug !== category.slug,
  );

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: dict.nav.shop, item: `${SITE_URL}/shop` },
      { "@type": "ListItem", position: 2, name: category.name, item: `${SITE_URL}/shop/${category.slug}` },
    ],
  };
  const itemListJsonLd =
    products.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: `${category.name} — Oreste Utensils`,
          numberOfItems: products.length,
          itemListElement: products.map((product, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: `${SITE_URL}/product/${product.slug}`,
            name: product.name,
          })),
        }
      : null;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8 lg:pt-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {itemListJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      )}

      <nav aria-label={dict.product.breadcrumb} className="text-sm text-ink-faint">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/shop" className="transition-colors duration-200 hover:text-copper">
              {dict.nav.shop}
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="font-medium text-ink-soft">
            {category.name}
          </li>
        </ol>
      </nav>

      <header className="mt-5 max-w-2xl">
        <h1 className="font-display text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
          {category.name}
        </h1>
        {category.intro && <p className="mt-3 leading-relaxed text-ink-soft">{category.intro}</p>}
      </header>

      {products.length > 0 ? (
        <ul role="list" className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product, index) => (
            <li key={product.id}>
              <ProductCard product={product} priority={index < 4} />
            </li>
          ))}
        </ul>
      ) : (
        <CatalogNotice kind="empty-category" categoryName={category.name} dict={dict} />
      )}

      {others.length > 0 && (
        <section aria-labelledby="other-cats" className="mt-16 border-t border-line pt-10">
          <h2 id="other-cats" className="font-display text-xl font-semibold">
            {dict.catalog.keepExploring}
          </h2>
          <ul role="list" className="mt-5 flex flex-wrap gap-2.5">
            {others.map(({ category: other, count }) => (
              <li key={other.id}>
                <Link
                  href={`/shop/${other.slug}`}
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-line-strong bg-surface px-4 text-sm font-medium text-ink-soft transition-colors duration-200 hover:border-copper hover:text-copper"
                >
                  {other.name}
                  <span className="tabular-nums text-ink-faint">{count}</span>
                  <IconArrowRight className="h-3.5 w-3.5" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
