import type { City } from "@/lib/types/city";
import type { FoodPreference, SafetyImportance, UserPreferences, Vibe } from "@/lib/types/user";
import { clamp01 } from "@/lib/scoring/normalize";

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}

function foodPreferenceScore(
  userFood: FoodPreference,
  cityFood: City["foodScene"],
): number {
  if (userFood === "mixed") return 0.85;
  return userFood === cityFood ? 1 : 0.25;
}

const DESIRED_SAFETY: Record<SafetyImportance, number> = {
  low: 5.5,
  medium: 7,
  high: 8.5,
};

function safetyAlignmentScore(
  citySafety: number,
  importance: SafetyImportance,
): number {
  const target = DESIRED_SAFETY[importance];
  const diff = Math.abs(citySafety - target);
  return clamp01(1 - diff / 4);
}

export function similarityToUserPreferences(
  city: City,
  prefs: UserPreferences,
): number {
  const userVibes = new Set(prefs.vibes.map((v: Vibe) => v.toLowerCase()));
  const cityVibes = new Set(city.vibeTags);
  const vibeSim = jaccard(userVibes, cityVibes);
  const foodSim = foodPreferenceScore(prefs.food, city.foodScene);
  const safetySim = safetyAlignmentScore(city.safetyScore, prefs.safetyImportance);
  return clamp01((vibeSim + foodSim + safetySim) / 3);
}
