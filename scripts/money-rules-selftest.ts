import assert from "node:assert/strict";

import {
  bookingPaymentApplyFilter,
  nextPaymentProgress,
} from "../src/lib/bookingPaymentProgress";
import {
  rtoCycleAfterInstallment,
  rtoDailyPayable,
} from "../src/lib/rtoInstallmentCycle";
import { totpCode, totpMatches } from "../src/lib/totp";
import { redactOpsText } from "../src/lib/redactOpsPii";
import { firebaseUserOwnsRider } from "../src/lib/riderOwnership";
import { sessionHubScope, staffCanAccessBooking } from "../src/lib/staffHubScope";
import { providedSecretMatches } from "../src/lib/timingSafe";
import { listResponse, listResponseFromPage, parseListQuery } from "../src/lib/listQuery";
import { existingDepositRefundFilter } from "../src/lib/queueDepositRefund";
import { existingCancellationRefundFilter } from "../src/lib/queueCancellationRefund";
import { clientIp } from "../src/lib/rateLimit";
import {
  bookingEligibleForReview,
  clampStars,
  defaultReviewStatus,
  riderPublicDisplayName,
  sanitizeReviewComment,
} from "../src/lib/reviews";

const unpaid = nextPaymentProgress({ rideStatus: "Booked" }, 0, 2000);
assert.equal(unpaid.pickupOTP, undefined);
assert.notEqual(unpaid.rideStatus, "Ready For Pickup");

const partial = nextPaymentProgress({ rideStatus: "Booked" }, 500, 1500);
assert.equal(partial.paymentStatus, "Partial");
assert.equal(partial.rideStatus, "Ready For Pickup");
assert.ok(partial.pickupOTP);
assert.equal(partial.vehicleStatus, "Ready For Pickup");

const reuse = nextPaymentProgress(
  { rideStatus: "Ready For Pickup", pickupOTP: "654321", pickupOTPExpiry: new Date() },
  800,
  1200
);
assert.equal(reuse.pickupOTP, "654321");

const paid = nextPaymentProgress({ rideStatus: "Ready For Pickup", pickupOTP: "111111" }, 2000, 0);
assert.equal(paid.paymentStatus, "Paid");
assert.ok(paid.pickupOTP);

const inRide = nextPaymentProgress(
  { rideStatus: "In Ride", pickupOTPVerified: true },
  500,
  1500
);
assert.equal(inRide.rideStatus, "In Ride");
assert.equal(inRide.pickupOTP, undefined);

const filter = bookingPaymentApplyFilter("abc", 500, 200) as {
  $and?: Array<{ receivedAmount?: number }>;
};
assert.equal(filter.$and?.[0]?.receivedAmount, 500);

const rtoOpen = rtoCycleAfterInstallment(
  {
    rentalMode: "Rent To Own",
    remainingRentToOwnDays: 10,
    rtoInstallmentsPaid: 2,
    rentToOwnCompletedDays: 2,
  },
  0,
  rtoDailyPayable() * 3
);
assert.equal(rtoOpen.paymentStatus, "Partial");
assert.equal(rtoOpen.ownershipTransferred, undefined);

const rtoDone = rtoCycleAfterInstallment(
  {
    rentalMode: "Rent To Own",
    remainingRentToOwnDays: 1,
    rtoInstallmentsPaid: 547,
    rentToOwnCompletedDays: 547,
  },
  0,
  99999
);
assert.equal(rtoDone.ownershipTransferred, true);
assert.equal(rtoDone.paymentStatus, "Paid");

assert.equal(
  sessionHubScope({ role: "super", username: "superadmin", dashboards: [] }),
  null
);
assert.deepEqual(
  sessionHubScope({ role: "staff", username: "yard", dashboards: ["bookings"] }),
  []
);
assert.equal(
  staffCanAccessBooking(
    { role: "staff", username: "yard", dashboards: ["bookings"] },
    { currentHub: "NOIDA-01" }
  ),
  false
);
assert.deepEqual(
  sessionHubScope({
    role: "staff",
    username: "yard",
    dashboards: ["bookings"],
    hubs: ["noida-01"],
  }),
  ["NOIDA-01"]
);
assert.equal(
  staffCanAccessBooking(
    { role: "staff", username: "yard", dashboards: ["bookings"], hubs: ["NOIDA-01"] },
    { currentHub: "NOIDA-01" }
  ),
  true
);
assert.equal(
  staffCanAccessBooking(
    { role: "staff", username: "yard", dashboards: ["bookings"], hubs: ["NOIDA-01"] },
    { currentHub: "DEL-02" }
  ),
  false
);
assert.equal(
  staffCanAccessBooking(
    { role: "super", username: "anand", dashboards: [] },
    { currentHub: "DEL-02" }
  ),
  true
);
assert.equal(
  staffCanAccessBooking(
    { role: "staff", username: "yard", dashboards: ["bookings"], hubs: ["NOIDA-01"] },
    { currentHub: "" }
  ),
  false
);

