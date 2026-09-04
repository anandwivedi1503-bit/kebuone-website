import {
  getAdminSession,
  isAdminAuthenticated,
  requireAdminDashboards,
  sessionHasAnyDashboard,
  unauthorizedResponse,
} from "@/lib/adminAuth";
import { API_DASHBOARDS } from "@/lib/adminCan";

import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";

import Rider from "@/models/Rider";
import Wallet from "@/models/Wallet";

import mongoose from "mongoose";

import { writeAudit } from "@/lib/writeAudit";
import { riderLookupFilter } from "@/lib/riderLookup";

import {
  firebaseUserOwnsRider,
  getVerifiedFirebaseUser,
} from "@/lib/requestAuth";

import {
  ensureRiderWallet,
  RiderWalletError,
} from "@/lib/ensureRiderWallet";

/* =========================================================
   TYPES
========================================================= */

type RiderForResponse = {
  _id?: unknown;

  riderId?: string;

  fullName?: string;

  phone?: string;

  email?: string;

  approvalStatus?: string;

  kycStatus?: string;

  status?: string;

  bookingEnabled?: boolean;

  activeRide?: boolean;

  blacklisted?: boolean;

  approvedAt?: Date;

  rejectedReason?: string;

  createdAt?: Date;

  updatedAt?: Date;

  firebaseUid?: string;
};

/* =========================================================
   SAFE RIDER RESPONSE
========================================================= */

function safeRiderResponse(
  rider: RiderForResponse
) {
  return {
    _id:
      rider._id,

    riderId:
      rider.riderId ?? "",

    fullName:
      rider.fullName ?? "",

    phone:
      rider.phone ?? "",

    email:
      rider.email ?? "",

    approvalStatus:
      rider.approvalStatus ??
      "Under Review",

    kycStatus:
      rider.kycStatus ??
      "Pending",

    status:
      rider.status ??
      "Blocked",

    bookingEnabled:
      rider.bookingEnabled ??
      false,

    activeRide:
      rider.activeRide ??
      false,

    blacklisted:
      rider.blacklisted ??
      false,

    approvedAt:
      rider.approvedAt,

    rejectedReason:
      rider.rejectedReason ??
      "",

    createdAt:
      rider.createdAt,

    updatedAt:
      rider.updatedAt,
  };
}

/* =========================================================
   GET RIDER
========================================================= */

