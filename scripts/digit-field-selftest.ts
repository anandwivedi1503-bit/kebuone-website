import assert from "node:assert/strict";

import {
  digitFieldCap,
  digitFieldValue,
  isDigitInputField,
} from "../src/lib/digitField";

assert.equal(digitFieldValue("9876543210 extra"), "9876543210");
assert.equal(digitFieldValue("98765432109876", 10), "9876543210");
assert.equal(digitFieldValue("1234 5678 9012", 12), "123456789012");
assert.equal(digitFieldValue("1234-5678-9012"), "123456789012");
assert.equal(digitFieldValue("12 34 56", 6), "123456");

assert.equal(isDigitInputField({ inputMode: "numeric" }), true);
assert.equal(isDigitInputField({ type: "tel" }), true);
assert.equal(isDigitInputField({ numeric: true }), true);
assert.equal(isDigitInputField({ type: "text" }), false);

assert.equal(digitFieldCap({ type: "tel" }), 10);
assert.equal(digitFieldCap({ numeric: true }), 10);
assert.equal(digitFieldCap({}), undefined);
assert.equal(digitFieldCap({ maxDigits: 12 }), 12);

console.log("digit-field-selftest: ok");
