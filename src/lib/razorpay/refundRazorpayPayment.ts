import { getRazorpayClient } from "@/lib/razorpay/config";

export async function refundRazorpayPayment(paymentId: string, amountInr: number) {
  const razorpay = getRazorpayClient();
  const refund = await razorpay.payments.refund(paymentId, {
    amount: Math.round(amountInr * 100),
    speed: "normal",
  });
  return refund;
}
