import { bilingual } from "@/lib/assistantCopy";
import { EVUDDY_KNOWLEDGE } from "@/lib/evuddyKnowledge";
import {
  fleetInvestmentFaqEnglish,
  fleetInvestmentFaqHindi,
} from "@/lib/fleetInvestment";
import { llmChat, llmConfigured } from "@/lib/llmChat";
import { wantsOwnAccountHelp } from "@/lib/riderAssistantHelp";

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
  /\b(how|what|explain|tell me|steps|kya|kaise|about|info)\b|कैसे|क्या|बताओ|बता|समझाओ|कसा|कसे|எப்படி|ఎలా|কিভাবে|કેવી|ಕೇಗೆ|എങ്ങനെ/;
const OPEN_CMD =
  /\b(open|take me|go to|navigate|book now|start booking|show)\b|खोलो|खोल दो|बुक करो|बुकिंग खोलो|ले चलो|दिखाओ|खोलें/;

const GREETING =
  /^(hi|hello|hey|hii|hlo|namaste|namaskar|yo|sup|ok|okay|yes|yeah|haan|han|ji|hello!|hi!|hey!)[!.,\s]*$|^(नमस्ते|नमस्कार|हेलो|हैलो|हाय|हाँ|हां|जी|ठीक|अच्छा|ओके)[!।.?,\s]*$/i;

