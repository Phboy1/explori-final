"use client";

import { useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import type { City } from "@/lib/types/city";

const ACCENT = "#A63D40";
const MUTED = "#78716c";

export default function MapView({
  cities,
  recommendedIds,
}: {
  cities: City[];
  recommendedIds: Set<string>;
}) {
  const center = useMemo(() => {
    if (cities.length === 0) return [20, 0] as [number, number];
    const lat =
      cities.reduce((s, c) => s + c.latitude, 0) / cities.length;
    const lng =
      cities.reduce((s, c) => s + c.longitude, 0) / cities.length;
    return [lat, lng] as [number, number];
  }, [cities]);

  if (cities.length === 0) {
    return (
      <div className="flex h-[480px] items-center justify-center rounded-2xl bg-white/80 text-stone-600 ring-1 ring-stone-900/5">
        No cities to plot yet.
      </div>
    );
  }

  return (
    <MapContainer
      center={center}
      zoom={2}
      className="z-0 h-[min(70vh,560px)] w-full rounded-2xl ring-1 ring-stone-900/10"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {cities.map((city) => {
        const rec = recommendedIds.has(city.id);
        return (
          <CircleMarker
            key={city.id}
            center={[city.latitude, city.longitude]}
            radius={rec ? 10 : 6}
            pathOptions={{
              color: rec ? ACCENT : MUTED,
              fillColor: rec ? ACCENT : MUTED,
              fillOpacity: rec ? 0.85 : 0.5,
              weight: 2,
            }}
          >
            <Popup>
              <div className="min-w-[140px] text-stone-900">
                <p className="font-semibold">{city.cityName}</p>
                <p className="text-xs text-stone-600">{city.country}</p>
                {rec && (
                  <p className="mt-1 text-xs font-medium text-[#A63D40]">
                    Recommended for you
                  </p>
                )}
                <Link
                  href={`/city/${city.id}`}
                  className="mt-2 inline-block text-xs text-[#A63D40] hover:underline"
                >
                  View city
                </Link>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
