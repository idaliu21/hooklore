"use client";

import { useState } from "react";
import Image from "next/image";
import type { PatternImage } from "@/lib/types";

export function ImageCarousel({ images }: { images: PatternImage[] }) {
  const [current, setCurrent] = useState(0);

  if (!images.length) return null;

  const img = images[current];

  return (
    <div>
      {/* Main image */}
      <div className="relative aspect-[3/4] sm:aspect-[4/3] rounded-2xl overflow-hidden bg-stone-100">
        <Image
          src={img.medium}
          alt={`Image ${current + 1} of ${images.length}`}
          fill
          sizes="(max-width: 640px) 100vw, 600px"
          className="object-contain"
          priority={current === 0}
        />
        {/* Counter badge */}
        {images.length > 1 && (
          <span className="absolute top-3 right-3 bg-black/50 text-white text-xs font-medium px-2 py-1 rounded-full">
            {current + 1}/{images.length}
          </span>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-none">
          {images.map((thumb, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                i === current
                  ? "border-stone-900 scale-105"
                  : "border-transparent opacity-50 hover:opacity-100"
              }`}
            >
              <Image
                src={thumb.thumb}
                alt={`Thumbnail ${i + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
