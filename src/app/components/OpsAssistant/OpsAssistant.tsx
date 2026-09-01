"use client";

import { useState } from "react";
import { Mic, MicOff, Search, Send, X } from "lucide-react";

import { ASSISTANT_LANGUAGES } from "@/lib/assistantLanguages";
import { useVoiceAssistant } from "@/app/components/Assistant/useVoiceAssistant";

type Hit = {
  kind: string;
  id: string;
  title: string;
  detail: string;
  dashboard: string;
};

type Turn = { role: "user" | "assistant"; content: string; hits?: Hit[] };

export default function OpsAssistant({
  onOpenDashboard,
}: {
  onOpenDashboard: (id: string) => void;
}) {
  const voice = useVoiceAssistant();
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("auto");
  const [turns, setTurns] = useState<Turn[]>([
    {
      role: "assistant",
      content:
        "Ops search assistant. Ask for unpaid bookings, a rider phone, BK- IDs, available scooters, or open tickets. I only show what this login can see. I cannot pay, refund, or enter OTP.",
    },
  ]);

  const ask = async (text: string) => {
    const asked = text.trim();
    if (asked.length < 2 || loading) return;
    setQuestion("");
    const nextTurns = [...turns, { role: "user" as const, content: asked }];
    setTurns(nextTurns);
    setLoading(true);
    try {
      const res = await fetch("/api/ops-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: asked, language }),
      });
      const data = await res.json();
      setTurns([
        ...nextTurns,
        {
          role: "assistant",
          content: data.answer || data.message || "No answer just then.",
          hits: Array.isArray(data.hits) ? data.hits : [],
        },
      ]);
    } catch {
      setTurns([
        ...nextTurns,
        { role: "assistant", content: "Network issue. Use the dashboard filters instead." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pointer-events-none fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-[80] flex flex-col items-end gap-3 print:hidden">
      {open ? (
        <div className="pointer-events-auto flex h-[min(34rem,72vh)] w-[min(26rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,.22)]">
          <div className="flex items-center justify-between bg-[#0B1B16] px-4 py-3 text-white">
            <div>
              <p className="text-sm font-black">Ops assistant</p>
              <p className="text-[11px] text-white/70">Search · coordinate · no payments</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                className="max-w-[108px] rounded-full bg-white/10 px-2 py-1 text-[11px] font-bold text-white outline-none"
                aria-label="Ops assistant language"
              >
                {ASSISTANT_LANGUAGES.map((item) => (
                  <option key={item.id} value={item.id} className="text-[#0F172A]">
                    {item.label}
                  </option>
                ))}
              </select>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close ops assistant">
                <X size={18} />
              </button>
            </div>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3 text-sm">
            {turns.map((turn, index) => (
              <div key={`${turn.role}-${index}`}>
                <div
                  className={
                    turn.role === "user"
                      ? "ml-8 rounded-2xl bg-[#18B368] px-3 py-2 text-white"
                      : "mr-4 rounded-2xl bg-slate-100 px-3 py-2 text-slate-700 whitespace-pre-wrap"
                  }
                >
                  {turn.content}
                </div>
                {turn.hits?.length ? (
                  <div className="mt-2 space-y-1">
                    {turn.hits.map((hit) => (
                      <button
                        key={`${hit.kind}-${hit.id}-${hit.title}`}
                        type="button"
                        onClick={() => onOpenDashboard(hit.dashboard)}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-left hover:border-[#18B368]"
                      >
                        <p className="text-xs font-bold uppercase tracking-wide text-[#18B368]">
                          {hit.kind}
                        </p>
                        <p className="font-black text-[#0F172A]">{hit.title}</p>
                        <p className="text-xs text-slate-500">{hit.detail}</p>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
            {loading || voice.status ? (
              <p className="text-xs text-slate-400">{voice.status || "Searching live data…"}</p>
            ) : null}
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
              placeholder={voice.listening ? "Listening… tap mic to stop" : "Search bookings, riders, fleet…"}
              maxLength={200}
            />
            <button
              type="button"
              onClick={() => {
                void voice.listen(
                  (text) => void ask(text),
                  language,
                  (message) =>
                    setTurns((old) => [...old, { role: "assistant", content: message }])
                );
              }}
              className={`flex h-11 w-11 items-center justify-center rounded-full text-white ${
                voice.listening ? "bg-[#EC2A8C]" : "bg-[#0B1B16]"
              }`}
              aria-label={voice.listening ? "Stop listening" : "Speak"}
            >
              {voice.listening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[#18B368] text-white disabled:opacity-50"
              aria-label="Search"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="pointer-events-auto flex h-14 items-center gap-2 rounded-full bg-[#0B1B16] px-4 font-bold text-white shadow-[0_16px_40px_rgba(15,23,42,.35)]"
        aria-label="Open ops assistant"
      >
        <Search size={18} />
        <span className="hidden sm:inline">Ops AI</span>
      </button>
    </div>
  );
}
