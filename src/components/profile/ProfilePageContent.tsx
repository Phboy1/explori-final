"use client";

import Link from "next/link";
import { useCities } from "@/context/CitiesContext";
import { useCityTasteStore } from "@/store/useCityTasteStore";
import { PreferenceForm } from "@/components/profile/PreferenceForm";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function ProfilePageContent() {
  const { citiesById, loading } = useCities();
  const ratings = useCityTasteStore((s) => s.ratings);
  const bookmarks = useCityTasteStore((s) => s.bookmarks);
  const resetProfile = useCityTasteStore((s) => s.resetProfile);

  const ratedEntries = Object.entries(ratings).sort(
    (a, b) => b[1].score - a[1].score,
  );

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
          Profile
        </h1>
        <p className="mt-2 text-stone-600">
          Preferences feed the engine; ratings teach it what “great” feels like
          for you.
        </p>
      </div>

      <PreferenceForm />

      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-stone-900">
            Rated cities
          </h2>
          <Button variant="secondary" onClick={resetProfile}>
            Reset all data
          </Button>
        </div>
        {loading ? (
          <p className="text-sm text-stone-600">Loading…</p>
        ) : ratedEntries.length === 0 ? (
          <p className="text-sm text-stone-600">
            No ratings yet. Open a city and score it 1–10.
          </p>
        ) : (
          <ul className="divide-y divide-stone-100">
            {ratedEntries.map(([id, r]) => {
              const c = citiesById.get(id);
              return (
                <li
                  key={id}
                  className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0"
                >
                  <div>
                    {c ? (
                      <Link
                        href={`/city/${id}`}
                        className="font-medium text-stone-900 hover:text-[#A63D40]"
                      >
                        {c.cityName}
                      </Link>
                    ) : (
                      <span className="font-medium text-stone-900">{id}</span>
                    )}
                    {c && (
                      <p className="text-sm text-stone-500">{c.country}</p>
                    )}
                    {r.notes && (
                      <p className="mt-1 text-sm text-stone-600">“{r.notes}”</p>
                    )}
                  </div>
                  <span className="rounded-full bg-[#A63D40]/10 px-3 py-1 text-sm font-medium text-[#A63D40]">
                    {r.score}/10
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Card className="space-y-3">
        <h2 className="text-lg font-semibold text-stone-900">Bookmarks</h2>
        {bookmarks.length === 0 ? (
          <p className="text-sm text-stone-600">No saved cities yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {bookmarks.map((id) => {
              const c = citiesById.get(id);
              return (
                <li key={id}>
                  {c ? (
                    <Link
                      href={`/city/${id}`}
                      className="text-[#A63D40] hover:underline"
                    >
                      {c.cityName}, {c.country}
                    </Link>
                  ) : (
                    <span className="text-stone-600">{id}</span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
