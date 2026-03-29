import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { VisitDimensions } from "@/lib/scoring/tripExperienceScore";
import type { CityRating, UserPreferences, Vibe } from "@/lib/types/user";

const defaultPreferences: UserPreferences = {
  budget: "medium",
  vibes: ["culture", "chill"],
  travelStyle: "solo",
  food: "mixed",
  safetyImportance: "medium",
};

const emptyDims = (): VisitDimensions => ({
  people: 0,
  vibe: 0,
  safety: 0,
  culture: 0,
});

export interface CityTasteState {
  preferences: UserPreferences;
  ratings: Record<string, CityRating>;
  bookmarks: string[];
  /** cityId → eventId → 1–5 (curated map/list events) */
  attractionRatings: Record<string, Record<string, number>>;
  visitDimensions: Record<string, VisitDimensions>;
  tripExperienceScores: Record<string, number>;
  tripScoreBreakdowns: Record<string, string>;
  setPreferences: (p: Partial<UserPreferences>) => void;
  setVibes: (vibes: Vibe[]) => void;
  rateCity: (cityId: string, score: number, notes?: string) => void;
  toggleBookmark: (cityId: string) => void;
  setAttractionRating: (
    cityId: string,
    eventId: string,
    score: number,
  ) => void;
  setVisitDimensions: (
    cityId: string,
    partial: Partial<VisitDimensions>,
  ) => void;
  setTripExperienceScore: (
    cityId: string,
    score: number,
    breakdown?: string,
  ) => void;
  resetProfile: () => void;
}

export const useCityTasteStore = create<CityTasteState>()(
  persist(
    (set) => ({
      preferences: defaultPreferences,
      ratings: {},
      bookmarks: [],
      attractionRatings: {},
      visitDimensions: {},
      tripExperienceScores: {},
      tripScoreBreakdowns: {},
      setPreferences: (p) =>
        set((s) => ({
          preferences: { ...s.preferences, ...p },
        })),
      setVibes: (vibes) =>
        set((s) => ({
          preferences: { ...s.preferences, vibes },
        })),
      rateCity: (cityId, score, notes) =>
        set((s) => ({
          ratings: {
            ...s.ratings,
            [cityId]: { score, notes },
          },
        })),
      toggleBookmark: (cityId) =>
        set((s) => ({
          bookmarks: s.bookmarks.includes(cityId)
            ? s.bookmarks.filter((id) => id !== cityId)
            : [...s.bookmarks, cityId],
        })),
      setAttractionRating: (cityId, eventId, score) =>
        set((s) => ({
          attractionRatings: {
            ...s.attractionRatings,
            [cityId]: {
              ...(s.attractionRatings[cityId] ?? {}),
              [eventId]: score,
            },
          },
        })),
      setVisitDimensions: (cityId, partial) =>
        set((s) => ({
          visitDimensions: {
            ...s.visitDimensions,
            [cityId]: {
              ...emptyDims(),
              ...s.visitDimensions[cityId],
              ...partial,
            },
          },
        })),
      setTripExperienceScore: (cityId, score, breakdown) =>
        set((s) => ({
          tripExperienceScores: {
            ...s.tripExperienceScores,
            [cityId]: score,
          },
          tripScoreBreakdowns:
            breakdown != null
              ? { ...s.tripScoreBreakdowns, [cityId]: breakdown }
              : s.tripScoreBreakdowns,
        })),
      resetProfile: () =>
        set({
          preferences: defaultPreferences,
          ratings: {},
          bookmarks: [],
          attractionRatings: {},
          visitDimensions: {},
          tripExperienceScores: {},
          tripScoreBreakdowns: {},
        }),
    }),
    {
      name: "citytaste-storage",
      partialize: (s) => ({
        preferences: s.preferences,
        ratings: s.ratings,
        bookmarks: s.bookmarks,
        attractionRatings: s.attractionRatings,
        visitDimensions: s.visitDimensions,
        tripExperienceScores: s.tripExperienceScores,
        tripScoreBreakdowns: s.tripScoreBreakdowns,
      }),
    },
  ),
);
