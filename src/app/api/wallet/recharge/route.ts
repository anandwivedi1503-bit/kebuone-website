import crypto from "crypto";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";

import Rider from "@/models/Rider";
import Wallet from "@/models/Wallet";
import WalletTransaction from "@/models/WalletTransaction";
import { ensureRiderWallet } from "@/lib/ensureRiderWallet";
import { NOT_DELETED_FILTER } from "@/lib/notDeleted";

import {
  isAdminAuthenticated,
  requireAdminDashboards,
  unauthorizedResponse,
} from "@/lib/adminAuth";
import { API_DASHBOARDS } from "@/lib/adminCan";

function normalizeRiderId(value: unknown) {
  return String(value || "")
    .trim()
    .toUpperCase();
}

function parseAmount(value: unknown): number | null {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return null;
  }

  return Math.round(amount * 100) / 100;
}

function createTransactionId(
  riderId: string,
  idempotencyKey: string
) {
  return (
    "WTX-" +
    crypto
      .createHash("sha256")
      .update(
        `ADMIN-CREDIT:${riderId}:${idempotencyKey}`
      )
      .digest("hex")
      .slice(0, 32)
      .toUpperCase()
  );
}

function isDuplicateKeyError(
  error: unknown
): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: number }).code === 11000
  );
}

