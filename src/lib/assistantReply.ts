import { EVUDDY_KNOWLEDGE } from "@/lib/evuddyKnowledge";

export type ChatTurn = { role: "user" | "assistant"; content: string };

const FAQ: { keys: string[]; answer: string }[] = [
  {
    keys: ["book", "how to", "start", "otp", "kyc", "register"],
    answer:
      "Book in four steps: (1) Register with your phone OTP and finish KYC. (2) Open Book a bike, pick city, hub and scooter. (3) Pay rent + 5% GST + refundable deposit with Razorpay, or wallet if you have balance. (4) Show the pickup OTP at the hub. Start here: https://www.evuddy.com/book-bike",
  },
  {
    keys: ["rate", "price", "hourly", "daily", "weekly", "monthly", "cost", "₹", "rs"],
    answer:
      "Listed rates (a scooter can differ): Hourly ₹60, Daily ₹230, Weekly ₹1610, Monthly ₹6900, plus 5% GST. Rentals also take a refundable security deposit (usually ₹2500). See live scooters on https://www.evuddy.com/book-bike",
  },
  {
    keys: ["deposit", "wallet", "refund"],
    answer:
      "The security deposit is part of the booking payment, not a separate wallet charge. After you return the scooter, staff approve the refund. It usually credits your EVUDDY wallet. They can send it back on Razorpay instead — never both. Wallet is also where returned deposits sit so you can pay a later booking.",
  },
  {
    keys: ["own", "rto", "installment", "18"],
    answer:
      "Rent to Own is ₹280 + 5% GST every day for 18 months, no security deposit. You get a daily receipt. After successful days, ownership transfers. https://www.evuddy.com/rent-to-own",
  },
  {
    keys: ["razorpay", "pay", "upi", "card"],
    answer:
      "UPI and cards go through Razorpay on evuddy.com. If your EVUDDY wallet has enough (refunded deposits or credits), you can also pay from wallet. Login OTP is still your phone OTP, not email.",
  },
  {
    keys: ["hub", "city", "lucknow", "where"],
    answer:
      "Pick your city and hub on the booking page so you collect the scooter from that hub. Corporate office: Summit Building, 7th Floor, Gomti Nagar, Lucknow. Live hubs: https://www.evuddy.com/book-bike",
  },
  {
    keys: ["contact", "help", "ticket", "support", "email"],
    answer:
      "Email info@kebuone.in or use https://www.evuddy.com/contact. After you pay, Book EV has Need help? for pickup or mid-ride issues (breakdown, battery, unlock, payment). Hub staff see it on Support.",
  },
];

function clean(text: string) {
  return text.trim().slice(0, 500);
}

export function faqAnswer(question: string) {
  const q = question.toLowerCase();
  let best: { score: number; answer: string } | null = null;
  for (const row of FAQ) {
    const score = row.keys.filter((key) => q.includes(key)).length;
    if (score > 0 && (!best || score > best.score)) {
      best = { score, answer: row.answer };
    }
  }
  return best?.answer || "";
}

async function llmAnswer(history: ChatTurn[], question: string) {
  const system = `You are the EVUDDY website assistant for https://www.evuddy.com.
Only use this knowledge. Do not invent hubs, prices, or policies.
You cannot take payments, change bookings, approve refunds, or bypass KYC.
If asked to do those, explain the rider must use the website buttons.
Keep answers short (under 120 words). Include a relevant https://www.evuddy.com link when useful.

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

export async function answerEvuddyQuestion(history: ChatTurn[], question: string) {
  const asked = clean(question);
  if (asked.length < 2) {
    return "Ask anything about booking, rates, deposits, Rent to Own, or pickup OTP.";
  }

  try {
    const llm = await llmAnswer(history, asked);
    if (llm) return llm.slice(0, 900);
  } catch (error) {
    console.error("EVUDDY ASSISTANT LLM SKIPPED:", error);
  }

  const faq = faqAnswer(asked);
  if (faq) return faq;

  return "I can help with EVUDDY bookings, rates, KYC, wallet deposits, Rent to Own, and pickup. Try Book a bike at https://www.evuddy.com/book-bike or write to info@kebuone.in. I cannot take payment or change a booking from this chat.";
}

export function assistantConfigured() {
  return Boolean(
    String(process.env.OPENAI_API_KEY || "").trim() ||
      String(process.env.GROQ_API_KEY || "").trim() ||
      String(process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY || "").trim()
  );
}
