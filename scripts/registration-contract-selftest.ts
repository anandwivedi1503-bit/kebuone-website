import assert from "node:assert/strict";

import {
  normalizePickupCityAck,
  pickupCityAckError,
  readRegistrationClient,
} from "../src/lib/registrationContract";

const legacy = readRegistrationClient(new Headers());
const web = readRegistrationClient(new Headers({ "x-evuddy-client": "web" }));
const oldAppShape = readRegistrationClient(new Headers({ "x-evuddy-client": "app" }));
const newApp = readRegistrationClient(
  new Headers({
    "x-evuddy-client": "app",
    "x-evuddy-client-capabilities": "pickupCityAck",
  })
);

assert.equal(legacy.kind, "legacy");
assert.equal(legacy.asksPickupCity, false);
assert.equal(pickupCityAckError(normalizePickupCityAck(undefined), legacy), null);

assert.equal(web.asksPickupCity, true);
assert.match(
  pickupCityAckError(normalizePickupCityAck(""), web) || "",
  /Lucknow/
);
assert.equal(pickupCityAckError(normalizePickupCityAck("lucknow"), web), null);
assert.equal(pickupCityAckError(normalizePickupCityAck("OTHER"), web), null);

assert.equal(oldAppShape.asksPickupCity, false);
assert.equal(pickupCityAckError("", oldAppShape), null);

assert.equal(newApp.asksPickupCity, true);
assert.equal(pickupCityAckError(normalizePickupCityAck("nope"), newApp) === null, false);

console.log("registration-contract-selftest: ok");
