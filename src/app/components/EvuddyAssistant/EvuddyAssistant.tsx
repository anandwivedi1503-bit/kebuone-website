"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, Send, X } from "lucide-react";

import { ASSISTANT_STARTERS } from "@/lib/evuddyKnowledge";

type Turn = { role: "user" | "assistant"; content: string };

export default function EvuddyAssistant() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([
    {
      role: "assistant",
      content:
        "Hi, I am the EVUDDY assistant. I can explain booking, rates, KYC, wallet deposits, and Rent to Own. I cannot take payment — use Razorpay or wallet on the booking page.",
    },
  ]);

  useEffect(() => {
    if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/admin-login")) {
      setOpen(false);
    }
  }, [pathname]);

  if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/admin-login")) {
    return null;
  }

  const ask = async (text: string) => {
    const asked = text.trim();
    if (asked.length < 2 || loading) return;
    setQuestion("");
    const nextTurns = [...turns, { role: "user" as const, content: asked }];
    setTurns(nextTurns);
    setLoading(true);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: asked,
          history: nextTurns.slice(-8),
        }),
      });
      const data = await res.json();
      setTurns([
        ...nextTurns,
        {
          role: "assistant",
          content:
            data.answer ||
            data.message ||
            "Please use Book a bike or info@kebuone.in — I could not answer just then.",
        },
      ]);
    } catch {
      setTurns([
        ...nextTurns,
        {
          role: "assistant",
          content: "Network issue. Book at /book-bike or email info@kebuone.in.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pointer-events-none fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-[80] flex flex-col items-end gap-3 sm:right-6">
      {open ? (
        <div className="pointer-events-auto flex h-[min(32rem,70vh)] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,.22)]">
          <div className="flex items-center justify-between bg-[#0F172A] px-4 py-3 text-white">
            <div>
              <p className="text-sm font-black">EVUDDY assistant</p>
              <p className="text-[11px] text-slate-300">Bookings, rates, KYC — not payments</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close assistant">
              <X size={18} />
            </button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3 text-sm">
            {turns.map((turn, index) => (
              <div
                key={`${turn.role}-${index}`}
                className={
                  turn.role === "user"
                    ? "ml-8 rounded-2xl bg-[#18B368] px-3 py-2 text-white"
                    : "mr-6 rounded-2xl bg-slate-100 px-3 py-2 text-slate-700"
                }
              >
                {turn.content}
              </div>
            ))}
            {loading ? <p className="text-xs text-slate-400">Thinking…</p> : null}
          </div>
          <div className="flex flex-wrap gap-1 border-t border-slate-100 px-3 py-2">
            {ASSISTANT_STARTERS.map((starter) => (
              <button
                key={starter}
                type="button"
                onClick={() => void ask(starter)}
                className="rounded-full bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-600"
              >
                {starter}
              </button>
            ))}
          </div>
          <form
            className="flex gap-2 border-t border-slate-100 p-3"
            onSubmit={(event) => {
              event.preventDefault();
              void ask(question);
            }}
          >
            <input
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              className="h-11 flex-1 rounded-full border border-slate-200 px-4 text-sm outline-none focus:border-[#18B368]"
              placeholder="Ask about EVUDDY…"
              maxLength={500}
            />
            <button
              type="submit"
              disabled={loading}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[#18B368] text-white disabled:opacity-50"
              aria-label="Send"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="pointer-events-auto flex h-14 items-center gap-2 rounded-full bg-[#18B368] px-4 font-bold text-white shadow-[0_16px_40px_rgba(24,179,104,.45)]"
        aria-label="Open EVUDDY assistant"
      >
        <MessageCircle size={20} />
        <span className="hidden sm:inline">Ask EVUDDY</span>
      </button>
    </div>
  );
}
