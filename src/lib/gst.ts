export const CGST_RATE = 0.025;
export const SGST_RATE = 0.025;
export const GST_RATE = CGST_RATE + SGST_RATE;

export function money(value: unknown) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return 0;
  }

  return Number(Math.max(0, amount).toFixed(2));
}

export function gstBreakdown(taxableAmount: unknown) {
  const taxable = money(taxableAmount);
  const cgstAmount = money(taxable * CGST_RATE);
  const sgstAmount = money(taxable * SGST_RATE);
  const gstAmount = money(cgstAmount + sgstAmount);

  return {
    taxableAmount: taxable,
    cgstRate: CGST_RATE,
    sgstRate: SGST_RATE,
    gstRate: GST_RATE,
    cgstAmount,
    sgstAmount,
    gstAmount,
    totalWithGst: money(taxable + gstAmount),
  };
}

type BookingPayableSource = {
  paymentDue?: unknown;
  pendingAmount?: unknown;
  receivedAmount?: unknown;
  rateApplied?: unknown;
  totalAmount?: unknown;
  gstAmount?: unknown;
  securityDeposit?: unknown;
};

export function getBookingPayableAmount(booking: BookingPayableSource) {
  const paymentDue = money(booking.paymentDue);

  if (paymentDue > 0) {
    return paymentDue;
  }

  const received = money(booking.receivedAmount);
  const pending = money(booking.pendingAmount);

  if (received + pending > 0) {
    return money(received + pending);
  }

  return money(
    money(booking.rateApplied || booking.totalAmount) +
      money(booking.gstAmount) +
      money(booking.securityDeposit)
  );
}

export function gstShareForPayment(params: {
  rentalAmount: unknown;
  gstAmount: unknown;
  previousReceived: unknown;
  paidNow: unknown;
}) {
  const rentalAmount = money(params.rentalAmount);
  const bookingGst = money(params.gstAmount);
  const previousReceived = money(params.previousReceived);
  const paidNow = money(params.paidNow);
  const rentalWithGst = money(rentalAmount + bookingGst);
  const remainingRentalWithGst = money(
    Math.max(0, rentalWithGst - Math.min(previousReceived, rentalWithGst))
  );
  const appliedToRental = money(Math.min(paidNow, remainingRentalWithGst));

  if (rentalWithGst <= 0 || bookingGst <= 0 || appliedToRental <= 0) {
    return {
      gstAmount: 0,
      cgstAmount: 0,
      sgstAmount: 0,
    };
  }

  const gstAmount = money((appliedToRental * bookingGst) / rentalWithGst);
  const cgstAmount = money(gstAmount / 2);
  const sgstAmount = money(gstAmount - cgstAmount);

  return {
    gstAmount,
    cgstAmount,
    sgstAmount,
  };
}

export function transactionCgst(txn: { cgstAmount?: unknown; gstAmount?: unknown }) {
  if (txn.cgstAmount !== undefined && txn.cgstAmount !== null && txn.cgstAmount !== "") {
    return money(txn.cgstAmount);
  }

  return money(money(txn.gstAmount) / 2);
}

export function transactionSgst(txn: { sgstAmount?: unknown; gstAmount?: unknown }) {
  if (txn.sgstAmount !== undefined && txn.sgstAmount !== null && txn.sgstAmount !== "") {
    return money(txn.sgstAmount);
  }

  return money(money(txn.gstAmount) - money(txn.gstAmount) / 2);
}