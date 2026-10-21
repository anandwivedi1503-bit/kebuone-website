/** Shared ops statuses so Admin home, pulse, search, money, and desks agree. */

export const OPEN_TICKET_STATUSES = ["OPEN", "IN-PROGRESS"] as const;

export const PENDING_REFUND_STATUSES = ["PENDING", "PROCESSING"] as const;

export const UNPAID_PAYMENT_STATUSES = ["Pending", "Partial"] as const;

/** Rider KYC waiting on staff — matches KYC desk fields, not invented status names. */
export const PENDING_KYC_FILTER = {
  $or: [{ kycStatus: "Pending" }, { approvalStatus: "Under Review" }],
};
