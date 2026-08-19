"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import PageContainer from "../DashboardUI/PageContainer";
import DashboardHeader from "../DashboardUI/DashboardHeader";
import KPIGrid from "../DashboardUI/KPIGrid";
import KPICard from "../DashboardUI/KPICard";
import DashboardCard from "../DashboardUI/DashboardCard";
import DashboardActions from "../DashboardUI/DashboardActions";
import SectionHeader from "../DashboardUI/SectionHeader";
import StatusBadge from "../DashboardUI/StatusBadge";

/* =========================================================
   TYPES
========================================================= */

type Rider = {
  _id: string;

  riderId: string;

  fullName: string;

  phone: string;

  email?: string;

  aadhaarNumber?: string;

  drivingLicense?: string;

  aadhaarFrontUrl?: string;

  aadhaarBackUrl?: string;

  licenseFrontUrl?: string;

  licenseBackUrl?: string;

  profilePhotoUrl?: string;

  kycStatus:
    | "Pending"
    | "Approved"
    | "Rejected"
    | string;

  approvalStatus:
    | "Under Review"
    | "Approved"
    | "Rejected"
    | "Suspended"
    | string;

  rejectedReason?: string;

  status?: string;

  createdAt?: string;

  updatedAt?: string;

  approvedAt?: string;
};

/* =========================================================
   API RESPONSE
========================================================= */

type RidersApiResponse = {
  success?: boolean;

  data?: unknown;

  message?: string;
};

/* =========================================================
   NORMALIZE RIDER
========================================================= */

function normalizeRider(
  value: any
): Rider {
  return {
    _id: String(
      value?._id ??
        value?.id ??
        ""
    ),

    riderId: String(
      value?.riderId ??
        ""
    ),

    fullName: String(
      value?.fullName ??
        ""
    ),

    phone: String(
      value?.phone ??
        ""
    ),

    email: value?.email
      ? String(value.email)
      : "",

    aadhaarNumber:
      value?.aadhaarNumber
        ? String(
            value.aadhaarNumber
          )
        : "",

    drivingLicense:
      value?.drivingLicense
        ? String(
            value.drivingLicense
          )
        : "",

    aadhaarFrontUrl:
      value?.aadhaarFrontUrl
        ? String(
            value.aadhaarFrontUrl
          )
        : "",

    aadhaarBackUrl:
      value?.aadhaarBackUrl
        ? String(
            value.aadhaarBackUrl
          )
        : "",

    licenseFrontUrl:
      value?.licenseFrontUrl
        ? String(
            value.licenseFrontUrl
          )
        : "",

    licenseBackUrl:
      value?.licenseBackUrl
        ? String(
            value.licenseBackUrl
          )
        : "",

    profilePhotoUrl:
      value?.profilePhotoUrl
        ? String(
            value.profilePhotoUrl
          )
        : "",

    kycStatus: String(
      value?.kycStatus ??
        "Pending"
    ),

    approvalStatus: String(
      value?.approvalStatus ??
        "Under Review"
    ),

    rejectedReason:
      value?.rejectedReason
        ? String(
            value.rejectedReason
          )
        : "",

    status: value?.status
      ? String(
          value.status
        )
      : "",

    createdAt:
      value?.createdAt
        ? String(
            value.createdAt
          )
        : undefined,

    updatedAt:
      value?.updatedAt
        ? String(
            value.updatedAt
          )
        : undefined,

    approvedAt:
      value?.approvedAt
        ? String(
            value.approvedAt
          )
        : undefined,
  };
}

/* =========================================================
   DOCUMENT LINK COMPONENT
========================================================= */

