import type { ScoreBreakdown } from "@/lib/scoring/finalScore";

const ROWS: {
  key: keyof Pick<
    ScoreBreakdown,
    | "similarityToUserPreferences"
    | "similarityToHighlyRatedCities"
    | "popularityNormalized"
    | "budgetMatch"
  >;
  label: string;
  weight: string;
}[] = [
  {
    key: "similarityToUserPreferences",
    label: "Your preferences (vibe, food, safety)",
    weight: "35%",
  },
  {
    key: "similarityToHighlyRatedCities",
    label: "Similar to cities you rated 8+",
    weight: "30%",
  },
  {
    key: "popularityNormalized",
    label: "Popularity",
    weight: "20%",
  },
  {
    key: "budgetMatch",
    label: "Budget fit",
    weight: "15%",
  },
];

export function ScoreBreakdownView({ breakdown }: { breakdown: ScoreBreakdown }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-stone-600">
        Final score blends weighted signals (each bar is the normalized 0–1
        input before weights).
      </p>
      <ul className="space-y-3">
        {ROWS.map(({ key, label, weight }) => {
          const v = breakdown[key];
          return (
            <li key={key}>
              <div className="mb-1 flex justify-between text-xs text-stone-600">
                <span>{label}</span>
                <span>
                  {weight} · {(v * 100).toFixed(0)}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-stone-200">
                <div
                  className="h-full rounded-full bg-[#A63D40] transition-all"
                  style={{ width: `${v * 100}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
      <p className="text-sm font-medium text-stone-900">
        Overall recommendation strength:{" "}
        <span className="text-[#A63D40]">
          {(breakdown.finalScore * 100).toFixed(1)}%
        </span>
      </p>
    </div>
  );
}
