import assert from "node:assert/strict";

import {
  DIRECT_THROUGH,
  normalizeComingThrough,
  partnerMatchesSegment,
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

console.log("partner-segments-selftest: ok");
