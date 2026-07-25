import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/shop/ProductCard";
import { IconArrowRight } from "@/components/ui/icons";
import { SITE_URL } from "@/lib/constants";
import { getCategories, getCategoryBySlug, getProducts } from "@/lib/data";

export const revalidate = 300;

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: `${category.name} in Kigali`,
    description: category.intro,
    alternates: { canonical: `/shop/${category.slug}` },
    openGraph: {
      title: `${category.name} — Oreste Utensils, Kigali`,
      description: category.intro,
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  const [category, categories] = await Promise.all([
    getCategoryBySlug(slug),
    getCategories(),
  ]);

  if (!category) notFound();

  const products = await getProducts({ categorySlug: category.slug });
  const otherCategories = categories.filter((c) => c.slug !== category.slug);

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${category.name} — Oreste Utensils`,
    description: category.intro,
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE_URL}/product/${product.slug}`,
      name: product.name,
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Shop", item: `${SITE_URL}/shop` },
      {
        "@type": "ListItem",
        position: 2,
        name: category.name,
        item: `${SITE_URL}/shop/${category.slug}`,
      },
    ],
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <nav aria-label="Breadcrumb" className="text-sm text-ink-faint">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/shop" className="transition-colors duration-200 hover:text-copper">
              Shop
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="font-medium text-ink-soft">{category.name}</li>
        </ol>
      </nav>

      <header className="mt-6 max-w-2xl">
        <h1 className="font-display text-4xl font-bold tracking-[-0.02em] sm:text-5xl">
          {category.name}
        </h1>
        <p className="mt-4 leading-relaxed text-ink-soft">{category.intro}</p>
      </header>

      {products.length > 0 ? (
        <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              priority={index < 4}
            />
          ))}
        </div>
      ) : (
        <p className="mt-10 text-ink-soft">
          New stock is on its way to this category. Ask us on WhatsApp for what&apos;s
          available in store today.
        </p>
      )}

      {/* Cross-links to other categories — good for crawl depth + discovery. */}
      <section aria-labelledby="other-cats" className="mt-16 border-t border-line pt-10">
        <h2 id="other-cats" className="font-display text-xl font-semibold">
          Keep exploring
        </h2>
        <div className="mt-5 flex flex-wrap gap-3">
          {otherCategories.map((other) => (
            <Link
              key={other.id}
              href={`/shop/${other.slug}`}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-line-strong bg-surface px-4 py-2 text-sm font-medium text-ink-soft transition-colors duration-200 hover:border-copper hover:text-copper"
            >
              {other.name}
              <IconArrowRight className="h-3.5 w-3.5" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
