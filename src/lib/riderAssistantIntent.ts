export type EvaRiderStage =
  | "phone_only"
  | "kyc_incomplete"
  | "under_review"
  | "rejected"
  | "suspended"
  | "blocked"
  | "ready_no_ride"
  | "in_ride"
  | "ready_pickup"
  | "payment_due"
  | "booked";

export type EvaRiderSession = {
  signedIn: boolean;
  stage: EvaRiderStage | "legacy";
  firstName: string;
  isNewRider: boolean;
  canBook: boolean;
  briefing: string;
  href: string;
  statusAnswer: string;
  bookingId?: string;
};

export function wantsFileSupportTicket(question: string) {
  const asked = question.trim();
  if (/कैसे|how to|क्या है|what is/i.test(asked)) return false;
  return /टिकट बना|शिकायत दर्ज|शिकायत कर|complaint|file a ticket|open a ticket|create a ticket|टिकट खोल|समस्या दर्ज|need help|help ticket|सपोर्ट टिकट/i.test(
    asked
  );
}

const WANTS_OWN_STATUS =
  /मेरी बुकिंग|मेरा राइड|मेरी राइड|my booking|pending amount|बाकी किराया|kyc status|मेरा kyc|मेरा केवाईसी|मेरी केवाईसी|approval status|ride status|स्टेटस|स्थिति|स्थिती|कहाँ है मेरी|कहां है मेरी|where is my|मेरा अकाउंट|मेरा खाता|booking status|पेमेंट बचा|नया रजिस्टर|नया हूँ|नया हुं|अभी नया|अब क्या करूँ|अब क्या करुं|अगला कदम|प्रोफ़ाइल|प्रोफाइल|लॉगिन|login status|मंज़ूरी|मंजूरी|अंडर रिव्यू|under review|मेरी स्थिति|राइडर आईडी|rider id/i;

export function wantsOwnAccountHelp(question: string) {
  return WANTS_OWN_STATUS.test(question.trim());
}