const FAQ: { keys: string[]; href?: string; en: string; hi: string }[] = [
  {
    keys: [
      "book",
      "how to",
      "start",
      "kyc",
      "register",
      "booking",
      "बुक",
      "बुकिंग",
      "रजिस्टर",
      "स्कूटर",
      "कैसे",
      "राइड",
    ],
    href: "/ride-options",
    en: "Book in four steps: (1) Register with phone OTP and finish KYC. (2) Open Book EV, pick city, hub and scooter. (3) Pay rent + 5% GST + refundable deposit with Razorpay, or wallet if you have balance. (4) Show the pickup OTP at the hub. I can open ride options — I cannot take payment.",
    hi: "बिल्कुल! स्कूटर बुक करना आसान है — चार साफ़ कदम:\n1) फोन OTP से रजिस्टर करें और KYC पूरा करें।\n2) Book EV खोलें — शहर, हब और स्कूटर चुनें।\n3) किराया + 5% GST + जमा (आमतौर पर ₹2,500) Razorpay या वॉलेट से दें।\n4) हब पर Pickup OTP दिखाएँ — यार्ड अनलॉक करेगा।\nमैं पेज खोल दूँगी, पैसे या OTP नहीं लूँगी। और कुछ पूछना है?",
  },
  {
    keys: [
      "rate",
      "rates",
      "price",
      "prices",
      "hourly",
      "daily",
      "weekly",
      "monthly",
      "cost",
      "₹",
      "rs",
      "किराया",
      "रेट",
      "दाम",
      "फीस",
      "charges",
    ],
    href: "/book-bike?flow=rental",
    en: "Listed rates (a scooter can differ): Hourly ₹60, Daily ₹230, Weekly ₹1,610, Monthly ₹6,900, plus 5% GST. Rentals also take a refundable security deposit (usually ₹2,500).",
    hi: "किराया साफ़ है (स्कूटर के हिसाब से थोड़ा बदल सकता है):\n• घंटे का — ₹60\n• दिन का — ₹230\n• हफ़्ते का — ₹1,610\n• महीने का — ₹6,900\nइस पर 5% GST लगता है। सामान्य किराये पर आमतौर पर ₹2,500 जमा (वापस मिलने वाला) भी होता है। Book EV पर लाइव स्कूटर देख सकते हैं।",
  },
  {
    keys: ["deposit", "wallet", "refund", "जमा", "वॉलेट", "रिफंड", "डिपॉजिट", "security"],
    href: "/refund-policy",
    en: "The security deposit is part of the booking payment, not a separate wallet charge. After you return the scooter, staff approve the refund. It usually credits your EVUDDY wallet. They can send it back on Razorpay instead — never both. I cannot refund or move money from this chat.",
    hi: "सिक्योरिटी डिपॉजिट बुकिंग पेमेंट का हिस्सा है — अलग से वॉलेट चार्ज नहीं। स्कूटर सही हालत में वापस करने के बाद स्टाफ रिफंड मंज़ूर करते हैं; आमतौर पर EVUDDY वॉलेट में आता है (या Razorpay — दोनों नहीं)। GST जमा पर नहीं लगता। मैं चैट से पैसे नहीं हिला सकती — पूरी नीति /refund-policy पर है।",
  },
  {
    keys: ["own", "rto", "installment", "18", "रेंट टू ओन", "अपना", "ownership", "किस्त"],
    href: "/rent-to-own",
    en: "Rent to Own is ₹280 + 5% GST every day for 18 months, no security deposit. You get a daily receipt. After successful days, ownership transfers.",
    hi: "Rent to Own मतलब स्कूटर धीरे-धीरे अपना बनाना:\n• रोज़ ₹280 + 5% GST\n• 18 महीने\n• कोई सिक्योरिटी डिपॉजिट नहीं\n• रोज़ रसीद मिलती है\nपूरे सफल दिनों के बाद मालिकाना हक ट्रांसफर होता है। यह सामान्य किराये से अलग प्लान है — चाहें तो पेज खोल दूँ।",
  },
  {
    keys: ["razorpay", "pay", "upi", "card", "पेमेंट", "भुगतान", "gst", "payment"],
    href: "/book-bike",
    en: "UPI and cards go through Razorpay on the booking page. GST is 5% on rent (CGST 2.5% + SGST 2.5%). If your EVUDDY wallet has enough, you can pay from wallet there. I cannot collect payment or enter OTP for you.",
    hi: "पेमेंट Book EV पेज पर होता है — UPI/कार्ड Razorpay से। किराये पर 5% GST (CGST 2.5% + SGST 2.5%)। वॉलेट में बैलेंस हो तो वहीं से भी पे कर सकते हैं। मैं चैट में भुगतान या OTP नहीं ले सकती — सुरक्षित बटन वहीँ यूज़ करें।",
  },
  {
    keys: ["hub", "city", "lucknow", "where", "हब", "शहर", "लखनऊ", "office", "address", "ऑफिस", "पता"],
    href: "/book-bike?flow=rental",
    en: "Pick your city and hub on the booking page so you collect the scooter from that hub. Corporate office: Summit Building, 7th Floor, Vibhuti Khand, Gomti Nagar, Lucknow.",
    hi: "स्कूटर उसी हब से मिलेगा जो आप Book EV पर चुनेंगे — शहर और हब चुनकर आगे बढ़ें। कॉर्पोरेट ऑफिस: Summit Building, 7th Floor, विभूति खंड, गोमती नगर, लखनऊ (226010)।",
  },
  {
    keys: [
      "contact",
      "help",
      "ticket",
      "support",
      "email",
      "phone",
      "helpdesk",
      "संपर्क",
      "मदद",
      "हेल्प",
      "टिकट",
      "शिकायत",
      "complaint",
    ],
    href: "/contact",
    en: "Helpdesk: helpdesk@kebuone.in or +91 8726006512, or use the contact page. After you pay, Book EV has Need help? for pickup or mid-ride issues — that creates a support ticket staff see on Support.",
    hi: "मदद के तीन आसान रास्ते:\n1) हेल्पडेस्क — helpdesk@kebuone.in या +91 8726006512\n2) संपर्क फॉर्म — /contact\n3) पेमेंट के बाद Book EV पर “Need help?” — बुकिंग वाला सपोर्ट टिकट बनता है (पिकअप, बैटरी, ब्रेकडाउन आदि)।",
  },
  {
    keys: ["pickup", "otp", "unlock", "yard", "पिकअप", "ओटीपी", "अनलॉक", "ride end", "ride started", "शुरू"],
    href: "/book-bike",
    en: "After your first payment (≥ ₹1), Book EV shows a Pickup OTP. Tell it to the yard. They unlock the scooter. Then swipe Ride started. For ride end: remaining rent ₹0, return to yard, swipe Ride end, tell that OTP to the yard. I cannot enter OTP for you.",
    hi: "पिकअप फ्लो:\n1) पहली पेमेंट (≥ ₹1) के बाद Book EV पर Pickup OTP दिखेगा।\n2) हब/यार्ड पर OTP बताएँ — वे अनलॉक करेंगे।\n3) फिर “Ride started” स्वाइप करें।\nराइड खत्म: बाकी किराया ₹0 करें → यार्ड लौटें → “Ride end” → OTP बताएँ। OTP मैं चैट में नहीं डाल सकती।",
  },
  {
    keys: [
      "invest",
      "investment",
      "partner",
      "fleet partner",
      "roi",
      "return",
      "profit",
      "poster",
      "इन्वेस्ट",
      "पार्टनर",
      "निवेश",
      "मुनाफा",
      "रिटर्न",
      "पोस्टर",
      "60%",
      "साठ",
      "फ्लीट",
    ],
    href: "/partners#investment-poster",
    en: fleetInvestmentFaqEnglish(),
    hi: fleetInvestmentFaqHindi(),
  },
  {
    keys: ["leadership", "ceo", "chairman", "team", "लीडरशिप", "टीम", "फाउंडर", "founder"],
    href: "/Leadership",
    en: "Leadership posters: Chairman Anjali Mishra, Founder & CEO Sunil Pathak, General Manager Bindu Singh. Team posters include SDE Anand Dhar Dwivedi, Admin & Front Desk Aanya Singh, and Graphic Designer Akanksha Maurya.",
    hi: "EVUDDY लीडरशिप:\n• चेयरमैन — अंजलि मिश्रा\n• फाउंडर व CEO — सुनील पाठक\n• GM — बिंदू सिंह\nटीम में SDE आनंद धर द्विवेदी, Admin & Front Desk आन्या सिंह, Graphic Designer आकांक्षा मौर्य। पोस्टर /Leadership पर देखें।",
  },
  {
    keys: ["career", "careers", "job", "hiring", "join", "करियर", "नौकरी", "जॉब", "vacancy"],
    href: "/careers",
    en: "Open Careers to apply. Roles span technology, operations, business, support, fleet, marketing, people and finance. You can also email helpdesk@kebuone.in.",
    hi: "नौकरी/करियर के लिए /careers पर अप्लाई करें — टेक्नोलॉजी, ऑप्स, बिज़नेस, सपोर्ट, फ्लीट, मार्केटिंग आदि। ईमेल भी कर सकते हैं: helpdesk@kebuone.in।",
  },
  {
    keys: ["vision", "mission", "about", "विजन", "मिशन", "अबाउट", "कंपनी", "company", "evuddy क्या", "what is"],
    href: "/vision",
    en: "Mission: make electric mobility affordable, accessible, and asset-building. Vision: empower gig workers and businesses with sustainable transport so every ride can lead to ownership. More on /vision and /about.",
    hi: "EVUDDY स्मार्ट इलेक्ट्रिक स्कूटर किराया + Rent to Own + फ्लीट पार्टनर प्लेटफ़ॉर्म है।\nमिशन: इलेक्ट्रिक मोबिलिटी सस्ती, सुलभ और एसेट-बिल्डिंग।\nविजन: गिग वर्कर्स व बिज़नेस के लिए सस्टेनेबल ट्रांसपोर्ट — हर राइड ओनरशिप तक ले जा सके। और पढ़ें /vision व /about।",
  },
  {
    keys: ["segment", "b2b", "b2c", "fleet", "business", "सेगमेंट", "व्यापार"],
    href: "/partners",
    en: "EVUDDY serves B2C rentals, Rent to Own, and B2B/fleet partners who invest or operate scooters. Riders book on Book EV; partners apply on /partners.",
    hi: "EVUDDY तीन तरह से काम करती है:\n1) B2C किराया — Book EV\n2) Rent to Own — अपना स्कूटर\n3) B2B/फ्लीट पार्टनर निवेश — /partners\nआप किस बारे में जानना चाहते हैं?",
  },
  {
    keys: ["privacy", "policy", "terms", "शर्त", "प्राइवेसी", "नियम", "कानून"],
    href: "/terms-and-conditions",
    en: "See /privacy-policy, /terms-and-conditions and /refund-policy for full legal text. High level: GST on rent, deposit rules on rentals, RTO is installment-based with no deposit.",
    hi: "कानूनी डिटेल इन पेजों पर है:\n• प्राइवेसी — /privacy-policy\n• नियम व शर्तें — /terms-and-conditions\n• रिफंड — /refund-policy\nसंक्षेप: किराये पर GST, जमा किराये पर लागू, Rent to Own में डिपॉजिट नहीं।",
  },
  {
    keys: ["hours", "timing", "open", "समय", "खुला", "टाइमिंग", "office hours"],
    href: "/book-bike",
    en: "Pickup and return follow the hub you choose on Book EV. The corporate office in Gomti Nagar is HQ, not a walk-in scooter counter unless that hub is listed on Book EV.",
    hi: "स्कूटर उसी हब के समय पर मिलता/वापस होता है जो आप Book EV पर चुनते हैं। गोमती नगर ऑफिस मुख्यालय है — वहाँ तभी जाएँ जब Book EV पर वही हब दिखे।",
  },
  {
    keys: ["kyc pending", "approval", "मंज़ूरी", "पेंडिंग", "waiting", "इंतज़ार", "verify"],
    href: "/register",
    en: "After you submit KYC, staff must approve before booking is enabled. Eva cannot approve KYC. If you are signed in, ask “मेरा KYC?” for your status.",
    hi: "KYC जमा करने के बाद स्टाफ मंज़ूरी देते हैं — बिना मंज़ूरी बुकिंग नहीं खुलती। मैं KYC पास नहीं कर सकती। साइन-इन हों तो पूछें “मेरा KYC?” — अपना स्टेटस बता दूँगी।",
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

function isGreetingOrAck(question: string) {
  const q = question.trim();
  if (q.length <= 24 && GREETING.test(q)) return true;
  if (/^(hi|hello|hey|namaste|नमस्ते)\b/i.test(q) && q.length < 40) return true;
  return false;
}

export function publicAssistantIntent(question: string, language = "hi"): AssistantReply | null {
  const q = question.toLowerCase();
  if (wantsBlockedAction(q)) {
    return {
      answer: bilingual(
        language,
        question,
        "I cannot take payment, enter OTP, unlock a scooter, or issue a refund. Use the buttons on Book EV or ask hub staff / helpdesk@kebuone.in.",
        "मैं भुगतान, OTP, अनलॉक या रिफंड नहीं कर सकती। Book EV पर बटन इस्तेमाल करें या helpdesk@kebuone.in / +91 8726006512 पर बात करें।"
      ),
    };
  }

  if (HOW_TO.test(question) && !OPEN_CMD.test(q)) {
    return null;
  }

  if (/\b(rent to own|rto|own the scooter)\b/.test(q) || /रेंट टू ओन|अपना स्कूटर/.test(q)) {
    if (OPEN_CMD.test(q) || /खोल/.test(q)) {
      return {
        answer:
          "Rent to Own पेज खोल रही हूँ। भुगतान उसी पेज/बुकिंग फ्लो पर होगा — चैट में नहीं।",
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
      answer:
        "राइड विकल्प खोल रही हूँ। सामान्य बुकिंग या Rent to Own चुनें — भुगतान बुकिंग पेज पर होगा।",
      href: "/ride-options",
      navigate: true,
    };
  }

  if (OPEN_CMD.test(q) && (/\b(register|kyc|sign up)\b/.test(q) || /रजिस्टर|केवाईसी/.test(q))) {
    return {
      answer: "रजिस्ट्रेशन खोल रही हूँ। KYC वहीं पूरा करें — मैं मंज़ूर नहीं कर सकती।",
      href: "/register",
      navigate: true,
    };
  }

  if (
    (OPEN_CMD.test(q) || /संपर्क पेज/.test(q)) &&
    (/\b(contact|support|help desk|helpdesk|email)\b/.test(q) || /संपर्क|मदद/.test(q))
  ) {
    return {
      answer: "संपर्क पेज खोल रही हूँ — helpdesk@kebuone.in · +91 8726006512।",
      href: "/contact",
      navigate: true,
    };
  }

  if (
    OPEN_CMD.test(q) &&
    (/\b(partner|invest|fleet|investment|poster)\b/.test(q) || /पार्टनर|इन्वेस्ट|निवेश|पोस्टर/.test(q))
  ) {
    return {
      answer:
        "आधिकारिक फ्लीट पार्टनर निवेश पोस्टर और प्लान खोल रही हूँ। फॉर्म से आवेदन करें — चैट में पैसे नहीं लिए जाते।",
      href: "/partners#investment-poster",
      navigate: true,
    };
  }

  if (OPEN_CMD.test(q) && (/\b(career|careers|job)\b/.test(q) || /करियर|नौकरी/.test(q))) {
    return {
      answer: "Careers पेज खोल रही हूँ — वहीं अप्लाई करें।",
      href: "/careers",
      navigate: true,
    };
  }

  if (OPEN_CMD.test(q) && (/\b(vision|mission|about)\b/.test(q) || /विजन|मिशन|अबाउट/.test(q))) {
    return {
      answer: "Vision पेज खोल रही हूँ।",
      href: "/vision",
      navigate: true,
    };
  }

  if (OPEN_CMD.test(q) && (/\b(leadership|team)\b/.test(q) || /लीडरशिप|टीम/.test(q))) {
    return {
      answer: "Leadership पेज खोल रही हूँ।",
      href: "/Leadership",
      navigate: true,
    };
  }

  return null;
}

export function faqAnswer(question: string, language = "hi"): AssistantReply {
  const q = question.toLowerCase();
  let best: { score: number; en: string; hi: string; href?: string } | null = null;
  for (const row of FAQ) {
    const score = row.keys.filter((key) => q.includes(key.toLowerCase())).length;
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

function greetingReply(): AssistantReply {
  return {
    answer:
      "नमस्ते! मैं Eva हूँ — EVUDDY की ChatGPT-स्टाइल हेल्प। बुकिंग, किराया, KYC, Rent to Own, फ्लीट निवेश पोस्टर, टिकट, लीडरशिप, करियर, विजन — कुछ भी आसान हिंदी में पूछें। सही पेज भी खोल दूँगी। भुगतान/OTP/अनलॉक चैट से नहीं होता। शुरू करें — जैसे “किराया कितना है?” या “निवेश प्लान बताओ।”",
  };
}

function directoryReply(): AssistantReply {
  return {
    answer:
      "मैं EVUDDY वेबसाइट की पूरी हेल्प हूँ। पूछ सकते हैं:\n• स्कूटर कैसे बुक करें / KYC\n• किराया व GST\n• Rent to Own (₹280/दिन, 18 महीने)\n• फ्लीट पार्टनर निवेश (60% आपका · पोस्टर)\n• सपोर्ट टिकट व हेल्पडेस्क\n• लीडरशिप, करियर, विजन\nसीधे कहें — “बुकिंग खोलो”, “पार्टनर खोलो”, या अपना सवाल लिखें/बोलें। हेल्पडेस्क: helpdesk@kebuone.in · +91 8726006512।",
    href: "/ride-options",
  };
}

async function llmAnswer(history: ChatTurn[], question: string, faqHint?: string) {
  const system = `You are Eva — EVUDDY's futuristic, ChatGPT-grade in-app assistant for https://www.evuddy.com.

PERSONA
- You are Eva, a capable female concierge for EVUDDY — warm, sharp, never robotic.
- Speak like a helpful colleague in simple everyday Hindi (देवनागरी). Short paragraphs or clear bullets.
- Cover ANY public website / EVUDDY question using ONLY the knowledge below (and FAQ hint). Do not invent hubs, live stock, secret prices, or policies.
- For Fleet Partner Investment always use official poster numbers (60% investor / 40% company, ₹87 profit/scooter/day, plans ₹1L→₹2,15,316 · ₹5L→₹10,76,580 · ₹10L→₹21,53,160 over 42 months) and mention /partners#investment-poster.
- You may suggest opening: /ride-options /book-bike /rent-to-own /register /contact /partners#investment-poster /careers /vision /Leadership /about /refund-policy /terms-and-conditions /privacy-policy.
- Never take payments, enter OTP, unlock scooters, approve KYC/refunds, or change bookings. Refuse those and send to website buttons or helpdesk@kebuone.in / +91 8726006512.
- If the user only greets or says हाँ/ठीक, welcome them and offer 2–3 concrete things you can help with.
- Keep answers under ~180 Hindi words. Product names (EVUDDY, Book EV, Rent to Own, Razorpay, OTP, KYC, GST) and ₹ amounts may stay in Latin script.
- NEVER reply in English paragraphs. Hindi only.

KNOWLEDGE:
${EVUDDY_KNOWLEDGE}
${faqHint ? `\nFAQ HINT (rephrase naturally in Hindi, do not ignore facts):\n${faqHint}` : ""}`;

  return llmChat({
    system,
    messages: [
      ...history.slice(-8).map((turn) => ({
        role: turn.role as "user" | "assistant",
        content: clean(turn.content),
      })),
      {
        role: "user",
        content: `उपयोगकर्ता का संदेश (अंग्रेज़ी हो तो भी जवाब सिर्फ आसान हिंदी में ChatGPT जैसे दें): ${question}`,
      },
    ],
    maxTokens: 520,
    temperature: 0.45,
  });
}

export async function answerEvuddyQuestion(
  history: ChatTurn[],
  question: string,
  _language = "hi",
  ownAccount?: AssistantReply | null
): Promise<AssistantReply> {
  const language = "hi";
  const asked = clean(question);
  if (asked.length < 1) {
    return greetingReply();
  }

  if (isGreetingOrAck(asked)) {
    return greetingReply();
  }

  const intent = publicAssistantIntent(asked, language);
  if (intent) return intent;

  if (ownAccount && wantsOwnAccountHelp(asked)) {
    return ownAccount;
  }

  const faq = faqAnswer(asked, language);

  if (llmConfigured()) {
    try {
      const llm = await llmAnswer(history, asked, faq.answer || "");
      if (llm) {
        return {
          answer: llm.slice(0, 1400),
          href: faq.href,
        };
      }
    } catch (error) {
      console.error("EVUDDY ASSISTANT LLM SKIPPED:", error);
    }
  }

  if (faq.answer && (faq.score || 0) >= 1) {
    return faq;
  }

  // Soft match: if question mentions EVUDDY / website / help, give directory.
  if (/\b(evuddy|website|site|help|help me|assist|जानकारी|वेबसाइट|मदद|बता)\b/i.test(asked)) {
    return directoryReply();
  }

  return directoryReply();
}

export function assistantConfigured() {
  return llmConfigured();
}
