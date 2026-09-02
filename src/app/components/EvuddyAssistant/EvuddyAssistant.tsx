"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Bike,
  CircleHelp,
  Headset,
  IndianRupee,
  Mic,
  MicOff,
  PiggyBank,
  Send,
  Sparkles,
  Ticket,
  UserRound,
} from "lucide-react";

import AssistantFab from "@/app/components/Assistant/AssistantFab";
import AssistantLogo from "@/app/components/Assistant/AssistantLogo";
import AssistantShell, { TypingDots } from "@/app/components/Assistant/AssistantShell";
import { useVoiceAssistant } from "@/app/components/Assistant/useVoiceAssistant";
import { firebaseAuth } from "@/lib/firebase";

type Turn = { role: "user" | "assistant"; content: string; href?: string };

const SAFE_HREF =
  /^\/$|^\/(ride-options|book-bike|rent-to-own|register|contact|partners|about|vision|Leadership|careers|refund-policy|terms-and-conditions|privacy-policy)(\?[\w=&%-]*)?(#[\w-]*)?$/;

const HELP_TOPICS = [
  {
    label: "बुक करें",
    ask: "स्कूटर कैसे बुक करें?",
    icon: Bike,
    blurb: "KYC → हब → पेमेंट",
  },
  {
    label: "किराया",
    ask: "किराया कितना है?",
    icon: IndianRupee,
    blurb: "घंटे से महीने तक",
  },
  {
    label: "Rent to Own",
    ask: "Rent to Own क्या है?",
    icon: Sparkles,
    blurb: "₹280 / दिन · 18 महीने",
  },
  {
    label: "निवेश",
    ask: "फ्लीट पार्टनर निवेश प्लान और पोस्टर बताओ",
    icon: PiggyBank,
    blurb: "आपको 60% · पोस्टर देखें",
  },
  {
    label: "मेरा अकाउंट",
    ask: "मेरा अकाउंट कैसा है?",
    icon: UserRound,
    blurb: "KYC · बुकिंग · अगला कदम",
  },
  {
    label: "टिकट",
    ask: "सपोर्ट टिकट कैसे बनता है?",
    icon: Ticket,
    blurb: "Book EV पर Need help?",
  },
  {
    label: "हेल्पडेस्क",
    ask: "हेल्पडेस्क कैसे संपर्क करें?",
    icon: Headset,
    blurb: "helpdesk@kebuone.in",
  },
] as const;

export default function EvuddyAssistant() {
  const pathname = usePathname();
  const router = useRouter();
  const voice = useVoiceAssistant();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"home" | "chat">("home");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [speakBack, setSpeakBack] = useState(true);
  // Eva is Hindi-only — no English replies or English TTS.
  const language = "hi";
  const [riderName] = useState(() => {
    if (typeof window === "undefined") return "";
    try {
      return localStorage.getItem("kebu_rider_name") || "";
    } catch {
      return "";
    }
  });
  const [hasRider] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return Boolean(
        localStorage.getItem("kebu_rider_id") || localStorage.getItem("kebu_rider_name")
      );
    } catch {
      return false;
    }
  });
  const [turns, setTurns] = useState<Turn[]>([
    {
      role: "assistant",
      content:
        "नमस्ते जी! मैं Eva हूँ — EVUDDY वाली। बोलचाल हिंदी में पूछिए, मैं समझ जाती हूँ। लॉगिन हों तो अपना KYC/बुकिंग हाल भी बता दूँगी। पैसे, OTP, अनलॉक चैट से नहीं होते।",
    },
  ]);
  const greetedRef = useRef(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [turns, loading, voice.status, view, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setView("home");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open || greetedRef.current) return;
    let cancelled = false;
    const hydrate = async () => {
      try {
        const firebaseIdToken = (await firebaseAuth?.currentUser?.getIdToken()) || "";
        if (!firebaseIdToken || cancelled) return;
        const res = await fetch("/api/assistant", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${firebaseIdToken}`,
          },
          body: JSON.stringify({
            question: "नमस्ते",
            language: "hi",
            history: [],
            firebaseIdToken,
          }),
        });
        const data = await res.json();
        const answer = String(data.answer || "").trim();
        if (!answer || cancelled) return;
        greetedRef.current = true;
        setTurns([
          {
            role: "assistant",
            content: answer,
            href: SAFE_HREF.test(String(data.href || "")) ? String(data.href) : "",
          },
        ]);
      } catch {
        /* guest copy stays */
      }
    };
    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [open]);

  const greeting = useMemo(() => {
    if (riderName) return `नमस्ते ${riderName.split(" ")[0]} जी — बताइए, क्या हाल है राइड का?`;
    return "बोलिए जी, Eva सुन रही है।";
  }, [riderName]);

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
    setView("chat");
    setQuestion("");
    const nextTurns = [...turns, { role: "user" as const, content: asked }];
    setTurns(nextTurns);
    setLoading(true);
    try {
      let firebaseIdToken = "";
      try {
        firebaseIdToken = (await firebaseAuth?.currentUser?.getIdToken()) || "";
      } catch {
        firebaseIdToken = "";
      }
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(firebaseIdToken ? { Authorization: `Bearer ${firebaseIdToken}` } : {}),
        },
        body: JSON.stringify({
          question: asked,
          language: "hi",
          history: nextTurns.slice(-8),
          ...(firebaseIdToken ? { firebaseIdToken } : {}),
        }),
      });
      const data = await res.json();
      const answer =
        data.answer ||
        data.message ||
        "अभी जवाब नहीं दे पाई। Book EV इस्तेमाल करें या हेल्पडेस्क helpdesk@kebuone.in / +91 8726006512 पर बात करें।";
      const href = SAFE_HREF.test(String(data.href || "")) ? String(data.href) : "";
      setTurns([...nextTurns, { role: "assistant", content: answer, href }]);
      if (speakBack) voice.speak(answer, "hi");
      if (href && data.navigate) go(href);
    } catch {
      setTurns([
        ...nextTurns,
        {
          role: "assistant",
          content: "नेटवर्क समस्या है। /ride-options पर बुक करें या हेल्पडेस्क +91 8726006512 पर कॉल करें।",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="pointer-events-none fixed right-3 bottom-[max(1rem,env(safe-area-inset-bottom))] z-[1101] print:hidden sm:right-6">
        <AssistantFab
          open={open}
          onClick={() => {
            setOpen((value) => !value);
            if (!open) setView("home");
          }}
          label="Ask Eva"
          ariaLabel={open ? "Close EVUDDY assistant" : "Open EVUDDY assistant"}
          tone="rider"
        />
      </div>

      {open ? (
        <div className="fixed inset-0 z-[1100] flex items-end justify-center bg-[#0B1B16]/45 px-3 pb-4 pt-4 backdrop-blur-[3px] print:hidden sm:items-start sm:justify-center sm:px-4 sm:pb-10 sm:pt-[7.5rem]">
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label="Close Eva backdrop"
            onClick={() => {
              setOpen(false);
              setView("home");
            }}
          />
          <div className="relative mb-[max(4.5rem,env(safe-area-inset-bottom))] w-full max-w-lg sm:mb-0 sm:max-h-[calc(100dvh-8.5rem)]">
        <AssistantShell
          title="Eva"
          subtitle="देसी हिंदी · आपका लाइव KYC/राइड हाल"
          liveLabel="Online"
          language={language}
          onLanguage={() => undefined}
          showLanguageSelect={false}
          languageBadge="हिन्दी"
          onClose={() => {
            setOpen(false);
            setView("home");
          }}
          speakBack={speakBack}
          onSpeakBack={() => setSpeakBack((value) => !value)}
          chips={
            <div className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <button
                type="button"
                onClick={() => setView("home")}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold ${
                  view === "home"
                    ? "bg-[#0B1B16] text-white"
                    : "border border-slate-200 bg-white text-slate-700"
                }`}
              >
                <CircleHelp size={13} />
                होम
              </button>
              {hasRider ? (
                <button
                  type="button"
                  onClick={() => go("/book-bike")}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#18B368]/30 bg-[#18B368]/10 px-3 py-1.5 text-[11px] font-bold text-[#0F7A45]"
                >
                  <Bike size={13} />
                  मेरी राइड
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => void ask("फ्लीट पार्टनर निवेश प्लान और पोस्टर बताओ")}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-700"
              >
                निवेश
              </button>
              <button
                type="button"
                onClick={() => go("/contact")}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-700"
              >
                <Ticket size={13} className="text-[#18B368]" />
                इंसान से बात
              </button>
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
                  voice.listening ? "सुन रही हूँ… रोकने के लिए माइक दबाएँ" : "हिंदी में कुछ भी पूछें…"
                }
                maxLength={500}
              />
              <button
                type="button"
                disabled={!voice.supported}
                title={voice.supported ? undefined : "Microphone is not available in this browser"}
                onClick={() => {
                  void voice.listen(
                    (text) => void ask(text),
                    "hi",
                    (message) => {
                      const hindi =
                        /[\u0900-\u097F]/.test(message) || /वॉइस|माइक|बोल|टाइप|सुन/.test(message)
                          ? message
                          : "माइक से सुन नहीं पाई। Chrome/Safari में बोलें, या सवाल हिंदी में टाइप करें।";
                      setTurns((old) => [...old, { role: "assistant", content: hindi }]);
                    },
                    true
                  );
                }}
                className={`relative flex h-12 w-12 items-center justify-center rounded-full text-white disabled:opacity-40 ${
                  voice.listening ? "bg-[#EC2A8C]" : "bg-[#0B1B16]"
                }`}
                aria-label={voice.listening ? "सुनना बंद करें" : "बोलें"}
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
                aria-label="Send"
              >
                <Send size={17} />
              </button>
            </form>
          }
        >
          {view === "home" ? (
            <div className="space-y-3">
              <div className="rounded-2xl border border-slate-100 bg-white px-3.5 py-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 overflow-hidden rounded-full bg-white p-0.5 ring-1 ring-slate-200">
                    <AssistantLogo size={36} />
                  </span>
                  <div>
                    <p className="text-sm font-black text-[#0F172A]">{greeting}</p>
                    <p className="text-[11px] text-slate-500">
                      ChatGPT जैसी हिंदी हेल्प · सही पेज · भुगतान नहीं
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {HELP_TOPICS.map((topic) => {
                  const Icon = topic.icon;
                  return (
                    <button
                      key={topic.label}
                      type="button"
                      onClick={() => void ask(topic.ask)}
                      className="rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#18B368] hover:shadow-md"
                    >
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[#18B368]/10 text-[#0F7A45]">
                        <Icon size={16} />
                      </span>
                      <p className="mt-2 text-sm font-black text-[#0F172A]">{topic.label}</p>
                      <p className="text-[11px] text-slate-500">{topic.blurb}</p>
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() => setView("chat")}
                className="w-full rounded-2xl bg-[#0B1B16] px-3 py-2.5 text-sm font-bold text-white"
              >
                हिंदी में लिखें या बोलें →
              </button>
            </div>
          ) : (
            <>
              {turns.map((turn, index) =>
                turn.role === "user" ? (
                  <div key={`u-${index}`} className="ml-10 flex justify-end">
                    <div className="rounded-2xl rounded-tr-md bg-gradient-to-br from-[#18B368] to-[#12995A] px-3.5 py-2.5 text-sm font-medium text-white shadow-sm">
                      {turn.content}
                    </div>
                  </div>
                ) : (
                  <div key={`a-${index}`} className="mr-6 flex items-end gap-2">
                    <span className="mb-0.5 flex h-7 w-7 shrink-0 overflow-hidden rounded-full bg-white p-0.5 ring-1 ring-slate-200">
                      <AssistantLogo size={28} />
                    </span>
                    <div className="rounded-2xl rounded-tl-md border border-slate-100 bg-white px-3.5 py-2.5 text-sm text-slate-700 shadow-sm">
                      {turn.content}
                      {turn.href ? (
                        <button
                          type="button"
                          onClick={() => go(turn.href)}
                          className="mt-2 inline-flex items-center rounded-full bg-[#18B368]/10 px-3 py-1 text-xs font-bold text-[#0F7A45]"
                        >
                          पेज खोलें →
                        </button>
                      ) : null}
                    </div>
                  </div>
                )
              )}
              {loading || voice.status ? (
                <div className="space-y-1">
                  {loading ? <TypingDots /> : null}
                  {voice.status ? (
                    <p className="pl-9 text-xs font-semibold text-slate-400">{voice.status}</p>
                  ) : null}
                </div>
              ) : null}
              <div ref={bottomRef} />
            </>
          )}
        </AssistantShell>
          </div>
        </div>
      ) : null}
    </>
  );
}
