import Booking from "@/models/Booking";
import Refund from "@/models/Refund";
import Transaction from "@/models/Transaction";
import Wallet from "@/models/Wallet";
import { REVENUE_TRANSACTION_TYPES } from "@/lib/opsRevenue";

function roundMoney(value: number) {
  return Math.round(Number(value || 0) * 100) / 100;
}

export async function getOpsMoneySummary() {
  const notDeleted = {
    $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
  };

  const [bookingAgg, txnAgg, cashAgg, walletAgg, refundAgg] = await Promise.all([
    Booking.aggregate([
      { $match: notDeleted },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          received: { $sum: { $ifNull: ["$receivedAmount", 0] } },
          pending: { $sum: { $ifNull: ["$pendingAmount", 0] } },
          deposit: { $sum: { $ifNull: ["$securityDeposit", 0] } },
          fullyPaid: { $sum: { $cond: [{ $eq: ["$paymentStatus", "Paid"] }, 1, 0] } },
          partial: { $sum: { $cond: [{ $eq: ["$paymentStatus", "Partial"] }, 1, 0] } },
          unpaid: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ["$rideStatus", "Cancelled"] },
                    {
                      $or: [
                        { $eq: ["$paymentStatus", "Unpaid"] },
                        { $eq: ["$paymentStatus", "Pending"] },
                      ],
                    },
                  ],
                },
                1,
                0,
              ],
            },
          },
          pendingLive: {
            $sum: {
              $cond: [
                { $eq: ["$rideStatus", "Cancelled"] },
                0,
                { $ifNull: ["$pendingAmount", 0] },
              ],
            },
          },
        },
      },
    ]),
    Transaction.aggregate([
      {
        $match: {
          status: "Success",
          transactionType: {
            $in: [...REVENUE_TRANSACTION_TYPES],
          },
          ...notDeleted,
        },
      },
      {
        $group: {
          _id: { $ifNull: ["$paymentMethod", "Unknown"] },
          total: { $sum: { $ifNull: ["$amount", 0] } },
          count: { $sum: 1 },
        },
      },
    ]),
    Transaction.aggregate([
      {
        $match: {
          paymentMethod: "Cash",
          status: "Success",
          transactionType: { $in: [...REVENUE_TRANSACTION_TYPES] },
          ...notDeleted,
        },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$cashHandoverStatus", "HandedOver"] },
              "HandedOver",
              {
                $cond: [
                  { $eq: ["$cashHandoverStatus", "DueToCompany"] },
                  "DueToCompany",
                  "Other",
                ],
              },
            ],
          },
          total: { $sum: { $ifNull: ["$amount", 0] } },
          count: { $sum: 1 },
        },
      },
    ]),
    Wallet.aggregate([
      { $match: notDeleted },
      {
        $group: {
          _id: null,
          riders: { $sum: 1 },
          credit: { $sum: { $ifNull: ["$balance", 0] } },
          hold: { $sum: { $ifNull: ["$securityDepositHold", 0] } },
        },
      },
    ]),
    Refund.aggregate([
      {
        $match: {
          $or: [
            { bookingId: { $exists: true, $nin: [null, ""] } },
            { ticketId: { $exists: true, $nin: [null, ""] } },
          ],
        },
      },
      {
        $lookup: {
          from: "bookings",
          localField: "bookingId",
          foreignField: "bookingId",
          as: "bk",
        },
      },
      {
        $match: {
          $or: [
            { "bk.0": { $exists: true } },
            { ticketId: { $exists: true, $nin: [null, ""] } },
          ],
        },
      },
      {
        $group: {
          _id: { $toUpper: { $ifNull: ["$refundStatus", "UNKNOWN"] } },
          total: { $sum: { $ifNull: ["$amount", 0] } },
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const booking = bookingAgg[0] ?? {};
  const methodTotal = (name: string) =>
    roundMoney(
      Number(
        txnAgg.find((row) => String(row._id).toLowerCase() === name.toLowerCase())?.total ?? 0
      )
    );
  const due = cashAgg.find((row) => String(row._id) === "DueToCompany");
  const handed = cashAgg.find((row) => String(row._id) === "HandedOver");
  const wallet = walletAgg[0] ?? {};
  const pendingRefund = refundAgg.filter((row) =>
    ["PENDING", "PROCESSING", "APPROVED"].includes(String(row._id))
  );
  const refunded = refundAgg.find((row) => String(row._id) === "REFUNDED");

  return {
    asOf: new Date().toISOString(),
    bookings: {
      count: Number(booking.count ?? 0),
      received: roundMoney(Number(booking.received ?? 0)),
      pending: roundMoney(Number(booking.pendingLive ?? booking.pending ?? 0)),
      deposit: roundMoney(Number(booking.deposit ?? 0)),
      fullyPaid: Number(booking.fullyPaid ?? 0),
      partial: Number(booking.partial ?? 0),
      unpaid: Number(booking.unpaid ?? 0),
    },
    payments: {
      razorpay: methodTotal("Razorpay") + methodTotal("Razorpay Payment Link") + methodTotal("UPI") + methodTotal("Card"),
      cash: methodTotal("Cash"),
      walletCredit: methodTotal("Wallet"),
      successCount: txnAgg.reduce((n, row) => n + Number(row.count ?? 0), 0),
    },
    cashHandover: {
      dueToCompany: roundMoney(Number(due?.total ?? 0)),
      handedOver: roundMoney(Number(handed?.total ?? 0)),
      dueCount: Number(due?.count ?? 0),
    },
    wallets: {
      riders: Number(wallet.riders ?? 0),
      creditBalance: roundMoney(Number(wallet.credit ?? 0)),
      depositHold: roundMoney(Number(wallet.hold ?? 0)),
    },
    refunds: {
      pending: roundMoney(pendingRefund.reduce((n, row) => n + Number(row.total ?? 0), 0)),
      pendingCount: pendingRefund.reduce((n, row) => n + Number(row.count ?? 0), 0),
      refunded: roundMoney(Number(refunded?.total ?? 0)),
      refundedCount: Number(refunded?.count ?? 0),
    },
  };
}

export type OpsMoneySummary = Awaited<ReturnType<typeof getOpsMoneySummary>>;

export async function attachLiveBookingsByRider(rows: Array<Record<string, unknown>>) {
  const riderIds = Array.from(
    new Set(rows.map((row) => String(row.riderId || "").trim().toUpperCase()).filter(Boolean))
  );
  if (riderIds.length === 0) return rows;

  const bookings = await Booking.find({
    riderId: { $in: riderIds },
    rideStatus: {
      $in: ["Booked", "Reserved", "Payment Pending", "Ready For Pickup", "In Ride"],
    },
    $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
  })
    .select(
      "bookingId riderId receivedAmount pendingAmount paymentStatus rideStatus securityDeposit createdAt"
    )
    .sort({ createdAt: -1 })
    .lean();

  const latest = new Map<string, (typeof bookings)[number]>();
  for (const booking of bookings) {
    const riderId = String(booking.riderId || "").toUpperCase();
    if (!latest.has(riderId)) latest.set(riderId, booking);
  }

  return rows.map((row) => {
    const live = latest.get(String(row.riderId || "").toUpperCase());
    return {
      ...row,
      liveBooking: live
        ? {
            bookingId: live.bookingId,
            receivedAmount: Number(live.receivedAmount || 0),
            pendingAmount: Number(live.pendingAmount || 0),
            paymentStatus: live.paymentStatus,
            rideStatus: live.rideStatus,
            securityDeposit: Number(live.securityDeposit || 0),
          }
        : null,
    };
  });
}

export async function attachBookingSnapshotsToRefunds(
  rows: Array<Record<string, unknown>>
) {
  const bookingIds = Array.from(
    new Set(rows.map((row) => String(row.bookingId || "").trim().toUpperCase()).filter(Boolean))
  );
  if (bookingIds.length === 0) {
    return rows.map((row) => ({
      ...row,
      bookingSnapshot: null,
      refundKind: String(row.remarks || "").toLowerCase().includes("security deposit")
        ? "SecurityDeposit"
        : "Manual",
    }));
  }

  const bookings = await Booking.find({ bookingId: { $in: bookingIds } })
    .select("bookingId receivedAmount pendingAmount paymentStatus rideStatus securityDeposit depositRefunded securityDepositRefunded")
    .lean();
  const byId = new Map(bookings.map((booking) => [String(booking.bookingId).toUpperCase(), booking]));

  return rows.map((row) => {
    const booking = byId.get(String(row.bookingId || "").toUpperCase()) || null;
    const deposit = Number(booking?.securityDeposit || 0);
    const amount = Number(row.amount || 0);
    const remarks = String(row.remarks || "").toLowerCase();
    const isDeposit =
      remarks.includes("security deposit") || (deposit > 0 && Math.abs(deposit - amount) < 0.02);

    return {
      ...row,
      bookingSnapshot: booking
        ? {
            bookingId: booking.bookingId,
            receivedAmount: Number(booking.receivedAmount || 0),
            pendingAmount: Number(booking.pendingAmount || 0),
            paymentStatus: booking.paymentStatus,
            rideStatus: booking.rideStatus,
            securityDeposit: deposit,
            depositRefunded: Boolean(booking.depositRefunded || booking.securityDepositRefunded),
          }
        : null,
      refundKind: isDeposit ? "SecurityDeposit" : "Manual",
    };
  });
}
