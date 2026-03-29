"use client";

import { useEffect } from "react";
import { CircleMarker, MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { City } from "@/lib/types/city";

const ACCENT = "#A63D40";
const MUTED = "#78716c";
const USER = "#2563eb";

function FlyToCity({
  cities,
  focusIndex,
}: {
  cities: City[];
  focusIndex: number;
}) {
  const map = useMap();
  useEffect(() => {
    const c = cities[focusIndex];
    if (!c) return;
    map.flyTo([c.latitude, c.longitude], Math.min(map.getZoom() || 8, 9), {
      duration: 0.75,
    });
  }, [cities, focusIndex, map]);
  return null;
}

export default function ExploreMapInner({
  cities,
  userPos,
  focusIndex,
}: {
  cities: City[];
  userPos: { lat: number; lng: number } | null;
  focusIndex: number;
}) {
  const safeFocus =
    cities.length > 0
      ? Math.min(Math.max(0, focusIndex), cities.length - 1)
      : 0;

  const center: [number, number] =
    cities.length > 0
      ? [cities[safeFocus].latitude, cities[safeFocus].longitude]
      : userPos
        ? [userPos.lat, userPos.lng]
        : [43.65, -79.38];

  if (cities.length === 0 && !userPos) {
    return (
      <div className="flex h-[220px] items-center justify-center rounded-2xl bg-white/80 text-sm text-stone-600 ring-1 ring-stone-900/5">
        Turn on location or widen search to see the map.
      </div>
    );
  }

  return (
    <MapContainer
      center={center}
      zoom={userPos ? 8 : 4}
      className="z-0 h-[220px] w-full rounded-2xl ring-1 ring-stone-900/10"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {cities.length > 0 ? (
        <FlyToCity cities={cities} focusIndex={safeFocus} />
      ) : null}
      {userPos && (
        <CircleMarker
          center={[userPos.lat, userPos.lng]}
          radius={9}
          pathOptions={{
            color: USER,
            fillColor: USER,
            fillOpacity: 0.9,
            weight: 2,
          }}
        />
      )}
      {cities.map((city, i) => {
        const focused = i === safeFocus;
        return (
          <CircleMarker
            key={city.id}
            center={[city.latitude, city.longitude]}
            radius={focused ? 11 : 6}
            pathOptions={{
              color: focused ? ACCENT : MUTED,
              fillColor: focused ? ACCENT : MUTED,
              fillOpacity: focused ? 0.9 : 0.45,
              weight: focused ? 3 : 2,
            }}
          />
        );
      })}
    </MapContainer>
  );
}
