import crypto from "crypto";
import type { ClientSession } from "mongoose";

import Booking from "@/models/Booking";
import Wallet from "@/models/Wallet";
import WalletTransaction from "@/models/WalletTransaction";

type BookingHoldDoc = {
  bookingId: string;
  riderId?: string;
  userId?: unknown;
  userName?: string;
  securityDeposit?: number;
  securityDepositHoldReleased?: boolean;
};

/** Release wallet deposit hold at most once per booking (ride-end, cancel, or refund). */
export async function releaseSecurityDepositHoldOnce(
  booking: BookingHoldDoc,
  session?: ClientSession | null,
  remarks = "Security deposit hold released"
) {
  const amount = Number(booking.securityDeposit || 0);
  const bookingId = String(booking.bookingId || "").trim();
  const riderId = String(booking.riderId || "").trim();
  if (amount <= 0 || !bookingId || !riderId) return false;

  const claimed = await Booking.findOneAndUpdate(
    {
      bookingId,
      securityDepositHoldReleased: { $ne: true },
    },
    { $set: { securityDepositHoldReleased: true } },
    { new: true, ...(session ? { session } : {}) }
  );
  if (!claimed) {
    booking.securityDepositHoldReleased = true;
    return false;
  }

  booking.securityDepositHoldReleased = true;

  const wallet = session
    ? await Wallet.findOne({ riderId }).session(session)
    : await Wallet.findOne({ riderId });
  if (wallet) {
    wallet.securityDepositHold = Math.max(
      0,
      Number(wallet.securityDepositHold || 0) - amount
    );
    await wallet.save(session ? { session } : {});
  }

  const existingRelease = session
    ? await WalletTransaction.findOne({
        bookingId,
        transactionType: "Security Deposit Release",
      }).session(session)
    : await WalletTransaction.findOne({
        bookingId,
        transactionType: "Security Deposit Release",
      });
  if (existingRelease) return true;

  const row = {
    transactionId: `WTX-${crypto.randomUUID().replace(/-/g, "").slice(0, 24).toUpperCase()}`,
    riderId,
    userId: booking.userId,
    userName: booking.userName,
    bookingId,
    amount,
    paymentMethod: "Wallet",
    transactionType: "Security Deposit Release",
    balanceAfter: Number(wallet?.balance || 0),
    remarks,
    status: "Success",
  };
  if (session) {
    await WalletTransaction.create([row], { session });
  } else {
    await WalletTransaction.create(row);
  }
  return true;
}
