import type { City } from "@/lib/types/city";
import type { CityRating } from "@/lib/types/user";
import type { ScoredCity } from "@/lib/scoring/recommend";

export type TransportMode = "local" | "car" | "plane";

const EPS_KM: Record<TransportMode, number> = {
  local: 5,
  car: 50,
  plane: 500,
};

function rankScore(
  cityId: string,
  scoredById: Map<string, ScoredCity>,
  ratings: Record<string, CityRating>,
): number {
  const user = ratings[cityId];
  if (user) return user.score / 10;
  const s = scoredById.get(cityId);
  return s?.breakdown.finalScore ?? 0;
}

export type ExploreRow = { city: City; km: number | null };

/** Distance buckets first; within ~same distance, higher score first — never alphabetical. */
export function sortExploreRows(
  rows: ExploreRow[],
  transport: TransportMode,
  scoredById: Map<string, ScoredCity>,
  ratings: Record<string, CityRating>,
): ExploreRow[] {
  const eps = EPS_KM[transport];

  return [...rows].sort((a, b) => {
    if (a.km == null && b.km == null) {
      return (
        rankScore(b.city.id, scoredById, ratings) -
        rankScore(a.city.id, scoredById, ratings)
      );
    }
    if (a.km == null) return 1;
    if (b.km == null) return -1;

    const bucketA = Math.floor(a.km / eps) * eps;
    const bucketB = Math.floor(b.km / eps) * eps;
    if (bucketA !== bucketB) return bucketA - bucketB;

    const sa = rankScore(a.city.id, scoredById, ratings);
    const sb = rankScore(b.city.id, scoredById, ratings);
    if (sb !== sa) return sb - sa;
    return a.km - b.km;
  });
}
