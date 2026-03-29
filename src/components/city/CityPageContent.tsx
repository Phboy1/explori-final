"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCities } from "@/context/CitiesContext";
import { useCityTasteStore } from "@/store/useCityTasteStore";
import { scoreCityForUser } from "@/lib/scoring/recommend";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ScoreBreakdownView } from "@/components/city/ScoreBreakdownView";

export function CityPageContent() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : params.slug?.[0];
  const { cities, citiesById, loading } = useCities();
  const preferences = useCityTasteStore((s) => s.preferences);
  const ratings = useCityTasteStore((s) => s.ratings);
  const rateCity = useCityTasteStore((s) => s.rateCity);
  const toggleBookmark = useCityTasteStore((s) => s.toggleBookmark);
  const bookmarks = useCityTasteStore((s) => s.bookmarks);
  const router = useRouter();

  const [scoreDraft, setScoreDraft] = useState(8);
  const [notes, setNotes] = useState("");

  const city = slug ? citiesById.get(slug) : undefined;

  const highlyRated = useMemo(() => {
    return cities.filter((c) => (ratings[c.id]?.score ?? 0) >= 8);
  }, [cities, ratings]);

  const highlyRatedNames = useMemo(
    () => highlyRated.map((c) => c.cityName),
    [highlyRated],
  );

  const scored = useMemo(() => {
    if (!city) return null;
    return scoreCityForUser(city, preferences, highlyRated, highlyRatedNames);
  }, [city, preferences, highlyRated, highlyRatedNames]);

  if (loading) {
    return (
      <p className="text-center text-stone-600">Loading city…</p>
    );
  }

  if (!city || !scored) {
    return (
      <Card className="text-center">
        <p className="text-stone-700">City not found.</p>
        <Button className="mt-4" onClick={() => router.push("/")}>
          Back home
        </Button>
      </Card>
    );
  }

  const existing = ratings[city.id];
  const bookmarked = bookmarks.includes(city.id);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/"
          className="text-sm font-medium text-[#A63D40] hover:underline"
        >
          ← Back to recommendations
        </Link>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
              {city.cityName}
            </h1>
            <p className="text-stone-600">{city.country}</p>
          </div>
          <Button variant="secondary" onClick={() => toggleBookmark(city.id)}>
            {bookmarked ? "Saved ★" : "Bookmark"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4">
          <h2 className="text-lg font-semibold text-stone-900">About</h2>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <dt className="text-stone-500">Cost index</dt>
            <dd className="font-medium text-stone-900">{city.avgCostIndex}/10</dd>
            <dt className="text-stone-500">Food scene</dt>
            <dd className="font-medium capitalize text-stone-900">
              {city.foodScene}
            </dd>
            <dt className="text-stone-500">Safety</dt>
            <dd className="font-medium text-stone-900">{city.safetyScore}/10</dd>
            <dt className="text-stone-500">Popularity</dt>
            <dd className="font-medium text-stone-900">
              {city.popularityScore}/10
            </dd>
          </dl>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
              Vibes
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {city.vibeTags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-stone-100 px-2.5 py-0.5 text-sm text-stone-800"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </Card>

        <Card className="space-y-4">
          <h2 className="text-lg font-semibold text-stone-900">
            Why it’s recommended
          </h2>
          <p className="text-sm leading-relaxed text-stone-600">
            {scored.explanation}
          </p>
          <ScoreBreakdownView breakdown={scored.breakdown} />
        </Card>
      </div>

      <Card className="space-y-4">
        <h2 className="text-lg font-semibold text-stone-900">Your rating</h2>
        {existing && (
          <p className="text-sm text-stone-600">
            You rated this {existing.score}/10
            {existing.notes ? ` — “${existing.notes}”` : ""}.
          </p>
        )}
        <div className="flex flex-wrap items-end gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-stone-600">Score (1–10)</span>
            <input
              type="number"
              min={1}
              max={10}
              value={scoreDraft}
              onChange={(e) => setScoreDraft(Number(e.target.value))}
              className="w-24 rounded-xl border border-stone-200 bg-white px-3 py-2 text-stone-900"
            />
          </label>
        </div>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-stone-600">Notes (optional)</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-stone-900"
            placeholder="What stood out?"
          />
        </label>
        <Button
          onClick={() => {
            const clamped = Math.min(10, Math.max(1, scoreDraft));
            rateCity(city.id, clamped, notes.trim() || undefined);
            setNotes("");
          }}
        >
          {existing ? "Update rating" : "Save rating"}
        </Button>
      </Card>
    </div>
  );
}
