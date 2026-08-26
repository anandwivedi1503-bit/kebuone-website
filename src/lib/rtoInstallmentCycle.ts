import { gstBreakdown, money } from "@/lib/gst";
import { RTO_PLAN, rtoInstallment } from "@/lib/rentalPlans";

type RtoBooking = {
  rentalMode?: string;
  rentToOwnCompletedDays?: number;
  remainingRentToOwnDays?: number;
  rtoInstallmentsPaid?: number;
};

export function isRentToOwnBooking(booking: { rentalMode?: string }) {
  return String(booking.rentalMode || "") === "Rent To Own";
}

export function rtoInstallmentPayable() {
  return gstBreakdown(rtoInstallment()).totalWithGst;
}

export function rtoCycleAfterInstallment(
  booking: RtoBooking,
  pendingAfterThisPay: number,
  newReceivedAmount: number
) {
  if (!isRentToOwnBooking(booking) || pendingAfterThisPay > 0.009) {
    return {};
  }

  const remaining = Math.max(
    0,
    Number(booking.remainingRentToOwnDays || 0) - RTO_PLAN.billingDays
  );
  const patch: Record<string, unknown> = {
    rtoInstallmentsPaid: Number(booking.rtoInstallmentsPaid || 0) + 1,
    rentToOwnCompletedDays:
      Number(booking.rentToOwnCompletedDays || 0) + RTO_PLAN.billingDays,
    remainingRentToOwnDays: remaining,
  };

  if (remaining > 0) {
    const nextDue = rtoInstallmentPayable();
    patch.pendingAmount = 0;
    patch.paymentStatus = "Partial";
    patch.rtoNextInstallmentAmount = nextDue;
    patch.rtoNextInstallmentAt = new Date(
      Date.now() + RTO_PLAN.billingDays * 24 * 60 * 60 * 1000
    );
    patch.paymentDue = money(newReceivedAmount + nextDue);
  } else {
    patch.ownershipTransferred = true;
    patch.ownershipTransferredAt = new Date();
    patch.paymentStatus = "Paid";
    patch.pendingAmount = 0;
  }

  return patch;
}

type RtoOpenBooking = {
  rentalMode?: string;
  ownershipTransferred?: boolean;
  remainingRentToOwnDays?: number;
  pendingAmount?: number;
  receivedAmount?: number;
  paymentDue?: number;
  paymentStatus?: string;
  rtoNextInstallmentAt?: Date | string | null;
  rtoNextInstallmentAmount?: number;
  save?: () => Promise<unknown>;
};

export async function openDueRtoInstallment(booking: RtoOpenBooking) {
  if (!isRentToOwnBooking(booking) || booking.ownershipTransferred) {
    return booking;
  }
  if (Number(booking.pendingAmount || 0) > 0.009) {
    return booking;
  }
  if (Number(booking.remainingRentToOwnDays || 0) <= 0) {
    return booking;
  }
  const dueAt = booking.rtoNextInstallmentAt
    ? new Date(booking.rtoNextInstallmentAt)
    : null;
  if (dueAt && !Number.isNaN(dueAt.getTime()) && dueAt.getTime() > Date.now()) {
    return booking;
  }
  const nextDue =
    Number(booking.rtoNextInstallmentAmount || 0) > 0.009
      ? Number(booking.rtoNextInstallmentAmount)
      : rtoInstallmentPayable();
  booking.pendingAmount = nextDue;
  booking.paymentStatus = "Partial";
  booking.paymentDue = money(Number(booking.receivedAmount || 0) + nextDue);
  if (typeof booking.save === "function") {
    await booking.save();
  }
  return booking;
}
