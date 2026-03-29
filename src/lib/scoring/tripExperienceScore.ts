/**
 * Blends your on-the-ground ratings with the model’s city estimate (0–1).
 * Dimensions + selected events are both optional, but you need at least one signal.
 */

export type VisitDimensions = {
  /** 0 = unset; 1–5 when set */
  people: number;
  vibe: number;
  safety: number;
  culture: number;
};

function dimTo10(d: VisitDimensions): number | null {
  const vals = [d.people, d.vibe, d.safety, d.culture].filter(
    (x) => typeof x === "number" && x >= 1 && x <= 5,
  );
  if (vals.length === 0) return null;
  return (vals.reduce((a, b) => a + b, 0) / vals.length / 5) * 10;
}

export function computeTripExperienceScore(
  dimensions: VisitDimensions,
  eventRatings: Record<string, number>,
  cityEstimate01: number,
): { score: number; breakdown: string } | null {
  const dim10 = dimTo10(dimensions);
  const evVals = Object.values(eventRatings).filter((v) => v >= 1 && v <= 5);
  const event10 =
    evVals.length > 0
      ? (evVals.reduce((a, b) => a + b, 0) / evVals.length / 5) * 10
      : null;

  const city10 = cityEstimate01 * 10;

  if (dim10 == null && event10 == null) return null;

  let score: number;
  let breakdown: string;

  if (dim10 != null && event10 != null) {
    score = 0.35 * dim10 + 0.35 * event10 + 0.3 * city10;
    breakdown = `Blend: 35% people/vibe/safety/culture (${dim10.toFixed(1)}/10) + 35% curated events (${event10.toFixed(1)}/10) + 30% city model (${city10.toFixed(1)}/10). The city score anchors how your visit lines up with your taste profile.`;
  } else if (dim10 != null) {
    score = 0.55 * dim10 + 0.45 * city10;
    breakdown = `Blend: 55% your dimension ratings (${dim10.toFixed(1)}/10) + 45% estimated city fit (${city10.toFixed(1)}/10). Add events on the map to refine.`;
  } else {
    score = 0.55 * event10! + 0.45 * city10;
    breakdown = `Blend: 55% event ratings (${event10!.toFixed(1)}/10) + 45% estimated city fit (${city10.toFixed(1)}/10). Add dimension sliders for a fuller picture.`;
  }

  return {
    score: Math.round(Math.min(10, Math.max(0, score)) * 10) / 10,
    breakdown,
  };
}
