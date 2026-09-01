"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Bike,
  CreditCard,
  Mic,
  MicOff,
  Radio,
  Send,
  Ticket,
} from "lucide-react";

import AssistantFab from "@/app/components/Assistant/AssistantFab";
import AssistantLogo from "@/app/components/Assistant/AssistantLogo";
import AssistantShell, { TypingDots } from "@/app/components/Assistant/AssistantShell";
import { useVoiceAssistant } from "@/app/components/Assistant/useVoiceAssistant";

type Hit = {
  kind: string;
  id: string;
  title: string;
  detail: string;
  dashboard: string;
};

type Turn = { role: "user" | "assistant"; content: string; hits?: Hit[] };

const OPS_CHIPS = [
  { label: "Unpaid", ask: "unpaid bookings", icon: CreditCard },
  { label: "In ride", ask: "in ride scooters", icon: Radio },
  { label: "Open tickets", ask: "open tickets", icon: Ticket },
  { label: "Available", ask: "available scooters", icon: Bike },
  { label: "Rent to Own", ask: "rent to own unpaid", icon: AlertTriangle },
] as const;

const KIND_STYLE: Record<string, string> = {
  booking: "border-l-[#18B368] text-[#0F7A45]",
  rider: "border-l-[#3B82F6] text-[#1D4ED8]",
  vehicle: "border-l-[#F59E0B] text-[#B45309]",
  ticket: "border-l-[#EC2A8C] text-[#BE185D]",
  hub: "border-l-[#0B1B16] text-[#0B1B16]",
};

export default function OpsAssistant({
  onOpenDashboard,
}: {
  onOpenDashboard: (id: string) => void;
}) {
  const voice = useVoiceAssistant();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("auto");
  const [turns, setTurns] = useState<Turn[]>([
    {
      role: "assistant",
      content:
        "Ops Eva here. Search live bookings, riders, fleet, hubs, and tickets for this login — like a yard command desk. Tap a chip or ask for a BK- ID / phone. I cannot pay, refund, or enter OTP.",
    },
  ]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [turns, loading, voice.status, open]);

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
    <div className="pointer-events-none fixed right-3 bottom-[max(1rem,env(safe-area-inset-bottom))] z-[90] flex max-h-[calc(100dvh-1rem)] flex-col items-end gap-3 print:hidden sm:right-6">
      {open ? (
        <AssistantShell
          title="Ops Eva"
          subtitle="Live search · no payments"
          liveLabel="Live"
          language={language}
          onLanguage={setLanguage}
          onClose={() => setOpen(false)}
          chips={
            <div className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {OPS_CHIPS.map((chip) => {
                const Icon = chip.icon;
                return (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => void ask(chip.ask)}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-700 shadow-sm hover:border-[#18B368]"
                  >
                    <Icon size={13} className="text-[#18B368]" />
                    {chip.label}
                  </button>
                );
              })}
            </div>
          }
          footer={
            <form
              className="flex items-center gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                void ask(question);
              }}
            >
              <input
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                className="h-12 flex-1 rounded-full border border-slate-200 bg-[#F8FAF9] px-4 text-sm outline-none focus:border-[#18B368]"
                placeholder={
                  voice.listening ? "Listening… tap mic to stop" : "BK-000001, phone, unpaid…"
                }
                maxLength={200}
              />
              <button
                type="button"
                disabled={!voice.supported}
                title={voice.supported ? undefined : "Microphone is not available in this browser"}
                onClick={() => {
                  void voice.listen(
                    (text) => void ask(text),
                    language,
                    (message) =>
                      setTurns((old) => [...old, { role: "assistant", content: message }])
                  );
                }}
                className={`relative flex h-12 w-12 items-center justify-center rounded-full text-white disabled:opacity-40 ${
                  voice.listening ? "bg-[#EC2A8C]" : "bg-[#0B1B16]"
                }`}
                aria-label={voice.listening ? "Stop listening" : "Speak"}
              >
                {voice.listening ? (
                  <span className="absolute inset-0 animate-ping rounded-full bg-[#EC2A8C]/40" />
                ) : null}
                {voice.listening ? <MicOff size={17} /> : <Mic size={17} />}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-[#18B368] text-white disabled:opacity-50"
                aria-label="Search"
              >
                <Send size={17} />
              </button>
            </form>
          }
        >
          {turns.map((turn, index) => (
            <div key={`${turn.role}-${index}`} className="space-y-2">
              {turn.role === "user" ? (
                <div className="ml-10 flex justify-end">
                  <div className="rounded-2xl rounded-tr-md bg-gradient-to-br from-[#18B368] to-[#12995A] px-3.5 py-2.5 text-sm font-medium text-white shadow-sm">
                    {turn.content}
                  </div>
                </div>
              ) : (
                <div className="mr-4 flex items-end gap-2">
                  <span className="mb-0.5 flex h-7 w-7 shrink-0 overflow-hidden rounded-full bg-white p-0.5 ring-1 ring-slate-200">
                    <AssistantLogo size={28} />
                  </span>
                  <div className="rounded-2xl rounded-tl-md border border-slate-100 bg-white px-3.5 py-2.5 text-sm whitespace-pre-wrap text-slate-700 shadow-sm">
                    {turn.content}
                  </div>
                </div>
              )}
              {turn.hits?.length ? (
                <div className="ml-9 space-y-1.5">
                  {turn.hits.map((hit) => (
                    <button
                      key={`${hit.kind}-${hit.id}-${hit.title}`}
                      type="button"
                      onClick={() => onOpenDashboard(hit.dashboard)}
                      className={`w-full rounded-2xl border border-slate-200 border-l-4 bg-white px-3 py-2.5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                        KIND_STYLE[hit.kind] || "border-l-[#18B368]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.16em]">
                          {hit.kind}
                        </p>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                          Open →
                        </span>
                      </div>
                      <p className="mt-0.5 font-black text-[#0F172A]">{hit.title}</p>
                      <p className="text-xs text-slate-500">{hit.detail}</p>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
          {loading || voice.status ? (
            <div className="space-y-1">
              {loading ? <TypingDots /> : null}
              {voice.status ? (
                <p className="pl-9 text-xs font-semibold text-slate-400">{voice.status}</p>
              ) : null}
            </div>
          ) : null}
          <div ref={bottomRef} />
        </AssistantShell>
      ) : null}

      <AssistantFab
        open={open}
        onClick={() => setOpen((value) => !value)}
        label="Ops Eva"
        ariaLabel={open ? "Close ops assistant" : "Open ops assistant"}
        tone="ops"
      />
    </div>
  );
}
