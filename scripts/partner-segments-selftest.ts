import assert from "node:assert/strict";

import {
  DIRECT_THROUGH,
  normalizeComingThrough,
  partnerMatchesSegment,
  riderMatchesNetwork,
} from "../src/lib/partnerSegments";

assert.equal(
  normalizeComingThrough({ comingThrough: "Zomato", partnerType: "EVUDDY Dealer" }),
  "Zomato"
);
assert.equal(
  normalizeComingThrough({ partnerType: "Flipkart Minutes Partner" }),
  "Flipkart Minutes"
);
assert.equal(normalizeComingThrough({ partnerType: "EVUDDY Dealer" }), DIRECT_THROUGH);
assert.equal(
  partnerMatchesSegment({ comingThrough: "Blinkit", partnerType: "Fleet Partner" }, "BLINKIT"),
  true
);
assert.equal(
  partnerMatchesSegment({ comingThrough: "Blinkit", partnerType: "EVUDDY Dealer" }, "DEALER"),
  true
);
assert.equal(
  partnerMatchesSegment({ comingThrough: "Direct / EVUDDY", partnerType: "EVUDDY Dealer" }, "ZOMATO"),
  false
);

assert.equal(
  riderMatchesNetwork({ comingThrough: "Zomato" }, "ZOMATO"),
  true
);
assert.equal(
  riderMatchesNetwork({ comingThrough: "" }, "DIRECT"),
  true
);
assert.equal(
  riderMatchesNetwork({ comingThrough: "Swiggy" }, "DIRECT"),
  false
);

console.log("partner-segments-selftest: ok");
