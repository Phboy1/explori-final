"use client";

import { useMemo } from "react";
import { useCities } from "@/context/CitiesContext";
import { useCityTasteStore } from "@/store/useCityTasteStore";
import { getTopRecommendations } from "@/lib/scoring/recommend";
import { HomeExploreSection } from "@/components/home/HomeExploreSection";
import { RecommendationList } from "@/components/recommendations/RecommendationList";

export function HomeView() {
  const { cities, loading, error } = useCities();
  const preferences = useCityTasteStore((s) => s.preferences);
  const ratings = useCityTasteStore((s) => s.ratings);

  const top = useMemo(
    () => getTopRecommendations(cities, preferences, ratings, 10),
    [cities, preferences, ratings],
  );

  if (loading) {
    return <p className="text-stone-600">Loading cities…</p>;
  }

  if (error && cities.length === 0) {
    return (
      <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800 ring-1 ring-red-200">
        {error}
      </p>
    );
  }

  return (
    <div className="space-y-10">
      {error && cities.length > 0 ? (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-950 ring-1 ring-amber-200/80">
          {error}
        </p>
      ) : null}
      <HomeExploreSection />
      <section className="space-y-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
            Top picks for you
          </h1>
          <p className="mt-2 max-w-2xl text-stone-600">
            Ranked from your preferences, cities you loved (8+), popularity, and
            budget fit. Rate more cities in your profile to sharpen matches.
          </p>
        </div>
        <RecommendationList items={top} />
      </section>
    </div>
  );
}
