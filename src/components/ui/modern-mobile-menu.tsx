"use client";

import React, { useRef, useEffect, useMemo } from "react";

type IconComponentType = React.ElementType<{ className?: string }>;

export interface InteractiveMenuItem {
  label: string;
  icon: IconComponentType;
  /** Optional route — when set, clicking the item navigates here. */
  href?: string;
}

export interface InteractiveMenuProps {
  items: InteractiveMenuItem[];
  accentColor?: string;
  /** Controlled active index (e.g. derived from the current route). */
  activeIndex: number;
  onSelect: (index: number, item: InteractiveMenuItem) => void;
}

const defaultAccentColor = "var(--component-active-color-default)";

export function InteractiveMenu({
  items,
  accentColor,
  activeIndex,
  onSelect,
}: InteractiveMenuProps) {
  const textRefs = useRef<(HTMLElement | null)[]>([]);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const setLineWidth = () => {
      const activeItemElement = itemRefs.current[activeIndex];
      const activeTextElement = textRefs.current[activeIndex];
      if (activeItemElement && activeTextElement) {
        const textWidth = activeTextElement.offsetWidth;
        activeItemElement.style.setProperty("--lineWidth", `${textWidth}px`);
      }
    };
    setLineWidth();
    window.addEventListener("resize", setLineWidth);
    return () => window.removeEventListener("resize", setLineWidth);
  }, [activeIndex, items]);

  const navStyle = useMemo(
    () =>
      ({
        "--component-active-color": accentColor || defaultAccentColor,
      }) as React.CSSProperties,
    [accentColor],
  );

  return (
    <nav className="menu" role="navigation" aria-label="Mobile" style={navStyle}>
      {items.map((item, index) => {
        const isActive = index === activeIndex;
        const IconComponent = item.icon;
        return (
          <button
            key={item.label}
            type="button"
            aria-label={item.label}
            aria-current={isActive ? "page" : undefined}
            className={`menu__item ${isActive ? "active" : ""}`}
            onClick={() => onSelect(index, item)}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
            style={{ "--lineWidth": "0px" } as React.CSSProperties}
          >
            <div className="menu__icon">
              <IconComponent className="icon" />
            </div>
            <strong
              className={`menu__text ${isActive ? "active" : ""}`}
              ref={(el) => {
                textRefs.current[index] = el;
              }}
            >
              {item.label}
            </strong>
          </button>
        );
      })}
    </nav>
  );
}
