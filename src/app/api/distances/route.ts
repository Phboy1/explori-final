import { distanceKm } from "@/lib/geo/haversine";
import { NextResponse, type NextRequest } from "next/server";

type TransportMode = "local" | "car" | "plane";

type CityPoint = {
  id: string;
  latitude: number;
  longitude: number;
};

type Body = {
  userLat: number;
  userLng: number;
  cities: CityPoint[];
  mode: TransportMode;
};

function greatCircleKm(body: Body): Record<string, number> {
  const out: Record<string, number> = {};
  for (const c of body.cities) {
    out[c.id] = distanceKm(
      body.userLat,
      body.userLng,
      c.latitude,
      c.longitude,
    );
  }
  return out;
}

/** Google Distance Matrix `mode` param */
function googleMode(mode: Exclude<TransportMode, "plane">): "walking" | "driving" {
  return mode === "local" ? "walking" : "driving";
}

const GOOGLE_MATRIX_MAX_DESTS = 25;

type GoogleMatrixResponse = {
  status: string;
  error_message?: string;
  rows?: {
    elements: {
      status: string;
      distance?: { value: number; text: string };
    }[];
  }[];
};

async function fetchGoogleDistanceMatrix(
  userLat: number,
  userLng: number,
  cities: CityPoint[],
  travelMode: "walking" | "driving",
  apiKey: string,
): Promise<{ distances: Record<string, number>; error?: string }> {
  const origins = `${userLat},${userLng}`;
  const destinations = cities
    .map((c) => `${c.latitude},${c.longitude}`)
    .join("|");

  const params = new URLSearchParams({
    origins,
    destinations,
    mode: travelMode,
    units: "metric",
    key: apiKey.trim(),
  });

  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?${params.toString()}`;
  const res = await fetch(url);
  const data = (await res.json()) as GoogleMatrixResponse;

  if (data.status !== "OK") {
    return {
      distances: {},
      error: data.error_message || data.status || "Distance Matrix request failed",
    };
  }

  const row = data.rows?.[0];
  const elements = row?.elements;
  if (!elements || elements.length !== cities.length) {
    return {
      distances: {},
      error: "Unexpected Distance Matrix response shape",
    };
  }

  const distances: Record<string, number> = {};
  for (let i = 0; i < cities.length; i++) {
    const el = elements[i];
    if (el.status === "OK" && el.distance?.value != null) {
      distances[cities[i].id] = el.distance.value / 1000;
    } else {
      distances[cities[i].id] = distanceKm(
        userLat,
        userLng,
        cities[i].latitude,
        cities[i].longitude,
      );
    }
  }

  return { distances };
}

export async function POST(request: NextRequest) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { userLat, userLng, cities, mode } = body;
  if (
    typeof userLat !== "number" ||
    typeof userLng !== "number" ||
    !Array.isArray(cities) ||
    cities.length === 0 ||
    cities.length > 60
  ) {
    return NextResponse.json(
      { error: "Invalid userLat, userLng, or cities" },
      { status: 400 },
    );
  }

  if (userLat < -90 || userLat > 90 || userLng < -180 || userLng > 180) {
    return NextResponse.json({ error: "Coordinates out of range" }, {
      status: 400,
    });
  }

  if (mode !== "local" && mode !== "car" && mode !== "plane") {
    return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
  }

  if (mode === "plane") {
    return NextResponse.json({
      distances: greatCircleKm(body),
      source: "great-circle",
    });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey?.trim()) {
    return NextResponse.json({
      distances: greatCircleKm(body),
      source: "great-circle-fallback",
      notice:
        "Set GOOGLE_MAPS_API_KEY (server-only) and enable Distance Matrix API in Google Cloud — see .env.local.example.",
    });
  }

  const travelMode = googleMode(mode);

  try {
    const merged: Record<string, number> = {};
    const errors: string[] = [];

    for (let i = 0; i < cities.length; i += GOOGLE_MATRIX_MAX_DESTS) {
      const chunk = cities.slice(i, i + GOOGLE_MATRIX_MAX_DESTS);
      const { distances, error } = await fetchGoogleDistanceMatrix(
        userLat,
        userLng,
        chunk,
        travelMode,
        apiKey,
      );
      Object.assign(merged, distances);
      if (error) errors.push(error);
    }

    if (Object.keys(merged).length === 0) {
      return NextResponse.json({
        distances: greatCircleKm(body),
        source: "great-circle-fallback",
        notice: errors[0] || "Google Distance Matrix returned no distances.",
      });
    }

    return NextResponse.json({
      distances: merged,
      source: mode === "local" ? "google-walking" : "google-driving",
      ...(errors.length ? { notice: errors.join(" ") } : {}),
    });
  } catch (e) {
    return NextResponse.json({
      distances: greatCircleKm(body),
      source: "great-circle-fallback",
      notice:
        e instanceof Error ? e.message : "Distance API error; using straight-line.",
    });
  }
}
