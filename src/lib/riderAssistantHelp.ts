import { bookingBelongsToRiderFilter } from "@/lib/findBookingRider";
import { NOT_DELETED_FILTER } from "@/lib/notDeleted";
import {
  firebaseUserOwnsRider,
  getVerifiedFirebaseUser,
} from "@/lib/requestAuth";
import type { EvaRiderSession } from "@/lib/riderAssistantIntent";
import { wantsOwnAccountHelp } from "@/lib/riderAssistantIntent";
import Booking from "@/models/Booking";
import Rider from "@/models/Rider";
import Wallet from "@/models/Wallet";

export type { EvaRiderSession } from "@/lib/riderAssistantIntent";
export { wantsOwnAccountHelp };

function firstNameOf(fullName: unknown) {
  const part = String(fullName || "")
    .trim()
    .split(/\s+/)[0];
  return part.replace(/[^A-Za-z\u0900-\u097F'.-]/g, "").slice(0, 24);
}

function rupees(value: unknown) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0.01) return "";
  return `₹${n.toFixed(2)}`;
}

function ji(name: string) {
  return name ? `${name} जी` : "जी";
}

export async function loadEvaRiderSession(
  req: Request,
  firebaseIdToken?: string
): Promise<EvaRiderSession | null> {
  const firebaseUser = await getVerifiedFirebaseUser(req, firebaseIdToken);
  if (!firebaseUser) return null;

  const riderLookups: Array<{ firebaseUid?: string; phone?: string }> = [
    { firebaseUid: firebaseUser.uid },
  ];
  if (firebaseUser.phone) riderLookups.push({ phone: firebaseUser.phone });

  const rider = await Rider.findOne({
    $and: [NOT_DELETED_FILTER, { $or: riderLookups }],
  }).select(
    "riderId fullName approvalStatus status bookingEnabled kycStatus currentBookingId firebaseUid phone createdAt totalBookings completedBookings rejectedReason blacklisted aadhaarFrontUrl aadhaarNumber drivingLicense"
  );

  if (!rider || !firebaseUserOwnsRider(firebaseUser, rider)) {
    const statusAnswer = `नमस्ते जी! नंबर से लॉगिन हो गया है, पर राइडर प्रोफ़ाइल अभी नहीं मिली। लगता है KYC फॉर्म बाकी है। ज़रा /register पर नाम-आधार भर दीजिए। मंज़ूरी मैं नहीं दे सकती — स्टाफ देखेंगे। OTP/पैसे चैट में नहीं चलते।`;
    return {
      signedIn: true,
      stage: "phone_only",
      firstName: "",
      isNewRider: true,
      canBook: false,
      briefing:
        "SIGNED-IN: Firebase phone login only. No rider profile yet. Next: complete /register KYC. Eva cannot approve. Never read OTP or take pay.",
      href: "/register",
      statusAnswer,
    };
  }

  const name = firstNameOf(rider.fullName);
  const hello = `नमस्ते ${ji(name)}!`;
  const approval = String(rider.approvalStatus || "");
  const kyc = String(rider.kycStatus || "");
  const account = String(rider.status || "Active");
  const createdAt = (rider as { createdAt?: Date }).createdAt;
  const ageMs = createdAt ? Date.now() - new Date(createdAt).getTime() : 0;
  const isNewRider =
    Number(rider.completedBookings || 0) < 1 ||
    (ageMs > 0 && ageMs < 7 * 24 * 60 * 60 * 1000);
  const newBit = isNewRider ? " आप नए राइडर लगते हैं।" : "";
  const hasAadhaarDoc = Boolean(String(rider.aadhaarFrontUrl || "").trim());
  const hasAadhaarNo = Boolean(String(rider.aadhaarNumber || "").trim());
  const canBook = Boolean(
    rider.bookingEnabled &&
      approval === "Approved" &&
      kyc !== "Rejected" &&
      account === "Active" &&
      !rider.blacklisted
  );

  let walletLine = "";
  try {
    const wallet = await Wallet.findOne({ riderId: rider.riderId }).select(
      "balance freezeAmount securityDepositHold"
    );
    const bal = rupees(wallet?.balance);
    if (bal) {
      walletLine = ` वॉलेट में करीब ${bal} दिख रहे हैं — सिर्फ़ जानकारी, मैं पैसे नहीं काट सकती।`;
    }
  } catch {
    walletLine = "";
  }

  if (rider.blacklisted || account === "Blocked") {
    const statusAnswer = `${hello} आपका अकाउंट अभी ब्लॉक है। चैट से नहीं खुलता। helpdesk@kebuone.in या +91 8726006512 पर बात कीजिए।`;
    return {
      signedIn: true,
      stage: "blocked",
      firstName: name,
      isNewRider,
      canBook: false,
      briefing: `RIDER ${rider.riderId}: BLOCKED. Eva cannot unblock. No OTP/pay.`,
      href: "/contact",
      statusAnswer,
    };
  }

  if (account === "Suspended" || approval === "Suspended") {
    const statusAnswer = `${hello} अकाउंट सस्पेंड है। बुकिंग बंद। हेल्पडेस्क से बात कीजिए — मैं चालू नहीं कर सकती।`;
    return {
      signedIn: true,
      stage: "suspended",
      firstName: name,
      isNewRider,
      canBook: false,
      briefing: `RIDER ${rider.riderId}: SUSPENDED. Eva cannot unsuspend.`,
      href: "/contact",
      statusAnswer,
    };
  }

  if (approval === "Rejected" || kyc === "Rejected") {
    const why = String(rider.rejectedReason || "").trim().slice(0, 120);
    const whyLine = why ? ` वजह (स्टाफ): ${why}` : "";
    const statusAnswer = `${hello}${newBit} KYC रिजेक्ट है।${whyLine} /register पर सही दस्तावेज़ दोबारा दीजिए। टिक मैं नहीं लगा सकती।`;
    return {
      signedIn: true,
      stage: "rejected",
      firstName: name,
      isNewRider,
      canBook: false,
      briefing: `RIDER ${rider.riderId}: KYC/approval REJECTED. Next /register. Eva cannot approve. Reason may be shown if staff wrote one.`,
      href: "/register",
      statusAnswer,
    };
  }

  if (!canBook) {
    const missingDocs = !hasAadhaarDoc && !hasAadhaarNo;
    if (missingDocs && approval !== "Approved") {
      const statusAnswer = `${hello}${newBit} फोन तो लग गया, पर KYC पूरा नहीं दिख रहा। /register पर आधार (लाइसेंस चाहें तो) अपलोड कर दीजिए। फिर स्टाफ रिव्यू करेंगे — मैं मंज़ूर नहीं कर सकती।`;
      return {
        signedIn: true,
        stage: "kyc_incomplete",
        firstName: name,
        isNewRider,
        canBook: false,
        briefing: `RIDER ${rider.riderId} (${name || "unnamed"}): KYC documents incomplete. bookingEnabled=false approval=${approval} kyc=${kyc}. Next /register.`,
        href: "/register",
        statusAnswer,
      };
    }
    const statusAnswer = `${hello}${newBit} KYC अभी रिव्यू में है (approval: ${approval || "Under Review"}, KYC: ${kyc || "Pending"}). बुकिंग तब तक बंद। स्टाफ चेक करेंगे, मैं पास नहीं कर सकती। इंतज़ार में किराया या Rent to Own पूछ सकते हैं।`;
    return {
      signedIn: true,
      stage: "under_review",
      firstName: name,
      isNewRider,
      canBook: false,
      briefing: `RIDER ${rider.riderId} (${name || "unnamed"}): NEW/PENDING KYC. approval=${approval} kyc=${kyc} bookingEnabled=${Boolean(rider.bookingEnabled)}. Cannot book yet. Eva cannot approve.`,
      href: "/register",
      statusAnswer,
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
    .sort({ createdAt: -1 });

  if (!booking) {
    const statusAnswer = `${hello}${newBit} KYC चल गया, बुकिंग खुली है। अभी कोई एक्टिव राइड नहीं। शहर-हब-स्कूटर Book EV पर चुनिए।${walletLine} पेमेंट/OTP यहीं चैट में नहीं होंगे।`;
    return {
      signedIn: true,
      stage: "ready_no_ride",
      firstName: name,
      isNewRider,
      canBook: true,
      briefing: `RIDER ${rider.riderId} (${name || "unnamed"}): KYC approved, bookingEnabled. No active booking. Next /ride-options or /book-bike. Wallet mentioned only as balance, never debit.`,
      href: "/ride-options",
      statusAnswer,
    };
  }

  const pending = Number(booking.pendingAmount || 0);
  const pendingBit = pending > 0.009 ? ` बाकी करीब ${rupees(pending)} Book EV पर दें।` : "";
  const hubBit = booking.startHub ? ` हब ${booking.startHub}.` : "";
  const mode = booking.rentalMode ? ` प्लान ${booking.rentalMode}.` : "";
  const ride = String(booking.rideStatus || "");
  const pay = String(booking.paymentStatus || "");

  let next = "Book EV खोलकर अगला बटन दबाएँ।";
  let stage: EvaRiderSession["stage"] = "booked";
  if (ride === "In Ride") {
    stage = "in_ride";
    next =
      pending > 0.009
        ? "पहले बाकी किराया Book EV पर चुकाइए, फिर यार्ड पर Ride end।"
        : "यार्ड लौटिए, Ride end स्वाइप कीजिए, Ride-end OTP यार्ड वाले को बोलिए — OTP मैं नहीं पढ़ूँगी।";
  } else if (ride === "Ready For Pickup") {
    stage = "ready_pickup";
    next =
      "Pickup OTP Book EV स्क्रीन पर दिखेगा। यार्ड को बोलिए, वे अनलॉक करेंगे, फिर Ride started स्वाइप कीजिए। OTP यहाँ नहीं लिखूँगी।";
  } else if (pending > 0.009) {
    stage = "payment_due";
    next = `बाकी ${rupees(pending)} Book EV पर Razorpay/वॉलेट से दीजिए। मैं पैसे नहीं काट सकती।`;
  }

  const statusAnswer = `${hello} आपकी लाइव बुकिंग ${booking.bookingId}: ${ride}, पेमेंट ${pay}.${mode}${hubBit}${pendingBit} ${next}${walletLine}`;
  return {
    signedIn: true,
    stage,
    firstName: name,
    isNewRider,
    canBook: true,
    briefing: `RIDER ${rider.riderId} (${name || "unnamed"}): active booking ${booking.bookingId} rideStatus=${ride} paymentStatus=${pay} pending=${pending} hub=${booking.startHub || ""} mode=${booking.rentalMode || ""}. NEVER read OTP. NEVER take payment. Next step is on Book EV buttons.`,
    href: "/book-bike",
    statusAnswer,
  };
}

/** Status-only reply for explicit “मेरी बुकिंग / KYC” questions. */
export async function riderAssistantHelp(
  req: Request,
  firebaseIdToken?: string
) {
  const session = await loadEvaRiderSession(req, firebaseIdToken);
  if (!session) return null;
  return { answer: session.statusAnswer, href: session.href };
}
