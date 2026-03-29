import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl bg-white/90 p-6 shadow-md shadow-stone-900/5 ring-1 ring-stone-900/5 ${className}`}
    >
      {children}
    </div>
  );
}
