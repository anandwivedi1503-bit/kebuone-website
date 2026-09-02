import { bilingual } from "@/lib/assistantCopy";
import { EVUDDY_KNOWLEDGE } from "@/lib/evuddyKnowledge";
import {
  fleetInvestmentFaqEnglish,
  fleetInvestmentFaqHindi,
} from "@/lib/fleetInvestment";
import { llmChat, llmConfigured } from "@/lib/llmChat";
import { wantsOwnAccountHelp, type EvaRiderSession } from "@/lib/riderAssistantIntent";

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
    hi: "बिल्कुल जी! स्कूटर बुक करना आसान है — चार साफ़ कदम:\n1) फोन OTP से रजिस्टर कीजिए, KYC पूरा कीजिए।\n2) Book EV खोलिए — शहर, हब और स्कूटर चुनिए।\n3) किराया + 5% GST + जमा (आमतौर पर ₹2,500) Razorpay या वॉलेट से दीजिए।\n4) हब पर Pickup OTP दिखाइए — यार्ड अनलॉक करेगा।\nमैं पेज खोल दूँगी, पैसे या OTP नहीं लूँगी। और कुछ पूछना है?",
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
    keys: ["leadership", "ceo", "chairman", "team", "लीडरशिप", "टीम", "फाउंडर", "founder", "anjali", "bindu", "sunil"],
    href: "/Leadership",
    en: "Leadership posters: Chairman Anjali Mishra, Founder & CEO Sunil Pathak, General Manager Bindu Singh. Team posters include SDE Anand Dhar Dwivedi, Admin & Front Desk Aanya Singh, and Graphic Designer Akanksha Maurya. Values: integrity, innovation, customer first, sustainability. Hashtag #safeRideWithEvuddy.",
    hi: "EVUDDY लीडरशिप (/Leadership):\n• चेयरमैन — अंजलि मिश्रा\n• फाउंडर व CEO — सुनील पाठक\n• GM — बिंदू सिंह\nटीम पोस्टर: SDE आनंद धर द्विवेदी, Admin & Front Desk आन्या सिंह, Graphic Designer आकांक्षा मौर्य। हैशटैग #safeRideWithEvuddy।",
  },
  {
    keys: ["career", "careers", "job", "hiring", "join", "करियर", "नौकरी", "जॉब", "vacancy", "apply"],
    href: "/careers",
    en: "Join on /careers: Technology, Operations, Business, Customer success, Fleet, Marketing, People, Finance. Steps: apply → review → conversation → offer. Form is on the Careers page; or email helpdesk@kebuone.in.",
    hi: "करियर /careers पर:\nटीमें — टेक्नोलॉजी, ऑप्स, बिज़नेस, कस्टमर सक्सेस, फ्लीट, मार्केटिंग, पीपल, फाइनेंस।\nकदम: अप्लाई → रिव्यू → बातचीत → ऑफर। फॉर्म उसी पेज पर है, या helpdesk@kebuone.in।",
  },
  {
    keys: ["about us", "about", "अबाउट", "कंपनी", "who we are", "हम कौन", "kebu one"],
    href: "/about",
    en: "About EVUDDY (/about): next-gen EV ecosystem — B2C rentals, B2B fleets/hubs, Rent to Own. Mission: affordable, accessible, asset-building. Live ops: KYC, OTP pickup, GPS, Razorpay. Catalog rates on that page match Book EV.",
    hi: "About Us (/about): EVUDDY भारत का EV मोबिलिटी इकोसिस्टम है — B2C किराया, B2B फ्लीट/हब, Rent to Own। मिशन: सस्ती, सुलभ, एसेट-बिल्डिंग मोबिलिटी। लाइव ऑप्स: KYC, OTP पिकअप, GPS, Razorpay। चाहें तो पेज खोल दूँ।",
  },
  {
    keys: ["vision", "mission", "विजन", "मिशन", "evuddy क्या", "asset-building"],
    href: "/vision",
    en: "Mission: make electric mobility affordable, accessible, and asset-building. Vision: empower gig workers and businesses with sustainable transport so every ride can lead to ownership. Values: Smart, Electric, Dependable, Asset-building. More on /vision.",
    hi: "विजन पेज (/vision):\nमिशन — इलेक्ट्रिक मोबिलिटी सस्ती, सुलभ, एसेट-बिल्डिंग।\nविजन — गिग वर्कर्स व बिज़नेस के लिए सस्टेनेबल ट्रांसपोर्ट; हर राइड ओनरशिप तक।\nमूल्य: Smart, Electric, Dependable, Asset-building। #safeRideWithEvuddy",
  },
  {
    keys: ["segment", "b2b", "b2c", "fleet", "business", "सेगमेंट", "व्यापार"],
    href: "/partners",
    en: "EVUDDY serves B2C rentals, Rent to Own, and B2B/fleet partners who invest or operate scooters. Riders book on Book EV; partners apply on /partners.",
    hi: "EVUDDY तीन तरह से काम करती है:\n1) B2C किराया — Book EV\n2) Rent to Own — अपना स्कूटर\n3) B2B/फ्लीट पार्टनर निवेश — /partners\nआप किस बारे में जानना चाहते हैं?",
  },
  {
    keys: ["privacy", "प्राइवेसी", "data", "personal data", "info@evuddy"],
    href: "/privacy-policy",
    en: "Privacy (/privacy-policy): we collect name, mobile, email, KYC, booking and payment records to run rentals and Rent to Own. Firebase verifies phone; Razorpay processes pay. We do not sell rider data. Profile correction: info@evuddy.com.",
    hi: "प्राइवेसी (/privacy-policy): नाम, मोबाइल, ईमेल, KYC, बुकिंग/पेमेंट रिकॉर्ड सेवा चलाने के लिए। फोन Firebase से, पेमेंट Razorpay से। राइडर डेटा नहीं बेचा जाता। प्रोफ़ाइल सुधार: info@evuddy.com।",
  },
  {
    keys: ["terms", "शर्त", "नियम", "कानून", "conditions", "t&c", "agreement"],
    href: "/terms-and-conditions",
    en: "Terms (/terms-and-conditions): complete KYC, follow hub pickup, pay rental or RTO dues. Rates + 5% GST on rent; deposit on normal rentals; RTO is ₹280/day + GST for 18 months with no deposit. Misuse, damage or unpaid dues can block booking.",
    hi: "नियम (/terms-and-conditions): KYC, हब पिकअप नियम, किराया/RTO भुगतान। किराये पर 5% GST; सामान्य किराये पर जमा; Rent to Own में डिपॉजिट नहीं। दुरुपयोग/नुकसान/बाकी बिल से बुकिंग ब्लॉक हो सकती है।",
  },
  {
    keys: [
      "range",
      "120",
      "speed",
      "45",
      "charging",
      "gps",
      "tracking",
      "specs",
      "specification",
      "रेंज",
      "स्पीड",
      "चार्जिंग",
      "ट्रैकिंग",
      "फीचर",
      "iot",
    ],
    href: "/",
    en: "Homepage scooter specs: about 120 km range, 45 km/h, ~4 hour charging, GPS live tracking, zero emissions. IoT on the scooter (GPS, lock, battery). Always pick a live hub on Book EV — I will not guess stock.",
    hi: "होमपेज पर स्कूटर:\n• रेंज करीब 120 km\n• स्पीड करीब 45 km/h\n• चार्जिंग करीब 4 घंटे\n• GPS लाइव ट्रैकिंग, IoT (लॉक/बैटरी)\nस्टॉक मैं नहीं गढ़ूँगी — Book EV पर शहर/हब चुनें।",
  },
  {
    keys: [
      "website",
      "pages",
      "sitemap",
      "homepage",
      "home page",
      "navbar",
      "वेबसाइट",
      "पेज",
      "होम",
      "साइट",
      "कौन से पेज",
    ],
    href: "/",
    en: "Public site: Home, Ride options, Book EV, Rent to Own, Register, Contact, Partners/Invest, About, Vision, Leadership, Careers, Privacy, Terms, Refund. Navbar also has Book EV and Invest. Staff dashboards are separate — I do not operate them.",
    hi: "पूरी पब्लिक वेबसाइट:\nहोम · राइड विकल्प · Book EV · Rent to Own · रजिस्टर/KYC · संपर्क · पार्टनर/निवेश · About · Vision · Leadership · Careers\nकानून: प्राइवेसी, टर्म्स, रिफंड।\nस्टाफ डैशबोर्ड अलग है — मैं वहाँ काम नहीं करती। कोई पेज खोलने को कहें।",
  },
  {
    keys: ["instagram", "youtube", "linkedin", "social", "hashtag", "saferide", "24x7", "24×7"],
    href: "/contact",
    en: "Footer: 24×7 customer support, Instagram @evuddy_bike / @kebuone, LinkedIn Kebu One, YouTube @kebuone. Brand hashtag #safeRideWithEvuddy. Helpdesk +91 8726006512.",
    hi: "फुटर: 24×7 सपोर्ट। Instagram @evuddy_bike व @kebuone, LinkedIn Kebu One, YouTube @kebuone। हैशटैग #safeRideWithEvuddy। फोन +91 8726006512।",
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

  if (OPEN_CMD.test(q) && (/\b(about)\b/.test(q) || /अबाउट|अबाउट अस|हमारे बारे/.test(q))) {
    return {
      answer: "About Us पेज खोल रही हूँ।",
      href: "/about",
      navigate: true,
    };
  }

  if (OPEN_CMD.test(q) && (/\b(vision|mission)\b/.test(q) || /विजन|मिशन/.test(q))) {
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

  if (OPEN_CMD.test(q) && (/\b(privacy)\b/.test(q) || /प्राइवेसी/.test(q))) {
    return {
      answer: "प्राइवेसी पॉलिसी खोल रही हूँ।",
      href: "/privacy-policy",
      navigate: true,
    };
  }

  if (OPEN_CMD.test(q) && (/\b(terms|conditions)\b/.test(q) || /नियम|शर्त/.test(q))) {
    return {
      answer: "नियम व शर्तें खोल रही हूँ।",
      href: "/terms-and-conditions",
      navigate: true,
    };
  }

  if (OPEN_CMD.test(q) && (/\b(refund policy)\b/.test(q) || /रिफंड पॉलिसी|रिफंड नीति/.test(q))) {
    return {
      answer: "रिफंड नीति खोल रही हूँ — रिफंड चैट से नहीं होता।",
      href: "/refund-policy",
      navigate: true,
    };
  }

  if (
    OPEN_CMD.test(q) &&
    (/\b(home|homepage|website)\b/.test(q) || /होम पेज|वेबसाइट खोल/.test(q))
  ) {
    return {
      answer: "होमपेज खोल रही हूँ — पूरी साइट वहीं से घूम सकते हैं।",
      href: "/",
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

function asRiderSession(
  value?: EvaRiderSession | AssistantReply | null
): EvaRiderSession | null {
  if (!value) return null;
  if ("statusAnswer" in value && typeof value.statusAnswer === "string") {
    return value;
  }
  const reply = value as AssistantReply;
  if (!reply.answer) return null;
  return {
    signedIn: true,
    stage: "legacy",
    firstName: "",
    isNewRider: false,
    canBook: true,
    briefing: reply.answer,
    href: reply.href || "/book-bike",
    statusAnswer: reply.answer,
  };
}

function greetingReply(session?: EvaRiderSession | null): AssistantReply {
  if (session?.statusAnswer) {
    return { answer: session.statusAnswer, href: session.href };
  }
  return {
    answer:
      "नमस्ते जी! मैं Eva हूँ — EVUDDY वाली। बोलचाल की हिंदी में सब समझती हूँ: बुकिंग, KYC, किराया, Rent to Own, निवेश, Careers, लीडरशिप। पेज भी खोल दूँगी। बस याद रखिए — पैसे, OTP, अनलॉक, रिफंड मैं नहीं कर सकती, वो Book EV के बटन पर है। पूछिए, “किराया कितना है?” या लॉगिन हों तो “मेरा अकाउंट कैसा है?”",
  };
}

function directoryReply(session?: EvaRiderSession | null): AssistantReply {
  const prefix = session?.firstName ? `${session.firstName} जी, ` : "";
  return {
    answer:
      `${prefix}पूरी साइट मैं संभालती हूँ। पूछ लीजिए:\n• स्कूटर कैसे बुक करें / KYC कहाँ तक है\n• किराया-GST, रेंज-स्पीड\n• Rent to Own ₹280/दिन\n• फ्लीट निवेश (60% आपका)\n• About, Vision, Leadership, Careers\n• संपर्क, 24×7 हेल्पडेस्क\nबोलिए “बुकिंग खोलो” या अपना हाल। helpdesk@kebuone.in · +91 8726006512।`,
    href: session?.href || "/",
  };
}

async function llmAnswer(
  history: ChatTurn[],
  question: string,
  faqHint?: string,
  rider?: EvaRiderSession | null
) {
  const system = `You are Eva — EVUDDY's in-app humanoid concierge for https://www.evuddy.com.

PERSONA / HINDI
- You are Eva, a warm Indian woman (like a smart Lucknow/Delhi colleague, not a Sanskrit textbook and not an English bot).
- Reply only in natural spoken Hindi (देवनागरी). Short sentences. Use जी, ना, बस, चलिए, ज़रा, देखिए where it fits.
- Keep product words in Latin: EVUDDY, Book EV, Rent to Own, Razorpay, OTP, KYC, GST, GPS.
- Never write English paragraphs. Do not sound robotic ("मैं आपकी सहायता के लिए यहाँ हूँ").

THIS RIDER (private live snapshot — do not invent extra facts, do not ignore it):
${rider?.briefing || "Not signed in (or no profile). Talk as a guest. If they ask 'my booking/KYC', tell them to login with phone OTP on /ride-options then complete /register."}

RULES
- Cover ANY public website question using ONLY the knowledge below (and FAQ hint): Home, Ride options, Book EV, Rent to Own, Register, Contact, Partners/Invest, About, Vision, Leadership, Careers, Privacy, Terms, Refund.
- If the rider is new / KYC pending / rejected / blocked, say that clearly in Hindi and give the next real button. You cannot approve KYC.
- If they have a live booking, explain ride/payment status and the next Book EV button. NEVER read or ask them to paste Pickup/Ride-end OTP here. NEVER take payment or unlock.
- Do not invent hubs, live stock, secret prices, unnamed staff, or dashboard steps.
- Fleet Partner Investment: official poster numbers only (60% investor / 40% company, ₹87 profit/scooter/day, plans ₹1L→₹2,15,316 · ₹5L→₹10,76,580 · ₹10L→₹21,53,160 over 42 months) and /partners#investment-poster.
- You may suggest opening: / /ride-options /book-bike /rent-to-own /register /contact /partners#investment-poster /careers /vision /Leadership /about /refund-policy /terms-and-conditions /privacy-policy.
- Keep answers under ~180 Hindi words.

KNOWLEDGE:
${EVUDDY_KNOWLEDGE}
${faqHint ? `\nFAQ HINT (rephrase in spoken Hindi, do not ignore facts):\n${faqHint}` : ""}`;

  return llmChat({
    system,
    messages: [
      ...history.slice(-8).map((turn) => ({
        role: turn.role as "user" | "assistant",
        content: clean(turn.content),
      })),
      {
        role: "user",
        content: `देसी बोलचाल हिंदी में जवाब दीजिए, अंग्रेज़ी पैराग्राफ नहीं। सवाल: ${question}`,
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
  ownAccount?: EvaRiderSession | AssistantReply | null
): Promise<AssistantReply> {
  const language = "hi";
  const asked = clean(question);
  const rider = asRiderSession(ownAccount);

  if (asked.length < 1 || isGreetingOrAck(asked)) {
    return greetingReply(rider);
  }

  const intent = publicAssistantIntent(asked, language);
  if (intent) return intent;

  if (rider && wantsOwnAccountHelp(asked)) {
    return { answer: rider.statusAnswer, href: rider.href };
  }

  if (
    rider &&
    !rider.canBook &&
    /बुक|book|kyc|केवाईसी|रजिस्टर|register|राइड|scooter/i.test(asked)
  ) {
    return { answer: rider.statusAnswer, href: rider.href };
  }

  const faq = faqAnswer(asked, language);

  if (llmConfigured()) {
    try {
      const llm = await llmAnswer(history, asked, faq.answer || "", rider);
      if (llm) {
        return {
          answer: llm.slice(0, 1400),
          href: faq.href || rider?.href,
        };
      }
    } catch (error) {
      console.error("EVUDDY ASSISTANT LLM SKIPPED:", error);
    }
  }

  if (faq.answer && (faq.score || 0) >= 1) {
    if (rider?.firstName) {
      return {
        ...faq,
        answer: `${rider.firstName} जी, ${faq.answer}`,
      };
    }
    return faq;
  }

  if (/\b(evuddy|website|site|help|help me|assist|जानकारी|वेबसाइट|मदद|बता)\b/i.test(asked)) {
    return directoryReply(rider);
  }

  return rider ? { answer: rider.statusAnswer, href: rider.href } : directoryReply();
}

export function assistantConfigured() {
  return llmConfigured();
}
