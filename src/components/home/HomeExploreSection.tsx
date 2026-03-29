"use client";

import { useEffect, useMemo, useState } from "react";
import { CityExploreRow } from "@/components/home/CityExploreRow";
import { ExploreMapWithNav } from "@/components/home/ExploreMapWithNav";
import { useCities } from "@/context/CitiesContext";
import {
  sortExploreRows,
  type TransportMode,
} from "@/lib/explore/sortExploreCities";
import { distanceToCity } from "@/lib/geo/haversine";
import { getAllScoredForUser } from "@/lib/scoring/recommend";
import { useCityTasteStore } from "@/store/useCityTasteStore";

export type { TransportMode } from "@/lib/explore/sortExploreCities";

const MAX_KM: Record<TransportMode, number> = {
  local: 150,
  car: 900,
  plane: 20000,
};

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A63D40]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F5EBDD]";

function sourceLabel(source: string | null): string {
  if (!source) return "";
  if (source.startsWith("google-")) {
    return source.includes("walking")
      ? "Walking route distances (Google Distance Matrix)"
      : "Driving route distances (Google Distance Matrix)";
  }
  if (source === "great-circle") return "Great-circle distance (flight-style)";
  if (source === "great-circle-fallback") {
    return "Straight-line distance (add GOOGLE_MAPS_API_KEY + enable Distance Matrix API for road/walk routing)";
  }
  return "";
}

