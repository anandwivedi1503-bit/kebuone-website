import { bilingual } from "@/lib/assistantCopy";
import { detectScriptLanguage, LANGUAGE_NAMES } from "@/lib/assistantLanguages";
import { EVUDDY_KNOWLEDGE } from "@/lib/evuddyKnowledge";

export type ChatTurn = { role: "user" | "assistant"; content: string };

export type AssistantReply = {
  answer: string;
  href?: string;
  navigate?: boolean;
  score?: number;
};

const BLOCKED =
  /\b(pay|payment|razorpay|upi|otp|unlock|refund|wallet debit|charge card)\b/i;
const HOW_TO =
  /\b(how|what|explain|tell me|steps|kya|kaise)\b|कैसे|क्या|कसा|कसे|எப்படி|ఎలా|কিভাবে|કેવી|ಕೇಗೆ|എങ്ങനെ/;
const OPEN_CMD =
  /\b(open|take me|go to|navigate|book now|start booking)\b|खोलो|खोल दो|बुक करो|बुकिंग खोलो|ले चलो/;

const FAQ: { keys: string[]; href?: string; en: string; hi: string }[] = [
  {
    keys: ["book", "how to", "start", "kyc", "register", "बुक", "बुकिंग", "रजिस्टर", "स्कूटर", "कैसे"],
    href: "/ride-options",
    en: "Book in four steps: (1) Register with your phone OTP and finish KYC. (2) Open Book EV, pick city, hub and scooter. (3) Pay rent + 5% GST + refundable deposit with Razorpay, or wallet if you have balance. (4) Show the pickup OTP at the hub. I can open ride options — I cannot take payment.",
    hi: "बुकिंग चार कदम: (1) फोन OTP से रजिस्टर करें और KYC पूरा करें। (2) Book EV खोलें, शहर, हब और स्कूटर चुनें। (3) किराया + 5% GST + रिफंडेबल डिपॉजिट Razorpay या वॉलेट से दें। (4) पिकअप OTP हब पर दिखाएँ। मैं पेज खोल सकता हूँ, भुगतान नहीं ले सकता।",
  },
  {
    keys: ["rate", "rates", "price", "prices", "hourly", "daily", "weekly", "monthly", "cost", "₹", "rs", "किराया", "रेट", "दाम"],
    href: "/book-bike?flow=rental",
    en: "Listed rates (a scooter can differ): Hourly ₹60, Daily ₹230, Weekly ₹1,610, Monthly ₹6,900, plus 5% GST. Rentals also take a refundable security deposit (usually ₹2,500).",
    hi: "सूची दरें (स्कूटर बदल सकता है): घंटे ₹60, दिन ₹230, सप्ताह ₹1,610, महीना ₹6,900, साथ 5% GST। किराये पर आमतौर पर ₹2,500 रिफंडेबल सिक्योरिटी डिपॉजिट भी लगता है।",
  },
  {
    keys: ["deposit", "wallet", "refund", "जमा", "वॉलेट", "रिफंड", "डिपॉजिट"],
    en: "The security deposit is part of the booking payment, not a separate wallet charge. After you return the scooter, staff approve the refund. It usually credits your EVUDDY wallet. They can send it back on Razorpay instead — never both. I cannot refund or move money from this chat.",
    hi: "सिक्योरिटी डिपॉजिट बुकिंग पेमेंट का हिस्सा है, अलग वॉलेट चार्ज नहीं। स्कूटर वापस करने के बाद स्टाफ रिफंड मंजूर करते हैं — आमतौर पर EVUDDY वॉलेट में। Razorpay पर भी भेज सकते हैं, दोनों नहीं। मैं यहाँ से रिफंड नहीं कर सकता।",
  },
  {
    keys: ["own", "rto", "installment", "18", "रेंट टू ओन", "अपना"],
    href: "/rent-to-own",
    en: "Rent to Own is ₹280 + 5% GST every day for 18 months, no security deposit. You get a daily receipt. After successful days, ownership transfers.",
    hi: "Rent to Own: 18 महीने तक रोज़ ₹280 + 5% GST, कोई सिक्योरिटी डिपॉजिट नहीं। रोज़ रसीद मिलती है। सफल दिनों के बाद मालिकाना हक ट्रांसफर होता है।",
  },
  {
    keys: ["razorpay", "pay", "upi", "card", "पेमेंट", "भुगतान"],
    en: "UPI and cards go through Razorpay on the booking page. If your EVUDDY wallet has enough, you can pay from wallet there. I cannot collect payment or enter OTP for you.",
    hi: "UPI और कार्ड बुकिंग पेज पर Razorpay से चलते हैं। वॉलेट में बैलेंस हो तो वहीं से पे कर सकते हैं। मैं भुगतान या OTP नहीं ले सकता।",
  },
  {
    keys: ["hub", "city", "lucknow", "where", "हब", "शहर", "लखनऊ"],
    href: "/book-bike?flow=rental",
    en: "Pick your city and hub on the booking page so you collect the scooter from that hub. Corporate office: Summit Building, 7th Floor, Gomti Nagar, Lucknow.",
    hi: "बुकिंग पेज पर शहर और हब चुनें — स्कूटर उसी हब से लें। कॉर्पोरेट ऑफिस: Summit Building, 7th Floor, गोमती नगर, लखनऊ।",
  },
  {
    keys: ["contact", "help", "ticket", "support", "email", "संपर्क", "मदद", "हेल्प"],
    href: "/contact",
    en: "Email info@kebuone.in or use the contact page. After you pay, Book EV has Need help? for pickup or mid-ride issues. Hub staff see it on Support.",
    hi: "ईमेल info@kebuone.in या संपर्क पेज इस्तेमाल करें। पेमेंट के बाद Book EV पर Need help? है। हब स्टाफ Support पर देखते हैं।",
  },
];

