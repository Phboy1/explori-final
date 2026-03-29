"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { City } from "@/lib/types/city";
import { cityFromDbRow } from "@/lib/cities/mapDbRow";
import { parseCitiesCsv } from "@/lib/csv/parseCities";
import { createClient } from "@/lib/supabase/client";

interface CitiesContextValue {
  cities: City[];
  citiesById: Map<string, City>;
  loading: boolean;
  error: string | null;
}

const CitiesContext = createContext<CitiesContextValue | null>(null);

export function CitiesProvider({ children }: { children: ReactNode }) {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    async function loadCsvFallback(): Promise<boolean> {
      try {
        const res = await fetch("/data/cities.csv");
        if (!res.ok) throw new Error("Failed to load cities");
        const text = await res.text();
        if (cancelled) return false;
        setCities(parseCitiesCsv(text));
        setError(null);
        return true;
      } catch (e: unknown) {
        if (cancelled) return false;
        setError(e instanceof Error ? e.message : "Unknown error");
        return false;
      }
    }

    async function load() {
      if (supabase) {
        const { data, error: qErr } = await supabase
          .from("cities")
          .select("*")
          .order("city_name");
        if (cancelled) return;
        if (!qErr && data?.length) {
          setCities(data.map((row) => cityFromDbRow(row)));
          setError(null);
          setLoading(false);
          return;
        }
        const csvOk = await loadCsvFallback();
        if (!cancelled && qErr && csvOk) {
          setError(`Supabase: ${qErr.message} — showing offline cities.`);
        }
        setLoading(false);
        return;
      }

      await loadCsvFallback();
      if (!cancelled) setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const citiesById = useMemo(
    () => new Map(cities.map((c) => [c.id, c])),
    [cities],
  );

  const value = useMemo(
    () => ({ cities, citiesById, loading, error }),
    [cities, citiesById, loading, error],
  );

  return (
    <CitiesContext.Provider value={value}>{children}</CitiesContext.Provider>
  );
}

export function useCities(): CitiesContextValue {
  const ctx = useContext(CitiesContext);
  if (!ctx) {
    throw new Error("useCities must be used within CitiesProvider");
  }
  return ctx;
}
