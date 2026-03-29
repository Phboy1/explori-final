"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { VisitExperienceModal } from "@/components/home/VisitExperienceModal";
import { useCityEvents } from "@/context/EventsContext";
import type { City } from "@/lib/types/city";
import type { ScoredCity } from "@/lib/scoring/recommend";
import { useCityTasteStore } from "@/store/useCityTasteStore";

function TripScoreReveal({
  target,
  onComplete,
}: {
  target: number;
  onComplete: () => void;
}) {
  const [v, setV] = useState(0);
  const onEnd = useRef(onComplete);
  onEnd.current = onComplete;

  useEffect(() => {
    const start = performance.now();
    const dur = 2000;
    let raf = 0;
    function tick(now: number) {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - (1 - t) ** 3;
      setV(target * eased);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setV(target);
        onEnd.current();
      }
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  return (
    <div className="flex flex-col items-center gap-2 py-6">
      <div className="text-5xl font-bold tabular-nums text-[#A63D40]">
        {v.toFixed(1)}
      </div>
      <p className="text-sm text-stone-600">/ 10 · your trip</p>
    </div>
  );
}

export function CityExploreRow({
  city,
  km,
  scored,
}: {
  city: City;
  km: number | null;
  scored: ScoredCity;
}) {
  const { byCityId } = useCityEvents();
  const ratings = useCityTasteStore((s) => s.ratings);
  const tripExperienceScores = useCityTasteStore((s) => s.tripExperienceScores);
  const tripScoreBreakdowns = useCityTasteStore((s) => s.tripScoreBreakdowns);
  const setTripExperienceScore = useCityTasteStore(
    (s) => s.setTripExperienceScore,
  );
  const finishOnce = useRef(false);
  const pendingBreakdown = useRef<string | undefined>(undefined);

  const [open, setOpen] = useState(false);
  const [visitOpen, setVisitOpen] = useState(false);
  const [animOpen, setAnimOpen] = useState(false);
  const [animTarget, setAnimTarget] = useState(0);

  const cityEvents = byCityId.get(city.id) ?? [];
  const userRating = ratings[city.id];
  const tripStored = tripExperienceScores[city.id];
  const breakdownStored = tripScoreBreakdowns[city.id];

  const estimated01 = scored.breakdown.finalScore;
  const estimated10 = estimated01 * 10;

  const handleCalculated = (score: number, breakdown: string) => {
    pendingBreakdown.current = breakdown;
    setAnimTarget(score);
    finishOnce.current = false;
    setVisitOpen(false);
    setAnimOpen(true);
  };

  const finishAnim = useCallback(() => {
    if (finishOnce.current) return;
    finishOnce.current = true;
    setTripExperienceScore(city.id, animTarget, pendingBreakdown.current);
    setAnimOpen(false);
  }, [animTarget, city.id, setTripExperienceScore]);

  const breakdownBits = useMemo(
    () => [
      `Match to your preferences: ${(scored.breakdown.similarityToUserPreferences * 100).toFixed(0)}%`,
      `Similar to cities you loved: ${(scored.breakdown.similarityToHighlyRatedCities * 100).toFixed(0)}%`,
      `Popularity: ${(scored.breakdown.popularityNormalized * 100).toFixed(0)}%`,
      `Budget fit: ${(scored.breakdown.budgetMatch * 100).toFixed(0)}%`,
    ],
    [scored.breakdown],
  );

  return (
    <li className="border-b border-stone-200/80 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full flex-wrap items-baseline justify-between gap-2 px-4 py-3 text-left transition hover:bg-stone-900/[0.03]"
      >
        <span className="font-medium text-stone-900">
          {city.cityName}
          <span className="font-normal text-stone-500">, {city.country}</span>
        </span>
        <span className="flex items-center gap-2">
          <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-700">
            {userRating
              ? `You: ${userRating.score}/10`
              : `Est. ${estimated10.toFixed(1)}/10`}
          </span>
          <span className="text-sm tabular-nums text-stone-600">
            {km != null
              ? km < 10
                ? `${km.toFixed(1)} km`
                : `${Math.round(km)} km`
              : "—"}
          </span>
          <span className="text-stone-400">{open ? "▾" : "▸"}</span>
        </span>
      </button>

      {open && (
        <div className="space-y-3 border-t border-stone-200/60 bg-stone-50/80 px-4 py-4 text-sm">
          <p className="text-stone-800">{scored.explanation}</p>
          <ul className="list-inside list-disc text-xs text-stone-600">
            {breakdownBits.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>

          {userRating ? (
            <p className="font-medium text-stone-900">
              Your rating: {userRating.score}/10
              {userRating.notes ? ` — ${userRating.notes}` : ""}
            </p>
          ) : (
            <p className="text-stone-700">
              <span className="font-medium">Estimated match:</span>{" "}
              {estimated10.toFixed(1)}/10 — based on your profile and cities you
              rated highly (similarity model).
            </p>
          )}

          {tripStored != null ? (
            <div className="rounded-xl border border-[#A63D40]/25 bg-white/80 p-3">
              <p className="font-medium text-[#A63D40]">
                Your trip score: {tripStored.toFixed(1)}/10
              </p>
              {breakdownStored ? (
                <p className="mt-2 text-xs leading-relaxed text-stone-600">
                  {breakdownStored}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setVisitOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-dashed border-[#A63D40] text-lg font-light text-[#A63D40] transition hover:bg-[#A63D40]/10"
              title="Log your visit"
              aria-label="Log your visit"
            >
              +
            </button>
            <span className="text-xs text-stone-600">
              Tap + for dimensions, search, map events, and blended score.
            </span>
            <Link
              href={`/city/${city.id}`}
              className="ml-auto text-xs font-medium text-[#A63D40] hover:underline"
            >
              Open city page →
            </Link>
          </div>
        </div>
      )}

      {visitOpen && (
        <VisitExperienceModal
          city={city}
          events={cityEvents}
          estimated01={estimated01}
          onClose={() => setVisitOpen(false)}
          onCalculated={handleCalculated}
        />
      )}

      {animOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-stone-900/55 p-6">
          <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl">
            <p className="text-sm font-medium text-stone-600">Your trip score</p>
            <TripScoreReveal target={animTarget} onComplete={finishAnim} />
            <button
              type="button"
              onClick={finishAnim}
              className="mt-2 text-xs text-[#A63D40] underline"
            >
              Skip
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