function clean(text: string) {
  return text.trim().slice(0, 500);
}

function wantsBlockedAction(question: string) {
  const q = question.toLowerCase();
  return (
    (BLOCKED.test(q) || /भुगतान|ओटीपी|रिफंड/.test(q)) &&
    /\b(for me|on my behalf|do it|complete|enter|pay now|कर दो|भेज दो)\b/.test(q)
  );
}

export function publicAssistantIntent(question: string, language = "auto"): AssistantReply | null {
  const q = question.toLowerCase();
  if (wantsBlockedAction(q)) {
    return {
      answer: bilingual(
        language,
        question,
        "I cannot take payment, enter OTP, unlock a scooter, or issue a refund. Use the buttons on Book EV or ask hub staff.",
        "मैं भुगतान, OTP, अनलॉक या रिफंड नहीं कर सकता। Book EV पर बटन इस्तेमाल करें या हब स्टाफ से कहें।"
      ),
    };
  }

  if (HOW_TO.test(question) && !OPEN_CMD.test(q)) {
    return null;
  }

  if (/\b(rent to own|rto|own the scooter)\b/.test(q) || /रेंट टू ओन|अपना स्कूटर/.test(q)) {
    if (OPEN_CMD.test(q) || /खोल/.test(q)) {
      return {
        answer: bilingual(
          language,
          question,
          "Opening Rent to Own. Payment still happens on that page — not in this chat.",
          "Rent to Own खोल रहा हूँ। भुगतान उसी पेज पर होगा, चैट में नहीं।"
        ),
        href: "/rent-to-own",
        navigate: true,
      };
    }
  }

  if (
    OPEN_CMD.test(q) &&
    (/\b(book|ride|scooter|ev|rental|booking)\b/.test(q) || /बुक|बुकिंग|स्कूटर|राइड/.test(q))
  ) {
    return {
      answer: bilingual(
        language,
        question,
        "Opening ride options. Choose normal booking or Rent to Own, then pay on the booking page.",
        "राइड विकल्प खोल रहा हूँ। सामान्य बुकिंग या Rent to Own चुनें। भुगतान बुकिंग पेज पर होगा।"
      ),
      href: "/ride-options",
      navigate: true,
    };
  }

  if (OPEN_CMD.test(q) && (/\b(register|kyc|sign up)\b/.test(q) || /रजिस्टर|केवाईसी/.test(q))) {
    return {
      answer: bilingual(
        language,
        question,
        "Opening registration. Complete KYC there — I cannot approve it.",
        "रजिस्ट्रेशन खोल रहा हूँ। KYC वहीं पूरा करें — मैं मंज़ूर नहीं कर सकता।"
      ),
      href: "/register",
      navigate: true,
    };
  }

  if (
    (OPEN_CMD.test(q) || /संपर्क पेज/.test(q)) &&
    (/\b(contact|support|help desk|email)\b/.test(q) || /संपर्क|मदद/.test(q))
  ) {
    return {
      answer: bilingual(
        language,
        question,
        "Opening contact so you can reach the team.",
        "संपर्क पेज खोल रहा हूँ।"
      ),
      href: "/contact",
      navigate: true,
    };
  }

  if (OPEN_CMD.test(q) && (/\b(partner|invest|fleet)\b/.test(q) || /पार्टनर|इन्वेस्ट/.test(q))) {
    return {
      answer: bilingual(language, question, "Opening the fleet partner page.", "पार्टनर पेज खोल रहा हूँ।"),
      href: "/partners",
      navigate: true,
    };
  }

  return null;
}

