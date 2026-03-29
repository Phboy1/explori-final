"use client";

import { useMemo } from "react";
import { useCities } from "@/context/CitiesContext";
import { useCityTasteStore } from "@/store/useCityTasteStore";
import { getTopRecommendations } from "@/lib/scoring/recommend";
import { MapViewDynamic } from "@/components/map/MapViewDynamic";
import { Card } from "@/components/ui/Card";

export function MapPageContent() {
  const { cities, loading, error } = useCities();
  const preferences = useCityTasteStore((s) => s.preferences);
  const ratings = useCityTasteStore((s) => s.ratings);

  const topIds = useMemo(() => {
    const top = getTopRecommendations(cities, preferences, ratings, 10);
    return new Set(top.map((t) => t.city.id));
  }, [cities, preferences, ratings]);

  if (error) {
    return (
      <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800">
        {error}
      </p>
    );
  }

  if (loading) {
    return <p className="text-stone-600">Loading map data…</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
          Map
        </h1>
        <p className="mt-2 max-w-2xl text-stone-600">
          All cities in the catalog. Larger, deeper red markers are in your
          current top 10 recommendations.
        </p>
      </div>
      <Card className="overflow-hidden p-0">
        <MapViewDynamic cities={cities} recommendedIds={topIds} />
      </Card>
    </div>
  );
}