export async function POST(req: Request) {
  let session: mongoose.ClientSession | null = null;

  /*
   * These values are needed by the duplicate-key
   * recovery logic inside catch().
   *
   * They must exist outside the try block.
   */
  let transactionId: string | null = null;
  let rechargeAmount: number | null = null;

  try {
    /*
     * ADMIN AUTHENTICATION
     */
    const gate = await requireAdminDashboards(...API_DASHBOARDS.walletWrite);
    if (gate.error) return gate.error;

    await connectDB();

    /*
     * IDEMPOTENCY KEY
     *
     * Prevents accidental duplicate recharge
     * when the same request is submitted twice.
     */
    const idempotencyKey =
      req.headers
        .get("Idempotency-Key")
        ?.trim();

    if (
      !idempotencyKey ||
      idempotencyKey.length < 16 ||
      idempotencyKey.length > 100
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Idempotency-Key header is required.",
        },
        { status: 400 }
      );
    }

    /*
     * REQUEST BODY
     */
    const body = await req.json();

    /*
     * RIDER ID
     */
    const normalizedRiderId =
      normalizeRiderId(body.riderId);

    if (
      !/^RDR-\d{6,}$/.test(
        normalizedRiderId
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Valid Rider ID is required.",
        },
        { status: 400 }
      );
    }

    /*
     * AMOUNT
     */
    rechargeAmount =
      parseAmount(body.amount);

    if (
      rechargeAmount === null ||
      rechargeAmount < 1 ||
      rechargeAmount > 50000
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Amount must be between ₹1 and ₹50,000.",
        },
        { status: 400 }
      );
    }

    /*
     * REMARKS
     */
    const rawRemarks =
      body.remarks === undefined ||
      body.remarks === null
        ? ""
        : String(body.remarks);

    if (rawRemarks.length > 200) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Remarks cannot exceed 200 characters.",
        },
        { status: 400 }
      );
    }

    const remarks =
      rawRemarks.trim();

    /*
     * CREATE DETERMINISTIC TRANSACTION ID
     *
     * Same Rider + same Idempotency-Key
     * always produces the same transaction ID.
     */
    transactionId =
      createTransactionId(
        normalizedRiderId,
        idempotencyKey
      );

    const rider = await Rider.findOne({
      riderId: normalizedRiderId,
      ...NOT_DELETED_FILTER,
    });

    if (rider) {
      try {
        await ensureRiderWallet(
          {
            riderId: rider.riderId,
            _id: rider._id,
            fullName: rider.fullName,
            phone: rider.phone,
            approvalStatus: rider.approvalStatus,
            kycStatus: rider.kycStatus,
            status: rider.status,
            bookingEnabled: rider.bookingEnabled,
            blacklisted: rider.blacklisted,
          },
          "Admin"
        );
      } catch (walletPrepError) {
        console.error(
          "WALLET RECHARGE PREP ERROR:",
          walletPrepError
        );
      }
    }

    /*
     * START ATOMIC TRANSACTION
     */
    session =
      await mongoose.startSession();

    session.startTransaction();

    /*
     * CHECK FOR PREVIOUSLY COMPLETED OPERATION
     */
    const existingTransaction =
      await WalletTransaction.findOne({
        transactionId,
      })
        .select(
          "transactionId amount"
        )
        .session(session)
        .lean<{
          transactionId: string;
          amount: number;
        } | null>();

    if (existingTransaction) {
      await session.commitTransaction();
      session.endSession();
      session = null;

      /*
       * Same idempotency key cannot be reused
       * for another amount.
       */
      if (
        Number(
          existingTransaction.amount
        ) !== rechargeAmount
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "This Idempotency-Key was already used with a different amount.",
          },
          { status: 409 }
        );
      }

      return NextResponse.json({
        success: true,
        duplicate: true,
        message:
          "Recharge was already processed.",
        transactionId:
          existingTransaction.transactionId,
      });
    }

    /*
     * ATOMIC WALLET UPDATE
     *
     * The balance is increased only if:
     *
     * - Rider ID matches
     * - Wallet is Active
     * - Wallet is not deleted
     */
    const now = new Date();

    const wallet =
      await Wallet.findOneAndUpdate(
        {
          riderId:
            normalizedRiderId,

          status: "Active",

          ...NOT_DELETED_FILTER,
        },
        {
          $inc: {
            balance:
              rechargeAmount,
            totalRecharge:
              rechargeAmount,
          },

          $set: {
            lastRechargeAt: now,
            lastTransactionAt: now,
            updatedBy: "Admin",
          },
        },
        {
          new: true,
          session,
          runValidators: true,
        }
      );

    /*
     * Wallet doesn't exist,
     * is blocked, or is deleted.
     */
    if (!wallet) {
      await session.abortTransaction();
      session.endSession();
      session = null;

      return NextResponse.json(
        {
          success: false,
          message:
            "Active wallet not found for this rider.",
        },
        { status: 404 }
      );
    }

    /*
     * CREATE IMMUTABLE TRANSACTION RECORD
     */
    await WalletTransaction.create(
      [
        {
          transactionId,

          riderId:
            wallet.riderId,

          userId:
            wallet.userId,

          userName:
            wallet.userName,

          amount:
            rechargeAmount as number,

          transactionType:
            "Admin Credit",

          paymentMethod:
            "Wallet",

          transactionSource:
            "Admin Panel",

          bookingId: "",

          razorpayPaymentId: "",

          razorpayOrderId: "",

          balanceAfter:
            wallet.balance,

          remarks,

          status:
            "Success",

          updatedBy:
            "Admin",
        },
      ],
      {
        session,
      }
    );

    /*
     * COMMIT EVERYTHING TOGETHER
     *
     * If transaction creation fails,
     * wallet balance update is rolled back.
     */
    await session.commitTransaction();

    session.endSession();
    session = null;

    return NextResponse.json({
      success: true,
      message:
        "Wallet recharged successfully.",
      data: {
        wallet,
        transactionId,
      },
    });
  } catch (error: unknown) {
    /*
     * ROLLBACK ON FAILURE
     */
    if (session) {
      try {
        await session.abortTransaction();
      } catch {}

      session.endSession();
      session = null;
    }

    console.error(
      "WALLET RECHARGE ERROR:",
      error
    );

    /*
     * CONCURRENT DUPLICATE TRANSACTION
     *
     * Two identical requests can reach the API
     * at almost exactly the same time.
     *
     * If MongoDB rejects the second transaction
     * because transactionId is already unique,
     * retrieve the committed transaction and
     * verify that the amount is identical.
     */
    if (
      isDuplicateKeyError(error)
    ) {
      /*
       * Duplicate recovery is only safe if
       * transactionId and rechargeAmount were
       * successfully created before the failure.
       */
      if (
        !transactionId ||
        rechargeAmount === null
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Recharge duplicate could not be safely verified.",
          },
          { status: 500 }
        );
      }

      try {
        const existingTransaction =
          await WalletTransaction.findOne({
            transactionId,
          })
            .select(
              "transactionId amount"
            )
            .lean<{
              transactionId: string;
              amount: number;
            } | null>();

        if (!existingTransaction) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Recharge could not be verified after a duplicate transaction conflict.",
            },
            { status: 500 }
          );
        }

        /*
         * Never allow the same idempotency key
         * to represent a different amount.
         */
        if (
          Number(
            existingTransaction.amount
          ) !== rechargeAmount
        ) {
          return NextResponse.json(
            {
              success: false,
              message:
                "This Idempotency-Key was already used with a different amount.",
            },
            { status: 409 }
          );
        }

        return NextResponse.json({
          success: true,
          duplicate: true,
          message:
            "Recharge was already processed.",
          transactionId:
            existingTransaction.transactionId,
        });
      } catch (
        duplicateLookupError
      ) {
        console.error(
          "RECHARGE DUPLICATE LOOKUP ERROR:",
          duplicateLookupError
        );

        return NextResponse.json(
          {
            success: false,
            message:
              "Unable to verify duplicate recharge.",
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        message:
          "Recharge failed.",
      },
      { status: 500 }
    );
  }
}