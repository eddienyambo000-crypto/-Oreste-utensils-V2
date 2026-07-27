"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Subtle scroll-driven parallax. Translates its children on the Y axis as the
 * element moves through the viewport (transform only, GPU-friendly). Disabled
 * for users who prefer reduced motion.
 */
export function Parallax({
  children,
  strength = 36,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const update = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const viewport = window.innerHeight || 1;
      // -1 (below viewport) → 0 (centered) → 1 (above viewport)
      const progress = (rect.top + rect.height / 2 - viewport / 2) / viewport;
      setOffset(-progress * strength);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [strength]);

  return (
    <div
      ref={ref}
      className={className}
      style={{ transform: `translate3d(0, ${offset}px, 0)`, willChange: "transform" }}
    >
      {children}
    </div>
  );
}
