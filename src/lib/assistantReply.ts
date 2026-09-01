import { EVUDDY_KNOWLEDGE } from "@/lib/evuddyKnowledge";

export type ChatTurn = { role: "user" | "assistant"; content: string };

export type AssistantReply = {
  answer: string;
  href?: string;
  navigate?: boolean;
};

const BLOCKED =
  /\b(pay|payment|razorpay|upi|otp|unlock|refund|wallet debit|charge card)\b/i;

const FAQ: { keys: string[]; answer: string; href?: string }[] = [
  {
    keys: ["book", "how to", "start", "kyc", "register"],
    href: "/ride-options",
    answer:
      "Book in four steps: (1) Register with your phone OTP and finish KYC. (2) Open Book EV, pick city, hub and scooter. (3) Pay rent + 5% GST + refundable deposit with Razorpay, or wallet if you have balance. (4) Show the pickup OTP at the hub. I can open ride options for you — I cannot take payment.",
  },
  {
    keys: ["rate", "price", "hourly", "daily", "weekly", "monthly", "cost", "₹", "rs"],
    href: "/book-bike?flow=rental",
    answer:
      "Listed rates (a scooter can differ): Hourly ₹60, Daily ₹230, Weekly ₹1610, Monthly ₹6900, plus 5% GST. Rentals also take a refundable security deposit (usually ₹2500).",
  },
  {
    keys: ["deposit", "wallet", "refund"],
    answer:
      "The security deposit is part of the booking payment, not a separate wallet charge. After you return the scooter, staff approve the refund. It usually credits your EVUDDY wallet. They can send it back on Razorpay instead — never both. I cannot refund or move money from this chat.",
  },
  {
    keys: ["own", "rto", "installment", "18"],
    href: "/rent-to-own",
    answer:
      "Rent to Own is ₹280 + 5% GST every day for 18 months, no security deposit. You get a daily receipt. After successful days, ownership transfers.",
  },
  {
    keys: ["razorpay", "pay", "upi", "card"],
    answer:
      "UPI and cards go through Razorpay on the booking page. If your EVUDDY wallet has enough, you can pay from wallet there. I cannot collect payment or enter OTP for you.",
  },
  {
    keys: ["hub", "city", "lucknow", "where"],
    href: "/book-bike?flow=rental",
    answer:
      "Pick your city and hub on the booking page so you collect the scooter from that hub. Corporate office: Summit Building, 7th Floor, Gomti Nagar, Lucknow.",
  },
  {
    keys: ["contact", "help", "ticket", "support", "email"],
    href: "/contact",
    answer:
      "Email info@kebuone.in or use the contact page. After you pay, Book EV has Need help? for pickup or mid-ride issues. Hub staff see it on Support.",
  },
];

function clean(text: string) {
  return text.trim().slice(0, 500);
}

export function publicAssistantIntent(question: string): AssistantReply | null {
  const q = question.toLowerCase();
  if (BLOCKED.test(q) && /\b(for me|on my behalf|do it|complete|enter|pay now)\b/.test(q)) {
    return {
      answer:
        "I cannot take payment, enter OTP, unlock a scooter, or issue a refund. Use the buttons on Book EV or ask hub staff.",
    };
  }
  if (/\b(rent to own|rto|own the scooter)\b/.test(q)) {
    return {
      answer: "Opening Rent to Own. Payment still happens on that page — not in this chat.",
      href: "/rent-to-own",
      navigate: true,
    };
  }
  if (/\b(book|ride|scooter|ev|rental)\b/.test(q) && /\b(open|start|go|take me|book now)\b/.test(q)) {
    return {
      answer: "Opening ride options. Choose normal booking or Rent to Own, then pay on the booking page.",
      href: "/ride-options",
      navigate: true,
    };
  }
  if (/\b(register|kyc|sign up)\b/.test(q)) {
    return { answer: "Opening registration. Complete KYC there — I cannot approve it.", href: "/register", navigate: true };
  }
  if (/\b(contact|support|help desk|email)\b/.test(q)) {
    return { answer: "Opening contact so you can reach the team.", href: "/contact", navigate: true };
  }
  if (/\b(partner|invest|fleet)\b/.test(q)) {
    return { answer: "Opening the fleet partner page.", href: "/partners", navigate: true };
  }
  return null;
}

