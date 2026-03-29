/** Curated city event / place — not an exhaustive list. */
export type EventDimension = "people" | "vibe" | "safety" | "culture" | "food";

export interface CityEvent {
  cityId: string;
  id: string;
  name: string;
  category: string;
  /** What this event mainly reflects for scoring */
  dimension: EventDimension;
  latitude: number;
  longitude: number;
}
