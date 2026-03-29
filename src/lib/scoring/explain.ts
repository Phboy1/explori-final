import type { City } from "@/lib/types/city";
import type { UserPreferences } from "@/lib/types/user";
import type { ScoreBreakdown } from "@/lib/scoring/finalScore";

export function buildRecommendationExplanation(
  city: City,
  prefs: UserPreferences,
  highlyRatedCityNames: string[],
  breakdown: ScoreBreakdown,
): string {
  const vibeOverlap = prefs.vibes.filter((v) =>
    city.vibeTags.includes(v.toLowerCase()),
  );
  const vibePart =
    vibeOverlap.length > 0
      ? vibeOverlap.join(" + ")
      : city.vibeTags.slice(0, 3).join(", ");

  const budgetLabel = prefs.budget;
  const pieces: string[] = [];

  if (highlyRatedCityNames.length > 0 && breakdown.similarityToHighlyRatedCities > 0.55) {
    const names = highlyRatedCityNames.slice(0, 2).join(" and ");
    pieces.push(`Similar to ${names} you rated highly`);
  }

  if (breakdown.similarityToUserPreferences > 0.55) {
    pieces.push(`matches your ${vibePart} leanings and ${budgetLabel} budget`);
  } else if (pieces.length === 0) {
    pieces.push(`Strong on popularity and cost fit for a ${budgetLabel} trip`);
  }

  const safetyNote =
    prefs.safetyImportance === "high" && city.safetyScore >= 8
      ? "with solid safety scores"
      : "";

  const main = pieces.join(" — ");
  return [main, safetyNote].filter(Boolean).join(" ").trim();
}
