"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import type { City } from "@/lib/types/city";
import type { CityEvent } from "@/lib/types/cityEvent";
import {
  computeTripExperienceScore,
  type VisitDimensions,
} from "@/lib/scoring/tripExperienceScore";
import { useCityTasteStore } from "@/store/useCityTasteStore";

const EventMapPicker = dynamic(
  () =>
    import("@/components/home/EventMapPicker").then((m) => m.EventMapPicker),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[220px] items-center justify-center rounded-xl bg-stone-100 text-sm text-stone-600">
        Loading map…
      </div>
    ),
  },
);

const DIM_LABELS: { key: keyof VisitDimensions; label: string; hint: string }[] =
  [
    { key: "people", label: "People & hospitality", hint: "Locals, service, warmth" },
    { key: "vibe", label: "Vibe & energy", hint: "Pace, mood, fun" },
    { key: "safety", label: "Safety & comfort", hint: "How safe you felt" },
    { key: "culture", label: "Culture & places", hint: "Sights, arts, character" },
  ];

const EMPTY_OBJ = {};
export function VisitExperienceModal({
  city,
  events,
  estimated01,
  onClose,
  onCalculated,
}: {
  city: City;
  events: CityEvent[];
  estimated01: number;
  onClose: () => void;
  onCalculated: (score: number, breakdown: string) => void;
}) {
  const visitDimensions = useCityTasteStore((s) => s.visitDimensions[city.id]);
  const attractionRatings = useCityTasteStore(
    (s) => s.attractionRatings[city.id] ?? EMPTY_OBJ,
  );
  const setVisitDimensions = useCityTasteStore((s) => s.setVisitDimensions);
  const setAttractionRating = useCityTasteStore((s) => s.setAttractionRating);

  const [query, setQuery] = useState("");

  const dims: VisitDimensions = visitDimensions ?? {
    people: 0,
    vibe: 0,
    safety: 0,
    culture: 0,
  };

  const filteredEvents = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return events;
    return events.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.dimension.toLowerCase().includes(q),
    );
  }, [events, query]);

  const canCompute = useMemo(() => {
    const hasDim = [dims.people, dims.vibe, dims.safety, dims.culture].some(
      (x) => x >= 1 && x <= 5,
    );
    const hasEv = Object.values(attractionRatings).some(
      (x) => x >= 1 && x <= 5,
    );
    return hasDim || hasEv;
  }, [dims, attractionRatings]);

  const handleCalc = () => {
    const res = computeTripExperienceScore(
      dims,
      attractionRatings,
      estimated01,
    );
    if (!res) return;
    onCalculated(res.score, res.breakdown);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-stone-900/45 p-4 sm:items-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-stone-100 p-5 shadow-2xl ring-1 ring-stone-900/10"
        role="dialog"
        aria-labelledby="visit-exp-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          id="visit-exp-title"
          className="text-lg font-semibold text-stone-900"
        >
          Your visit · {city.cityName}
        </h3>
        <p className="mt-1 text-xs text-stone-600">
          Rate how it felt (dimensions), then pick a few curated spots on the map
          — not every business, just highlights. Scores blend with the city’s
          estimated match for you.
        </p>

        <section className="mt-5 space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            Dimensions (1–5 each)
          </h4>
          <div className="grid gap-3 sm:grid-cols-2">
            {DIM_LABELS.map(({ key, label, hint }) => (
              <div
                key={key}
                className="rounded-xl border border-stone-200 bg-white p-3"
              >
                <p className="text-sm font-medium text-stone-900">{label}</p>
                <p className="text-[11px] text-stone-500">{hint}</p>
                <div className="mt-2 flex gap-1">
                  {([1, 2, 3, 4, 5] as const).map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() =>
                        setVisitDimensions(city.id, { [key]: star })
                      }
                      className={`h-8 flex-1 rounded-lg text-xs font-medium ${
                        (dims[key] ?? 0) >= star
                          ? "bg-[#A63D40] text-white"
                          : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                      }`}
                    >
                      {star}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            Curated events
          </h4>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, category, or dimension…"
            className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm"
          />
          <p className="mt-2 text-[11px] text-stone-500">
            Map: click markers to rate. List below matches your search.
          </p>
          <div className="mt-3">
            <EventMapPicker
              city={city}
              events={filteredEvents.length ? filteredEvents : events}
              eventRatings={attractionRatings}
              onPickRating={(id, stars) =>
                setAttractionRating(city.id, id, stars)
              }
            />
          </div>
          <ul className="mt-3 max-h-40 space-y-2 overflow-y-auto">
            {filteredEvents.length === 0 ? (
              <li className="text-sm text-stone-500">No matches.</li>
            ) : (
              filteredEvents.map((e) => (
                <li
                  key={e.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm"
                >
                  <span>
                    <span className="font-medium text-stone-900">{e.name}</span>
                    <span className="ml-2 text-[10px] uppercase text-stone-400">
                      {e.dimension}
                    </span>
                  </span>
                  <div className="flex gap-0.5">
                    {([1, 2, 3, 4, 5] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setAttractionRating(city.id, e.id, s)}
                        className={`h-7 w-7 rounded text-xs ${
                          (attractionRatings[e.id] ?? 0) >= s
                            ? "bg-[#A63D40] text-white"
                            : "bg-stone-100 text-stone-600"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </li>
              ))
            )}
          </ul>
        </section>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-800"
          >
            Close
          </button>
          <button
            type="button"
            disabled={!canCompute}
            onClick={handleCalc}
            className="rounded-xl bg-[#A63D40] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Calculate trip score
          </button>
        </div>
      </div>
    </div>
  );
}
