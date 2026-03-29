"use client";

import { useMemo } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { City } from "@/lib/types/city";
import type { CityEvent, EventDimension } from "@/lib/types/cityEvent";

const DIM: Record<EventDimension, string> = {
  people: "#7c3aed",
  vibe: "#db2777",
  safety: "#059669",
  culture: "#ca8a04",
  food: "#ea580c",
};

export function EventMapPicker({
  city,
  events,
  eventRatings,
  onPickRating,
}: {
  city: City;
  events: CityEvent[];
  eventRatings: Record<string, number>;
  onPickRating: (eventId: string, stars: number) => void;
}) {
  const center: [number, number] = [city.latitude, city.longitude];

  const boundsOk = useMemo(
    () => events.every((e) => e.latitude && e.longitude),
    [events],
  );

  if (!boundsOk || events.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center rounded-xl bg-stone-200/50 text-xs text-stone-600">
        No mapped events for this city yet.
      </div>
    );
  }

  return (
    <MapContainer
      center={center}
      zoom={12}
      className="z-0 h-[220px] w-full rounded-xl ring-1 ring-stone-900/10"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <CircleMarker
        center={[city.latitude, city.longitude]}
        radius={6}
        pathOptions={{ color: "#57534e", fillColor: "#a8a29e", fillOpacity: 0.35 }}
      >
        <Popup>City center</Popup>
      </CircleMarker>
      {events.map((e) => {
        const color = DIM[e.dimension] ?? "#78716c";
        const rated = eventRatings[e.id] ?? 0;
        return (
          <CircleMarker
            key={e.id}
            center={[e.latitude, e.longitude]}
            radius={rated > 0 ? 10 : 7}
            pathOptions={{
              color,
              fillColor: color,
              fillOpacity: rated > 0 ? 0.95 : 0.45,
              weight: 2,
            }}
          >
            <Popup>
              <div className="max-w-[200px] text-stone-900">
                <p className="text-sm font-semibold">{e.name}</p>
                <p className="text-[10px] uppercase text-stone-500">
                  {e.dimension} · {e.category}
                </p>
                <div className="mt-2 flex gap-0.5">
                  {([1, 2, 3, 4, 5] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`h-7 w-7 rounded text-xs font-medium ${
                        rated >= s
                          ? "bg-[#A63D40] text-white"
                          : "bg-stone-100 text-stone-600"
                      }`}
                      onClick={() => onPickRating(e.id, s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