export async function GET(
  req: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    await connectDB();

    const { id } =
      await params;

    if (!id?.trim()) {
      return NextResponse.json(
        {
          success: false,

          errorCode:
            "RIDER_ID_REQUIRED",

          message:
            "Rider ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Use a simple lean object here.
     *
     * We do not expose sensitive information such
     * as Firebase UID in the response.
     */

    const rider =
      await Rider.findOne(
        riderLookupFilter(id)
      )
        .select(
          [
            "_id",
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
        .lean();

    if (!rider) {
      return NextResponse.json(
        {
          success: false,

          errorCode:
            "RIDER_NOT_FOUND",

          message:
            "Rider not found.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * Admin requests are authenticated using
     * the admin session cookie.
     */

    const isAdmin = sessionHasAnyDashboard(
      await getAdminSession(),
      ...API_DASHBOARDS.ridersRead
    );

    /*
     * Normal rider requests must prove ownership
     * using the Firebase ID token.
     */

    if (!isAdmin) {
      const firebaseUser =
        await getVerifiedFirebaseUser(
          req
        );

      if (
        !firebaseUserOwnsRider(
          firebaseUser,
          rider as any
        )
      ) {
        return unauthorizedResponse();
      }
    }

    /*
     * Never expose Firebase UID to browser.
     */

    return NextResponse.json({
      success: true,

      data:
        safeRiderResponse(
          rider as RiderForResponse
        ),
    });
  } catch (error: unknown) {
    console.error(
      "GET RIDER ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        errorCode:
          "RIDER_FETCH_ERROR",

        message:
          "Unable to fetch rider.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   PATCH RIDER — ADMIN ONLY
========================================================= */

export async function PATCH(
  req: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    /* =====================================================
       ADMIN AUTHENTICATION
    ===================================================== */

    const gate = await requireAdminDashboards(...API_DASHBOARDS.ridersWrite);
    if (gate.error) return gate.error;

    await connectDB();

    const { id } =
      await params;

    if (!id?.trim()) {
      return NextResponse.json(
        {
          success: false,

          errorCode:
            "RIDER_ID_REQUIRED",

          message:
            "Rider ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       REQUEST BODY
    ===================================================== */

    let body: Record<
      string,
      unknown
    >;

    try {
      body =
        await req.json();
    } catch {
      return NextResponse.json(
        {
          success: false,

          errorCode:
            "INVALID_JSON",

          message:
            "Invalid request body.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        {
          success: false,

          errorCode:
            "INVALID_BODY",

          message:
            "Invalid request body.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       ADMIN INPUT
    ===================================================== */

    const requestedApprovalStatus =
      body.approvalStatus;

    const requestedKycStatus =
      body.kycStatus;

    const requestedStatus =
      body.status;

    const requestedRejectedReason =
      body.rejectedReason;

    const requestedBlacklisted =
      body.blacklisted;

    const requestedBlacklistReason =
      body.blacklistReason;

    /* =====================================================
       VALID VALUES
    ===================================================== */

    const validApprovalStatuses =
      [
        "Under Review",
        "Approved",
        "Rejected",
        "Suspended",
      ] as const;

    const validKycStatuses =
      [
        "Pending",
        "Approved",
        "Rejected",
      ] as const;

    const validRiderStatuses =
      [
        "Active",
        "Inactive",
        "Blocked",
        "Suspended",
      ] as const;

    /* =====================================================
       VALIDATE APPROVAL STATUS
    ===================================================== */

    if (
      requestedApprovalStatus !==
        undefined &&
      (
        typeof requestedApprovalStatus !==
          "string" ||
        !(
          validApprovalStatuses as readonly string[]
        ).includes(
          requestedApprovalStatus
        )
      )
    ) {
      return NextResponse.json(
        {
          success: false,

          errorCode:
            "INVALID_APPROVAL_STATUS",

          message:
            "Invalid approval status.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       VALIDATE KYC STATUS
    ===================================================== */

    if (
      requestedKycStatus !==
        undefined &&
      (
        typeof requestedKycStatus !==
          "string" ||
        !(
          validKycStatuses as readonly string[]
        ).includes(
          requestedKycStatus
        )
      )
    ) {
      return NextResponse.json(
        {
          success: false,

          errorCode:
            "INVALID_KYC_STATUS",

          message:
            "Invalid KYC status.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       VALIDATE RIDER STATUS
    ===================================================== */

    if (
      requestedStatus !==
        undefined &&
      (
        typeof requestedStatus !==
          "string" ||
        !(
          validRiderStatuses as readonly string[]
        ).includes(
          requestedStatus
        )
      )
    ) {
      return NextResponse.json(
        {
          success: false,

          errorCode:
            "INVALID_RIDER_STATUS",

          message:
            "Invalid rider status.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       VALIDATE REJECTION REASON
    ===================================================== */

    if (
      requestedRejectedReason !==
        undefined &&
      typeof requestedRejectedReason !==
        "string"
    ) {
      return NextResponse.json(
        {
          success: false,

          errorCode:
            "INVALID_REJECTION_REASON",

          message:
            "Invalid rejection reason.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       VALIDATE BLACKLIST
    ===================================================== */

    if (
      requestedBlacklisted !==
        undefined &&
      typeof requestedBlacklisted !==
        "boolean"
    ) {
      return NextResponse.json(
        {
          success: false,

          errorCode:
            "INVALID_BLACKLIST_VALUE",

          message:
            "Invalid blacklist value.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      requestedBlacklistReason !==
        undefined &&
      typeof requestedBlacklistReason !==
        "string"
    ) {
      return NextResponse.json(
        {
          success: false,

          errorCode:
            "INVALID_BLACKLIST_REASON",

          message:
            "Invalid blacklist reason.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       LOAD RIDER
    ===================================================== */

    const rider =
      await Rider.findOne(
        riderLookupFilter(id)
      );

    if (!rider) {
      return NextResponse.json(
        {
          success: false,

          errorCode:
            "RIDER_NOT_FOUND",

          message:
            "Rider not found.",
        },
        {
          status: 404,
        }
      );
    }

    /* =====================================================
       SOFT-DELETED RIDER
    ===================================================== */

    if (rider.isDeleted) {
      return NextResponse.json(
        {
          success: false,

          errorCode:
            "RIDER_DELETED",

          message:
            "This rider has been deleted.",
        },
        {
          status: 404,
        }
      );
    }

    /* =====================================================
       ACTIVE RIDE SAFETY
    ===================================================== */

    const attemptingRestriction =
      requestedStatus ===
        "Blocked" ||
      requestedStatus ===
        "Suspended" ||
      requestedApprovalStatus ===
        "Rejected" ||
      requestedApprovalStatus ===
        "Suspended" ||
      requestedBlacklisted ===
        true;

    if (
      rider.activeRide &&
      attemptingRestriction
    ) {
      return NextResponse.json(
        {
          success: false,

          errorCode:
            "RIDER_HAS_ACTIVE_RIDE",

          message:
            "Rider cannot be blocked, suspended, rejected, or blacklisted while an active ride is in progress.",
        },
        {
          status: 409,
        }
      );
    }

    /* =====================================================
       AUDIT ACTOR
    ===================================================== */

    const auditActor =
      "Admin";

    /* =====================================================
       UPDATE APPROVAL STATUS
    ===================================================== */

    if (
      requestedApprovalStatus !==
        undefined
    ) {
      rider.approvalStatus =
        requestedApprovalStatus as
          | "Under Review"
          | "Approved"
          | "Rejected"
          | "Suspended";
    }

    /* =====================================================
       UPDATE KYC STATUS
    ===================================================== */

    if (
      requestedKycStatus !==
        undefined
    ) {
      rider.kycStatus =
        requestedKycStatus as
          | "Pending"
          | "Approved"
          | "Rejected";
    }

    /* =====================================================
       UPDATE RIDER STATUS
    ===================================================== */

    if (
      requestedStatus !==
        undefined
    ) {
      rider.status =
        requestedStatus as
          | "Active"
          | "Inactive"
          | "Blocked"
          | "Suspended";
    }

    /* =====================================================
       REJECTION REASON
    ===================================================== */

    if (
      requestedRejectedReason !==
        undefined
    ) {
      rider.rejectedReason =
        String(
          requestedRejectedReason
        )
          .trim()
          .slice(0, 500);
    }

    /* =====================================================
       BLACKLIST
    ===================================================== */

    if (
      requestedBlacklisted !==
        undefined
    ) {
      rider.blacklisted =
        requestedBlacklisted;

      if (
        requestedBlacklisted
      ) {
        rider.blacklistReason =
          String(
            requestedBlacklistReason ??
              ""
          )
            .trim()
            .slice(0, 500);
      } else {
        rider.blacklistReason =
          "";
      }
    }

    /* =====================================================
       AUDIT
    ===================================================== */

    rider.updatedBy =
      auditActor;

    /* =====================================================
       APPROVAL STATE
    ===================================================== */

    const fullyApproved =
      rider.approvalStatus ===
        "Approved" &&
      rider.kycStatus ===
        "Approved";

    /*
     * New registrations are stored as Blocked until
     * KYC is approved. That waiting state must not
     * block the approval path. Only an explicit
     * Suspended/Blocked update in this request, or
     * a remaining Suspended status, keeps booking off.
     */

    const explicitHold =
      requestedStatus ===
        "Suspended" ||
      requestedStatus ===
        "Blocked" ||
      (rider.status ===
        "Suspended" &&
        requestedStatus !==
          "Active");

    /* =====================================================
       EXPLICIT SUSPENSION / BLOCK
    ===================================================== */

    if (
      explicitHold
    ) {
      rider.bookingEnabled =
        false;

      rider.blockedAt =
        new Date();

      rider.blockedBy =
        auditActor;
    }

    /* =====================================================
       REJECTED
    ===================================================== */

    else if (
      rider.approvalStatus ===
        "Rejected" ||
      rider.kycStatus ===
        "Rejected"
    ) {
      rider.status =
        "Blocked";

      rider.bookingEnabled =
        false;

      rider.blockedAt =
        new Date();

      rider.blockedBy =
        auditActor;
    }

    /* =====================================================
       FULLY APPROVED
       
       This is the ONLY condition under which booking
       becomes enabled automatically. It also lifts the
       initial Blocked status created at registration.
    ===================================================== */

    else if (
      fullyApproved
    ) {
      rider.status =
        "Active";

      rider.bookingEnabled =
        true;

      rider.rejectedReason =
        "";

      rider.blockedAt =
        undefined;

      rider.blockedBy =
        "";

      if (!rider.approvedAt) {
        rider.approvedAt =
          new Date();
      }

      rider.approvedBy =
        auditActor;
    }

    /* =====================================================
       UNDER REVIEW / PENDING
    ===================================================== */

    else {
      rider.status =
        "Blocked";

      rider.bookingEnabled =
        false;
    }

    /* =====================================================
       BLACKLIST OVERRIDES EVERYTHING
    ===================================================== */

    if (
      rider.blacklisted
    ) {
      rider.bookingEnabled =
        false;

      if (
        rider.status ===
        "Active"
      ) {
        rider.status =
          "Blocked";
      }
    }

    /* =====================================================
       FINAL BOOKING SAFETY
    ===================================================== */

    if (
      rider.approvalStatus !==
        "Approved" ||
      rider.kycStatus !==
        "Approved" ||
      rider.status !==
        "Active" ||
      rider.blacklisted
    ) {
      rider.bookingEnabled =
        false;
    }

    /* =====================================================
       VERSION
    ===================================================== */

    rider.version =
      Number(
        rider.version || 1
      ) + 1;

    /* =====================================================
       SAVE RIDER
       
       NO MongoDB TRANSACTION.
       
       This avoids deployment failures when MongoDB is
       not running as a replica set.
    ===================================================== */

    await rider.save({
      validateModifiedOnly:
        true,
    });

    /* =====================================================
       WALLET SYNCHRONIZATION
    ===================================================== */

    let wallet: any =
      await Wallet.findOne({
        riderId:
          rider.riderId,

        isDeleted:
          false,
      });

    const desiredWalletStatus =
      rider.bookingEnabled
        ? "Active"
        : "Blocked";

    /* =====================================================
       OLD RIDER WITHOUT WALLET
       
       Legacy riders are repaired automatically.
    ===================================================== */

    if (!wallet) {
      try {
        wallet =
          await ensureRiderWallet(
            {
              _id: rider._id,
              riderId: rider.riderId,
              fullName: rider.fullName,
              phone: rider.phone,
              approvalStatus:
                rider.approvalStatus,
              kycStatus:
                rider.kycStatus,
              status: rider.status,
              bookingEnabled:
                rider.bookingEnabled,
              blacklisted:
                rider.blacklisted,
            },
            auditActor
          );
      } catch (walletError) {
        console.error(
          "WALLET CREATION FAILED:",
          walletError
        );

        const message =
          walletError instanceof
          RiderWalletError
            ? walletError.message
            : "Rider was updated, but the rider wallet could not be synchronized.";

        return NextResponse.json(
          {
            success: false,

            errorCode:
              walletError instanceof
              RiderWalletError
                ? walletError.code
                : "WALLET_SYNC_FAILED",

            message,
          },
          {
            status: 500,
          }
        );
      }
    }

    /* =====================================================
       EXISTING WALLET
       
       IMPORTANT:
       Do NOT modify balance or financial totals here.
    ===================================================== */

    else {
      wallet.status =
        desiredWalletStatus;

      wallet.updatedBy =
        auditActor;

      wallet.version =
        Number(
          wallet.version || 1
        ) + 1;

      await wallet.save();
    }

    /* =====================================================
       RESPONSE
    ===================================================== */

    void writeAudit({
      actor: auditActor || "Admin",
      action: "RIDER_UPDATED",
      entity: "Rider",
      entityId: String(rider.riderId || ""),
      riderId: String(rider.riderId || ""),
      detail: `kyc=${String(rider.kycStatus || "")} bookingEnabled=${String(rider.bookingEnabled)}`,
    });

    return NextResponse.json({
      success: true,

      message:
        "Rider updated successfully.",

      data: {
        ...safeRiderResponse(
          rider as RiderForResponse
        ),

        walletBalance:
          Number(
            wallet?.balance ??
              0
          ),

        walletStatus:
          wallet?.status ??
          desiredWalletStatus,

        walletSecurityDepositHold:
          Number(
            wallet?.securityDepositHold ??
              0
          ),

        walletFreezeAmount:
          Number(
            wallet?.freezeAmount ??
              0
          ),

        walletTotalRecharge:
          Number(
            wallet?.totalRecharge ??
              0
          ),

        walletTotalSpent:
          Number(
            wallet?.totalSpent ??
              0
          ),

        walletTotalRefund:
          Number(
            wallet?.totalRefund ??
              0
          ),

        walletAdminBlocked:
          Boolean(
            wallet?.adminBlocked ??
              false
          ),
      },
    });
  } catch (error: unknown) {
    console.error(
      "PATCH RIDER ERROR:",
      error
    );

    /* =====================================================
       MONGOOSE VALIDATION ERROR
    ===================================================== */

    if (
      error instanceof
      mongoose.Error.ValidationError
    ) {
      const validationErrors =
        Object.values(
          error.errors
        ).map(
          (item) =>
            item.message
        );

      return NextResponse.json(
        {
          success: false,

          errorCode:
            "VALIDATION_ERROR",

          message:
            validationErrors.join(
              " "
            ) ||
            "Rider validation failed.",

          errors:
            validationErrors,
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       DUPLICATE KEY ERROR
    ===================================================== */

    if (
      typeof error ===
        "object" &&
      error !== null &&
      "code" in error &&
      Number(
        (
          error as {
            code?: unknown;
          }
        ).code
      ) === 11000
    ) {
      return NextResponse.json(
        {
          success: false,

          errorCode:
            "DUPLICATE_RECORD",

          message:
            "A duplicate rider or wallet record already exists.",
        },
        {
          status: 409,
        }
      );
    }

    /* =====================================================
       GENERIC ERROR
    ===================================================== */

    const errorMessage =
      error instanceof Error
        ? error.message
        : String(error);

    return NextResponse.json(
      {
        success: false,

        errorCode:
          "RIDER_UPDATE_ERROR",

        message:
          process.env.NODE_ENV ===
          "development"
            ? errorMessage
            : "Unable to update rider.",
      },
      {
        status: 500,
      }
    );
  }
}