import type { City, FoodScene } from "@/lib/types/city";

export type CityRow = {
  id: string;
  city_name: string;
  country: string;
  avg_cost_index: number;
  vibe_tags: string;
  food_scene: string;
  safety_score: number;
  popularity_score: number;
  latitude: number;
  longitude: number;
};

const FOOD_SCENES: FoodScene[] = ["street food", "fine dining", "mixed"];

function normalizeFoodScene(raw: string): FoodScene {
  const s = raw.trim().toLowerCase();
  if (FOOD_SCENES.includes(s as FoodScene)) return s as FoodScene;
  return "mixed";
}

export function cityFromDbRow(row: CityRow): City {
  const tags = (row.vibe_tags || "")
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

  return {
    id: row.id,
    cityName: row.city_name,
    country: row.country,
    avgCostIndex: Number(row.avg_cost_index) || 5,
    vibeTags: tags,
    foodScene: normalizeFoodScene(row.food_scene || "mixed"),
    safetyScore: Number(row.safety_score) || 5,
    popularityScore: Number(row.popularity_score) || 5,
    latitude: Number(row.latitude) || 0,
    longitude: Number(row.longitude) || 0,
  };
}
