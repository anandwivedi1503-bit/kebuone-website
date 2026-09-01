"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MessageCircle, Mic, MicOff, Send, Volume2, X } from "lucide-react";

import { ASSISTANT_STARTERS } from "@/lib/evuddyKnowledge";
import { useVoiceAssistant } from "@/app/components/Assistant/useVoiceAssistant";

type Turn = { role: "user" | "assistant"; content: string; href?: string };

const SAFE_HREF = /^\/(ride-options|book-bike|rent-to-own|register|contact|partners|about|vision|Leadership|careers)(\?[\w=&%-]*)?$/;

export default function EvuddyAssistant() {
  const pathname = usePathname();
  const router = useRouter();
  const voice = useVoiceAssistant();
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [speakBack, setSpeakBack] = useState(true);
  const [turns, setTurns] = useState<Turn[]>([
    {
      role: "assistant",
      content:
        "Hi, I am your EVUDDY assistant. Speak or type. I can open booking, Rent to Own, or contact. I cannot take payment, enter OTP, or unlock a scooter.",
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

  const go = (href?: string) => {
    if (!href || !SAFE_HREF.test(href)) return;
    router.push(href);
  };

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
      const answer =
        data.answer ||
        data.message ||
        "Please use Book EV or info@kebuone.in — I could not answer just then.";
      const href = SAFE_HREF.test(String(data.href || "")) ? String(data.href) : "";
      setTurns([...nextTurns, { role: "assistant", content: answer, href }]);
      if (speakBack) voice.speak(answer);
      if (href && data.navigate) go(href);
    } catch {
      setTurns([
        ...nextTurns,
        {
          role: "assistant",
          content: "Network issue. Book at /ride-options or email info@kebuone.in.",
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
              <p className="text-[11px] text-slate-300">Voice guide · not payments or OTP</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSpeakBack((value) => !value)}
                className={`rounded-full p-1.5 ${speakBack ? "bg-[#18B368]" : "bg-white/10"}`}
                aria-label="Toggle speak back"
              >
                <Volume2 size={16} />
              </button>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close assistant">
                <X size={18} />
              </button>
            </div>
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
                {turn.href ? (
                  <button
                    type="button"
                    onClick={() => go(turn.href)}
                    className="mt-2 block text-xs font-bold text-[#18B368]"
                  >
                    Open page →
                  </button>
                ) : null}
              </div>
            ))}
            {loading ? <p className="text-xs text-slate-400">Working…</p> : null}
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
              placeholder={voice.listening ? "Listening…" : "Ask or tap the mic…"}
              maxLength={500}
            />
            {voice.supported ? (
              <button
                type="button"
                onClick={() => {
                  if (voice.listening) {
                    voice.stop();
                    return;
                  }
                  voice.listen((text) => void ask(text));
                }}
                className={`flex h-11 w-11 items-center justify-center rounded-full text-white ${
                  voice.listening ? "bg-[#EC2A8C]" : "bg-[#0B1B16]"
                }`}
                aria-label={voice.listening ? "Stop listening" : "Speak"}
              >
                {voice.listening ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
            ) : null}
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
