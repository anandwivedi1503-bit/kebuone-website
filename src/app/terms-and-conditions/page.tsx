import { LegalPage } from "@/app/components/Legal/LegalPage";

export default function TermsPage() {
  return (
    <LegalPage title="Terms and Conditions" updated="Last updated: August 2026">
      <p>
        By registering as a rider you agree to complete KYC, follow hub pickup rules, and pay rental or
        Rent to Own dues through EVUDDY.
      </p>
      <p>
        Flexible rentals are charged as hourly ₹60, daily ₹230, weekly ₹1,610 or monthly ₹6,900, plus 5%
        GST (CGST 2.5% + SGST 2.5%) on the rental only, and a refundable security deposit where applicable.
      </p>
      <p>
        Rent to Own is ₹280 per day for 18 months. The amount payable to start is ₹280 plus 5% GST. There
        is no security deposit on Rent to Own. Ownership transfers only after successful completion of the
        plan, subject to EVUDDY verification.
      </p>
      <p>
        Booking, OTP pickup and vehicle use must follow hub instructions. Misuse, damage or unpaid dues may
        lead to blocked booking access.
      </p>
    </LegalPage>
  );
}
