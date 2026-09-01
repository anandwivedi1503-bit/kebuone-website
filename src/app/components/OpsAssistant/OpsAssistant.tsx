"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Bike,
  Command,
  CreditCard,
  LayoutDashboard,
  Mic,
  MicOff,
  Radio,
  Search,
  Send,
  ShieldCheck,
  Ticket,
  Wallet,
  X,
} from "lucide-react";

import AssistantFab from "@/app/components/Assistant/AssistantFab";
import AssistantLogo from "@/app/components/Assistant/AssistantLogo";
import { TypingDots } from "@/app/components/Assistant/AssistantShell";
import { useVoiceAssistant } from "@/app/components/Assistant/useVoiceAssistant";
import { ASSISTANT_LANGUAGES } from "@/lib/assistantLanguages";
import { writeOpsFocus } from "@/lib/opsFocus";

type Hit = {
  kind: string;
  id: string;
  title: string;
  detail: string;
  dashboard: string;
  badge?: string;
};

type Stat = { label: string; value: string; dashboard?: string };

type Action = {
  type: "open_dashboard";
  dashboard: string;
  label: string;
  autoNavigate?: boolean;
  focusQuery?: string;
};

type Turn = {
  role: "user" | "assistant";
  content: string;
  hits?: Hit[];
  stats?: Stat[];
  action?: Action | null;
};

const COMMANDS = [
  { label: "Unpaid", ask: "unpaid bookings", icon: CreditCard },
  { label: "In ride", ask: "in ride scooters", icon: Radio },
  { label: "KYC", ask: "pending kyc", icon: ShieldCheck },
  { label: "Tickets", ask: "open tickets", icon: Ticket },
  { label: "Available", ask: "available scooters", icon: Bike },
  { label: "Refunds", ask: "pending refunds", icon: Wallet },
  { label: "Bookings", ask: "open bookings dashboard", icon: LayoutDashboard },
  { label: "RTO due", ask: "rent to own unpaid", icon: AlertTriangle },
  { label: "Pickup ready", ask: "ready for pickup", icon: Bike },
] as const;

const KIND_STYLE: Record<string, string> = {
  booking: "border-l-[#18B368]",
  rider: "border-l-[#3B82F6]",
  vehicle: "border-l-[#F59E0B]",
  ticket: "border-l-[#EC2A8C]",
  hub: "border-l-[#0B1B16]",
  refund: "border-l-[#7C3AED]",
  wallet: "border-l-[#0891B2]",
  transaction: "border-l-[#059669]",
  partner: "border-l-[#DB2777]",
  battery: "border-l-[#CA8A04]",
};

const RECENT_KEY = "evuddy_ops_eva_recent";

function loadRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(String).slice(0, 8) : [];
  } catch {
    return [];
  }
}

function saveRecent(query: string) {
  const next = [query, ...loadRecent().filter((item) => item !== query)].slice(0, 8);
  localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  return next;
}

