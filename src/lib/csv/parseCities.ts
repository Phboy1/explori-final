import Papa from "papaparse";
import type { City, FoodScene } from "@/lib/types/city";
import { cityId } from "@/lib/citySlug";

const FOOD_SCENES: FoodScene[] = ["street food", "fine dining", "mixed"];

function normalizeFoodScene(raw: string): FoodScene {
  const s = raw.trim().toLowerCase();
  if (FOOD_SCENES.includes(s as FoodScene)) return s as FoodScene;
  return "mixed";
}

export function parseCitiesCsv(csvText: string): City[] {
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  if (parsed.errors.length) {
    console.warn("CSV parse warnings:", parsed.errors);
  }

  const rows = parsed.data.filter((row) => row.city_name?.trim());

  return rows.map((row) => {
    const cityName = row.city_name.trim();
    const country = row.country.trim();
    const tags = (row.vibe_tags || "")
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    return {
      id: cityId(cityName, country),
      cityName,
      country,
      avgCostIndex: Number(row.avg_cost_index) || 5,
      vibeTags: tags,
      foodScene: normalizeFoodScene(row.food_scene || "mixed"),
      safetyScore: Number(row.safety_score) || 5,
      popularityScore: Number(row.popularity_score) || 5,
      latitude: Number(row.latitude) || 0,
      longitude: Number(row.longitude) || 0,
    };
  });
}