const secret = "JBSWY3DPEHPK3PXP";
assert.equal(totpMatches(secret, totpCode(secret)), true);
assert.equal(totpMatches(secret, "000000"), false);
assert.match(redactOpsText("Call 9876543210 or a@b.com"), /\*\*\*\*\*\*/);
assert.doesNotMatch(redactOpsText("Call 9876543210"), /9876543210/);

const unpaidFilter = bookingPaymentApplyFilter("x", 0, 100) as {
  $and?: Array<{ $or?: unknown }>;
};
assert.ok(unpaidFilter.$and?.[0]?.$or);

assert.equal(providedSecretMatches("cron-secret-value", "cron-secret-value"), true);
assert.equal(providedSecretMatches("cron-secret-value", "other"), false);
assert.equal(providedSecretMatches("", ""), false);

assert.equal(
  firebaseUserOwnsRider(
    { uid: "uid-a", phone: "9876543210" },
    { firebaseUid: "uid-a", phone: "9876543210" }
  ),
  true
);
assert.equal(
  firebaseUserOwnsRider(
    { uid: "uid-b", phone: "9876543210" },
    { firebaseUid: "uid-a", phone: "9876543210" }
  ),
  false
);
assert.equal(
  firebaseUserOwnsRider(
    { uid: "uid-b", phone: "9876543210" },
    { phone: "9876543210" }
  ),
  true
);

const listPage = parseListQuery(
  new Request("https://www.evuddy.com/api/bookings?limit=80&page=1")
);
assert.equal(listPage.limit, 80);
assert.equal(listPage.page, 1);
assert.equal(listResponse(["a"], 200, 1, 80).pagination.hasMore, true);
assert.equal(listResponse(["a"], 80, 1, 80).pagination.hasMore, false);
assert.equal(listResponseFromPage(new Array(81).fill("x"), 1, 80).pagination.hasMore, true);
assert.equal(listResponseFromPage(new Array(81).fill("x"), 1, 80).data.length, 80);
assert.equal(listResponseFromPage(new Array(80).fill("x"), 1, 80).pagination.hasMore, false);

const depositFilter = existingDepositRefundFilter("BK-1") as {
  bookingId: string;
  $or: Array<{ refundSource?: string }>;
};
assert.equal(depositFilter.bookingId, "BK-1");
assert.equal(depositFilter.$or[0]?.refundSource, "Security Deposit");

const cancelFilter = existingCancellationRefundFilter("BK-2") as {
  bookingId: string;
  refundSource: string;
};
assert.equal(cancelFilter.bookingId, "BK-2");
assert.equal(cancelFilter.refundSource, "Booking Cancellation");

assert.equal(
  clientIp(
    new Request("https://www.evuddy.com", {
      headers: { "x-forwarded-for": "1.1.1.1, 10.0.0.1" },
    })
  ),
  "10.0.0.1"
);
assert.equal(
  clientIp(
    new Request("https://www.evuddy.com", {
      headers: {
        "x-forwarded-for": "1.1.1.1, 10.0.0.1",
        "x-real-ip": "10.0.0.9",
      },
    })
  ),
  "10.0.0.9"
);

assert.equal(clampStars(7), 5);
assert.equal(clampStars(0), 0);
assert.equal(clampStars("3.2"), 3);
assert.equal(defaultReviewStatus(5), "Published");
assert.equal(defaultReviewStatus(3), "Pending");
assert.equal(riderPublicDisplayName("Anand Dhar Dwivedi"), "Anand D.");
assert.equal(sanitizeReviewComment("  nice ride http://spam.example  "), "nice ride");
assert.equal(bookingEligibleForReview({ rideStatus: "Completed" }), true);
assert.equal(bookingEligibleForReview({ rideStatus: "In Ride" }), false);
assert.equal(
  bookingEligibleForReview({
    rideStatus: "In Ride",
    rentalMode: "Rent To Own",
    receivedAmount: 280,
  }),
  true
);

console.log("money-rules self-test ok");