export function faqAnswer(question: string): AssistantReply {
  const q = question.toLowerCase();
  let best: { score: number; answer: string; href?: string } | null = null;
  for (const row of FAQ) {
    const score = row.keys.filter((key) => q.includes(key)).length;
    if (score > 0 && (!best || score > best.score)) {
      best = { score, answer: row.answer, href: row.href };
    }
  }
  return best ? { answer: best.answer, href: best.href } : { answer: "" };
}

async function llmAnswer(history: ChatTurn[], question: string) {
const system = `You are the EVUDDY website assistant for https://www.evuddy.com.
Only use this knowledge. Do not invent hubs, prices, or policies.
You cannot take payments, change bookings, approve refunds, enter OTP, or unlock scooters.
If asked to do those, refuse and tell the rider to use the website buttons.
You may offer to open /ride-options, /rent-to-own, /register, /contact, or /partners.
Keep answers short (under 120 words).

KNOWLEDGE:
${EVUDDY_KNOWLEDGE}`;

  const openaiKey = String(process.env.OPENAI_API_KEY || "").trim();
  const groqKey = String(process.env.GROQ_API_KEY || "").trim();
  const geminiKey = String(process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY || "").trim();

  const messages = [
    ...history.slice(-6).map((turn) => ({
      role: turn.role,
      content: clean(turn.content),
    })),
    { role: "user" as const, content: question },
  ];

  if (openaiKey) {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.2,
        max_tokens: 280,
        messages: [{ role: "system", content: system }, ...messages],
      }),
    });
    if (!res.ok) throw new Error("openai");
    const data = await res.json();
    return String(data.choices?.[0]?.message?.content || "").trim();
  }

  if (groqKey) {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${groqKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
        temperature: 0.2,
        max_tokens: 280,
        messages: [{ role: "system", content: system }, ...messages],
      }),
    });
    if (!res.ok) throw new Error("groq");
    const data = await res.json();
    return String(data.choices?.[0]?.message?.content || "").trim();
  }

  if (geminiKey) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(geminiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: messages.map((turn) => ({
            role: turn.role === "assistant" ? "model" : "user",
            parts: [{ text: turn.content }],
          })),
          generationConfig: { temperature: 0.2, maxOutputTokens: 280 },
        }),
      }
    );
    if (!res.ok) throw new Error("gemini");
    const data = await res.json();
    return String(data.candidates?.[0]?.content?.parts?.[0]?.text || "").trim();
  }

  return "";
}

export async function answerEvuddyQuestion(history: ChatTurn[], question: string): Promise<AssistantReply> {
  const asked = clean(question);
  if (asked.length < 2) {
    return { answer: "Ask anything about booking, rates, KYC, wallet deposits, or Rent to Own. You can also speak with the mic." };
  }

  const intent = publicAssistantIntent(asked);
  if (intent) return intent;

  try {
    const llm = await llmAnswer(history, asked);
    if (llm) {
      const faq = faqAnswer(asked);
      return { answer: llm.slice(0, 900), href: faq.href };
    }
  } catch (error) {
    console.error("EVUDDY ASSISTANT LLM SKIPPED:", error);
  }

  const faq = faqAnswer(asked);
  if (faq.answer) return faq;

  return {
    answer:
      "I can help with EVUDDY bookings, rates, KYC, wallet deposits, Rent to Own, and pickup. Say “open booking” and I will take you there. I cannot take payment or change a booking from this chat.",
    href: "/ride-options",
  };
}

export function assistantConfigured() {
  return Boolean(
    String(process.env.OPENAI_API_KEY || "").trim() ||
      String(process.env.GROQ_API_KEY || "").trim() ||
      String(process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY || "").trim()
  );
}
