import {
  isAdminAuthenticated,
  unauthorizedResponse,
} from "@/lib/adminAuth";

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

import Rider from "@/models/Rider";
import Wallet from "@/models/Wallet";

import mongoose from "mongoose";

import {
  firebaseUserOwnsRider,
  getVerifiedFirebaseUser,
} from "@/lib/requestAuth";

function riderLookupFilter(id: string) {
  const cleanedId = String(id || "").trim();

  const filters: Record<string, unknown>[] = [
    {
      riderId: cleanedId.toUpperCase(),
      isDeleted: false,
    },
  ];

  if (mongoose.Types.ObjectId.isValid(cleanedId)) {
    filters.push({
      _id: cleanedId,
      isDeleted: false,
    });
  }

  return {
    $or: filters,
  };
}

function safeRiderResponse(rider: any) {
  return {
    _id: rider._id,
    riderId: rider.riderId,
    fullName: rider.fullName,
    phone: rider.phone,
    email: rider.email,

    approvalStatus: rider.approvalStatus,
    kycStatus: rider.kycStatus,

    status: rider.status,
    bookingEnabled: rider.bookingEnabled,

    activeRide: rider.activeRide,

    blacklisted: rider.blacklisted,

    approvedAt: rider.approvedAt,

    rejectedReason: rider.rejectedReason,

    createdAt: rider.createdAt,
    updatedAt: rider.updatedAt,
  };
}

/* =========================================================
   GET RIDER
========================================================= */

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    if (!id?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Rider ID is required.",
        },
        { status: 400 }
      );
    }

    const rider = await Rider.findOne(
      riderLookupFilter(id)
    )
      .select(
        [
          "riderId",
          "fullName",
          "phone",
          "email",
          "firebaseUid",
          "bookingEnabled",
          "approvalStatus",
          "kycStatus",
          "activeRide",
          "status",
          "blacklisted",
          "approvedAt",
          "rejectedReason",
          "createdAt",
          "updatedAt",
        ].join(" ")
      )
      .lean<{
        _id: mongoose.Types.ObjectId;
        riderId: string;
        fullName: string;
        phone: string;
        email?: string;
        firebaseUid?: string;
        bookingEnabled: boolean;
        approvalStatus: string;
        kycStatus: string;
        activeRide: boolean;
        status: string;
        blacklisted: boolean;
        approvedAt?: Date;
        rejectedReason?: string;
        createdAt?: Date;
        updatedAt?: Date;
      } | null>();

    if (!rider) {
      return NextResponse.json(
        {
          success: false,
          message: "Rider not found.",
        },
        { status: 404 }
      );
    }

    /*
     * Admin requests are authenticated using the
     * secure admin session cookie.
     */
    const isAdmin =
      await isAdminAuthenticated().catch(() => false);

    /*
     * Non-admin requests must prove ownership.
     */
    if (!isAdmin) {
      const firebaseUser =
        await getVerifiedFirebaseUser(req);

      if (
        !firebaseUserOwnsRider(
          firebaseUser,
          rider
        )
      ) {
        return unauthorizedResponse();
      }
    }

    /*
     * Never expose Firebase UID to the browser.
     */
    return NextResponse.json({
      success: true,
      data: safeRiderResponse(rider),
    });
  } catch (error: unknown) {
    console.error(
      "GET RIDER ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch rider.",
      },
      { status: 500 }
    );
  }
}

