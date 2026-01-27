"use client";

import Link from "next/link";
import { useRef } from "react";

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
  const scrollLeft = useRef(0);
  const moved = useRef(false);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollerRef.current;
    if (!el) return;

    isDown.current = true;
    moved.current = false;

    startX.current = e.clientX;
    scrollLeft.current = el.scrollLeft;

    el.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollerRef.current;
    if (!el || !isDown.current) return;

    const dx = e.clientX - startX.current;
    if (Math.abs(dx) > 6) moved.current = true;

    el.scrollLeft = scrollLeft.current - dx;
  };

  const onPointerUp = () => {
    isDown.current = false;
  };

  const onClickCapture = (e: React.MouseEvent) => {
    // If user dragged, stop link click
    if (moved.current) {
      e.preventDefault();
      e.stopPropagation();
      moved.current = false;
    }
  };

  return (
    <div
      ref={scrollerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClickCapture={onClickCapture}
      className="flex gap-8 overflow-x-auto pb-4 px-2 scroll-smooth snap-x snap-mandatory
                 cursor-grab active:cursor-grabbing select-none"
      style={{
        WebkitOverflowScrolling: "touch",
      }}
    >
      {items.map((c) => (
        <Link
          key={c.key}
          href={c.href}
          className="group relative overflow-hidden rounded-[2.5rem] cursor-pointer snap-start shrink-0
                     w-[280px] sm:w-[320px] md:w-[340px] aspect-[4/5]"
        >
          <img
            src={c.img}
            alt={c.title}
            className="absolute inset-0 w-full h-full object-cover scale-[1.02] group-hover:scale-[1.08]
                       transition-transform duration-700"
            loading="lazy"
            draggable={false}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80";
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
          <div className="absolute inset-0 border-4 border-transparent group-hover:border-[#C8A951] transition-all duration-500 rounded-[2.5rem]" />

          <div className="absolute bottom-10 left-10 right-10">
            <h3 className="text-white text-2xl font-bold mb-2">{c.title}</h3>
            {c.subtitle ? (
              <p className="text-white/75 text-sm font-medium">{c.subtitle}</p>
            ) : null}
          </div>
        </Link>
      ))}
    </div>
  );
}
