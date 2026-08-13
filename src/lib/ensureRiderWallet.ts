import mongoose from "mongoose";

import Wallet from "@/models/Wallet";

type RiderWalletSeed = {
  _id: mongoose.Types.ObjectId;

  riderId: string;

  fullName: string;

  phone: string;

  approvalStatus?: string;

  kycStatus?: string;

  status?: string;

  bookingEnabled?: boolean;

  blacklisted?: boolean;
};

function resolveInitialWalletStatus(
  rider: RiderWalletSeed
): "Active" | "Blocked" {
  const eligible =
    rider.approvalStatus === "Approved" &&
    rider.kycStatus === "Approved" &&
    rider.status === "Active" &&
    rider.bookingEnabled === true &&
    rider.blacklisted !== true;

  return eligible ? "Active" : "Blocked";
}

export class RiderWalletError extends Error {
  code: "CLOSED_WALLET_EXISTS" | "WALLET_ALREADY_EXISTS";

  constructor(
    code: "CLOSED_WALLET_EXISTS" | "WALLET_ALREADY_EXISTS",
    message: string
  ) {
    super(message);
    this.code = code;
  }
}

export async function ensureRiderWallet(
  rider: RiderWalletSeed,
  updatedBy = "System"
) {
  const activeWallet = await Wallet.findOne({
    riderId: rider.riderId,
    $or: [
      { isDeleted: false },
      { isDeleted: { $exists: false } },
    ],
  });

  if (activeWallet) {
    return activeWallet;
  }

  const closedWallet = await Wallet.findOne({
    riderId: rider.riderId,
    isDeleted: true,
  }).select("_id");

  if (closedWallet) {
    throw new RiderWalletError(
      "CLOSED_WALLET_EXISTS",
      "A closed wallet already exists for this rider."
    );
  }

  try {
    return await Wallet.create({
      riderId: rider.riderId,
      userId: rider._id,
      userName: rider.fullName,
      phone: rider.phone,
      balance: 0,
      securityDepositHold: 0,
      freezeAmount: 0,
      totalRecharge: 0,
      totalSpent: 0,
      totalRefund: 0,
      status: resolveInitialWalletStatus(rider),
      adminBlocked: false,
      isDeleted: false,
      updatedBy,
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      Number((error as { code?: unknown }).code) === 11000
    ) {
      const existingWallet = await Wallet.findOne({
        riderId: rider.riderId,
        $or: [
          { isDeleted: false },
          { isDeleted: { $exists: false } },
        ],
      });

      if (existingWallet) {
        return existingWallet;
      }

      throw new RiderWalletError(
        "WALLET_ALREADY_EXISTS",
        "Wallet creation conflict occurred."
      );
    }

    throw error;
  }
}
