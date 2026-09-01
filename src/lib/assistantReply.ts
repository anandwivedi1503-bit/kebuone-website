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
    en: "Book in four steps: (1) Register with phone OTP and finish KYC. (2) Open Book EV, pick city, hub and scooter. (3) Pay rent + 5% GST + refundable deposit with Razorpay, or wallet if you have balance. (4) Show the pickup OTP at the hub. I can open ride options — I cannot take payment.",
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
    keys: ["razorpay", "pay", "upi", "card", "पेमेंट", "भुगतान", "gst"],
    en: "UPI and cards go through Razorpay on the booking page. GST is 5% on rent (CGST 2.5% + SGST 2.5%). If your EVUDDY wallet has enough, you can pay from wallet there. I cannot collect payment or enter OTP for you.",
    hi: "UPI और कार्ड बुकिंग पेज पर Razorpay से चलते हैं। किराये पर 5% GST (CGST 2.5% + SGST 2.5%)। वॉलेट में बैलेंस हो तो वहीं से पे कर सकते हैं। मैं भुगतान या OTP नहीं ले सकता।",
  },
  {
    keys: ["hub", "city", "lucknow", "where", "हब", "शहर", "लखनऊ", "office", "address"],
    href: "/book-bike?flow=rental",
    en: "Pick your city and hub on the booking page so you collect the scooter from that hub. Corporate office: Summit Building, 7th Floor, Vibhuti Khand, Gomti Nagar, Lucknow.",
    hi: "बुकिंग पेज पर शहर और हब चुनें — स्कूटर उसी हब से लें। कॉर्पोरेट ऑफिस: Summit Building, 7th Floor, विभूति खंड, गोमती नगर, लखनऊ।",
  },
  {
    keys: ["contact", "help", "ticket", "support", "email", "phone", "helpdesk", "संपर्क", "मदद", "हेल्प", "टिकट"],
    href: "/contact",
    en: "Helpdesk: helpdesk@kebuone.in or +91 8726006512, or use the contact page. After you pay, Book EV has Need help? for pickup or mid-ride issues — that creates a support ticket staff see on Support.",
    hi: "हेल्पडेस्क: helpdesk@kebuone.in या +91 8726006512, या संपर्क पेज। पेमेंट के बाद Book EV पर Need help? से सपोर्ट टिकट बनता है — स्टाफ Support पर देखते हैं।",
  },
  {
    keys: ["pickup", "otp", "unlock", "yard", "पिकअप", "ओटीपी", "अनलॉक", "ride end", "ride started"],
    href: "/book-bike",
    en: "After your first payment (≥ ₹1), Book EV shows a Pickup OTP. Tell it to the yard. They unlock the scooter. Then swipe Ride started. For ride end: remaining rent ₹0, return to yard, swipe Ride end, tell that OTP to the yard. I cannot enter OTP for you.",
    hi: "पहली पेमेंट (≥ ₹1) के बाद Book EV पर Pickup OTP दिखता है। हब पर बताएँ — वे अनलॉक करेंगे। फिर Ride started स्वाइप करें। राइड एंड: बाकी किराया ₹0, यार्ड लौटें, Ride end स्वाइप करें, OTP बताएँ। मैं OTP नहीं डाल सकता।",
  },
  {
    keys: ["invest", "investment", "partner", "fleet partner", "roi", "return", "profit", "इन्वेस्ट", "पार्टनर", "निवेश"],
    href: "/partners",
    en: "Fleet Partner Investment on /partners: you fund scooters, EVUDDY operates them, profit share is 50/50 on the published model (example ~₹3,915/month on a ₹1 lakh plan over ~42 months, plus scrap). Plans include ₹1L, ₹5L, ₹10L. Apply on the partners form — I cannot take investment money in chat.",
    hi: "फ्लीट पार्टनर निवेश /partners पर: आप स्कूटर फंड करते हैं, EVUDDY चलाती है, प्रकाशित मॉडल में 50/50 प्रॉफिट शेयर (उदाहरण ₹1 लाख प्लान पर ~₹3,915/महीना, ~42 महीने + स्क्रैप)। प्लान ₹1L / ₹5L / ₹10L। पार्टनर्स फॉर्म से आवेदन करें — चैट में निवेश पैसे नहीं ले सकता।",
  },
  {
    keys: ["leadership", "ceo", "chairman", "team", "लीडरशिप", "टीम"],
    href: "/Leadership",
    en: "Leadership posters: Chairman Anjali Mishra, Founder & CEO Sunil Pathak, General Manager Bindu Singh. Team posters include SDE Anand Dhar Dwivedi, Admin & Front Desk Aanya Singh, and Graphic Designer Akanksha Maurya.",
    hi: "लीडरशिप: चेयरमैन अंजलि मिश्रा, फाउंडर व CEO सुनील पाठक, GM बिंदू सिंह। टीम में SDE आनंद धर द्विवेदी, Admin & Front Desk आन्या सिंह, Graphic Designer आकांक्षा मौर्य।",
  },
  {
    keys: ["career", "careers", "job", "hiring", "join", "करियर", "नौकरी"],
    href: "/careers",
    en: "Open Careers to apply. Roles span technology, operations, business, support, fleet, marketing, people and finance. You can also email helpdesk@kebuone.in.",
    hi: "Careers पेज पर आवेदन करें — टेक्नोलॉजी, ऑप्स, बिज़नेस, सपोर्ट आदि। ईमेल helpdesk@kebuone.in भी कर सकते हैं।",
  },
  {
    keys: ["vision", "mission", "about", "विजन", "मिशन", "अबाउट"],
    href: "/vision",
    en: "Mission: make electric mobility affordable, accessible, and asset-building. Vision: empower gig workers and businesses with sustainable transport so every ride can lead to ownership. More on /vision and /about.",
    hi: "मिशन: इलेक्ट्रिक मोबिलिटी सस्ती, सुलभ और एसेट-बिल्डिंग। विजन: गिग वर्कर्स व बिज़नेस के लिए सस्टेनेबल ट्रांसपोर्ट — हर राइड ओनरशिप तक ले जा सके। /vision और /about देखें।",
  },
  {
    keys: ["segment", "b2b", "b2c", "fleet", "business", "सेगमेंट"],
    href: "/partners",
    en: "EVUDDY serves B2C rentals, Rent to Own, and B2B/fleet partners who invest or operate scooters. Riders book on Book EV; partners apply on /partners.",
    hi: "EVUDDY: B2C किराया, Rent to Own, और B2B/फ्लीट पार्टनर। राइडर Book EV पर बुक करते हैं; पार्टनर /partners पर अप्लाई करते हैं।",
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
        "I cannot take payment, enter OTP, unlock a scooter, or issue a refund. Use the buttons on Book EV or ask hub staff / helpdesk@kebuone.in.",
        "मैं भुगतान, OTP, अनलॉक या रिफंड नहीं कर सकता। Book EV पर बटन इस्तेमाल करें या helpdesk@kebuone.in पर संपर्क करें।"
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
    (/\b(contact|support|help desk|helpdesk|email)\b/.test(q) || /संपर्क|मदद/.test(q))
  ) {
    return {
      answer: bilingual(
        language,
        question,
        "Opening contact — helpdesk@kebuone.in · +91 8726006512.",
        "संपर्क पेज खोल रहा हूँ — helpdesk@kebuone.in · +91 8726006512।"
      ),
      href: "/contact",
      navigate: true,
    };
  }

  if (OPEN_CMD.test(q) && (/\b(partner|invest|fleet|investment)\b/.test(q) || /पार्टनर|इन्वेस्ट|निवेश/.test(q))) {
    return {
      answer: bilingual(
        language,
        question,
        "Opening fleet partner investment. Apply on the form — no payment in chat.",
        "फ्लीट पार्टनर निवेश पेज खोल रहा हूँ। फॉर्म से आवेदन करें — चैट में भुगतान नहीं।"
      ),
      href: "/partners",
      navigate: true,
    };
  }

  if (OPEN_CMD.test(q) && (/\b(career|careers|job)\b/.test(q) || /करियर|नौकरी/.test(q))) {
    return {
      answer: bilingual(language, question, "Opening Careers.", "Careers खोल रहा हूँ।"),
      href: "/careers",
      navigate: true,
    };
  }

  if (OPEN_CMD.test(q) && (/\b(vision|mission|about)\b/.test(q) || /विजन|मिशन/.test(q))) {
    return {
      answer: bilingual(language, question, "Opening Vision.", "Vision खोल रहा हूँ।"),
      href: "/vision",
      navigate: true,
    };
  }

  if (OPEN_CMD.test(q) && (/\b(leadership|team)\b/.test(q) || /लीडरशिप/.test(q))) {
    return {
      answer: bilingual(language, question, "Opening Leadership.", "Leadership खोल रहा हूँ।"),
      href: "/Leadership",
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
  const system = `You are Eva, the EVUDDY in-app assistant for https://www.evuddy.com — Uber/Ola/Rapido/Zypp grade ride help.
Only use this knowledge. Do not invent hubs, prices, investment returns, or policies.
Cover bookings, rates, KYC, GST, wallet/deposit, Rent to Own, support tickets, fleet investment plans, leadership, careers, vision, and contact.
You cannot take payments, change bookings, approve refunds/KYC, enter OTP, or unlock scooters.
If asked to do those, refuse and send the rider to website buttons or helpdesk@kebuone.in / +91 8726006512.
You may offer to open /ride-options, /rent-to-own, /register, /contact, /partners, /careers, /vision, /Leadership, /about.
Reply in ${replyLang}. Keep answers clear and under 140 words.

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
        max_tokens: 320,
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
        max_tokens: 320,
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
          generationConfig: { temperature: 0.2, maxOutputTokens: 320 },
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
        "Ask about booking, rates, Rent to Own, investment plans, tickets, KYC, or contact. You can also speak with the mic.",
        "बुकिंग, किराया, Rent to Own, निवेश प्लान, टिकट, KYC या संपर्क पूछें। माइक से भी बोल सकते हैं।"
      ),
    };
  }

  const intent = publicAssistantIntent(asked, language);
  if (intent) return intent;

  const faq = faqAnswer(asked, language);
  if ((faq.score || 0) >= 1 && faq.answer) return faq;

  try {
    const llm = await llmAnswer(history, asked, language);
    if (llm) {
      return { answer: llm.slice(0, 1000), href: faq.href };
    }
  } catch (error) {
    console.error("EVUDDY ASSISTANT LLM SKIPPED:", error);
  }

  if (faq.answer) return faq;

  return {
    answer: bilingual(
      language,
      asked,
      "I can help with EVUDDY bookings, rates, KYC, deposits, Rent to Own, support tickets, fleet investment, leadership, and contact (helpdesk@kebuone.in · +91 8726006512). Say “open booking” or “open partners”. I cannot take payment or change a booking from chat.",
      "मैं EVUDDY बुकिंग, किराया, KYC, डिपॉजिट, Rent to Own, सपोर्ट टिकट, फ्लीट निवेश, लीडरशिप और संपर्क (helpdesk@kebuone.in · +91 8726006512) बता सकता हूँ। “बुकिंग खोलो” या “पार्टनर खोलो” कहें। भुगतान या बुकिंग बदलना चैट से नहीं होगा।"
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
