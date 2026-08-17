import crypto from "crypto";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";

import Wallet from "@/models/Wallet";
import WalletTransaction from "@/models/WalletTransaction";

import {
  isAdminAuthenticated,
  unauthorizedResponse,
} from "@/lib/adminAuth";
import { NOT_DELETED_FILTER } from "@/lib/notDeleted";

function normalizeRiderId(value: unknown): string {
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
): string {
  return (
    "WTX-" +
    crypto
      .createHash("sha256")
      .update(
        `ADMIN-DEBIT:${riderId}:${idempotencyKey}`
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
   * These values are required by the duplicate
   * transaction recovery logic in catch().
   */
  let transactionId: string | null = null;
  let debitAmount: number | null = null;

  try {
    /*
     * ADMIN AUTHENTICATION
     */
    if (!(await isAdminAuthenticated())) {
      return unauthorizedResponse();
    }

    await connectDB();

    /*
     * IDEMPOTENCY KEY
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
    debitAmount =
      parseAmount(body.amount);

    if (
      debitAmount === null ||
      debitAmount < 1 ||
      debitAmount > 50000
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
     * DETERMINISTIC TRANSACTION ID
     */
    transactionId =
      createTransactionId(
        normalizedRiderId,
        idempotencyKey
      );

    /*
     * START ATOMIC TRANSACTION
     */
    session =
      await mongoose.startSession();

    session.startTransaction();

    /*
     * CHECK WHETHER THIS DEBIT
     * WAS ALREADY PROCESSED
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
       * Same idempotency key + rider
       * cannot represent another amount.
       */
      if (
        Number(
          existingTransaction.amount
        ) !== debitAmount
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
          "Debit was already processed.",
        transactionId:
          existingTransaction.transactionId,
      });
    }

    /*
     * ATOMIC WALLET DEBIT
     *
     * balance >= debitAmount is checked
     * INSIDE MongoDB.
     *
     * This prevents negative balances even
     * under concurrent requests.
     */
    const now = new Date();

    const wallet =
      await Wallet.findOneAndUpdate(
        {
          riderId:
            normalizedRiderId,

          status: "Active",

          ...NOT_DELETED_FILTER,

          balance: {
            $gte: debitAmount,
          },
        },
        {
          $inc: {
            balance: -debitAmount,
            totalSpent: debitAmount,
          },

          $set: {
            lastDebitAt: now,
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
     * Wallet unavailable or insufficient balance.
     */
    if (!wallet) {
      await session.abortTransaction();
      session.endSession();
      session = null;

      return NextResponse.json(
        {
          success: false,
          message:
            "Wallet is blocked, closed, or has insufficient balance.",
        },
        { status: 400 }
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
            debitAmount as number,

          transactionType:
            "Admin Debit",

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
     * COMMIT WALLET + LEDGER TOGETHER
     */
    await session.commitTransaction();

    session.endSession();
    session = null;

    return NextResponse.json({
      success: true,
      message:
        "Wallet debit successful.",
      data: {
        wallet,
        transactionId,
      },
    });
  } catch (error: unknown) {
    /*
     * ROLLBACK
     */
    if (session) {
      try {
        await session.abortTransaction();
      } catch {}

      session.endSession();
      session = null;
    }

    console.error(
      "WALLET DEBIT ERROR:",
      error
    );

    /*
     * CONCURRENT DUPLICATE RECOVERY
     */
    if (
      isDuplicateKeyError(error)
    ) {
      /*
       * We can only safely recover if these
       * values were successfully calculated.
       */
      if (
        !transactionId ||
        debitAmount === null
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Debit duplicate could not be safely verified.",
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
                "Debit could not be verified after a duplicate transaction conflict.",
            },
            { status: 500 }
          );
        }

        /*
         * Same idempotency key cannot
         * represent a different amount.
         */
        if (
          Number(
            existingTransaction.amount
          ) !== debitAmount
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
            "Debit was already processed.",
          transactionId:
            existingTransaction.transactionId,
        });
      } catch (
        duplicateLookupError
      ) {
        console.error(
          "DEBIT DUPLICATE LOOKUP ERROR:",
          duplicateLookupError
        );

        return NextResponse.json(
          {
            success: false,
            message:
              "Unable to verify duplicate debit.",
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: "Debit failed.",
      },
      { status: 500 }
    );
  }
}