function DocumentLink({
  url,
}: {
  url?: string;
}) {
  if (!url) {
    return (
      <span className="text-gray-400 text-sm">
        Not Uploaded
      </span>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center rounded-xl bg-pink-50 px-4 py-2 text-sm font-semibold text-[#FF165E] hover:bg-pink-100 hover:underline transition"
    >
      View
    </a>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function KYCDashboard() {
  const [riders, setRiders] =
    useState<Rider[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [processingId, setProcessingId] =
    useState("");

  const [error, setError] =
    useState("");

  /* =======================================================
     LOAD RIDERS
  ======================================================= */

  const loadRiders =
    useCallback(
      async (
        showRefreshState = false
      ) => {
        if (showRefreshState) {
          setRefreshing(true);
        }

        try {
          setError("");

          const response =
            await fetch(
              "/api/riders",
              {
                method: "GET",

                cache: "no-store",

                headers: {
                  Accept:
                    "application/json",
                },
              }
            );

          let result:
            RidersApiResponse = {};

          try {
            result =
              await response.json();
          } catch {
            result = {};
          }

          if (
            !response.ok ||
            result.success === false
          ) {
            throw new Error(
              result.message ||
                "Failed to fetch rider KYC records."
            );
          }

          const rawData =
            Array.isArray(
              result.data
            )
              ? result.data
              : [];

          const normalized =
            rawData
              .filter(
                (
                  item: any
                ) =>
                  item &&
                  typeof item ===
                    "object"
              )
              .map(
                (
                  item: any
                ) =>
                  normalizeRider(
                    item
                  )
              )
              .filter(
                (
                  rider
                ) =>
                  Boolean(
                    rider._id
                  ) ||
                  Boolean(
                    rider.riderId
                  )
              );

          setRiders(
            normalized
          );
        } catch (loadError) {
          console.error(
            "KYC LOAD RIDERS ERROR:",
            loadError
          );

          setError(
            loadError instanceof
              Error
              ? loadError.message
              : "Unable to load KYC records."
          );
        } finally {
          setLoading(false);

          setRefreshing(false);
        }
      },
      []
    );

  /* =======================================================
     INITIAL LOAD + AUTO REFRESH
  ======================================================= */

  useEffect(() => {
    void loadRiders();

    const interval =
      window.setInterval(
        () => {
          void loadRiders();
        },
        10000
      );

    return () =>
      window.clearInterval(
        interval
      );
  }, [loadRiders]);

  /* =======================================================
     KYC KPI COUNTS
  ======================================================= */

  const totalApplications =
    riders.length;

  const pendingApplications =
    useMemo(
      () =>
        riders.filter(
          (rider) =>
            rider.kycStatus ===
            "Pending"
        ).length,
      [riders]
    );

  const approvedApplications =
    useMemo(
      () =>
        riders.filter(
          (rider) =>
            rider.kycStatus ===
            "Approved"
        ).length,
      [riders]
    );

  const rejectedApplications =
    useMemo(
      () =>
        riders.filter(
          (rider) =>
            rider.kycStatus ===
            "Rejected"
        ).length,
      [riders]
    );

  /* =======================================================
     APPROVE KYC
  ======================================================= */

  const approveRider =
    async (
      rider: Rider
    ) => {
      if (
        processingId
      ) {
        return;
      }

      const id =
        rider.riderId ||
        rider._id;

      if (!id) {
        alert(
          "Rider ID is missing."
        );

        return;
      }

      if (
        rider.kycStatus ===
        "Approved"
      ) {
        return;
      }

      setProcessingId(id);

      try {
        const response =
          await fetch(
            `/api/riders/${encodeURIComponent(
              id
            )}`,
            {
              method:
                "PATCH",

              headers: {
                "Content-Type":
                  "application/json",

                Accept:
                  "application/json",
              },

              body:
                JSON.stringify({
                  kycStatus:
                    "Approved",

                  approvalStatus:
                    "Approved",

                  status:
                    "Active",
                }),
            }
          );

        let result:
          RidersApiResponse = {};

        try {
          result =
            await response.json();
        } catch {
          result = {};
        }

        if (
          !response.ok ||
          result.success === false
        ) {
          throw new Error(
            result.message ||
              "Failed to approve KYC."
          );
        }

        /*
         * Reload the complete rider
         * collection immediately.
         *
         * This guarantees that:
         * - old riders remain visible
         * - new riders remain visible
         * - KPI counts update
         * - the approved rider gets
         *   the latest database state
         */

        await loadRiders(
          true
        );
      } catch (approveError) {
        console.error(
          "KYC APPROVAL ERROR:",
          approveError
        );

        alert(
          approveError instanceof
            Error
            ? approveError.message
            : "Failed to approve KYC."
        );
      } finally {
        setProcessingId("");
      }
    };

  /* =======================================================
     REJECT KYC
  ======================================================= */

  const rejectRider =
    async (
      rider: Rider
    ) => {
      if (
        processingId
      ) {
        return;
      }

      const id =
        rider.riderId ||
        rider._id;

      if (!id) {
        alert(
          "Rider ID is missing."
        );

        return;
      }

      if (
        rider.kycStatus ===
        "Rejected"
      ) {
        return;
      }

      const reason =
        window.prompt(
          "Enter KYC rejection reason:"
        );

      if (
        reason ===
          null ||
        !reason.trim()
      ) {
        return;
      }

      setProcessingId(id);

      try {
        const response =
          await fetch(
            `/api/riders/${encodeURIComponent(
              id
            )}`,
            {
              method:
                "PATCH",

              headers: {
                "Content-Type":
                  "application/json",

                Accept:
                  "application/json",
              },

              body:
                JSON.stringify({
                  kycStatus:
                    "Rejected",

                  approvalStatus:
                    "Rejected",

                  rejectedReason:
                    reason.trim(),
                }),
            }
          );

        let result:
          RidersApiResponse = {};

        try {
          result =
            await response.json();
        } catch {
          result = {};
        }

        if (
          !response.ok ||
          result.success === false
        ) {
          throw new Error(
            result.message ||
              "Failed to reject KYC."
          );
        }

        await loadRiders(
          true
        );
      } catch (rejectError) {
        console.error(
          "KYC REJECTION ERROR:",
          rejectError
        );

        alert(
          rejectError instanceof
            Error
            ? rejectError.message
            : "Failed to reject KYC."
        );
      } finally {
        setProcessingId("");
      }
    };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <PageContainer>
        <DashboardHeader
          title="KYC Verification Dashboard"
          subtitle="Loading KYC applications..."
        />
      </PageContainer>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <PageContainer>
      <DashboardHeader
        title="KYC Verification Dashboard"
        subtitle="Review rider documents and approve KYC verification requests."
      />

      {/* ===================================================
          ERROR
      =================================================== */}

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <span>
              {error}
            </span>

            <button
              type="button"
              onClick={() =>
                void loadRiders(
                  true
                )
              }
              className="rounded-xl bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* ===================================================
          KPI GRID
      =================================================== */}

      <KPIGrid>
        <KPICard
          title="Applications"
          value={
            totalApplications
          }
          subtitle="Total Requests"
          icon="🪪"
          color="pink"
        />

        <KPICard
          title="Pending"
          value={
            pendingApplications
          }
          subtitle="Under Review"
          icon="⏳"
          color="yellow"
        />

        <KPICard
          title="Approved"
          value={
            approvedApplications
          }
          subtitle="Verified"
          icon="✅"
          color="green"
        />

        <KPICard
          title="Rejected"
          value={
            rejectedApplications
          }
          subtitle="Declined"
          icon="❌"
          color="red"
        />
      </KPIGrid>

      {/* ===================================================
          SECTION
      =================================================== */}

      <SectionHeader
        title="KYC Applications"
        subtitle="Review submitted rider verification documents."
        rightContent={
          <DashboardActions
            filename="KYC.csv"
            rows={riders.map((rider: any) => ({
              RiderID: rider.riderId,
              Name: rider.fullName,
              Phone: rider.phone,
              KYC: rider.kycStatus || rider.approvalStatus,
            }))}
          />
        }
      />

      {/* ===================================================
          TABLE
      =================================================== */}

      <DashboardCard
        title="Verification Requests"
        subtitle="Live KYC Records"
      >
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={() =>
              void loadRiders(
                true
              )
            }
            disabled={
              refreshing
            }
            className="rounded-xl bg-[#0A1134] px-5 py-2.5 font-semibold text-white hover:bg-[#141d50] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>

        <div className="overflow-x-auto rounded-3xl">
          <table className="min-w-[1400px] w-full">
            <thead>
              <tr className="border-b border-pink-100 bg-pink-50">
                <th className="px-6 py-5 text-left font-bold text-[#0A1134]">
                  Rider ID
                </th>

                <th className="px-6 py-5 text-left font-bold text-[#0A1134]">
                  Rider
                </th>

                <th className="px-6 py-5 text-left font-bold text-[#0A1134]">
                  Phone
                </th>

                <th className="px-6 py-5 text-center font-bold text-[#0A1134]">
                  Aadhaar Front
                </th>

                <th className="px-6 py-5 text-center font-bold text-[#0A1134]">
                  Aadhaar Back
                </th>

                <th className="px-6 py-5 text-center font-bold text-[#0A1134]">
                  DL Front
                </th>

                <th className="px-6 py-5 text-center font-bold text-[#0A1134]">
                  DL Back
                </th>

                <th className="px-6 py-5 text-center font-bold text-[#0A1134]">
                  Photo
                </th>

                <th className="px-6 py-5 text-center font-bold text-[#0A1134]">
                  Submitted On
                </th>

                <th className="px-6 py-5 text-center font-bold text-[#0A1134]">
                  Status
                </th>

                <th className="px-6 py-5 text-center font-bold text-[#0A1134]">
                  Approve
                </th>

                <th className="px-6 py-5 text-center font-bold text-[#0A1134]">
                  Reject
                </th>
              </tr>
            </thead>

            <tbody>
              {/* =================================================
                  EMPTY STATE
              ================================================= */}

              {riders.length ===
                0 && (
                <tr>
                  <td
                    colSpan={
                      12
                    }
                    className="py-12 text-center text-gray-500"
                  >
                    No KYC applications found.
                  </td>
                </tr>
              )}

              {/* =================================================
                  RIDERS
              ================================================= */}

              {riders.map(
                (
                  rider
                ) => {
                  const id =
                    rider.riderId ||
                    rider._id;

                  const isProcessing =
                    processingId ===
                    id;

                  return (
                    <tr
                      key={
                        rider._id ||
                        rider.riderId
                      }
                      className="border-b border-pink-50 transition hover:bg-pink-50/40"
                    >
                      {/* ================================
                          RIDER ID
                      ================================= */}

                      <td className="px-6 py-5 font-semibold text-[#FF165E]">
                        {
                          rider.riderId ||
                          "—"
                        }
                      </td>

                      {/* ================================
                          RIDER
                      ================================= */}

                      <td className="px-6 py-5">
                        <div className="font-semibold">
                          {
                            rider.fullName ||
                            "—"
                          }
                        </div>

                        {rider.email && (
                          <div className="mt-1 text-xs text-gray-500">
                            {
                              rider.email
                            }
                          </div>
                        )}
                      </td>

                      {/* ================================
                          PHONE
                      ================================= */}

                      <td className="px-6 py-5">
                        {
                          rider.phone ||
                          "—"
                        }
                      </td>

                      {/* ================================
                          AADHAAR FRONT
                      ================================= */}

                      <td className="px-6 py-5 text-center">
                        <DocumentLink
                          url={
                            rider.aadhaarFrontUrl
                          }
                        />
                      </td>

                      {/* ================================
                          AADHAAR BACK
                      ================================= */}

                      <td className="px-6 py-5 text-center">
                        <DocumentLink
                          url={
                            rider.aadhaarBackUrl
                          }
                        />
                      </td>

                      {/* ================================
                          DL FRONT
                      ================================= */}

                      <td className="px-6 py-5 text-center">
                        <DocumentLink
                          url={
                            rider.licenseFrontUrl
                          }
                        />
                      </td>

                      {/* ================================
                          DL BACK
                      ================================= */}

                      <td className="px-6 py-5 text-center">
                        <DocumentLink
                          url={
                            rider.licenseBackUrl
                          }
                        />
                      </td>

                      {/* ================================
                          PROFILE PHOTO
                      ================================= */}

                      <td className="px-6 py-5 text-center">
                        <DocumentLink
                          url={
                            rider.profilePhotoUrl
                          }
                        />
                      </td>

                      {/* ================================
                          CREATED AT
                      ================================= */}

                      <td className="px-6 py-5 text-center text-sm">
                        {rider.createdAt
                          ? new Date(
                              rider.createdAt
                            ).toLocaleString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month:
                                  "short",
                                year:
                                  "numeric",
                                hour:
                                  "2-digit",
                                minute:
                                  "2-digit",
                              }
                            )
                          : "—"}
                      </td>

                      {/* ================================
                          KYC STATUS
                      ================================= */}

                      <td className="px-6 py-5 text-center">
                        {rider.kycStatus ===
                          "Approved" && (
                          <StatusBadge
                            status="active"
                          />
                        )}

                        {rider.kycStatus ===
                          "Pending" && (
                          <StatusBadge
                            status="warning"
                          />
                        )}

                        {rider.kycStatus ===
                          "Rejected" && (
                          <StatusBadge
                            status="inactive"
                          />
                        )}

                        {![
                          "Approved",
                          "Pending",
                          "Rejected",
                        ].includes(
                          rider.kycStatus
                        ) && (
                          <span className="text-xs font-semibold text-gray-500">
                            {
                              rider.kycStatus
                            }
                          </span>
                        )}

                        {rider.kycStatus ===
                          "Rejected" &&
                          rider.rejectedReason && (
                            <div className="mt-2 max-w-[180px] text-xs text-red-500">
                              {
                                rider.rejectedReason
                              }
                            </div>
                          )}
                      </td>

                      {/* ================================
                          APPROVE
                      ================================= */}

                      <td className="px-6 py-5 text-center">
                        {rider.kycStatus ===
                          "Approved" ? (
                          <span className="font-bold text-green-600">
                            Approved
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={
                              Boolean(
                                processingId
                              )
                            }
                            onClick={() =>
                              void approveRider(
                                rider
                              )
                            }
                            className="rounded-xl bg-green-600 px-5 py-2 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isProcessing
                              ? "Processing..."
                              : "Approve"}
                          </button>
                        )}
                      </td>

                      {/* ================================
                          REJECT
                      ================================= */}

                      <td className="px-6 py-5 text-center">
                        {rider.kycStatus ===
                          "Rejected" ? (
                          <span className="font-bold text-red-600">
                            Rejected
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={
                              Boolean(
                                processingId
                              )
                            }
                            onClick={() =>
                              void rejectRider(
                                rider
                              )
                            }
                            className="rounded-xl bg-red-600 px-5 py-2 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isProcessing
                              ? "Processing..."
                              : "Reject"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </div>
      </DashboardCard>
    </PageContainer>
  );
}