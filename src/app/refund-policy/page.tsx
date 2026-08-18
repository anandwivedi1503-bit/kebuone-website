import { LegalPage } from "@/app/components/Legal/LegalPage";

export default function RefundPolicyPage() {
  return (
    <LegalPage title="Refund Policy" updated="Last updated: August 2026">
      <p>
        Security deposits on normal rentals are refundable after the ride is completed and the scooter is
        returned in acceptable condition, subject to deductions for damage or unpaid charges. GST is not
        charged on the deposit.
      </p>
      <p>
        Rent to Own does not collect a security deposit. The ₹280 + GST start payment is an installment,
        not a deposit, and is not refunded once the plan is activated except where required by law or an
        admin-approved refund ticket.
      </p>
      <p>
        Partial payments on normal bookings remain on the booking as pending until the balance is paid.
        Refund requests are handled in the admin Refund and Support dashboards.
      </p>
    </LegalPage>
  );
}
