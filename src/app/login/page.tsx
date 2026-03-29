"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Role = "patient" | "staff";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-dark";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("patient");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (!supabase) {
      setMessage(
        "Add NEXT_PUBLIC_SUPABASE_URL and a public key (NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY) to .env.local",
      );
      return;
    }

    const em = email.trim();
    const pw = password;
    if (!em || !pw) {
      setMessage("Email and password are required.");
      return;
    }
    if (pw.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    if (mode === "signup") {
      const un = username.trim();
      if (!un) {
        setMessage("Choose a username.");
        return;
      }
      setBusy(true);
      const { data, error } = await supabase.auth.signUp({
        email: em,
        password: pw,
        options: {
          data: { username: un, role },
        },
      });
      if (error) {
        setMessage(error.message);
        setBusy(false);
        return;
      }
      setBusy(false);
      if (data.session) {
        router.push("/");
        router.refresh();
      } else {
        setMessage(
          "Check your email to confirm your account, then sign in.",
        );
      }
      return;
    }

    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: em,
      password: pw,
    });
    setBusy(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-14 sm:py-20">
      <div className="w-full max-w-[400px]">
        <div className="rounded-2xl border border-stone-300/50 bg-cream-dark p-8 shadow-card sm:p-10">
          <div className="mb-6 text-left">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
              Account
            </p>
            <h1 className="text-balance text-[1.625rem] font-semibold leading-[1.15] tracking-tight text-foreground sm:text-[1.75rem]">
              {mode === "signin" ? "Sign in to CityTaste" : "Create an account"}
            </h1>
            <p className="mt-2 max-w-[32ch] text-pretty text-[0.9375rem] leading-relaxed text-muted">
              {mode === "signin"
                ? "Use the email and password you registered with."
                : "Username is stored in your profile; sign-in uses email."}
            </p>
          </div>

          <div className="mb-6 flex gap-1 rounded-xl bg-stone-900/[0.06] p-1 ring-1 ring-inset ring-stone-900/[0.04]">
            {(
              [
                ["signin", "Sign in"],
                ["signup", "Sign up"],
              ] as const
            ).map(([id, label]) => {
              const selected = mode === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setMode(id);
                    setMessage(null);
                  }}
                  className={`min-h-10 flex-1 rounded-lg text-sm font-medium transition-colors ${focusRing} ${
                    selected
                      ? "bg-brand text-white shadow-sm"
                      : "text-muted hover:text-stone-800"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <form onSubmit={onSubmit} className="space-y-4 text-left">
            {mode === "signup" && (
              <>
                <div>
                  <label
                    htmlFor="username"
                    className="mb-1.5 block text-[13px] font-medium text-stone-700"
                  >
                    Username
                  </label>
                  <input
                    id="username"
                    name="username"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`min-h-11 w-full rounded-xl border border-stone-300/80 bg-white px-3.5 text-sm text-stone-900 placeholder:text-stone-400 ${focusRing}`}
                    placeholder="jordan"
                  />
                </div>
                <div>
                  <span
                    id="role-label"
                    className="mb-2 block text-[13px] font-medium text-stone-700"
                  >
                    You are
                  </span>
                  <div
                    className="flex gap-1 rounded-xl bg-stone-900/[0.06] p-1 ring-1 ring-inset ring-stone-900/[0.04]"
                    role="group"
                    aria-labelledby="role-label"
                  >
                    {(
                      [
                        ["patient", "Personal"],
                        ["staff", "Team"],
                      ] as const
                    ).map(([id, label]) => {
                      const selected = role === id;
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setRole(id)}
                          className={`min-h-10 flex-1 rounded-lg text-sm font-medium transition-colors ${focusRing} ${
                            selected
                              ? "bg-brand text-white shadow-sm"
                              : "text-muted hover:text-stone-800"
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-[13px] font-medium text-stone-700"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`min-h-11 w-full rounded-xl border border-stone-300/80 bg-white px-3.5 text-sm text-stone-900 placeholder:text-stone-400 ${focusRing}`}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-[13px] font-medium text-stone-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={
                  mode === "signup" ? "new-password" : "current-password"
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`min-h-11 w-full rounded-xl border border-stone-300/80 bg-white px-3.5 text-sm text-stone-900 placeholder:text-stone-400 ${focusRing}`}
                placeholder="••••••••"
              />
            </div>

            {message && (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-950 ring-1 ring-amber-200/80">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className={`flex min-h-12 w-full items-center justify-center rounded-xl bg-brand text-[15px] font-medium text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.12)] transition-colors hover:bg-brand-hover active:bg-[#8f1818] disabled:opacity-60 ${focusRing}`}
            >
              {busy ? "Please wait…" : mode === "signin" ? "Continue" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-[12px] leading-relaxed text-muted">
            By continuing you agree to our terms and privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
}
