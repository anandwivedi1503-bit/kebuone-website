import { LegalPage } from "@/app/components/Legal/LegalPage";

export default function RefundPolicyPage() {
  return (
    <LegalPage title="Refund Policy" updated="Last updated: September 2026">
      <p>
        Security deposits on rentals and Rent to Own are refundable after the scooter is returned in
        acceptable condition, subject to deductions for damage or unpaid charges. GST is not charged on
        the deposit.
      </p>
      <p>
        The GST-included daily Rent to Own fare is an installment, not a deposit, and is not refunded
        once that day is activated except where required by law or an admin-approved refund ticket.
      </p>
      <p>
        Partial payments on normal bookings remain on the booking as pending until the balance is paid.
        Refund requests are handled in the admin Refund and Support dashboards.
      </p>
    </LegalPage>
  );
}
