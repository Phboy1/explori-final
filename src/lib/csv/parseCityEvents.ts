import Papa from "papaparse";
import type { CityEvent, EventDimension } from "@/lib/types/cityEvent";

const DIMS: EventDimension[] = [
  "people",
  "vibe",
  "safety",
  "culture",
  "food",
];

function normalizeDim(raw: string): EventDimension {
  const s = raw.trim().toLowerCase();
  if (DIMS.includes(s as EventDimension)) return s as EventDimension;
  return "culture";
}

export function parseCityEventsCsv(csvText: string): CityEvent[] {
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  const rows = parsed.data.filter((row) => row.city_id?.trim() && row.id?.trim());

  return rows.map((row) => ({
    cityId: row.city_id.trim(),
    id: row.id.trim(),
    name: row.name.trim(),
    category: (row.category || "general").trim(),
    dimension: normalizeDim(row.dimension || "culture"),
    latitude: Number(row.latitude) || 0,
    longitude: Number(row.longitude) || 0,
  }));
}

export function cityEventsByCityId(events: CityEvent[]): Map<string, CityEvent[]> {
  const m = new Map<string, CityEvent[]>();
  for (const e of events) {
    const list = m.get(e.cityId) ?? [];
    list.push(e);
    m.set(e.cityId, list);
  }
  return m;
}