export function faqAnswer(question: string, language = "auto"): AssistantReply {
  const q = question.toLowerCase();
  let best: { score: number; en: string; hi: string; href?: string } | null = null;
  for (const row of FAQ) {
    const score = row.keys.filter((key) => q.includes(key)).length;
    if (score > 0 && (!best || score > best.score)) {
      best = { score, en: row.en, hi: row.hi, href: row.href };
    }
  }
  if (!best) return { answer: "", score: 0 };
  return {
    answer: bilingual(language, question, best.en, best.hi),
    href: best.href,
    score: best.score,
  };
}

async function llmAnswer(history: ChatTurn[], question: string, language: string) {
  const replyLang =
    language === "auto"
      ? LANGUAGE_NAMES[detectScriptLanguage(question)]
      : LANGUAGE_NAMES[language] || "the user's language";
  const system = `You are Eva, the EVUDDY ride assistant for https://www.evuddy.com — like an in-app buddy on Uber/Ola/Rapido/Zypp.
Only use this knowledge. Do not invent hubs, prices, or policies.
You cannot take payments, change bookings, approve refunds, enter OTP, or unlock scooters.
If asked to do those, refuse and tell the rider to use the website buttons.
You may offer to open /ride-options, /rent-to-own, /register, /contact, or /partners.
Reply in ${replyLang}. Keep answers short (under 120 words). Sound clear, warm, and operational.

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

export async function answerEvuddyQuestion(
  history: ChatTurn[],
  question: string,
  language = "auto"
): Promise<AssistantReply> {
  const asked = clean(question);
  if (asked.length < 2) {
    return {
      answer: bilingual(
        language,
        asked,
        "Ask anything about booking, rates, KYC, wallet deposits, or Rent to Own. You can also speak with the mic.",
        "बुकिंग, किराया, KYC, वॉलेट डिपॉजिट या Rent to Own पूछें। माइक से बोल भी सकते हैं।"
      ),
    };
  }

  const intent = publicAssistantIntent(asked, language);
  if (intent) return intent;

  const faq = faqAnswer(asked, language);
  if ((faq.score || 0) >= 2 && faq.answer) return faq;

  try {
    const llm = await llmAnswer(history, asked, language);
    if (llm) {
      return { answer: llm.slice(0, 900), href: faq.href };
    }
  } catch (error) {
    console.error("EVUDDY ASSISTANT LLM SKIPPED:", error);
  }

  if (faq.answer) return faq;

  return {
    answer: bilingual(
      language,
      asked,
      "I can help with EVUDDY bookings, rates, KYC, wallet deposits, Rent to Own, and pickup. Say “open booking” and I will take you there. I cannot take payment or change a booking from this chat.",
      "मैं EVUDDY बुकिंग, किराया, KYC, वॉलेट डिपॉजिट, Rent to Own और पिकअप बता सकता हूँ। “बुकिंग खोलो” कहें तो पेज खोल दूँगा। भुगतान या बुकिंग बदलना इस चैट से नहीं होगा।"
    ),
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
