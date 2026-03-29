"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CityEvent } from "@/lib/types/cityEvent";
import {
  cityEventsByCityId,
  parseCityEventsCsv,
} from "@/lib/csv/parseCityEvents";

interface EventsContextValue {
  events: CityEvent[];
  byCityId: Map<string, CityEvent[]>;
  loading: boolean;
  error: string | null;
}

const EventsContext = createContext<EventsContextValue | null>(null);

export function EventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<CityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/data/events.csv")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load events");
        return res.text();
      })
      .then((text) => {
        if (cancelled) return;
        setEvents(parseCityEventsCsv(text));
        setError(null);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Unknown error");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const byCityId = useMemo(() => cityEventsByCityId(events), [events]);

  const value = useMemo(
    () => ({ events, byCityId, loading, error }),
    [events, byCityId, loading, error],
  );

  return (
    <EventsContext.Provider value={value}>{children}</EventsContext.Provider>
  );
}

export function useCityEvents(): EventsContextValue {
  const ctx = useContext(EventsContext);
  if (!ctx) {
    throw new Error("useCityEvents must be used within EventsProvider");
  }
  return ctx;
}
