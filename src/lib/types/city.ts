export type FoodScene = "street food" | "fine dining" | "mixed";

export interface City {
  id: string;
  cityName: string;
  country: string;
  avgCostIndex: number;
  vibeTags: string[];
  foodScene: FoodScene;
  safetyScore: number;
  popularityScore: number;
  latitude: number;
  longitude: number;
}
