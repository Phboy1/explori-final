"use client";

import type { ReactNode } from "react";
import { EventsProvider } from "@/context/EventsContext";
import { AuthProvider } from "@/context/AuthContext";
import { CitiesProvider } from "@/context/CitiesContext";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CitiesProvider>
        <EventsProvider>{children}</EventsProvider>
      </CitiesProvider>
    </AuthProvider>
  );
}
