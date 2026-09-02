import assert from "node:assert/strict";

import {
  bookingPaymentApplyFilter,
  nextPaymentProgress,
} from "../src/lib/bookingPaymentProgress";
import {
  rtoCycleAfterInstallment,
  rtoDailyPayable,
} from "../src/lib/rtoInstallmentCycle";
import { sessionHubScope, staffCanAccessBooking } from "../src/lib/staffHubScope";

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
assert.equal(
  sessionHubScope({ role: "staff", username: "yard", dashboards: ["bookings"] }),
  null
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

console.log("money-rules self-test ok");
