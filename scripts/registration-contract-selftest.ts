import assert from "node:assert/strict";

import {
  enforcesHalfRentalFirstPayment,
  normalizePickupCityAck,
  pickupCityAckError,
  readRegistrationClient,
  registrationContract,
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
assert.match(
  pickupCityAckError(normalizePickupCityAck(undefined), legacy) || "",
  /Update the app/
);

assert.equal(web.asksPickupCity, true);
assert.match(
  pickupCityAckError(normalizePickupCityAck(""), web) || "",
  /Lucknow/
);
assert.equal(pickupCityAckError(normalizePickupCityAck("lucknow"), web), null);
assert.match(
  pickupCityAckError(normalizePickupCityAck("OTHER"), web) || "",
  /Lucknow pickups only/
);

assert.equal(oldAppShape.asksPickupCity, false);
assert.match(
  pickupCityAckError("", oldAppShape) || "",
  /Update the app/
);

assert.equal(newApp.asksPickupCity, true);
assert.equal(pickupCityAckError(normalizePickupCityAck("nope"), newApp) === null, false);
assert.equal(pickupCityAckError(normalizePickupCityAck("LUCKNOW"), newApp), null);
assert.notEqual(pickupCityAckError(normalizePickupCityAck("OTHER"), newApp), null);
assert.equal(registrationContract().requiredForNewRiders, true);
assert.equal(registrationContract().activeServiceCity, "Lucknow");

assert.equal(enforcesHalfRentalFirstPayment(new Headers()), true);
assert.equal(enforcesHalfRentalFirstPayment(new Headers({ "x-evuddy-client": "web" })), true);
assert.equal(enforcesHalfRentalFirstPayment(new Headers({ "x-evuddy-client": "app" })), true);
assert.equal(
  enforcesHalfRentalFirstPayment(
    new Headers({
      "x-evuddy-client": "app",
      "x-evuddy-client-capabilities": "pickupCityAck,firstPaymentHalfRental",
    })
  ),
  true
);

console.log("registration-contract-selftest: ok");
