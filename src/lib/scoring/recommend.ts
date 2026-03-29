import type { City } from "@/lib/types/city";
import type { CityRating, UserPreferences } from "@/lib/types/user";
import { computeScoreBreakdown, type ScoreBreakdown } from "@/lib/scoring/finalScore";
import { buildRecommendationExplanation } from "@/lib/scoring/explain";

export interface ScoredCity {
  city: City;
  breakdown: ScoreBreakdown;
  explanation: string;
}

export function getHighlyRatedCities(
  citiesById: Map<string, City>,
  ratings: Record<string, CityRating>,
): City[] {
  return Object.entries(ratings)
    .filter(([, r]) => r.score >= 8)
    .map(([id]) => citiesById.get(id))
    .filter((c): c is City => Boolean(c));
}

export function scoreCityForUser(
  city: City,
  prefs: UserPreferences,
  highlyRated: City[],
  highlyRatedNames: string[],
): ScoredCity {
  const breakdown = computeScoreBreakdown(city, prefs, highlyRated);
  const explanation = buildRecommendationExplanation(
    city,
    prefs,
    highlyRatedNames,
    breakdown,
  );
  return { city, breakdown, explanation };
}

export function getTopRecommendations(
  cities: City[],
  prefs: UserPreferences,
  ratings: Record<string, CityRating>,
  limit = 10,
): ScoredCity[] {
  const byId = new Map(cities.map((c) => [c.id, c]));
  const highlyRated = getHighlyRatedCities(byId, ratings);
  const highlyRatedNames = highlyRated.map((c) => c.cityName);
  const ratedIds = new Set(Object.keys(ratings));

  return cities
    .filter((c) => !ratedIds.has(c.id))
    .map((c) => scoreCityForUser(c, prefs, highlyRated, highlyRatedNames))
    .sort((a, b) => b.breakdown.finalScore - a.breakdown.finalScore)
    .slice(0, limit);
}

export function getAllScoredForUser(
  cities: City[],
  prefs: UserPreferences,
  ratings: Record<string, CityRating>,
): ScoredCity[] {
  const byId = new Map(cities.map((c) => [c.id, c]));
  const highlyRated = getHighlyRatedCities(byId, ratings);
  const highlyRatedNames = highlyRated.map((c) => c.cityName);

  return cities.map((c) =>
    scoreCityForUser(c, prefs, highlyRated, highlyRatedNames),
  );
}
