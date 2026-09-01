import assert from "node:assert/strict";

import { detectScriptLanguage } from "../src/lib/assistantLanguages";
import { faqAnswer, publicAssistantIntent } from "../src/lib/assistantReply";

assert.equal(publicAssistantIntent("How do I book a scooter?"), null);
assert.equal(publicAssistantIntent("स्कूटर कैसे बुक करें?"), null);
assert.equal(publicAssistantIntent("What are the rental rates?"), null);

const openBooking = publicAssistantIntent("open booking");
assert.equal(openBooking?.navigate, true);
assert.equal(openBooking?.href, "/ride-options");

const hindiOpen = publicAssistantIntent("बुकिंग खोलो");
assert.equal(hindiOpen?.navigate, true);

const blocked = publicAssistantIntent("pay now for me");
assert.ok(blocked?.answer);
assert.equal(blocked?.navigate, undefined);

const rates = faqAnswer("What are the rental rates?", "en");
assert.ok((rates.score || 0) >= 2);
assert.match(rates.answer, /230/);

const hindiBook = faqAnswer("स्कूटर कैसे बुक करें?", "hi");
assert.ok((hindiBook.score || 0) >= 2);
assert.match(hindiBook.answer, /KYC|कदम/);

assert.equal(detectScriptLanguage("नमस्ते स्कूटर बुक करें"), "hi");
assert.equal(detectScriptLanguage("तुम्ही कसे आहात"), "mr");
assert.equal(detectScriptLanguage("hello rates"), "en");

console.log("assistant self-test ok");
