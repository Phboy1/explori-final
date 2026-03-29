import type { City } from "@/lib/types/city";
import type { Budget } from "@/lib/types/user";
import { clamp01 } from "@/lib/scoring/normalize";

const IDEAL_COST: Record<Budget, number> = {
  low: 3.5,
  medium: 6,
  high: 8.5,
};

export function budgetMatchScore(city: City, budget: Budget): number {
  const ideal = IDEAL_COST[budget];
  const diff = Math.abs(city.avgCostIndex - ideal);
  return clamp01(1 - diff / 5);
}
