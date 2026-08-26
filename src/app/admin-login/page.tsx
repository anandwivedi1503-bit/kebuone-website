"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin-login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password, username }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      setError(data.message || "Login failed.");
      setLoading(false);
      return;
    }

    router.replace("/dashboard/admin");
    router.refresh();
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0A1134] px-5 py-10">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md overflow-hidden rounded-3xl border border-[#18B368]/25 bg-white shadow-[0_24px_60px_rgba(10,17,52,0.35)]"
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-[#18B368] via-[#2dd4a0] to-[#0A1134]" />
        <div className="px-8 pb-8 pt-7">
          <div className="flex items-center gap-3">
            <Image
              src="/evuddy.jpeg"
              alt="EVUDDY"
              width={48}
              height={48}
              className="rounded-xl ring-2 ring-[#18B368]/40"
              priority
            />
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#18B368]">
                Operations Center
              </p>
              <h1 className="text-2xl font-medium tracking-[-0.03em] text-[#0A1134]">
                EVUDDY Admin
              </h1>
            </div>
          </div>

          <p className="mt-4 text-sm leading-6 text-slate-500">
            Super admin: password only. Staff: username + password.
          </p>

          <label className="mt-7 block text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
            Username
          </label>
          <input
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError("");
            }}
            placeholder="Staff only"
            className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 text-[#0A1134] outline-none transition focus:border-[#18B368] focus:shadow-[0_0_0_3px_rgba(24,179,104,0.18)]"
          />

          <label className="mt-5 block text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
            Password
          </label>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            placeholder="Admin password"
            className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 text-[#0A1134] outline-none transition focus:border-[#18B368] focus:shadow-[0_0_0_3px_rgba(24,179,104,0.18)]"
          />

          {error ? (
            <p className="mt-3 text-sm font-medium text-rose-600">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 h-12 w-full rounded-xl bg-[#18B368] text-sm font-medium tracking-tight text-white shadow-[0_10px_24px_rgba(24,179,104,0.35)] transition hover:bg-[#14a05c] disabled:opacity-60"
          >
            {loading ? "Checking..." : "Open Dashboard"}
          </button>
        </div>
      </form>
    </main>
  );
}
