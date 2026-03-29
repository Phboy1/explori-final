"use client";

import type { Budget, FoodPreference, SafetyImportance, TravelStyle, Vibe } from "@/lib/types/user";
import { useCityTasteStore } from "@/store/useCityTasteStore";
import { Card } from "@/components/ui/Card";

const BUDGETS: Budget[] = ["low", "medium", "high"];
const VIBES: Vibe[] = ["party", "chill", "nature", "culture", "luxury"];
const STYLES: TravelStyle[] = ["solo", "couple", "group"];
const FOODS: FoodPreference[] = ["street food", "fine dining", "mixed"];
const SAFETY: SafetyImportance[] = ["low", "medium", "high"];

function ChipGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  multiple,
}: {
  label: string;
  options: readonly T[];
  value: T | T[];
  onChange: (next: T | T[]) => void;
  multiple?: boolean;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-stone-800">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const selected = multiple
            ? (value as T[]).includes(opt)
            : value === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => {
                if (multiple) {
                  const cur = value as T[];
                  const next = cur.includes(opt)
                    ? cur.filter((x) => x !== opt)
                    : [...cur, opt];
                  onChange(next);
                } else {
                  onChange(opt);
                }
              }}
              className={`rounded-full px-3 py-1.5 text-sm capitalize transition-colors ${
                selected
                  ? "bg-[#A63D40] text-white"
                  : "bg-stone-100 text-stone-700 hover:bg-stone-200"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function PreferenceForm() {
  const preferences = useCityTasteStore((s) => s.preferences);
  const setPreferences = useCityTasteStore((s) => s.setPreferences);
  const setVibes = useCityTasteStore((s) => s.setVibes);

  return (
    <Card className="space-y-8">
      <h2 className="text-lg font-semibold text-stone-900">Trip preferences</h2>
      <ChipGroup
        label="Budget"
        options={BUDGETS}
        value={preferences.budget}
        onChange={(b) => setPreferences({ budget: b as Budget })}
      />
      <ChipGroup
        label="Vibe (select any)"
        options={VIBES}
        value={preferences.vibes}
        onChange={(v) => setVibes(v as Vibe[])}
        multiple
      />
      <ChipGroup
        label="Travel style"
        options={STYLES}
        value={preferences.travelStyle}
        onChange={(t) => setPreferences({ travelStyle: t as TravelStyle })}
      />
      <ChipGroup
        label="Food"
        options={FOODS}
        value={preferences.food}
        onChange={(f) => setPreferences({ food: f as FoodPreference })}
      />
      <ChipGroup
        label="Safety importance"
        options={SAFETY}
        value={preferences.safetyImportance}
        onChange={(s) =>
          setPreferences({ safetyImportance: s as SafetyImportance })
        }
      />
    </Card>
  );
}
