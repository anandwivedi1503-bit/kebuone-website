import type { AssistantReply } from "@/lib/assistantReply";
import { bookingBelongsToRiderFilter } from "@/lib/findBookingRider";
import { NOT_DELETED_FILTER } from "@/lib/notDeleted";
import {
  firebaseUserOwnsRider,
  getVerifiedFirebaseUser,
} from "@/lib/requestAuth";
import { wantsOwnAccountHelp } from "@/lib/riderAssistantIntent";
import Booking from "@/models/Booking";
import Rider from "@/models/Rider";

export { wantsOwnAccountHelp };

export async function riderAssistantHelp(
  req: Request,
  firebaseIdToken?: string
): Promise<AssistantReply | null> {
  const firebaseUser = await getVerifiedFirebaseUser(req, firebaseIdToken);
  if (!firebaseUser) return null;

  const riderLookups: Array<{ firebaseUid?: string; phone?: string }> = [
    { firebaseUid: firebaseUser.uid },
  ];
  if (firebaseUser.phone) riderLookups.push({ phone: firebaseUser.phone });

  const rider = await Rider.findOne({
    $and: [NOT_DELETED_FILTER, { $or: riderLookups }],
  })
    .select(
      "riderId fullName approvalStatus status bookingEnabled kycStatus currentBookingId firebaseUid phone"
    )
    .lean();

  if (!rider || !firebaseUserOwnsRider(firebaseUser, rider)) {
    return {
      answer:
        "साइन-इन तो है, पर राइडर प्रोफ़ाइल नहीं मिली। /register पर KYC पूरा करें — मैं मंज़ूरी नहीं दे सकती।",
      href: "/register",
    };
  }

  const booking = await Booking.findOne({
    $and: [
      bookingBelongsToRiderFilter(rider),
      NOT_DELETED_FILTER,
      { rideStatus: { $ne: "Cancelled" } },
      {
        $or: [
          { paymentStatus: { $in: ["Pending", "Partial"] } },
          {
            rideStatus: {
              $in: [
                "Booked",
                "Reserved",
                "Payment Pending",
                "Ready For Pickup",
                "In Ride",
              ],
            },
          },
        ],
      },
    ],
  })
    .select(
      "bookingId rideStatus paymentStatus pendingAmount receivedAmount rentalMode pickupCity startHub vehicleId"
    )
    .sort({ createdAt: -1 })
    .lean();

  const kyc = String(rider.approvalStatus || rider.kycStatus || rider.status || "");
  const kycLine = rider.bookingEnabled
    ? "KYC/बुकिंग चालू है।"
    : `KYC अभी बुक करने लायक नहीं (${kyc || "Pending"}). स्टाफ मंज़ूरी का इंतज़ार करें — मैं मंज़ूर नहीं कर सकती।`;

  if (!booking) {
    return {
      answer: `${kycLine}\nअभी कोई एक्टिव बुकिंग नहीं दिख रही। Book EV से शहर और हब चुनकर बुक करें, या Rent to Own देखें। OTP/पेमेंट चैट से नहीं होता।`,
      href: rider.bookingEnabled ? "/ride-options" : "/register",
    };
  }

  const pending = Number(booking.pendingAmount || 0);
  const next =
    booking.rideStatus === "In Ride"
      ? pending > 0.009
        ? "बाकी किराया Book EV पर चुकाएँ, फिर यार्ड पर Ride end।"
        : "यार्ड लौटें, Ride end स्वाइप करें, OTP यार्ड को दें।"
      : booking.rideStatus === "Ready For Pickup"
        ? "Pickup OTP Book EV पर देखें — यार्ड को बताएँ, फिर Ride started।"
        : pending > 0.009
          ? `बाकी लगभग ₹${pending.toFixed(2)} Book EV पर दें।`
          : "Book EV खोलकर अगला कदम देखें।";

  return {
    answer: `${kycLine}\nआपकी एक्टिव बुकिंग ${booking.bookingId}: ${booking.rideStatus || ""} · पेमेंट ${booking.paymentStatus || ""}${
      pending > 0.009 ? ` · बाकी ₹${pending.toFixed(2)}` : ""
    }${booking.startHub ? ` · हब ${booking.startHub}` : ""}.\n${next}\nमैं OTP नहीं दिखाऊँगी और पैसे नहीं काटूँगी — बटन Book EV पर हैं।`,
    href: "/book-bike",
  };
}
