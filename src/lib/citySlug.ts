import type { City } from "@/lib/types/city";

export function cityId(cityName: string, country: string): string {
  return `${cityName.toLowerCase().trim()}-${country.toLowerCase().trim()}`.replace(
    /\s+/g,
    "-",
  );
}

export function citySlug(city: Pick<City, "cityName" | "country">): string {
  return cityId(city.cityName, city.country);
}