export default function OpsAssistant({
  onOpenDashboard,
}: {
  onOpenDashboard: (id: string) => void;
}) {
  const voice = useVoiceAssistant();
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const searchGen = useRef(0);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"command" | "ask">("command");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("auto");
  const [pulse, setPulse] = useState<Stat[]>([]);
  const [hits, setHits] = useState<Hit[]>([]);
  const [answer, setAnswer] = useState("");
  const [action, setAction] = useState<Action | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [modeTag, setModeTag] = useState<"ai" | "search">("search");
  const [recent, setRecent] = useState<string[]>(() =>
    typeof window === "undefined" ? [] : loadRecent()
  );
  const [turns, setTurns] = useState<Turn[]>([
    {
      role: "assistant",
      content:
        "Ops Eva — ChatGPT-style ops command center. Type any name, phone, BK- ID, unpaid, KYC, tickets… I search the live DB in milliseconds and open the right dashboard with the record ready. Say “approve this rider” and I jump you there — you finish on the staff Approve button (audit-safe). Ctrl/⌘ K.",
    },
  ]);

  const queryReady = question.trim().length >= 2;
  const groupedHits = useMemo(() => {
    if (question.trim().length < 2) return [] as [string, Hit[]][];
    const map = new Map<string, Hit[]>();
    for (const hit of hits) {
      const list = map.get(hit.kind) || [];
      list.push(hit);
      map.set(hit.kind, list);
    }
    return [...map.entries()];
  }, [hits, question]);

  const loadPulse = useCallback(async () => {
    try {
      const res = await fetch("/api/ops-assistant/pulse", { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.stats)) setPulse(data.stats);
    } catch {
      // keep last pulse
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const start = window.setTimeout(() => {
      void loadPulse();
      inputRef.current?.focus();
    }, 0);
    const timer = window.setInterval(() => void loadPulse(), 20000);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(timer);
    };
  }, [open, loadPulse]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
        setMode("command");
      }
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [turns, loading, mode]);

  const runSearch = useCallback(
    async (text: string, opts?: { askMode?: boolean; navigate?: boolean }) => {
      const asked = text.trim();
      if (asked.length < 2) return;
      const gen = ++searchGen.current;
      setLoading(true);
      setRecent(saveRecent(asked));
      if (opts?.askMode) {
        setTurns((old) => [...old, { role: "user", content: asked }]);
      }
      try {
        const res = await fetch("/api/ops-assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: asked, language }),
        });
        const data = await res.json();
        if (gen !== searchGen.current) return;
        const nextHits = Array.isArray(data.hits) ? data.hits : [];
        const nextStats = Array.isArray(data.stats) ? data.stats : [];
        const nextAction = (data.action as Action | null) || null;
        setHits(nextHits);
        setAnswer(data.answer || data.message || "");
        setAction(nextAction);
        setElapsedMs(Number(data.elapsedMs || 0));
        setModeTag(data.mode === "ai" ? "ai" : "search");
        if (nextStats.length) setPulse(nextStats);
        if (opts?.askMode) {
          setTurns((old) => [
            ...old,
            {
              role: "assistant",
              content: data.answer || data.message || "No answer.",
              hits: nextHits,
              stats: nextStats,
              action: nextAction,
            },
          ]);
        }
        if (
          nextAction?.type === "open_dashboard" &&
          nextAction.dashboard &&
          (nextAction.autoNavigate || opts?.navigate)
        ) {
          if (nextAction.focusQuery) writeOpsFocus(nextAction.focusQuery);
          else if (nextHits[0]?.id) writeOpsFocus(nextHits[0].id);
          onOpenDashboard(nextAction.dashboard);
        }
      } catch {
        if (gen !== searchGen.current) return;
        setAnswer("Network issue. Use sidebar filters.");
        if (opts?.askMode) {
          setTurns((old) => [
            ...old,
            { role: "assistant", content: "Network issue. Use sidebar filters." },
          ]);
        }
      } finally {
        if (gen === searchGen.current) setLoading(false);
      }
    },
    [language, onOpenDashboard]
  );

  useEffect(() => {
    if (!open || mode !== "command") return;
    const q = question.trim();
    if (q.length < 2) return;
    const id = window.setTimeout(() => {
      void runSearch(q);
    }, 160);
    return () => window.clearTimeout(id);
  }, [question, open, mode, runSearch]);

  return (
    <>
      <div className="pointer-events-none fixed right-3 bottom-[max(1rem,env(safe-area-inset-bottom))] z-[96] print:hidden sm:right-6">
        <AssistantFab
          open={open}
          onClick={() => {
            setOpen((value) => !value);
            setMode("command");
          }}
          label="Ops Eva"
          ariaLabel={open ? "Close ops command center" : "Open ops command center"}
          tone="ops"
        />
      </div>

      {open ? (
        <div className="fixed inset-0 z-[95] flex items-end justify-center bg-[#0B1B16]/55 px-3 py-4 backdrop-blur-[3px] print:hidden sm:items-start sm:py-10">
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label="Close ops command center backdrop"
            onClick={() => setOpen(false)}
          />
          <div className="relative mb-[max(4.5rem,env(safe-area-inset-bottom))] flex max-h-[min(44rem,calc(100dvh-7.5rem))] w-full max-w-3xl flex-col overflow-hidden rounded-[28px] border border-white/20 bg-[#F4F7F5] shadow-[0_40px_120px_rgba(0,0,0,.45)] animate-[assistantPanelIn_.22s_ease] [font-family:var(--font-noto-deva),var(--font-geist-sans),sans-serif] sm:mb-0 sm:max-h-[min(44rem,calc(100dvh-5rem))]">
            <div className="shrink-0 bg-gradient-to-br from-[#0B1B16] via-[#102820] to-[#163528] px-3 py-3 text-white sm:px-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-3">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white p-1 ring-2 ring-[#18B368]/50">
                    <AssistantLogo size={44} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[15px] font-black">Ops Eva</p>
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#18B368]/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#7DFFB2]">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#22C55E]" />
                        Live
                      </span>
                      <span className="hidden items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white/70 sm:inline-flex">
                        <Command size={11} /> K
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] leading-snug text-white/70">
                      <span className="sm:hidden">Live DB search · ACL-safe</span>
                      <span className="hidden sm:inline">
                        Instant live DB search · ChatGPT-style answers · ACL-safe
                      </span>
                      {elapsedMs ? ` · last ${elapsedMs}ms` : ""}
                      {modeTag === "ai" ? " · AI" : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="shrink-0 rounded-full bg-white/10 p-1.5 sm:hidden"
                    aria-label="Close"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <div className="flex flex-1 rounded-full bg-white/10 p-0.5 text-[11px] font-bold sm:mr-1 sm:flex-none">
                    <button
                      type="button"
                      onClick={() => setMode("command")}
                      className={`flex-1 rounded-full px-3 py-1.5 sm:flex-none sm:py-1 ${mode === "command" ? "bg-[#18B368] text-white" : "text-white/70"}`}
                    >
                      Search
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode("ask")}
                      className={`flex-1 rounded-full px-3 py-1.5 sm:flex-none sm:py-1 ${mode === "ask" ? "bg-[#18B368] text-white" : "text-white/70"}`}
                    >
                      Ask
                    </button>
                  </div>
                  <select
                    value={language}
                    onChange={(event) => setLanguage(event.target.value)}
                    className="max-w-[84px] shrink-0 rounded-full border border-white/15 bg-white/10 px-2 py-1.5 text-[11px] font-bold text-white outline-none sm:py-1"
                    aria-label="Ops language"
                  >
                    {ASSISTANT_LANGUAGES.map((item) => (
                      <option key={item.id} value={item.id} className="text-[#0F172A]">
                        {item.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="hidden shrink-0 rounded-full bg-white/10 p-1.5 sm:inline-flex"
                    aria-label="Close"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {pulse.length ? (
                <div className="mt-3 flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {pulse.map((stat) => (
                    <button
                      key={stat.label}
                      type="button"
                      onClick={() => {
                        if (stat.dashboard) onOpenDashboard(stat.dashboard);
                      }}
                      className="min-w-[5.5rem] rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-left"
                    >
                      <p className="text-[10px] font-bold uppercase tracking-wide text-white/55">
                        {stat.label}
                      </p>
                      <p className="text-xl font-black text-[#7DFFB2]">{stat.value}</p>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="shrink-0 border-b border-slate-200 bg-white px-3 py-3">
              <form
                className="flex items-center gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  void runSearch(question, {
                    askMode: mode === "ask",
                    navigate: mode === "command",
                  });
                }}
              >
                <div className="relative flex-1">
                  <Search
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    ref={inputRef}
                    value={question}
                    onChange={(event) => setQuestion(event.target.value)}
                    className="h-12 w-full rounded-full border border-slate-200 bg-[#F8FAF9] pl-10 pr-4 text-sm outline-none focus:border-[#18B368]"
                    placeholder={
                      mode === "command"
                        ? "Search BK- ID, phone, unpaid, KYC, refunds…"
                        : "Ask: how many unpaid? open wallet…"
                    }
                    maxLength={240}
                  />
                </div>
                <button
                  type="button"
                  disabled={!voice.supported}
                  onClick={() => {
                    void voice.listen(
                      (text) => {
                        setQuestion(text);
                        void runSearch(text, { askMode: mode === "ask", navigate: true });
                      },
                      language
                    );
                  }}
                  className={`relative flex h-12 w-12 items-center justify-center rounded-full text-white ${
                    voice.listening ? "bg-[#EC2A8C]" : "bg-[#0B1B16]"
                  }`}
                  aria-label={voice.listening ? "Stop listening" : "Speak"}
                >
                  {voice.listening ? <MicOff size={17} /> : <Mic size={17} />}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-[#18B368] text-white disabled:opacity-50"
                  aria-label="Run"
                >
                  <Send size={17} />
                </button>
              </form>
              <div className="mt-2 flex gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {COMMANDS.map((chip) => {
                  const Icon = chip.icon;
                  return (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => {
                        setQuestion(chip.ask);
                        void runSearch(chip.ask, { askMode: mode === "ask", navigate: true });
                      }}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-[#F8FAF9] px-3 py-1.5 text-[11px] font-bold text-slate-700"
                    >
                      <Icon size={13} className="text-[#18B368]" />
                      {chip.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
              {mode === "command" ? (
                <div className="space-y-3">
                  {loading ? <TypingDots /> : null}
                  {voice.status ? (
                    <p className="text-xs font-semibold text-slate-400">{voice.status}</p>
                  ) : null}
                  {!queryReady && !loading ? (
                    <div className="space-y-2 rounded-2xl border border-dashed border-slate-200 bg-white px-3 py-4 text-sm text-slate-600">
                      <p className="text-center font-semibold text-slate-700">
                        Search like a command palette — results in milliseconds
                      </p>
                      <p className="text-center text-xs text-slate-500">
                        Try a name, 10-digit phone, BK- ID, “unpaid”, “pending kyc”, “open tickets”,
                        or “approve rider …”. I open the dashboard with search prefilled. Approve/Pay
                        stay on staff buttons.
                      </p>
                    </div>
                  ) : null}
                  {queryReady && elapsedMs ? (
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                      {modeTag === "ai" ? "AI + live search" : "Live search"} · {elapsedMs}ms ·{" "}
                      {hits.length} hits
                    </p>
                  ) : null}
                  {!question && recent.length ? (
                    <div>
                      <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                        Recent
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {recent.map((item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => {
                              setQuestion(item);
                              void runSearch(item, { navigate: true });
                            }}
                            className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200"
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {queryReady && answer ? (
                    <p className="whitespace-pre-wrap rounded-2xl border border-slate-100 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm">
                      {answer}
                    </p>
                  ) : null}
                  {queryReady && action?.dashboard ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (action.focusQuery) writeOpsFocus(action.focusQuery);
                        onOpenDashboard(action.dashboard);
                      }}
                      className="inline-flex items-center gap-2 rounded-full bg-[#18B368] px-4 py-2 text-xs font-black text-white"
                    >
                      <LayoutDashboard size={14} />
                      {action.label}
                    </button>
                  ) : null}
                  {groupedHits.map(([kind, rows]) => (
                    <div key={kind}>
                      <p className="mb-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
                        {kind} · {rows.length}
                      </p>
                      <div className="space-y-1.5">
                        {rows.map((hit) => (
                          <button
                            key={`${hit.kind}-${hit.id}-${hit.title}`}
                            type="button"
                            onClick={() => {
                              writeOpsFocus(hit.id || hit.title);
                              onOpenDashboard(hit.dashboard);
                            }}
                            className={`w-full rounded-2xl border border-slate-200 border-l-4 bg-white px-3 py-2.5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                              KIND_STYLE[hit.kind] || "border-l-[#18B368]"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-black text-[#0F172A]">{hit.title}</p>
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                                {hit.badge || "Open →"}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500">{hit.detail}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  {!loading && question.trim().length >= 2 && !hits.length && !answer ? (
                    <p className="text-sm text-slate-500">No matches yet — try BK- ID or a phone.</p>
                  ) : null}
                </div>
              ) : (
                <div className="space-y-3">
                  {turns.map((turn, index) => (
                    <div key={`${turn.role}-${index}`} className="space-y-2">
                      {turn.role === "user" ? (
                        <div className="ml-10 flex justify-end">
                          <div className="rounded-2xl rounded-tr-md bg-[#18B368] px-3.5 py-2.5 text-sm font-medium text-white">
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
                      {turn.action?.dashboard ? (
                        <div className="ml-9">
                          <button
                            type="button"
                            onClick={() => {
                              if (turn.action?.focusQuery) writeOpsFocus(turn.action.focusQuery);
                              onOpenDashboard(turn.action!.dashboard);
                            }}
                            className="inline-flex items-center gap-2 rounded-full bg-[#18B368] px-4 py-2 text-xs font-black text-white"
                          >
                            <LayoutDashboard size={14} />
                            {turn.action.label}
                          </button>
                        </div>
                      ) : null}
                      {turn.hits?.length ? (
                        <div className="ml-9 space-y-1.5">
                          {turn.hits.slice(0, 8).map((hit) => (
                            <button
                              key={`${hit.kind}-${hit.id}-${index}`}
                              type="button"
                              onClick={() => {
                                writeOpsFocus(hit.id || hit.title);
                                onOpenDashboard(hit.dashboard);
                              }}
                              className={`w-full rounded-2xl border border-slate-200 border-l-4 bg-white px-3 py-2 text-left ${
                                KIND_STYLE[hit.kind] || "border-l-[#18B368]"
                              }`}
                            >
                              <p className="font-black text-[#0F172A]">{hit.title}</p>
                              <p className="text-xs text-slate-500">{hit.detail}</p>
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ))}
                  {loading ? <TypingDots /> : null}
                  <div ref={bottomRef} />
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
