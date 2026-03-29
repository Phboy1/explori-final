import type { City } from "@/lib/types/city";
import type { UserPreferences } from "@/lib/types/user";
import { budgetMatchScore } from "@/lib/scoring/budgetMatch";
import { similarityToUserPreferences } from "@/lib/scoring/preferencesSimilarity";
import { similarityToHighlyRatedCities } from "@/lib/scoring/highlyRatedSimilarity";
import { clamp01 } from "@/lib/scoring/normalize";

export interface ScoreBreakdown {
  similarityToUserPreferences: number;
  similarityToHighlyRatedCities: number;
  popularityNormalized: number;
  budgetMatch: number;
  finalScore: number;
}

const W_PREF = 0.35;
const W_LIKED = 0.3;
const W_POP = 0.2;
const W_BUDGET = 0.15;

export function computeScoreBreakdown(
  city: City,
  prefs: UserPreferences,
  highlyRatedCities: City[],
): ScoreBreakdown {
  const prefSim = similarityToUserPreferences(city, prefs);
  const likedSim = similarityToHighlyRatedCities(city, highlyRatedCities);
  const pop = clamp01(city.popularityScore / 10);
  const budget = budgetMatchScore(city, prefs.budget);
  const finalScore = clamp01(
    W_PREF * prefSim + W_LIKED * likedSim + W_POP * pop + W_BUDGET * budget,
  );
  return {
    similarityToUserPreferences: prefSim,
    similarityToHighlyRatedCities: likedSim,
    popularityNormalized: pop,
    budgetMatch: budget,
    finalScore,
  };
}
