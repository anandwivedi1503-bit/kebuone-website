import { LegalPage } from "@/app/components/Legal/LegalPage";

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="Last updated: August 2026">
      <p>
        EVUDDY by Kebu One collects rider details such as name, mobile number, email, KYC documents,
        booking and payment records to operate electric scooter rentals and Rent to Own plans.
      </p>
      <p>
        Phone numbers are verified with Firebase. Payments are processed by Razorpay. Documents may be
        stored with our cloud upload provider. We do not sell rider data.
      </p>
      <p>
        Admin staff can view live operational records to approve KYC, manage bookings, wallets and support
        tickets. You may contact us at info@evuddy.com to request a correction of your rider profile.
      </p>
    </LegalPage>
  );
}
