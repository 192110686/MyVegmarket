"use client";

import Link from "next/link";
import React, { useRef } from "react";

type Item = {
  key: string;
  title: string;
  subtitle?: string;
  href: string;
  img: string;
};

export default function CategoryRow({ items }: { items: Item[] }) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const isDown = useRef(false);
  const startX = useRef(0);
  const startScrollLeft = useRef(0);
  const dragged = useRef(false);

  // ✅ Detect real drag using scroll movement (most reliable)
  const SCROLL_DRAG_THRESHOLD = 8; // px of actual scroll change

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollerRef.current;
    if (!el) return;

    // Only mouse/pen; touch uses native swipe
    if (e.pointerType === "touch") return;

    // Only left click
    if (e.button !== 0) return;

    isDown.current = true;
    dragged.current = false;

    startX.current = e.clientX;
    startScrollLeft.current = el.scrollLeft;
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollerRef.current;
    if (!el || !isDown.current) return;

    const dx = e.clientX - startX.current;
    el.scrollLeft = startScrollLeft.current - dx;

    // ✅ mark as dragged ONLY if scroll actually changed enough
    const moved = Math.abs(el.scrollLeft - startScrollLeft.current);
    if (moved > SCROLL_DRAG_THRESHOLD) dragged.current = true;
  };

  const endPointer = () => {
    isDown.current = false;

    // ✅ reset AFTER click event finishes
    setTimeout(() => {
      dragged.current = false;
    }, 0);
  };

  const onWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = scrollerRef.current;
    if (!el) return;

    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      el.scrollLeft += e.deltaY;
    } else {
      el.scrollLeft += e.deltaX;
    }
  };

  return (
    <>
      <div
        ref={scrollerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
        onPointerLeave={endPointer}
        onWheel={onWheel}
        className="categories-scroll flex gap-8 overflow-x-auto pb-4 px-2 scroll-smooth snap-x snap-mandatory cursor-grab active:cursor-grabbing select-none"
        style={{
          WebkitOverflowScrolling: "touch",
          touchAction: "pan-x",
        }}
      >
        {items.map((c) => (
          <Link
            key={c.key}
            href={c.href}
            // ✅ block ONLY if a real scroll happened
            onClick={(ev) => {
              if (dragged.current) {
                ev.preventDefault();
                ev.stopPropagation();
              }
            }}
            className="group relative overflow-hidden rounded-[2.5rem] cursor-pointer snap-start shrink-0 w-[280px] sm:w-[320px] md:w-[340px] aspect-[4/5]"
            draggable={false}
          >
            <img
              src={c.img}
              alt={c.title}
              className="absolute inset-0 w-full h-full object-cover scale-[1.02] group-hover:scale-[1.08] transition-transform duration-700"
              loading="lazy"
              draggable={false}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80";
              }}
            />

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
            <div className="pointer-events-none absolute inset-0 border-4 border-transparent group-hover:border-[#C8A951] transition-all duration-500 rounded-[2.5rem]" />

            <div className="pointer-events-none absolute bottom-10 left-10 right-10">
              <h3 className="text-white text-2xl font-bold mb-2">{c.title}</h3>
              {c.subtitle ? (
                <p className="text-white/75 text-sm font-medium">{c.subtitle}</p>
              ) : null}
            </div>
          </Link>
        ))}
      </div>

      <style jsx>{`
        .categories-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .categories-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
}
