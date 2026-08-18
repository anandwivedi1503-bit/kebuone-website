"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

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

  walletBalance?: number;

  walletStatus?: string;

  walletAdminBlocked?: boolean;

  status:
    | "Active"
    | "Inactive"
    | "Blocked"
    | "Suspended"
    | string;

  bookingEnabled: boolean;

  activeRide: boolean;

  blacklisted: boolean;

  approvedAt?: string;

  rejectedReason?: string;

  createdAt?: string;

  updatedAt?: string;
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
    _id:
      String(
        value?._id ??
          value?.id ??
          ""
      ),

    riderId:
      String(
        value?.riderId ??
          ""
      ),

    fullName:
      String(
        value?.fullName ??
          ""
      ),

    phone:
      String(
        value?.phone ??
          ""
      ),

    email:
      value?.email
        ? String(
            value.email
          )
        : "",

    kycStatus:
      String(
        value?.kycStatus ??
          "Pending"
      ),

    approvalStatus:
      String(
        value?.approvalStatus ??
          "Under Review"
      ),

    walletBalance:
      Number(
        value?.walletBalance ??
          0
      ),

    walletStatus:
      value?.walletStatus
        ? String(
            value.walletStatus
          )
        : "Blocked",

    walletAdminBlocked:
      Boolean(
        value?.walletAdminBlocked ??
          false
      ),

    status:
      String(
        value?.status ??
          "Inactive"
      ),

    bookingEnabled:
      Boolean(
        value?.bookingEnabled ??
          false
      ),

    activeRide:
      Boolean(
        value?.activeRide ??
          false
      ),

    blacklisted:
      Boolean(
        value?.blacklisted ??
          false
      ),

    approvedAt:
      value?.approvedAt
        ? String(
            value.approvedAt
          )
        : undefined,

    rejectedReason:
      value?.rejectedReason
        ? String(
            value.rejectedReason
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
  };
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function UserManagement() {
  const [riders, setRiders] =
    useState<Rider[]>([]);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

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
                "Failed to fetch riders."
            );
          }

          /*
           * /api/riders should return:
           *
           * {
           *   success: true,
           *   data: [...]
           * }
           */

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
            "USER MANAGEMENT LOAD RIDERS ERROR:",
            loadError
          );

          setError(
            loadError instanceof
              Error
              ? loadError.message
              : "Unable to load riders."
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
     KPI COUNTS
  ======================================================= */

  const totalRiders =
    riders.length;

  const activeUsers =
    useMemo(
      () =>
        riders.filter(
          (rider) =>
            rider.status ===
              "Active" &&
            rider.bookingEnabled ===
              true &&
            rider.blacklisted !==
              true
        ).length,
      [riders]
    );

  const pendingKYC =
    useMemo(
      () =>
        riders.filter(
          (rider) =>
            rider.kycStatus ===
            "Pending"
        ).length,
      [riders]
    );

  const suspendedUsers =
    useMemo(
      () =>
        riders.filter(
          (rider) =>
            rider.status ===
            "Suspended"
        ).length,
      [riders]
    );

  /* =======================================================
     SEARCH + FILTER
  ======================================================= */

  const filteredRiders =
    useMemo(() => {
      const searchValue =
        search
          .trim()
          .toLowerCase();

      return riders.filter(
        (rider) => {
          const matchesSearch =
            !searchValue ||
            rider.fullName
              .toLowerCase()
              .includes(
                searchValue
              ) ||
            rider.phone
              .toLowerCase()
              .includes(
                searchValue
              ) ||
            rider.email
              ?.toLowerCase()
              .includes(
                searchValue
              ) ||
            rider.riderId
              .toLowerCase()
              .includes(
                searchValue
              );

          const matchesStatus =
            statusFilter ===
              "All" ||
            rider.approvalStatus ===
              statusFilter ||
            rider.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      riders,
      search,
      statusFilter,
    ]);

  /* =======================================================
     ACTIVATE / APPROVE RIDER
  ======================================================= */

  const activateRider =
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
                  approvalStatus:
                    "Approved",

                  kycStatus:
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
              "Failed to activate rider."
          );
        }

        /*
         * Refresh immediately.
         *
         * This ensures the dashboard displays
         * the new status without waiting for
         * the 10-second polling interval.
         */

        await loadRiders(
          true
        );
      } catch (activateError) {
        console.error(
          "ACTIVATE RIDER ERROR:",
          activateError
        );

        alert(
          activateError instanceof
            Error
            ? activateError.message
            : "Unable to activate rider."
        );
      } finally {
        setProcessingId("");
      }
    };

  /* =======================================================
     SUSPEND RIDER
  ======================================================= */

  const suspendRider =
    async (
      rider: Rider
    ) => {
      if (
        processingId
      ) {
        return;
      }

      if (
        rider.activeRide
      ) {
        alert(
          "This rider currently has an active ride and cannot be suspended."
        );

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
                  status:
                    "Suspended",

                  approvalStatus:
                    "Suspended",
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
              "Failed to suspend rider."
          );
        }

        await loadRiders(
          true
        );
      } catch (suspendError) {
        console.error(
          "SUSPEND RIDER ERROR:",
          suspendError
        );

        alert(
          suspendError instanceof
            Error
            ? suspendError.message
            : "Unable to suspend rider."
        );
      } finally {
        setProcessingId("");
      }
    };

  /* =======================================================
     LOADING STATE
  ======================================================= */

  if (loading) {
    return (
      <PageContainer>
        <DashboardHeader
          title="User Management"
          subtitle="Loading riders..."
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
        title="User Management"
        subtitle="Manage riders, KYC verification, wallet balances and account activity."
      />

      {/* ===================================================
          ERROR
      =================================================== */}

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
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
          KPI
      =================================================== */}

      <KPIGrid>
        <KPICard
          title="Riders"
          value={
            totalRiders
          }
          subtitle="Registered"
          icon="👥"
          color="pink"
        />

        <KPICard
          title="Active"
          value={
            activeUsers
          }
          subtitle="Currently Active"
          icon="✅"
          color="green"
        />

        <KPICard
          title="KYC Pending"
          value={
            pendingKYC
          }
          subtitle="Verification"
          icon="🪪"
          color="yellow"
        />

        <KPICard
          title="Suspended"
          value={
            suspendedUsers
          }
          subtitle="Restricted"
          icon="🚫"
          color="red"
        />
      </KPIGrid>

      {/* ===================================================
          DIRECTORY HEADER
      =================================================== */}

      <SectionHeader
        title="Rider Directory"
        subtitle="Search and manage rider accounts."
        rightContent={
          <DashboardActions
            filename="Riders.csv"
            rows={filteredRiders.map((rider: any) => ({
              RiderID: rider.riderId,
              Name: rider.fullName,
              Phone: rider.phone,
              Email: rider.email,
              Status: rider.approvalStatus,
            }))}
          />
        }
      />

      {/* ===================================================
          SEARCH / FILTER
      =================================================== */}

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <input
          type="text"
          placeholder="Search rider by name, phone, email or rider ID..."
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
          className="flex-1 h-14 rounded-2xl border border-pink-100 bg-white px-5 py-4 focus:outline-none focus:ring-2 focus:ring-pink-200"
        />

        <select
          value={
            statusFilter
          }
          onChange={(event) =>
            setStatusFilter(
              event.target.value
            )
          }
          className="h-14 rounded-2xl border border-pink-100 bg-white px-5 focus:outline-none focus:ring-2 focus:ring-pink-200"
        >
          <option value="All">
            All
          </option>

          <option value="Approved">
            Approved
          </option>

          <option value="Rejected">
            Rejected
          </option>

          <option value="Under Review">
            Under Review
          </option>

          <option value="Suspended">
            Suspended
          </option>

          <option value="Blocked">
            Blocked
          </option>

          <option value="Inactive">
            Inactive
          </option>
        </select>

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
          className="h-14 rounded-2xl bg-[#0A1134] px-6 font-semibold text-white hover:bg-[#141d50] disabled:opacity-50"
        >
          {refreshing
            ? "Refreshing..."
            : "Refresh"}
        </button>
      </div>

      {/* ===================================================
          RIDER TABLE
      =================================================== */}

      <DashboardCard
        title="Riders"
        subtitle="Live User Records"
      >
        <div className="overflow-x-auto rounded-3xl">
          <table className="min-w-[1200px] w-full">
            <thead>
              <tr className="bg-pink-50 border-b border-pink-100">
                <th className="px-6 py-5 text-left font-bold text-[#0A1134]">
                  Rider
                </th>

                <th className="px-6 py-5 text-left font-bold text-[#0A1134]">
                  Phone
                </th>

                <th className="px-6 py-5 text-left font-bold text-[#0A1134]">
                  Email
                </th>

                <th className="px-6 py-5 text-center font-bold text-[#0A1134]">
                  KYC
                </th>

                <th className="px-6 py-5 text-center font-bold text-[#0A1134]">
                  Approval
                </th>

                <th className="px-6 py-5 text-center font-bold text-[#0A1134]">
                  Wallet
                </th>

                <th className="px-6 py-5 text-center font-bold text-[#0A1134]">
                  Status
                </th>

                <th className="px-6 py-5 text-center font-bold text-[#0A1134]">
                  Activate
                </th>

                <th className="px-6 py-5 text-center font-bold text-[#0A1134]">
                  Suspend
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredRiders.length ===
                0 && (
                <tr>
                  <td
                    colSpan={
                      9
                    }
                    className="text-center py-12 text-gray-500"
                  >
                    {riders.length ===
                    0
                      ? "No rider records are currently available."
                      : "No riders match your search/filter."}
                  </td>
                </tr>
              )}

              {filteredRiders.map(
                (rider) => {
                  const riderProcessing =
                    processingId ===
                    (
                      rider.riderId ||
                      rider._id
                    );

                  return (
                    <tr
                      key={
                        rider._id ||
                        rider.riderId
                      }
                      className="border-b border-pink-50 hover:bg-pink-50/40 transition"
                    >
                      {/* ===========================
                          RIDER
                      ============================ */}

                      <td className="px-6 py-5">
                        <div className="font-semibold">
                          {
                            rider.fullName
                          }
                        </div>

                        <div className="text-xs text-gray-500 mt-1">
                          {
                            rider.riderId
                          }
                        </div>
                      </td>

                      {/* ===========================
                          PHONE
                      ============================ */}

                      <td className="px-6 py-5">
                        {
                          rider.phone
                        }
                      </td>

                      {/* ===========================
                          EMAIL
                      ============================ */}

                      <td className="px-6 py-5 break-all">
                        {rider.email ||
                          "—"}
                      </td>

                      {/* ===========================
                          KYC
                      ============================ */}

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
                      </td>

                      {/* ===========================
                          APPROVAL
                      ============================ */}

                      <td className="px-6 py-5 text-center">
                        {rider.approvalStatus ===
                          "Approved" && (
                          <StatusBadge
                            status="active"
                          />
                        )}

                        {rider.approvalStatus ===
                          "Under Review" && (
                          <StatusBadge
                            status="warning"
                          />
                        )}

                        {(
                          [
                            "Rejected",
                            "Suspended",
                          ] as string[]
                        ).includes(
                          rider.approvalStatus
                        ) && (
                          <StatusBadge
                            status="inactive"
                          />
                        )}

                        {![
                          "Approved",
                          "Under Review",
                          "Rejected",
                          "Suspended",
                        ].includes(
                          rider.approvalStatus
                        ) && (
                          <span className="text-xs font-semibold text-gray-500">
                            {
                              rider.approvalStatus
                            }
                          </span>
                        )}
                      </td>

                      {/* ===========================
                          WALLET
                      ============================ */}

                      <td className="px-6 py-5 text-center">
                        <div className="font-bold">
                          ₹
                          {Number(
                            rider.walletBalance ??
                              0
                          ).toFixed(
                            2
                          )}
                        </div>

                        {rider.walletAdminBlocked && (
                          <div className="text-xs text-red-600 font-semibold mt-1">
                            BLOCKED
                          </div>
                        )}
                      </td>

                      {/* ===========================
                          STATUS
                      ============================ */}

                      <td className="px-6 py-5 text-center">
                        {rider.status ===
                            "Active" &&
                        rider.bookingEnabled ===
                            true &&
                        rider.blacklisted !==
                            true ? (
                          <span className="font-bold text-green-600">
                            ACTIVE
                          </span>
                        ) : rider.blacklisted ? (
                          <span className="font-bold text-red-600">
                            BLACKLISTED
                          </span>
                        ) : (
                          <span className="font-bold text-red-600">
                            {rider.status
                              ?.toUpperCase() ||
                              "INACTIVE"}
                          </span>
                        )}
                      </td>

                      {/* ===========================
                          ACTIVATE
                      ============================ */}

                      <td className="px-6 py-5 text-center">
                        {rider.approvalStatus ===
                            "Approved" &&
                        rider.kycStatus ===
                            "Approved" &&
                        rider.status ===
                            "Active" &&
                        rider.bookingEnabled ===
                            true ? (
                          <span className="text-green-600 font-semibold">
                            Active
                          </span>
                        ) : rider.blacklisted ? (
                          <span className="text-gray-400">
                            —
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              void activateRider(
                                rider
                              )
                            }
                            disabled={
                              riderProcessing ||
                              rider.activeRide
                            }
                            className="px-4 py-2 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {riderProcessing
                              ? "..."
                              : "Activate"}
                          </button>
                        )}
                      </td>

                      {/* ===========================
                          SUSPEND
                      ============================ */}

                      <td className="px-6 py-5 text-center">
                        {rider.status ===
                          "Active" ? (
                          <button
                            type="button"
                            onClick={() =>
                              void suspendRider(
                                rider
                              )
                            }
                            disabled={
                              riderProcessing ||
                              rider.activeRide
                            }
                            title={
                              rider.activeRide
                                ? "Cannot suspend a rider during an active ride."
                                : "Suspend rider"
                            }
                            className="px-4 py-2 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {riderProcessing
                              ? "..."
                              : "Suspend"}
                          </button>
                        ) : (
                          <span className="text-gray-400">
                            —
                          </span>
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