export function HomeExploreSection() {
  const { cities, loading } = useCities();
  const preferences = useCityTasteStore((s) => s.preferences);
  const ratings = useCityTasteStore((s) => s.ratings);

  const [query, setQuery] = useState("");
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [locError, setLocError] = useState<string | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [transport, setTransport] = useState<TransportMode>("car");
  const [distancesById, setDistancesById] = useState<Record<
    string,
    number
  > | null>(null);
  const [distSource, setDistSource] = useState<string | null>(null);
  const [distNotice, setDistNotice] = useState<string | null>(null);
  const [distanceLoading, setDistanceLoading] = useState(false);

  const maxKm = MAX_KM[transport];

  const scoredById = useMemo(() => {
    const scored = getAllScoredForUser(cities, preferences, ratings);
    return new Map(scored.map((s) => [s.city.id, s]));
  }, [cities, preferences, ratings]);

  useEffect(() => {
    if (!userPos || cities.length === 0) {
      setDistancesById(null);
      setDistSource(null);
      setDistNotice(null);
      setDistanceLoading(false);
      return;
    }

    let cancelled = false;
    const ac = new AbortController();
    setDistanceLoading(true);

    fetch("/api/distances", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: ac.signal,
      body: JSON.stringify({
        userLat: userPos.lat,
        userLng: userPos.lng,
        cities: cities.map((c) => ({
          id: c.id,
          latitude: c.latitude,
          longitude: c.longitude,
        })),
        mode: transport,
      }),
    })
      .then((r) => r.json())
      .then(
        (data: {
          distances?: Record<string, number>;
          source?: string;
          notice?: string;
        }) => {
          if (cancelled) return;
          setDistancesById(data.distances ?? null);
          setDistSource(data.source ?? null);
          setDistNotice(data.notice ?? null);
        },
      )
      .catch(() => {
        if (cancelled) return;
        setDistancesById(null);
        setDistSource(null);
        setDistNotice(null);
      })
      .finally(() => {
        if (!cancelled) setDistanceLoading(false);
      });

    return () => {
      cancelled = true;
      ac.abort();
    };
  }, [userPos, cities, transport]);

  const withDistance = useMemo(() => {
    if (!userPos) {
      return cities.map((c) => ({ city: c, km: null as number | null }));
    }
    return cities.map((c) => {
      const apiKm = distancesById?.[c.id];
      const km =
        typeof apiKm === "number" && Number.isFinite(apiKm)
          ? apiKm
          : distanceToCity(userPos.lat, userPos.lng, c);
      return { city: c, km };
    });
  }, [cities, userPos, distancesById]);

  const sortedRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = withDistance.filter(({ city }) => {
      if (!q) return true;
      const name = `${city.cityName} ${city.country}`.toLowerCase();
      return name.includes(q);
    });

    if (userPos) {
      rows = rows.filter(({ km }) => km != null && km <= maxKm);
    }

    return sortExploreRows(rows, transport, scoredById, ratings);
  }, [withDistance, query, userPos, maxKm, transport, scoredById, ratings]);

  const mapCities = useMemo(
    () => sortedRows.map((r) => r.city),
    [sortedRows],
  );

  function requestLocation() {
    setLocError(null);
    if (!navigator.geolocation) {
      setLocError("Geolocation is not supported in this browser.");
      return;
    }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocLoading(false);
      },
      (err) => {
        setLocLoading(false);
        setLocError(err.message || "Could not read your location.");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    );
  }

  const distHint = sourceLabel(distSource);

  return (
    <section className="rounded-2xl border border-stone-300/50 bg-cream-dark p-6 shadow-card sm:p-8">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-stone-900">
            Find cities near you
          </h2>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-stone-600">
            Map and list update together. Order is by distance, then by your
            rating / estimated match when distances are close. Local/Car use
            Google Distance Matrix when configured.
          </p>
        </div>
        <div
          className="flex shrink-0 items-center gap-1 rounded-full border border-stone-200 bg-white/80 px-3 py-1.5 text-xs text-stone-600"
          title="Placeholder — wired to real scoring later"
        >
          <span className="text-amber-600">★★★★</span>
          <span className="text-stone-400">★</span>
          <span className="ml-1 font-medium tabular-nums text-stone-700">
            4.2 / 5
          </span>
        </div>
      </div>

      {!loading && (
        <ExploreMapWithNav cities={mapCities} userPos={userPos} />
      )}

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="sr-only" htmlFor="city-search">
          Search cities
        </label>
        <input
          id="city-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by city or country…"
          className={`min-h-11 w-full flex-1 rounded-xl border border-stone-300/80 bg-white px-4 text-sm text-stone-900 placeholder:text-stone-400 sm:max-w-md ${focusRing}`}
          autoComplete="off"
        />
        <button
          type="button"
          onClick={requestLocation}
          disabled={locLoading || loading}
          className={`min-h-11 shrink-0 rounded-xl border border-stone-300/80 bg-white px-4 text-sm font-medium text-stone-800 transition hover:bg-stone-50 disabled:opacity-60 ${focusRing}`}
        >
          {locLoading ? "Locating…" : userPos ? "Update location" : "Use my location"}
        </button>
      </div>

      {locError && (
        <p className="mb-4 text-sm text-red-700">{locError}</p>
      )}

      <div className="mb-5">
        <span className="mb-2 block text-left text-[13px] font-medium text-stone-700">
          Travel mode (affects max distance)
        </span>
        <div
          className="flex max-w-md gap-1 rounded-xl bg-stone-900/[0.06] p-1 ring-1 ring-inset ring-stone-900/[0.04]"
          role="group"
          aria-label="Travel mode"
        >
          {(
            [
              ["local", "Local"],
              ["car", "Car"],
              ["plane", "Plane"],
            ] as const
          ).map(([id, label]) => {
            const selected = transport === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTransport(id)}
                className={`min-h-11 flex-1 rounded-lg text-sm font-medium transition-colors ${focusRing} ${
                  selected
                    ? "bg-[#A63D40] text-white shadow-sm"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-stone-500">
          Within ~{maxKm.toLocaleString()} km
          {userPos ? "" : " once location is on"}
          {transport === "plane"
            ? " — tie-break: up to ~500 km band, then higher score"
            : transport === "car"
              ? " — tie-break: ~50 km band"
              : " — tie-break: ~5 km band"}
        </p>
        {userPos && distHint ? (
          <p className="mt-2 text-xs text-stone-600">
            {distHint}
            {distanceLoading ? " · Updating…" : ""}
          </p>
        ) : null}
        {distNotice ? (
          <p className="mt-1 text-xs text-amber-800/90">{distNotice}</p>
        ) : null}
      </div>

      {loading ? (
        <p className="text-sm text-stone-600">Loading locations…</p>
      ) : (
        <ul className="divide-y divide-stone-200/80 rounded-xl border border-stone-200/80 bg-white/70">
          {sortedRows.length === 0 ? (
            <li className="px-4 py-8 text-center text-sm text-stone-600">
              No cities match. Try another search or switch travel mode.
            </li>
          ) : (
            sortedRows.map(({ city, km }) => {
              const scored = scoredById.get(city.id)!;
              return (
                <CityExploreRow
                  key={city.id}
                  city={city}
                  km={km}
                  scored={scored}
                />
              );
            })
          )}
        </ul>
      )}
    </section>
  );
}
