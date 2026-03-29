"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { City } from "@/lib/types/city";

const ExploreMapInner = dynamic(() => import("./ExploreMapInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[220px] items-center justify-center rounded-2xl bg-white/80 text-sm text-stone-600 ring-1 ring-stone-900/5">
      Loading map…
    </div>
  ),
});

export function ExploreMapWithNav({
  cities,
  userPos,
}: {
  cities: City[];
  userPos: { lat: number; lng: number } | null;
}) {
  const [focusIndex, setFocusIndex] = useState(0);

  useEffect(() => {
    setFocusIndex((i) => {
      if (cities.length === 0) return 0;
      return Math.min(i, cities.length - 1);
    });
  }, [cities.length]);

  const n = cities.length;
  const prev = () =>
    setFocusIndex((i) => (n <= 1 ? 0 : (i - 1 + n) % n));
  const next = () =>
    setFocusIndex((i) => (n <= 1 ? 0 : (i + 1) % n));

  return (
    <div className="mb-6 space-y-2">
      <ExploreMapInner
        cities={cities}
        userPos={userPos}
        focusIndex={n ? focusIndex : 0}
      />
      {n > 0 ? (
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={prev}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone-300/80 bg-white text-lg text-stone-800 shadow-sm transition hover:bg-stone-50"
            aria-label="Previous city"
          >
            ←
          </button>
          <span className="min-w-[8rem] text-center text-sm font-medium text-stone-700">
            {cities[focusIndex]?.cityName ?? "—"}
            <span className="block text-xs font-normal text-stone-500">
              {focusIndex + 1} / {n}
            </span>
          </span>
          <button
            type="button"
            onClick={next}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone-300/80 bg-white text-lg text-stone-800 shadow-sm transition hover:bg-stone-50"
            aria-label="Next city"
          >
            →
          </button>
        </div>
      ) : null}
    </div>
  );
}
