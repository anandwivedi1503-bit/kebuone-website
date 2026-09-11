/** Cap used when staff mark a refund REFUNDED. Does not send money. */

export function isDepositRefundRow(refund: {
  refundSource?: string;
  remarks?: string;
}) {
  const source = String(refund.refundSource || "").trim();
  if (source === "Security Deposit") return true;
  if (source === "Booking Cancellation") return false;
  return /security deposit/i.test(String(refund.remarks || ""));
}

export function refundApproveMaxAmount(
  refund: {
    refundSource?: string;
    remarks?: string;
  },
  booking: {
    receivedAmount?: number;
    securityDeposit?: number;
  }
) {
  const deposit = Number(booking.securityDeposit || 0);
  const received = Number(booking.receivedAmount || 0);

  if (isDepositRefundRow(refund)) {
    return deposit;
  }

  if (String(refund.refundSource || "").trim() === "Booking Cancellation") {
    return received;
  }

  return received + deposit;
}

export function refundExceedsApproveCap(
  refund: {
    amount?: number;
    refundSource?: string;
    remarks?: string;
  },
  booking: {
    receivedAmount?: number;
    securityDeposit?: number;
  }
) {
  const amount = Number(refund.amount || 0);
  const cap = refundApproveMaxAmount(refund, booking);
  return amount > cap + 0.009;
}

export function refundApproveCapMessage(
  refund: {
    refundSource?: string;
    remarks?: string;
  }
) {
  if (isDepositRefundRow(refund)) {
    return "Refund amount exceeds security deposit.";
  }
  if (String(refund.refundSource || "").trim() === "Booking Cancellation") {
    return "Refund amount exceeds rental paid on this booking.";
  }
  return "Refund amount exceeds paid rental plus security deposit.";
}
