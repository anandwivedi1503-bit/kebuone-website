"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
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
      body: JSON.stringify({ password }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      setError(data.message || "Login failed.");
      setLoading(false);
      return;
    }

    router.push("/dashboard/admin");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#070A12] px-5">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl"
      >
        <h1 className="text-3xl font-black text-[#0A1134]">
          Kebu One Admin
        </h1>

        <p className="mt-2 text-gray-500">
          Enter admin password to open dashboard.
        </p>

        <input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
          placeholder="Admin password"
          className="mt-8 h-14 w-full rounded-xl border border-gray-200 px-4 text-[#0A1134] outline-none focus:border-[#FF165E]"
        />

        {error && (
          <p className="mt-3 text-sm font-semibold text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 h-14 w-full rounded-xl bg-[#FF165E] font-bold text-white disabled:opacity-60"
        >
          {loading ? "Checking..." : "Open Dashboard"}
        </button>
      </form>
    </main>
  );
}