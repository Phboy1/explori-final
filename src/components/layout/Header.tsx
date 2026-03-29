"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const links = [
  { href: "/", label: "Home" },
  { href: "/map", label: "Map" },
  { href: "/profile", label: "Profile" },
];

export function Header() {
  const { user, loading, signOut, supabaseReady } = useAuth();

  const display =
    (user?.user_metadata?.username as string | undefined) ||
    user?.email?.split("@")[0] ||
    null;

  return (
    <header className="border-b border-stone-200/80 bg-[#F5EBDD]/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-stone-900"
        >
          City<span className="text-[#A63D40]">Taste</span>
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-1 sm:gap-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-900/5 hover:text-stone-900"
            >
              {l.label}
            </Link>
          ))}
          {supabaseReady && !loading && user ? (
            <>
              <span className="hidden px-2 text-sm text-stone-500 sm:inline">
                {display}
              </span>
              <button
                type="button"
                onClick={() => void signOut()}
                className="rounded-lg px-3 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-900/5 hover:text-stone-900"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-sm font-medium text-[#A63D40] transition-colors hover:bg-[#A63D40]/10"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
