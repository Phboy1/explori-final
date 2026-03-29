export type Budget = "low" | "medium" | "high";

export type Vibe =
  | "party"
  | "chill"
  | "nature"
  | "culture"
  | "luxury";

export type TravelStyle = "solo" | "couple" | "group";

export type FoodPreference = "street food" | "fine dining" | "mixed";

export type SafetyImportance = "low" | "medium" | "high";

export interface UserPreferences {
  budget: Budget;
  vibes: Vibe[];
  travelStyle: TravelStyle;
  food: FoodPreference;
  safetyImportance: SafetyImportance;
}

export interface CityRating {
  score: number;
  notes?: string;
}
