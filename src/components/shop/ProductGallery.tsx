"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useLang } from "@/lib/i18n/LanguageProvider";

interface ProductGalleryProps {
  images: string[];
  name: string;
}

/**
 * One snap-aligned strip of every photo: swiped on phones (with a "1 / 3"
 * counter), driven by thumbnails on larger screens. A single set of <Image>s
 * serves every breakpoint, so nothing downloads twice. A product without
 * photos shows a neutral placeholder — never another product's image.
 */
export function ProductGallery({ images, name }: ProductGalleryProps) {
  const { dict } = useLang();
  const [active, setActive] = useState(0);
  const stripRef = useRef<HTMLDivElement>(null);

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-3xl bg-cream px-8 text-center">
        <span className="font-display text-xl text-ink-faint">{name}</span>
      </div>
    );
  }

  function onScroll() {
    const el = stripRef.current;
    if (el) setActive(Math.round(el.scrollLeft / el.clientWidth));
  }

  function show(index: number) {
    const el = stripRef.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: index * el.clientWidth, behavior: reduced ? "auto" : "smooth" });
    setActive(index);
  }

  return (
    <div>
      <div className="relative">
        <div
          ref={stripRef}
          onScroll={onScroll}
          role="region"
          aria-label={dict.product.gallery}
          className="scroll-rail flex snap-x snap-mandatory overflow-x-auto rounded-3xl bg-cream"
        >
          {images.map((image, index) => (
            <div key={image} className="relative aspect-square w-full shrink-0 snap-center">
              <Image
                src={image}
                alt={`${name} — ${index + 1} / ${images.length}`}
                fill
                priority={index === 0}
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 600px"
                className="object-cover"
              />
            </div>
          ))}
        </div>
        {images.length > 1 && (
          <span
            aria-hidden
            className="absolute bottom-3 right-3 rounded-full bg-ink/70 px-2.5 py-1 text-xs font-medium tabular-nums text-porcelain md:hidden"
          >
            {active + 1} / {images.length}
          </span>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-4 hidden flex-wrap gap-3 md:flex" role="group" aria-label={dict.product.gallery}>
          {images.map((image, index) => {
            const selected = index === active;
            return (
              <button
                key={image}
                type="button"
                onClick={() => show(index)}
                aria-label={`${dict.product.viewImage} ${index + 1} / ${images.length}`}
                aria-pressed={selected}
                className={`relative aspect-square w-20 cursor-pointer overflow-hidden rounded-xl border-2 transition-colors duration-200 ${
                  selected ? "border-copper" : "border-transparent hover:border-line-strong"
                }`}
              >
                <Image src={image} alt="" fill sizes="80px" className="object-cover" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
