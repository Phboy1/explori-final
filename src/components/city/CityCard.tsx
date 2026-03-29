import Link from "next/link";
import type { ScoredCity } from "@/lib/scoring/recommend";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useCityTasteStore } from "@/store/useCityTasteStore";

interface CityCardProps {
  scored: ScoredCity;
  href: string;
}

export function CityCard({ scored, href }: CityCardProps) {
  const { city, breakdown, explanation } = scored;
  const toggleBookmark = useCityTasteStore((s) => s.toggleBookmark);
  const bookmarks = useCityTasteStore((s) => s.bookmarks);
  const bookmarked = bookmarks.includes(city.id);

  return (
    <Card className="flex h-full flex-col gap-3 p-5 transition-shadow hover:shadow-lg">
      <div className="flex items-start justify-between gap-2">
        <div>
          <Link
            href={href}
            className="text-lg font-semibold text-stone-900 hover:text-[#A63D40]"
          >
            {city.cityName}
          </Link>
          <p className="text-sm text-stone-600">{city.country}</p>
        </div>
        <Button
          variant="ghost"
          className="shrink-0 px-2 py-1 text-lg leading-none"
          onClick={() => toggleBookmark(city.id)}
          aria-label={bookmarked ? "Remove bookmark" : "Bookmark"}
        >
          {bookmarked ? "★" : "☆"}
        </Button>
      </div>
      <p className="text-sm leading-relaxed text-stone-600">{explanation}</p>
      <div className="mt-auto flex flex-wrap gap-2 text-xs text-stone-500">
        <span className="rounded-full bg-stone-100 px-2 py-0.5">
          Match {(breakdown.finalScore * 100).toFixed(0)}%
        </span>
        {city.vibeTags.slice(0, 4).map((t) => (
          <span
            key={t}
            className="rounded-full bg-[#A63D40]/10 px-2 py-0.5 text-[#A63D40]"
          >
            {t}
          </span>
        ))}
      </div>
      <Link
        href={href}
        className="text-sm font-medium text-[#A63D40] hover:underline"
      >
        View details →
      </Link>
    </Card>
  );
}
