import Image from "next/image";
import Link from "next/link";

/** One tile in the scrolling strip — a curated slide or a product. */
export interface MarqueeItem {
  key: string;
  image: string;
  alt: string;
  /** Overlay title (product name, or a slide caption). Optional. */
  title?: string;
  /** Secondary overlay line (e.g. a product price). Optional. */
  subtitle?: string;
  /** Destination when tapped. Internal ("/…") uses Link; external uses <a>. */
  href?: string;
}

/**
 * Auto-scrolling strip. Fed normalized items (curated slides preferred, else
 * latest products). Renders nothing below `minItems` so it never looks sparse.
 * Pauses on hover; the list is duplicated for a seamless CSS loop.
 */
export function ProductMarquee({
  items,
  minItems = 1,
}: {
  items: MarqueeItem[];
  minItems?: number;
}) {
  if (items.length < minItems) return null;

  const loop = [...items, ...items];

  return (
    <div className="marquee-viewport w-full py-1" aria-label="Featured products">
      <div className="marquee-track gap-3 sm:gap-4">
        {loop.map((item, index) => {
          const hidden = index >= items.length;
          const tile = (
            <>
              <Image
                src={item.image}
                alt={item.alt}
                fill
                sizes="128px"
                className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/10 to-transparent" />
              {(item.title || item.subtitle) && (
                <div className="absolute inset-x-0 bottom-0 p-2">
                  {item.title && (
                    <p className="truncate text-[0.7rem] font-medium leading-tight text-white">
                      {item.title}
                    </p>
                  )}
                  {item.subtitle && (
                    <p className="text-[0.7rem] font-semibold text-copper-tint">
                      {item.subtitle}
                    </p>
                  )}
                </div>
              )}
            </>
          );

          const className =
            "group relative block h-32 w-28 shrink-0 overflow-hidden rounded-2xl bg-cream shadow-card sm:h-36 sm:w-32";
          const key = `${item.key}-${index}`;

          if (!item.href) {
            return (
              <div key={key} aria-hidden={hidden} className={className}>
                {tile}
              </div>
            );
          }

          if (item.href.startsWith("/")) {
            return (
              <Link
                key={key}
                href={item.href}
                aria-hidden={hidden}
                tabIndex={hidden ? -1 : undefined}
                className={className}
              >
                {tile}
              </Link>
            );
          }

          return (
            <a
              key={key}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-hidden={hidden}
              tabIndex={hidden ? -1 : undefined}
              className={className}
            >
              {tile}
            </a>
          );
        })}
      </div>
    </div>
  );
}
