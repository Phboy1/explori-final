"use client";

import dynamic from "next/dynamic";
import type { City } from "@/lib/types/city";

const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[min(70vh,560px)] w-full items-center justify-center rounded-2xl bg-white/80 text-stone-600 ring-1 ring-stone-900/5">
      Loading map…
    </div>
  ),
});

export function MapViewDynamic({
  cities,
  recommendedIds,
}: {
  cities: City[];
  recommendedIds: Set<string>;
}) {
  return <MapView cities={cities} recommendedIds={recommendedIds} />;
}
