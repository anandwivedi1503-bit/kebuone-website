import { LegalPage } from "@/app/components/Legal/LegalPage";

export default function TermsPage() {
  return (
    <LegalPage title="Terms and Conditions" updated="Last updated: September 2026">
      <p>
        By registering as a rider you agree to complete KYC, follow hub pickup rules, and pay rental or
        Rent to Own dues through EVUDDY.
      </p>
      <p>
        Flexible rentals are charged as hourly ₹60, daily ₹250, weekly ₹1,750 or monthly ₹7,500, GST
        included (CGST 2.5% + SGST 2.5% is already in the fare), plus a refundable security deposit of
        ₹2,500. GST is not charged on the deposit.
      </p>
      <p>
        Rent to Own is ₹300 per day GST included for 20 months, plus a one-time refundable security
        deposit of ₹2,500. Ownership transfers only after successful completion of the plan, subject to
        EVUDDY verification.
      </p>
      <p>
        Booking, OTP pickup and vehicle use must follow hub instructions. Misuse, damage or unpaid dues may
        lead to blocked booking access.
      </p>
    </LegalPage>
  );
}
