"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Bike, HelpCircle, IndianRupee, KeyRound, Mic, MicOff, Send, Sparkles } from "lucide-react";

import AssistantFab from "@/app/components/Assistant/AssistantFab";
import AssistantShell, { TypingDots } from "@/app/components/Assistant/AssistantShell";
import { useVoiceAssistant } from "@/app/components/Assistant/useVoiceAssistant";

type Turn = { role: "user" | "assistant"; content: string; href?: string };

const SAFE_HREF =
  /^\/(ride-options|book-bike|rent-to-own|register|contact|partners|about|vision|Leadership|careers)(\?[\w=&%-]*)?$/;

const QUICK_ACTIONS = [
  { label: "Book EV", ask: "How do I book a scooter?", icon: Bike },
  { label: "Rates", ask: "What are the rental rates?", icon: IndianRupee },
  { label: "Deposit", ask: "How does the security deposit work?", icon: KeyRound },
  { label: "Rent to Own", ask: "What is Rent to Own?", icon: Sparkles },
  { label: "हिन्दी मदद", ask: "स्कूटर कैसे बुक करें?", icon: HelpCircle },
] as const;

export default function EvuddyAssistant() {
  const pathname = usePathname();
  const router = useRouter();
  const voice = useVoiceAssistant();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [speakBack, setSpeakBack] = useState(true);
  const [language, setLanguage] = useState("auto");
  const [turns, setTurns] = useState<Turn[]>([
    {
      role: "assistant",
      content:
        "Hi, I’m Eva — your EVUDDY ride buddy. Ask about booking, rates, KYC, deposit, or Rent to Own. Tap the mic to speak Hindi or English. I cannot take payment or OTP.",
    },
  ]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [turns, loading, voice.status, open]);

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
          language,
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
      if (speakBack) voice.speak(answer, language);
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
    <div className="pointer-events-none fixed right-3 bottom-[max(1rem,env(safe-area-inset-bottom))] z-[80] flex flex-col items-end gap-3 sm:right-6">
      {open ? (
        <AssistantShell
          title="Eva"
          subtitle="EVUDDY ride buddy · voice + Hindi"
          language={language}
          onLanguage={setLanguage}
          onClose={() => setOpen(false)}
          speakBack={speakBack}
          onSpeakBack={() => setSpeakBack((value) => !value)}
          chips={
            <div className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    type="button"
                    onClick={() => void ask(action.ask)}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-700 shadow-sm hover:border-[#18B368] hover:text-[#0B1B16]"
                  >
                    <Icon size={13} className="text-[#18B368]" />
                    {action.label}
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
                placeholder={voice.listening ? "Listening… tap mic to stop" : "Ask Eva anything…"}
                maxLength={500}
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
                aria-label="Send"
              >
                <Send size={17} />
              </button>
            </form>
          }
        >
          {turns.map((turn, index) =>
            turn.role === "user" ? (
              <div key={`u-${index}`} className="ml-10 flex justify-end">
                <div className="rounded-2xl rounded-tr-md bg-gradient-to-br from-[#18B368] to-[#12995A] px-3.5 py-2.5 text-sm font-medium text-white shadow-sm">
                  {turn.content}
                </div>
              </div>
            ) : (
              <div key={`a-${index}`} className="mr-6 flex items-end gap-2">
                <span className="mb-0.5 flex h-7 w-7 shrink-0 overflow-hidden rounded-full bg-white ring-1 ring-slate-200">
                  <Image src="/kebu-mascot.jpg" alt="" width={28} height={28} className="object-cover" />
                </span>
                <div className="rounded-2xl rounded-tl-md border border-slate-100 bg-white px-3.5 py-2.5 text-sm text-slate-700 shadow-sm">
                  {turn.content}
                  {turn.href ? (
                    <button
                      type="button"
                      onClick={() => go(turn.href)}
                      className="mt-2 inline-flex items-center rounded-full bg-[#18B368]/10 px-3 py-1 text-xs font-bold text-[#0F7A45]"
                    >
                      Open page →
                    </button>
                  ) : null}
                </div>
              </div>
            )
          )}
          {loading || voice.status ? (
            <div className="space-y-1">
              {loading ? <TypingDots /> : null}
              {voice.status ? <p className="pl-9 text-xs font-semibold text-slate-400">{voice.status}</p> : null}
            </div>
          ) : null}
          <div ref={bottomRef} />
        </AssistantShell>
      ) : null}

      <AssistantFab
        open={open}
        onClick={() => setOpen((value) => !value)}
        label="Ask Eva"
        ariaLabel={open ? "Close EVUDDY assistant" : "Open EVUDDY assistant"}
        tone="rider"
      />
    </div>
  );
}
