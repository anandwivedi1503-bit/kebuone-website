const WANTS_OWN_STATUS =
  /मेरी बुकिंग|my booking|मेरा राइड|मेरी राइड|pending amount|बाकी|kyc status|मेरा kyc|approval status|ride status|स्टेटस|कहाँ है मेरी|where is my|मेरा अकाउंट|booking status|पेमेंट बचा/i;

export function wantsOwnAccountHelp(question: string) {
  return WANTS_OWN_STATUS.test(question.trim());
}