/* =========================================================
   PATCH RIDER — ADMIN ONLY
========================================================= */

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let session: mongoose.ClientSession | null = null;

  try {
    /*
     * Only authenticated administrators can modify
     * rider approval/status information.
     */
    if (!(await isAdminAuthenticated())) {
      return unauthorizedResponse();
    }

    await connectDB();

    const { id } = await params;

    if (!id?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Rider ID is required.",
        },
        { status: 400 }
      );
    }

    const body = await req.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body.",
        },
        { status: 400 }
      );
    }

    /*
     * Only these fields are accepted from the admin
     * approval/status request.
     *
     * activeRide, wallet balance, Firebase UID, etc.
     * are intentionally NOT accepted here.
     */
    const requestedApprovalStatus =
      body.approvalStatus;

    const requestedKycStatus =
      body.kycStatus;

    const requestedStatus =
      body.status;

    const requestedRejectedReason =
      body.rejectedReason;

    /*
     * AUDIT ACTOR
     *
     * The browser is NOT allowed to decide
     * who approved or updated a rider.
     *
     * The current admin authentication helper
     * confirms administrator access, but does not
     * expose an administrator identity.
     *
     * Therefore the server uses a fixed
     * server-controlled audit actor for now.
     */
    const auditActor = "Admin";

    const validApprovalStatus = [
      "Under Review",
      "Approved",
      "Rejected",
      "Suspended",
    ] as const;

    const validKycStatus = [
      "Pending",
      "Approved",
      "Rejected",
    ] as const;

    const validStatus = [
      "Active",
      "Blocked",
      "Suspended",
    ] as const;

    if (
      requestedApprovalStatus !== undefined &&
      !validApprovalStatus.includes(
        requestedApprovalStatus
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid approval status.",
        },
        { status: 400 }
      );
    }

    if (
      requestedKycStatus !== undefined &&
      !validKycStatus.includes(
        requestedKycStatus
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid KYC status.",
        },
        { status: 400 }
      );
    }

    if (
      requestedStatus !== undefined &&
      !validStatus.includes(
        requestedStatus
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid rider status.",
        },
        { status: 400 }
      );
    }

    if (
      requestedRejectedReason !== undefined &&
      typeof requestedRejectedReason !== "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid rejection reason.",
        },
        { status: 400 }
      );
    }

    session =
      await mongoose.startSession();

    session.startTransaction();

    try {
      const rider = await Rider.findOne(
        riderLookupFilter(id)
      ).session(session);

      if (!rider) {
        await session.abortTransaction();

        return NextResponse.json(
          {
            success: false,
            message: "Rider not found.",
          },
          { status: 404 }
        );
      }

      /*
       * Soft-deleted riders must never be modified.
       */
      if (rider.isDeleted) {
        await session.abortTransaction();

        return NextResponse.json(
          {
            success: false,
            message:
              "Rider no longer exists.",
          },
          { status: 404 }
        );
      }

      /*
       * A rider currently on a ride cannot be
       * rejected/suspended/blocked.
       */
      const attemptingRestriction =
        requestedStatus === "Blocked" ||
        requestedStatus === "Suspended" ||
        requestedApprovalStatus === "Rejected" ||
        requestedApprovalStatus === "Suspended";

      if (
        rider.activeRide &&
        attemptingRestriction
      ) {
        await session.abortTransaction();

        return NextResponse.json(
          {
            success: false,
            message:
              "Rider cannot be blocked, suspended, or rejected while an active ride is in progress.",
          },
          { status: 409 }
        );
      }

      /*
       * IMPORTANT:
       *
       * activeRide is NOT modified here.
       *
       * Ride APIs own activeRide.
       */

      if (
        requestedApprovalStatus !== undefined
      ) {
        rider.approvalStatus =
          requestedApprovalStatus;
      }

      if (
        requestedKycStatus !== undefined
      ) {
        rider.kycStatus =
          requestedKycStatus;
      }

      /*
       * Rejection reason.
       */
      if (
        requestedRejectedReason !==
        undefined
      ) {
        rider.rejectedReason =
          requestedRejectedReason
            .trim()
            .slice(0, 500);
      }

      /*
       * SERVER-CONTROLLED AUDIT INFORMATION
       *
       * Never trust approvedBy / updatedBy from
       * the browser.
       */
      rider.updatedBy = auditActor;

      /*
       * approvedBy is written only when the rider
       * reaches the fully approved state.
       */
      if (
        rider.approvalStatus === "Approved" &&
        rider.kycStatus === "Approved" &&
        !rider.approvedAt
      ) {
        rider.approvedBy = auditActor;
      }

      /*
       * ===================================================
       * DETERMINE FINAL RIDER STATE
       * ===================================================
       *
       * Booking is enabled ONLY when:
       *
       * approvalStatus === Approved
       * AND
       * kycStatus === Approved
       * AND
       * status === Active
       * AND
       * blacklisted === false
       *
       * This becomes the single authoritative rule.
       */

      const fullyApproved =
        rider.approvalStatus === "Approved" &&
        rider.kycStatus === "Approved";

      /*
       * Explicit admin suspension/block takes priority.
       */
      if (
        requestedStatus === "Suspended"
      ) {
        rider.status = "Suspended";
        rider.bookingEnabled = false;
        rider.blockedAt = new Date();
      } else if (
        requestedStatus === "Blocked"
      ) {
        rider.status = "Blocked";
        rider.bookingEnabled = false;
        rider.blockedAt = new Date();
      } else if (
        rider.approvalStatus ===
          "Rejected" ||
        rider.kycStatus === "Rejected"
      ) {
        rider.status = "Blocked";
        rider.bookingEnabled = false;
      } else if (fullyApproved) {
        rider.status = "Active";
        rider.bookingEnabled = true;

        rider.rejectedReason = "";

        /*
         * Only now is the rider genuinely approved.
         */
        if (!rider.approvedAt) {
          rider.approvedAt = new Date();
        }
      } else {
        /*
         * Under Review / Pending combinations.
         */
        rider.status = "Blocked";
        rider.bookingEnabled = false;
      }

      /*
       * If rider is blacklisted, booking can NEVER
       * be enabled.
       */
      if (rider.blacklisted) {
        rider.bookingEnabled = false;

        if (
          rider.status === "Active"
        ) {
          rider.status = "Blocked";
        }
      }

      /*
       * Never allow an unapproved rider to book.
       */
      if (
        rider.approvalStatus !==
          "Approved" ||
        rider.kycStatus !== "Approved"
      ) {
        rider.bookingEnabled = false;
      }

      /*
       * Increment application version.
       */
      rider.version =
        Number(rider.version || 1) + 1;

      await rider.save({
        session,
        validateModifiedOnly: true,
      });

      /*
       * ===================================================
       * WALLET SYNCHRONIZATION
       * ===================================================
       *
       * Rider eligibility controls wallet activation,
       * EXCEPT when an administrator has explicitly
       * blocked the wallet.
       */

      const wallet =
        await Wallet.findOne({
          riderId: rider.riderId,
          isDeleted: false,
        }).session(session);

      if (!wallet) {
        throw new Error(
          "Wallet not found for rider."
        );
      }

      /*
       * A manually blocked wallet remains blocked
       * even if rider KYC/approval changes later.
       */
      if (wallet.adminBlocked) {
        wallet.status = "Blocked";
      } else {
        wallet.status =
          rider.bookingEnabled
            ? "Active"
            : "Blocked";
      }

      wallet.updatedBy =
        rider.updatedBy || "";

      wallet.version =
        Number(wallet.version || 1) + 1;

      await wallet.save({
        session,
        validateBeforeSave: true,
      });

      /*
       * Everything succeeded.
       */
      await session.commitTransaction();

      return NextResponse.json({
        success: true,
        message:
          "Rider updated successfully.",
        data: safeRiderResponse(rider),
      });
    } catch (transactionError) {
      try {
        await session.abortTransaction();
      } catch {}

      throw transactionError;
    } finally {
      await session.endSession();
      session = null;
    }
  } catch (error: unknown) {
    console.error(
      "PATCH RIDER ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to update rider.",
      },
      { status: 500 }
    );
  }
}