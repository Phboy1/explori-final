import type { ScoredCity } from "@/lib/scoring/recommend";
import { CityCard } from "@/components/city/CityCard";

export function RecommendationList({ items }: { items: ScoredCity[] }) {
  if (items.length === 0) {
    return (
      <p className="rounded-2xl bg-white/60 px-6 py-8 text-center text-stone-600 shadow-sm ring-1 ring-stone-900/5">
        You’ve rated every city in our catalog, or data is still loading. Add
        more cities to the CSV or clear some ratings in your profile.
      </p>
    );
  }

  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((scored) => (
        <li key={scored.city.id}>
          <CityCard scored={scored} href={`/city/${scored.city.id}`} />
        </li>
      ))}
    </ul>
  );
}
