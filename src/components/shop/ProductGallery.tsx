"use client";

import Image from "next/image";
import { useState } from "react";

interface ProductGalleryProps {
  images: string[];
  name: string;
}

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const safeImages = images.length > 0 ? images : ["/images/cat-cookware.webp"];

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-cream shadow-card">
        <Image
          src={safeImages[active]}
          alt={`${name} — view ${active + 1}`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
      </div>

      {safeImages.length > 1 && (
        <div className="flex gap-3" role="group" aria-label="Product images">
          {safeImages.map((image, index) => {
            const selected = index === active;
            return (
              <button
                key={image}
                type="button"
                onClick={() => setActive(index)}
                aria-label={`View image ${index + 1} of ${safeImages.length}`}
                aria-pressed={selected}
                className={`relative aspect-square w-20 shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 transition-colors duration-200 ${
                  selected ? "border-copper" : "border-transparent hover:border-line-strong"
                }`}
              >
                <Image
                  src={image}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
