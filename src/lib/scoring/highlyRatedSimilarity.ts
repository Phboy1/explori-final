import type { City } from "@/lib/types/city";
import { clamp01 } from "@/lib/scoring/normalize";

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}

function foodMatch(a: City["foodScene"], b: City["foodScene"]): number {
  return a === b ? 1 : 0.35;
}

/** Similarity between two cities' feature vectors, all in 0–1. */
export function cityPairSimilarity(a: City, b: City): number {
  const tagSim = jaccard(new Set(a.vibeTags), new Set(b.vibeTags));
  const foodSim = foodMatch(a.foodScene, b.foodScene);
  const costSim = clamp01(1 - Math.abs(a.avgCostIndex - b.avgCostIndex) / 10);
  const safetySim = clamp01(1 - Math.abs(a.safetyScore - b.safetyScore) / 10);
  return clamp01((tagSim + foodSim + costSim + safetySim) / 4);
}

/**
 * Average similarity to cities the user rated >= 8.
 * Neutral 0.5 when there are no highly rated cities.
 */
export function similarityToHighlyRatedCities(
  candidate: City,
  highlyRatedCities: City[],
): number {
  if (highlyRatedCities.length === 0) return 0.5;
  const sum = highlyRatedCities.reduce(
    (acc, liked) => acc + cityPairSimilarity(candidate, liked),
    0,
  );
  return clamp01(sum / highlyRatedCities.length);
}
