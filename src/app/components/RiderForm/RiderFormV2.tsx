"use client";

import { useEffect, useRef, useState } from "react";

import { auth } from "@/lib/firebase";
import { markRiderPlanReady } from "@/lib/riderPlanGate";

import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  onAuthStateChanged,
  ConfirmationResult,
} from "firebase/auth";

export default function RiderFormV2() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [registeredRiderId, setRegisteredRiderId] = useState("");
 const [submitting, setSubmitting] = useState(false);
  const [fullName, setFullName] = useState("");
const [phone, setPhone] = useState("");
const [email, setEmail] = useState("");

const [otp, setOtp] = useState("");
const [otpSent, setOtpSent] = useState(false);
const [otpLoading, setOtpLoading] = useState(false);
const [otpCooldown, setOtpCooldown] = useState(0);
const [otpSendCount, setOtpSendCount] = useState(0);
const [otpVerifyAttempts, setOtpVerifyAttempts] = useState(0);
const [otpLockedUntil, setOtpLockedUntil] = useState(0);
const [firebaseUid, setFirebaseUid] = useState("");
const [firebaseIdToken, setFirebaseIdToken] = useState("");

const [otpVerified, setOtpVerified] = useState(false);

const [confirmationResult, setConfirmationResult] =
  useState<ConfirmationResult | null>(null);

  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
const otpMessageTimeout = useRef<NodeJS.Timeout | null>(null);

const [aadhaar, setAadhaar] = useState("");
const [license, setLicense] = useState("");

const [aadhaarFrontFile, setAadhaarFrontFile] = useState<File | null>(null);

const [aadhaarBackFile, setAadhaarBackFile] = useState<File | null>(null);

const [licenseFrontFile, setLicenseFrontFile] = useState<File | null>(null);

const [licenseBackFile, setLicenseBackFile] = useState<File | null>(null);
const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
const [instagramId, setInstagramId] = useState("");
const [facebookId, setFacebookId] = useState("");

const [reference1Name, setReference1Name] = useState("");
const [reference1Phone, setReference1Phone] = useState("");

const [reference2Name, setReference2Name] = useState("");
const [reference2Phone, setReference2Phone] = useState("");


const [error, setError] = useState("");
const [otpMessage, setOtpMessage] = useState("");
const [checkingRegistration, setCheckingRegistration] =
useState(false);
const [approvalStatus, setApprovalStatus] =
useState("Under Review");

const [bookingEnabled, setBookingEnabled] =
useState(false);


const applyExistingFirebaseSession = async (typedPhone = "") => {
  const user = auth.currentUser;
  const sessionPhone = indianMobile(user?.phoneNumber || "");
  const typed = indianMobile(typedPhone);
  if (!user || !phoneRegex.test(sessionPhone)) {
    return false;
  }
  if (typed && typed !== sessionPhone) {
    return false;
  }

  const token = await user.getIdToken(true);
  setPhone(sessionPhone);
  setFirebaseUid(user.uid);
  setFirebaseIdToken(token);
  setOtpVerified(true);
  setOtpSent(true);
  setOtp("");
  setConfirmationResult(null);
  setOtpMessage("Phone already verified. Continue — no second SMS is needed.");
  return true;
};

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, () => {
    void applyExistingFirebaseSession();
  });
  return () => unsubscribe();
}, []);

useEffect(() => {

  if (!submitted) return;

  const riderId =
    localStorage.getItem("kebu_rider_id");

  if (!riderId) return;

  const interval = setInterval(async () => {

    try {
      const token = await auth.currentUser?.getIdToken();

      if (!token) return;

      const response =
        await fetch(`/api/riders/${riderId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

      const data =
        await response.json();

      if (!data.success) return;

      setApprovalStatus(
        data.data.approvalStatus
      );

      setBookingEnabled(
        data.data.bookingEnabled
      );

      if (
  data.data.bookingEnabled &&
  data.data.approvalStatus === "Approved"
 ) {
  localStorage.setItem(
    "kebu_rider_id",
    data.data.riderId
  );

  clearInterval(interval);
  markRiderPlanReady();
  window.location.href = "/ride-options";
}

    } catch {}

  }, 10000);

  return () => clearInterval(interval);

}, [submitted]);
const nameRegex = /^[A-Za-z][A-Za-z\s'.-]{2,49}$/;
const phoneRegex = /^[6-9]\d{9}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const aadhaarRegex = /^\d{12}$/;
const drivingLicenseRegex = /^[A-Z]{2}\d{2}\d{11}$/;

const allowedDocumentTypes = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const allowedPhotoTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const maxFileSize = 5 * 1024 * 1024;

const cleanDigits = (value: string) => value.replace(/\D/g, "");
const indianMobile = (value: string) => {
  const digits = cleanDigits(value);
  return digits.length > 10 ? digits.slice(-10) : digits.slice(0, 10);
};
const cleanName = (value: string) => value.trim().replace(/\s+/g, " ");
const cleanLicense = (value: string) =>
  value.toUpperCase().replace(/\s/g, "");

const OTP_COOLDOWN_SECONDS = 60;
const MAX_OTP_SENDS_PER_PHONE = 3;
const MAX_OTP_VERIFY_ATTEMPTS = 5;

const getFirebaseOtpErrorMessage = (error: unknown) => {
  const code =
    typeof error === "object" && error && "code" in error
      ? String((error as { code?: string }).code)
      : "";

  if (code === "auth/unauthorized-domain") {  
 
    return "This domain is not allowed in Firebase. Add your hosting domain in Firebase Authentication settings.";
  }

  if (code === "auth/invalid-phone-number") {
    return "Enter a valid 10 digit Indian mobile number.";
  }

  if (code === "auth/too-many-requests") {
    return "Too many OTP attempts. Please wait and try again later.";
  }

  if (code === "auth/quota-exceeded") {
    return "Firebase SMS quota is exceeded. Check billing and phone auth limits.";
  }

  if (code === "auth/captcha-check-failed" || code === "auth/invalid-app-credential") {
    return "reCAPTCHA verification failed. Refresh the page and try again.";
  }

  return "Failed to send OTP. Check Firebase Phone Auth, authorized domain, billing, and reCAPTCHA setup.";
};

const resetRecaptcha = () => {
  if (recaptchaVerifierRef.current) {
    recaptchaVerifierRef.current.clear();
    recaptchaVerifierRef.current = null;
  }

  const container = document.getElementById("recaptcha-container");
  if (container) {
    container.innerHTML = "";
  }
};

const getOtpPhone = () => cleanDigits(phone).slice(0, 10);
const showOtpMessage = (
  message: string,
  duration = 3000
) => {
  setOtpMessage(message);

  if (otpMessageTimeout.current) {
    clearTimeout(otpMessageTimeout.current);
  }

  otpMessageTimeout.current = setTimeout(() => {
    setOtpMessage("");
  }, duration);
};


const validateSelectedFile = (
  file: File | null,
  allowedTypes: string[],
  label: string
) => {
  if (!file) return false;

  if (!allowedTypes.includes(file.type)) {
    setError(`${label} must be PDF, JPG, PNG, or WEBP only`);
    return false;
  }

  if (file.size > maxFileSize) {
    setError(`${label} must be less than 5 MB`);
    return false;
  }

  return true;
};

const selectValidatedFile = (
  file: File | null,
  setFile: (file: File | null) => void,
  allowedTypes: string[],
  label: string
) => {
  if (!file) {
    setFile(null);
    return;
  }

  if (!validateSelectedFile(file, allowedTypes, label)) {
    setFile(null);
    return;
  }

  setFile(file);
  setError("");
};
const areFilesIdentical = (
  file1: File | null,
  file2: File | null
) => {
  if (!file1 || !file2) return false;

  return (
    file1.name === file2.name &&
    file1.size === file2.size &&
    file1.lastModified === file2.lastModified
  );
};

const convertToBase64 = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = () => {
      resolve(reader.result as string);
    };

    reader.onerror = (error) => {
      reject(error);
    };
  });
};

const uploadFile = async (
  file: File,
  token: string
) => {
  const base64 = await convertToBase64(file);
  showOtpMessage("Uploading document...");
  const response = await fetch("/api/upload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
  file: base64,
  firebaseIdToken: token,
}),
  });

  const data = await response.json();

  if (!data.success || !data.url) {
    throw new Error(data.error || "File upload failed");
  }

  showOtpMessage("Upload completed.");

  return data.url;
};
const submitForm = async () => {

  if (submitting) return;

  setSubmitting(true);

  try {
setError("");
showOtpMessage("Preparing your registration...");

    let activeFirebaseIdToken = firebaseIdToken;

    if (auth.currentUser) {
      activeFirebaseIdToken =
        await auth.currentUser.getIdToken(true);
      setFirebaseIdToken(activeFirebaseIdToken);
    }

    if (!activeFirebaseIdToken) {
  setError("Please verify OTP again before uploading documents.");
  return;
}

 let aadhaarFrontUrl = "";
let aadhaarBackUrl = "";

let licenseFrontUrl = "";
let licenseBackUrl = "";

let profileUrl = "";

if (aadhaarFrontFile) {
    aadhaarFrontUrl = await uploadFile(
      aadhaarFrontFile,
      activeFirebaseIdToken
    );
}

if (aadhaarBackFile) {
    aadhaarBackUrl = await uploadFile(
      aadhaarBackFile,
      activeFirebaseIdToken
    );
}

if (licenseFrontFile) {
    licenseFrontUrl = await uploadFile(
      licenseFrontFile,
      activeFirebaseIdToken
    );
}

if (licenseBackFile) {
    licenseBackUrl = await uploadFile(
      licenseBackFile,
      activeFirebaseIdToken
    );
}

if (profilePhoto) {
    profileUrl = await uploadFile(
      profilePhoto,
      activeFirebaseIdToken
    );
}

    const response = await fetch("/api/riders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        fullName,
        phone,
        email,
        phoneVerified: otpVerified,
        firebaseUid: auth.currentUser?.uid || firebaseUid,
firebaseIdToken: activeFirebaseIdToken,

        aadhaarNumber: aadhaar,
        drivingLicense: license,

        aadhaarFrontUrl,

aadhaarBackUrl,

licenseFrontUrl,

licenseBackUrl,

profilePhotoUrl: profileUrl,

        instagramId,
        facebookId,

        reference1Name,
        reference1Phone,

        reference2Name,
        reference2Phone,
      }),
    });

    const result = await response.json();

if (!response.ok) {

  if (
    result.riderExists &&
    result.riderStatus === "Approved"
  ) {

    localStorage.setItem(
      "kebu_rider_phone",
      phone
    );

    if (result.riderId) {
      localStorage.setItem(
        "kebu_rider_id",
        result.riderId
      );
    }

    markRiderPlanReady();
    window.location.href = "/ride-options";
    return;
  }

  if (
    result.riderExists &&
    result.riderStatus === "Under Review"
  ) {

    setRegisteredRiderId(result.riderId || "");

    setApprovalStatus("Under Review");

    setBookingEnabled(false);

    setSubmitted(true);

    return;
  }

  if (
    result.riderExists &&
    result.riderStatus === "Rejected"
  ) {

    alert(result.message);

    return;
  }

  setError(
    result.message ||
    "Registration failed."
  );

  return;
}

localStorage.setItem(
  "kebu_rider_phone",
  phone
);

if (result.data?.riderId) {

  localStorage.setItem(
    "kebu_rider_id",
    result.data.riderId
  );

  setRegisteredRiderId(
    result.data.riderId
  );

}

setApprovalStatus("Under Review");

setBookingEnabled(false);

showOtpMessage(
  "Registration completed successfully."
);

setSubmitted(true);

// Reset registration state

setStep(4);

setOtp("");

setOtpSent(false);

setConfirmationResult(null);

setOtpVerified(false);

setOtpCooldown(0);

setOtpVerifyAttempts(0);

setOtpSendCount(0);

setFirebaseUid("");

 setFirebaseIdToken("");

  } catch (error) {
  console.error(error);
  setError("Registration failed. Please try again.");
} finally {
  setSubmitting(false);
}
};

useEffect(() => {
  if (otpCooldown <= 0) return;

  const timer = window.setInterval(() => {
    setOtpCooldown((seconds) => Math.max(seconds - 1, 0));
  }, 1000);

  return () => window.clearInterval(timer);
}, [otpCooldown]);

useEffect(() => {
  return () => {
    if (otpMessageTimeout.current) {
      clearTimeout(otpMessageTimeout.current);
    }
  };
}, []);

const sendOtp = async () => {
  try {
    setError("");
    setOtpMessage("");

    const validPhone = indianMobile(phone);

    if (!phoneRegex.test(validPhone)) {
      setError("Enter a valid 10 digit Indian mobile number.");
      return;
    }

    if (otpVerified) {
      setOtpMessage("Phone Number is already verified");
      return;
    }

    if (otpCooldown > 0) {
      setError(`Please wait ${otpCooldown}s before requesting another OTP.`);
      return;
    }

    if (otpSendCount >= MAX_OTP_SENDS_PER_PHONE) {
      setError("Maximum OTP sends reached for this session. Refresh and try again later.");
      return;
    }

    setPhone(validPhone);
    setOtp("");
    setOtpVerified(false);
    setOtpLoading(true);
    setConfirmationResult(null);

    const reused = await applyExistingFirebaseSession(validPhone);
    if (reused) {
      return;
    }

    resetRecaptcha();

    recaptchaVerifierRef.current = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "invisible",
        callback: () => {
          setOtpMessage("Security verified. Sending OTP...");
        },
        "expired-callback": () => {
          setError("reCAPTCHA expired. Please send OTP again.");
          resetRecaptcha();
        },
      }
    );

    await recaptchaVerifierRef.current.render();

    const result = await signInWithPhoneNumber(
      auth,
      `+91${validPhone}`,
      recaptchaVerifierRef.current
    );

    setConfirmationResult(result);
    setOtpSent(true);
    setOtp("");
    setOtpCooldown(OTP_COOLDOWN_SECONDS);
    setOtpSendCount((count) => count + 1);
    showOtpMessage("OTP sent successfully.");
  } catch (error) {
    console.error(error);
    setError(getFirebaseOtpErrorMessage(error));
    setConfirmationResult(null);
    resetRecaptcha();
  } finally {
    setOtpLoading(false);
  }
};

const verifyOtp = async () => {
  try {
    setError("");
    setOtpMessage("");

    if (!confirmationResult) {
      setError("Please send OTP first");
      return;
    }

    if (otpVerifyAttempts >= MAX_OTP_VERIFY_ATTEMPTS) {
      setError("Too many wrong OTP attempts. Please resend OTP.");
      resetRecaptcha();
      setConfirmationResult(null);
      return;
    }

    if (!/^[0-9]{6}$/.test(otp)) {
      setError("OTP must be 6 digits");
      return;
    }

    const result = await confirmationResult.confirm(otp);
    const user = result.user;
    const idToken = await user.getIdToken(true);

    setFirebaseUid(user.uid);
    setFirebaseIdToken(idToken);
    setOtpVerified(true);
    setOtpCooldown(0);
    setOtpVerifyAttempts(0);
    // Check whether this phone number is already registered


    try {

  const response = await fetch(
    `/api/riders?phone=${phone}`,
    {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    }
  );

  const data = await response.json();

  if (data.success) {

    localStorage.setItem(
      "kebu_rider_phone",
      phone
    );

    if (data.data.riderId) {

      localStorage.setItem(
        "kebu_rider_id",
        data.data.riderId
      );

      setRegisteredRiderId(
        data.data.riderId
      );

    }

    if (
      data.data.approvalStatus === "Approved" &&
      data.data.bookingEnabled
    ) {
      markRiderPlanReady();
      window.location.href = "/ride-options";
      return;

    }

    if (
      data.data.approvalStatus === "Under Review"
    ) {

      setApprovalStatus("Under Review");

      setBookingEnabled(false);

      setSubmitted(true);

      return;

    }

    if (
      data.data.approvalStatus === "Rejected"
    ) {

      alert(
        "Your previous registration was rejected. Please contact support."
      );

      return;

    }

  }

} catch (error) {

  console.error(error);

}

showOtpMessage("Phone verified successfully.");
  } catch (error) {
    console.error(error);

    const nextAttempts = otpVerifyAttempts + 1;
    setOtpVerifyAttempts(nextAttempts);
    setOtpVerified(false);

    if (nextAttempts >= MAX_OTP_VERIFY_ATTEMPTS) {
      resetRecaptcha();
      setConfirmationResult(null);
      setError("Too many wrong OTP attempts. Please resend OTP.");
      return;
    }

    setError(
  `Invalid OTP. ${
    MAX_OTP_VERIFY_ATTEMPTS - nextAttempts
  } attempt(s) remaining.`
);
    setOtpMessage("");
  }
};

const validateStep = () => {
  if (step === 1) {
    const validName = cleanName(fullName);
    const validPhone = indianMobile(phone);
    const validEmail = email.trim().toLowerCase();

    if (!nameRegex.test(validName)) {
      setError("Enter a valid full name using letters only");
      return false;
    }

    if (!phoneRegex.test(validPhone)) {
      setError("Enter a valid 10 digit Indian mobile number");
      return false;
    }

    if (!emailRegex.test(validEmail)) {
      setError("Enter a valid email address");
      return false;
    }

    setFullName(validName);
    setPhone(validPhone);
    setEmail(validEmail);
  }

  if (step === 2) {
    if (!otpVerified) {
      setError("Please verify OTP first");
      return false;
    }
  }

  if (step === 3) {
    const validAadhaar = cleanDigits(aadhaar);
    const validLicense = cleanLicense(license);

    if (!aadhaarRegex.test(validAadhaar)) {
      setError("Aadhaar number must be exactly 12 digits");
      return false;
    }

    if (validLicense && !drivingLicenseRegex.test(validLicense)) {
      setError("Enter a valid Indian driving license number");
      return false;
    }

    if (reference1Name.trim() && !nameRegex.test(cleanName(reference1Name))) {
      setError("Enter a valid Reference Person 1 name");
      return false;
    }

    if (reference1Phone.trim() && !phoneRegex.test(cleanDigits(reference1Phone))) {
      setError("Enter a valid Reference Person 1 phone number");
      return false;
    }

    if (reference2Name.trim() && !nameRegex.test(cleanName(reference2Name))) {
      setError("Enter a valid Reference Person 2 name");
      return false;
    }

    if (reference2Phone.trim() && !phoneRegex.test(cleanDigits(reference2Phone))) {
      setError("Enter a valid Reference Person 2 phone number");
      return false;
    }

    setAadhaar(validAadhaar);
    setLicense(validLicense);
    setReference1Name(cleanName(reference1Name));
    setReference1Phone(cleanDigits(reference1Phone));
    setReference2Name(cleanName(reference2Name));
    setReference2Phone(cleanDigits(reference2Phone));
  }

  if (step === 4) {
   if (!aadhaarFrontFile) {
    setError("Please upload Aadhaar Front.");
    return false;
}

if (!aadhaarBackFile) {
    setError("Please upload Aadhaar Back.");
    return false;
}

if (areFilesIdentical(aadhaarFrontFile, aadhaarBackFile)) {

  setError(
    "Aadhaar Front and Aadhaar Back cannot be the same file."
  );

  return false;

}

if (
    !validateSelectedFile(
        aadhaarFrontFile,
        allowedDocumentTypes,
        "Aadhaar Front"
    )
) {
    return false;
}

if (
    !validateSelectedFile(
        aadhaarBackFile,
        allowedDocumentTypes,
        "Aadhaar Back"
    )
) {
    return false;
}

if (
    licenseFrontFile &&
    !validateSelectedFile(
        licenseFrontFile,
        allowedDocumentTypes,
        "Driving License Front"
    )
) {
    return false;
}

if (
  licenseFrontFile &&
  licenseBackFile &&
  areFilesIdentical(
    licenseFrontFile,
    licenseBackFile
  )
) {
  setError(
    "Driving License Front and Back cannot be the same file."
  );

  return false;
}

if (
    licenseBackFile &&
    !validateSelectedFile(
        licenseBackFile,
        allowedDocumentTypes,
        "Driving License Back"
    )
) {
    return false;
}
    if (!profilePhoto) {
      setError("Please upload Profile Photo");
      return false;
    }

    if (!validateSelectedFile(profilePhoto, allowedPhotoTypes, "Profile photo")) {
      return false;
    }
  }

  setError("");
  return true;
};

const isContinueDisabled = step === 2 && !otpVerified;

if (checkingRegistration) {

  return (

    <section
      className="py-40 bg-white text-center"
    >

      <div className="max-w-xl mx-auto">

        <div
          className="
          w-16
          h-16
          mx-auto
          rounded-full
          border-4
          border-[#FF165E]
          border-t-transparent
          animate-spin
          mb-8
          "
        />

        <h2 className="text-3xl font-black text-[#0A1134]">
          Checking Rider Status...
        </h2>

        <p className="text-gray-500 mt-4">
          Please wait while we verify your account.
        </p>

      </div>

    </section>

  );

}

if (submitted) {
  return (
  <section
    id="rider-registration"
    className="py-32 bg-gradient-to-b from-white via-[#FFF7FA] to-white"
  >

      <div className="max-w-3xl mx-auto px-6">

        <div className="
        bg-white
        rounded-[40px]
        p-6 md:p-12
        shadow-[0_30px_100px_rgba(255,22,94,0.12)]
        text-center
        border border-pink-100
        ">

          <div className="text-8xl mb-6 animate-bounce">
✅
</div>

          <h2 className="text-5xl font-black text-[#0A1134] mb-4">
            Waiting for admin approval
          </h2>

          <p className="text-[#444] text-lg mb-10">
            Registration submitted. You can book or start Rent to Own only after an admin approves your KYC.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-10">

            <div className="bg-pink-50 rounded-3xl p-6">
              <p className="text-sm text-gray-500 mb-2">
                Reference ID
              </p>

              <h3 className="font-bold text-[#FF165E]">
                {registeredRiderId || "Generating Rider ID..."}
              </h3>
            </div>

            <div className="bg-pink-50 rounded-3xl p-6">
              <p className="text-sm text-gray-500 mb-2">
                KYC Status
              </p>

              <h3
className={`font-bold ${
approvalStatus==="Approved"
? "text-green-600"
: approvalStatus==="Rejected"
? "text-red-600"
: "text-orange-500"
}`}
>
{approvalStatus}
</h3>
            </div>

            <div className="bg-pink-50 rounded-3xl p-6">
              <p className="text-sm text-gray-500 mb-2">
                Approval Time
              </p>

              <h3 className="font-bold text-green-600">
                Within 24 Hours
              </h3>
            </div>

            <div className="bg-pink-50 rounded-3xl p-6">
    <p className="text-sm text-gray-500 mb-2">
        Booking Access
    </p>

    <h3
className={`font-bold ${
bookingEnabled
? "text-green-600"
: "text-red-600"
}`}
>
{bookingEnabled
? "Enabled"
: "Disabled"}
</h3>
</div>

          </div>

          {bookingEnabled ? (

<p className="text-green-700 font-semibold mb-8">

🎉 Congratulations!

Your account has been approved.

You can now book your first bike.

</p>

) : (

<p className="text-[#555] mb-8">

Your documents have been securely submitted.

Our verification team is reviewing your profile.

This page updates automatically after approval.

</p>

)}

          <div className="flex flex-col md:flex-row gap-4 justify-center">

  
  {bookingEnabled ? (

<button

onClick={()=>{
markRiderPlanReady();
window.location.href="/ride-options";
}}

className="
px-10
py-4
rounded-2xl
bg-gradient-to-r
from-[#FF165E]
to-[#FF5A8B]
text-white
font-bold
"

>

Book Your First Bike

</button>

) : (

<button

disabled

className="
px-10
py-4
rounded-2xl
bg-gray-300
text-gray-600
font-bold
cursor-not-allowed
"

>

Waiting For Admin Approval

</button>

)}
  <button
    onClick={() => window.location.href = "/"}
    className="
    px-10
    py-4
    rounded-2xl
    border
    border-pink-200
    text-[#FF165E]
    font-bold
    "
  >
    Return Home
  </button>

</div>

        </div>

      </div>

    </section>
  );
}

  return (
   <section
  id="rider-registration"
  className="
pt-8
pb-16
lg:pt-44
lg:pb-24
bg-gradient-to-br
from-white
via-[#F7FFFB]
to-[#F2FFF7]
overflow-hidden
"
>
      <div className="max-w-7xl mx-auto px-6">

        <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr] lg:gap-10 items-start">

          {/* ================= LEFT PREMIUM SECTION ================= */}

<div className="relative block">

  <div
className="
relative
overflow-hidden
rounded-[28px]
h-[220px]
sm:h-[320px]
lg:h-[720px]
lg:rounded-[42px]
bg-[#081C15]
shadow-[0_40px_120px_rgba(0,0,0,0.18)]
"
>

    <img
      src="/trans.png"
      alt="EVUDDY Bike"
      className="
w-full
h-full
object-contain
lg:object-cover
object-center
lg:object-[48%_center]
scale-[1.02]
transition-all
duration-700
"
    />

    <div className="absolute inset-0 bg-gradient-to-br from-[#081C15]/35 via-[#0B2A20]/20 to-transparent lg:from-[#081C15]/82 lg:via-[#0B2A20]/58 lg:to-[#18B368]/22" />

  </div>

  {/* Premium Logo */}

<div className="absolute top-10 left-8 z-20 hidden lg:block">

  <span
    className="
    inline-flex
    items-center
    rounded-full
    bg-white/10
    backdrop-blur-xl
    border
    border-white/15
    px-4
    py-2
    text-[11px]
    uppercase
    tracking-[0.22em]
    text-green-300
    "
  >
    Smart Electric Mobility
  </span>

  <h2
    className="
    mt-6
    text-[42px]
    font-black
    tracking-tight
    leading-none
    text-white
    "
  >
    EVUDDY
  </h2>

  <p
className="
mt-3
max-w-[240px]
text-[15px]
leading-8
text-white/80
"
>
India's premium electric mobility ecosystem built for riders,
rentals and smart commuting.
</p>

</div>
  
  {/* Reserved for future hero content */}
  {/* Floating Card */}

  <div
className="
hidden
lg:block
absolute
top-16
right-2
w-[170px]
rounded-[28px]
bg-white/10
backdrop-blur-2xl
border
border-white/20
shadow-[0_25px_60px_rgba(0,0,0,.25)]
p-6
z-20
"
>

<div className="flex items-center gap-3">

<div
className="
w-10
h-10
rounded-2xl
bg-gradient-to-br
from-[#22C55E]
to-[#16A34A]
flex
items-center
justify-center
text-white
text-xl
"
>

⚡

</div>

<div>

<p className="text-white text-[24px] font-black leading-none">

24 hrs

</p>

<p className="text-white/70 text-xs uppercase tracking-[0.15em] mt-2">

Average Approval

</p>

</div>

</div>

<div className="mt-5 border-t border-white/10 pt-4">

<p className="text-green-300 text-sm font-medium">

Fast Digital Verification

</p>

</div>

</div>

  <div
className="
hidden
lg:block
absolute
bottom-10
left-6
w-[170px]
rounded-[28px]
bg-white/10
backdrop-blur-2xl
border
border-white/20
shadow-[0_25px_60px_rgba(0,0,0,.25)]
p-5
z-20
"
>

<div className="flex items-center gap-3">

<div
className="
w-10
h-10
rounded-2xl
bg-gradient-to-br
from-[#22C55E]
to-[#16A34A]
flex
items-center
justify-center
text-white
text-lg
"
>

🛡

</div>

<div>

<p className="text-white text-[24px] font-black">

100%

</p>

<p className="text-white/70 text-xs uppercase tracking-[0.15em]">

Secure Registration

</p>

</div>

</div>

<div className="mt-5 border-t border-white/10 pt-4">

<p className="text-green-300 text-sm">

Aadhaar Protected

</p>

</div>

</div>

</div>

          {/* RIGHT FORM */}

          <div>
 <span
  className="
inline-flex
items-center
gap-2
px-5
py-2.5
rounded-full
bg-[#F4FFF8]
border
border-[#22C55E]/20
text-[#16A34A]
font-semibold
shadow-sm
mb-6
"
>
  <span
    className="
w-2.5
h-2.5
rounded-full
bg-[#22C55E]
animate-pulse
"
  />

  Rider Registration
</span>

            <h2
className="
text-[50px]
md:text-[64px]
leading-[0.95]
font-black
tracking-tight
text-[#0F172A]
"
>
Start Your Journey
</h2>

<h3
className="
mt-3
text-[38px]
md:text-[52px]
font-black
tracking-tight
bg-gradient-to-r
from-[#16A34A]
via-[#22C55E]
to-[#18B368]
bg-clip-text
text-transparent
"
>
With EVUDDY
</h3>

<p
className="
mt-6
mb-10
max-w-xl
text-[18px]
leading-8
text-slate-600
"
>
Complete your registration, verify your identity and unlock secure electric mobility powered by EVUDDY's intelligent rider platform.
</p>

            <div
className="
flex
items-center
justify-between
mb-10
mt-8
overflow-x-auto
rounded-[24px]
bg-white
border
border-slate-200
shadow-sm
px-6
py-5
"
>

  <div className="flex flex-col items-center">
  <div
className={`
w-14
h-14
rounded-full
flex
items-center
justify-center
font-black
text-lg
transition-all
duration-300
shadow-lg
${
step >= 1
? "bg-gradient-to-br from-[#16A34A] via-[#22C55E] to-[#18B368] text-white scale-110 shadow-[0_12px_35px_rgba(34,197,94,.35)]"
: "bg-slate-200 text-slate-500"
}
`}
>
    1
  </div>

  <span className="text-xs mt-2 text-gray-600 font-medium">
    Personal
  </span>
</div>

  <div className="
flex-1
h-[4px]
rounded-full
bg-slate-200
mx-3
overflow-hidden
">
    <div
className={`
${step >= 2 ? "w-full" : "w-0"}
h-full
bg-gradient-to-r
from-[#16A34A]
via-[#22C55E]
to-[#18B368]
transition-all
duration-500
`}
/>
  </div>

  <div className="flex flex-col items-center">
  <div
className={`
w-14
h-14
rounded-full
flex
items-center
justify-center
font-black
text-lg
transition-all
duration-300
shadow-lg
${
step >= 2
? "bg-gradient-to-br from-[#16A34A] via-[#22C55E] to-[#18B368] text-white scale-110"
: "bg-slate-200 text-slate-500"
}
`}
>
    2
  </div>

  <span className="text-xs mt-2 text-gray-600 font-medium">
    Verify
  </span>
</div>

  <div className="
flex-1
h-[4px]
rounded-full
bg-slate-200
mx-3
overflow-hidden
">
    <div className={`${step >= 3 ? "w-full" : "w-0"} h-full bg-[#22C55E] transition-all duration-500`} />
  </div>

  <div className="flex flex-col items-center">
  <div
className={`
w-14
h-14
rounded-full
flex
items-center
justify-center
font-black
text-lg
transition-all
duration-300
shadow-lg
${
step >= 3
? "bg-gradient-to-br from-[#16A34A] via-[#22C55E] to-[#18B368] text-white scale-110"
: "bg-slate-200 text-slate-500"
}
`}
>
    3
  </div>

  <span className="text-xs mt-2 text-gray-600 font-medium">
    KYC
  </span>
</div>

  <div className="
flex-1
h-[4px]
rounded-full
bg-slate-200
mx-3
overflow-hidden
">
    <div className={`${step >= 4 ? "w-full" : "w-0"} h-full bg-[#22C55E] transition-all duration-500`} />
  </div>

  <div className="flex flex-col items-center">
  <div
className={`
w-14
h-14
rounded-full
flex
items-center
justify-center
font-black
text-lg
transition-all
duration-300
shadow-lg
${
step >= 4
? "bg-gradient-to-br from-[#16A34A] via-[#22C55E] to-[#18B368] text-white scale-110"
: "bg-slate-200 text-slate-500"
}
`}
>
    4
  </div>

  <span className="text-xs mt-2 text-[#0A1134] font-semibold">
    Documents
  </span>
</div>

</div>

            {/* FORM CARD */}

           <div className="
relative
overflow-hidden
rounded-[40px]
bg-white/95
backdrop-blur-xl
 border
border-white
p-6
sm:p-10
md:p-12
shadow-[0_35px_90px_rgba(15,23,42,0.10)]
hover:shadow-[0_45px_120px_rgba(15,23,42,0.16)]
transition-all
duration-500
before:absolute
before:top-0
before:left-0
before:w-full
before:h-1
before:bg-gradient-to-r
before:from-[#16A34A]
before:via-[#22C55E]
before:to-[#18B368]
"
>

              {step === 1 && (
                <>
                  <h3
className="
text-[36px]
font-black
tracking-tight
text-[#0F172A]
mb-3
"
>
                    Personal Information
                  </h3>

                  <p className="text-gray-500 mt-2 mb-8">
Step 1 of 4
</p>

                  <p className="text-sm text-gray-500 mb-6">
  Fields marked <span className="text-red-500">*</span> are required
</p>

                  <div className="space-y-6">

                    <input
  type="text"
  placeholder="Full Name *"
  value={fullName}
  onChange={(e) => {
  setFullName(e.target.value);
  setError("");
}}
 className="
w-full
h-14
px-5
rounded-2xl
border
border-slate-200
bg-[#F8FAFC]
text-[#0F172A]
placeholder:text-slate-500
shadow-sm
transition-all
duration-300
outline-none
focus:bg-white
focus:border-[#22C55E]
focus:ring-4
focus:ring-[#22C55E]/20
"
/>

                    <input
  type="tel"
  placeholder="Phone Number *"
  value={phone}
  onChange={(e) => {
  const next = e.target.value;
  setPhone(next);
  const digits = indianMobile(next);
  const sessionPhone = indianMobile(auth.currentUser?.phoneNumber || "");
  if (sessionPhone && digits === sessionPhone && phoneRegex.test(sessionPhone)) {
    void applyExistingFirebaseSession(digits);
    return;
  }
  setOtp("");
  setOtpSent(false);
  setOtpVerified(false);
  setConfirmationResult(null);
  setOtpMessage("");
  setError("");
  setOtpSendCount(0);
setOtpVerifyAttempts(0);

  if (recaptchaVerifierRef.current) {
    recaptchaVerifierRef.current.clear();
    recaptchaVerifierRef.current = null;
  }
}}
  className="
w-full
h-16
px-5
rounded-2xl
border
border-slate-200
bg-[#F8FAFC]
text-[#0F172A]
placeholder:text-slate-500
shadow-sm
 transition-all
duration-300
outline-none
focus:bg-white
focus:border-[#22C55E]
focus:ring-4
focus:ring-[#22C55E]/20
"
/>

                    <input
  type="email"
  placeholder="Email Address *"
  value={email}
  onChange={(e) => {
  setEmail(e.target.value);
  setError("");
}}
  className="
w-full
h-14
px-5
rounded-2xl
border
border-slate-200
bg-[#F8FAFC]
text-[#0F172A]
placeholder:text-slate-500
shadow-sm
transition-all
duration-300
outline-none
focus:bg-white
focus:border-[#22C55E]
focus:ring-4
focus:ring-[#22C55E]/20
"
/>

                  </div>
                </>
              )}

              {step === 2 && (
  <>
  
    <h3
className="
text-[36px]
font-black
tracking-tight
text-[#0F172A]
mb-3
"
>
      OTP Verification
    </h3>

    <p
className="
text-[16px]
text-slate-500
mb-8
leading-7
"
>
Step 2 of 4
</p>

    <div className="space-y-6">
      <div id="recaptcha-container"></div>

      <input
        type="text"
        disabled={otpVerified}
        placeholder="Enter 6 Digit OTP"
        value={otp}
        onChange={(e) => {
          setOtp(e.target.value);
          setError("");
          setOtpMessage("");
        }}
        className="
        w-full
        h-16
        px-5
        rounded-2xl
        border
        border-gray-200
        disabled:bg-green-50
        disabled:text-green-700
        disabled:cursor-not-allowed
        "
      />

      <button
        type="button"
        onClick={sendOtp}
        disabled={otpLoading || otpVerified || otpCooldown > 0 || otpSendCount >= MAX_OTP_SENDS_PER_PHONE}
        className="
        w-full
        h-14
        rounded-2xl
        bg-blue-600
        text-white
        font-bold
        shadow-lg
        "
      >
        {otpLoading
  ? "Sending OTP..."
  : otpCooldown > 0
  ? `Resend OTP in ${otpCooldown}s`
  : otpSent
  ? "Resend OTP"
  : "Send OTP"}
      </button>

      {otpVerified ? (
  <div
    className="
    w-full
    h-14
    rounded-2xl
    bg-green-50
    border
    border-green-300
    flex
    items-center
    justify-center
    font-bold
    text-green-700
    "
  >
    ✓ Phone Number Verified
  </div>
) : (
  otpSent && (
    <button
      type="button"
      onClick={verifyOtp}
      disabled={otpLoading}
      className="
      w-full
      h-14
      rounded-2xl
      bg-green-600
      text-white
      font-bold
      shadow-lg
      disabled:opacity-50
      "
    >
      Verify OTP
    </button>
  )
)}

      {otpMessage && (
  <div className="
  p-4
  rounded-xl
  bg-green-50
  border
  border-green-200
  text-green-700
  font-semibold
  ">
    {otpMessage}
  </div>
      )}
      </div>
      </>
              )}
            

              {step === 3 && (
                <>
                  <h3
className="
text-[36px]
font-black
tracking-tight
text-[#0F172A]
mb-3
"
>
                    KYC Details
                  </h3>

                  <p
className="
text-[16px]
text-slate-500
mb-8
leading-7
"
>
                    Step 3 of 4
                  </p>

                  <div className="space-y-6">

                    <input
  type="text"
  placeholder="Aadhaar Number *"
  value={aadhaar}
  onChange={(e) => {
    setAadhaar(e.target.value);
    setError("");
  }}
  className="w-full h-16 px-5 rounded-2xl border border-gray-200 bg-white text-[#0A1134] placeholder:text-gray-500 placeholder:opacity-100 shadow-sm"
/>

                    <input
  type="text"
  placeholder="Driving License Number (Optional)"
  value={license}
  onChange={(e) => {
    setLicense(e.target.value);
    setError("");
  }}
  className="
w-full
h-16
px-5
rounded-2xl
border
border-slate-200
bg-[#F8FAFC]
text-[#0F172A]
placeholder:text-slate-500
shadow-sm
transition-all
duration-300
outline-none
focus:bg-white
focus:border-[#22C55E]
focus:ring-4
focus:ring-[#22C55E]/20
"
/>

<input
  type="text"
  placeholder="Instagram ID (Optional)"
  value={instagramId}
  onChange={(e) => setInstagramId(e.target.value)}
  className="
w-full
h-16
px-5
rounded-2xl
border
border-slate-200
bg-[#F8FAFC]
text-[#0F172A]
placeholder:text-slate-500
shadow-sm
transition-all
duration-300
outline-none
focus:bg-white
focus:border-[#22C55E]
focus:ring-4
focus:ring-[#22C55E]/20
"
/>

<input
  type="text"
  placeholder="Facebook ID (Optional)"
  value={facebookId}
  onChange={(e) => setFacebookId(e.target.value)}
  className="
w-full
h-16
px-5
rounded-2xl
border
border-slate-200
bg-[#F8FAFC]
text-[#0F172A]
placeholder:text-slate-500
shadow-sm
transition-all
duration-300
outline-none
focus:bg-white
focus:border-[#22C55E]
focus:ring-4
focus:ring-[#22C55E]/20
"
/>

<input
  type="text"
  placeholder="Reference Person 1 Name (Optional)"
  value={reference1Name}
  onChange={(e) => setReference1Name(e.target.value)}
  className="
w-full
h-16
px-5
rounded-2xl
border
border-slate-200
bg-[#F8FAFC]
text-[#0F172A]
placeholder:text-slate-500
shadow-sm
transition-all
duration-300
outline-none
focus:bg-white
focus:border-[#22C55E]
focus:ring-4
focus:ring-[#22C55E]/20
"
/>

<input
  type="tel"
  placeholder="Reference Person 1 Phone (Optional)"
  value={reference1Phone}
  onChange={(e) => setReference1Phone(e.target.value)}
 className="
w-full
h-16
px-5
rounded-2xl
border
border-slate-200
bg-[#F8FAFC]
text-[#0F172A]
placeholder:text-slate-500
shadow-sm
transition-all
duration-300
outline-none
focus:bg-white
focus:border-[#22C55E]
focus:ring-4
focus:ring-[#22C55E]/20
"
/>

<input
  type="text"
  placeholder="Reference Person 2 Name (Optional)"
  value={reference2Name}
  onChange={(e) => setReference2Name(e.target.value)}
  className="
w-full
h-16
px-5
rounded-2xl
border
border-slate-200
bg-[#F8FAFC]
text-[#0F172A]
placeholder:text-slate-500
shadow-sm
transition-all
duration-300
outline-none
focus:bg-white
focus:border-[#22C55E]
focus:ring-4
focus:ring-[#22C55E]/20
"
/>

<input
  type="tel"
  placeholder="Reference Person 2 Phone (Optional)"
  value={reference2Phone}
  onChange={(e) => setReference2Phone(e.target.value)}
  className="
w-full
h-16
px-5
rounded-3xl
border
border-slate-200
bg-[#F8FAFC]
text-[#0F172A]
placeholder:text-slate-500
shadow-md
transition-all
duration-300
outline-none
focus:bg-white
focus:border-[#22C55E]
focus:ring-4
focus:ring-[#22C55E]/20
"
/>

                  </div>
                </>
              )}

              {step === 4 && (
                <>
                  <h3
className="
text-[34px]
font-black
tracking-tight
text-[#0F172A]
mb-5
"
>
                    Upload Documents
                  </h3>

                  <p
className="
text-[16px]
text-slate-500
mb-8
leading-7
"
>
Step 4 of 4
</p>

                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">

  <label
    className="
    cursor-pointer
    border-2
    border-dashed
    border-pink-200
    rounded-3xl
    p-8
    bg-pink-50/50
    hover:scale-[1.03]
hover:shadow-xl
    hover:border-[#FF165E]
    hover:bg-pink-50
    transition-all
    duration-300
    text-center
    "
  >

    <div className="text-5xl mb-4">
      📄
    </div>

    <h4 className="font-bold text-[#0A1134] mb-2">
      Aadhaar Front *
    </h4>
    <p className="text-xs text-red-500 mb-2 font-medium">
Required
</p>

    <p className="text-[#444] text-sm mb-3">
      Drag & Drop or Click To Upload
    </p>
    <p className="text-xs text-gray-400 mt-2">
Maximum Size: 5 MB
</p>

    <p className="text-xs text-[#666]">
      PDF • JPG • PNG
    </p>
   {aadhaarFrontFile && (
  <>
    <p className="mt-3 text-green-600 text-sm font-semibold">
      ✅ {aadhaarFrontFile.name}
    </p>

    <p className="text-xs text-gray-500">
      {(aadhaarFrontFile.size / 1024 / 1024).toFixed(2)} MB
    </p>

    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        setAadhaarFrontFile(null);
      }}
      className="mt-3 text-red-600 text-sm font-semibold hover:underline"
    >
      ❌ Remove File
    </button>
  </>
)}

    <input
      type="file"
       accept=".pdf,.jpg,.jpeg,.png,.webp"
      className="hidden"
      onChange={(e) =>
  selectValidatedFile(
    e.target.files ? e.target.files[0] : null,
    setAadhaarFrontFile,
    allowedDocumentTypes,
    "Aadhaar Front"
  )
}
    />

  </label>

  <label
    className="
    cursor-pointer
    border-2
    border-dashed
    border-pink-200
    rounded-3xl
    p-8
    bg-pink-50/50
    hover:scale-[1.03]
hover:shadow-xl
    hover:border-[#FF165E]
    hover:bg-pink-50
    transition-all
    duration-300
    text-center
    "
  >

    <div className="text-5xl mb-4">
      📄
    </div>

    <h4 className="font-bold text-[#0A1134] mb-2">
      Aadhaar Back *
    </h4>
    <p className="text-xs text-red-500 mb-2 font-medium">
Required
</p>

    <p className="text-[#444] text-sm mb-3">
      Drag & Drop or Click To Upload
    </p>
    <p className="text-xs text-gray-400 mt-2">
Maximum Size: 5 MB
</p>

    <p className="text-xs text-[#666]">
      PDF • JPG • PNG
    </p>
   {aadhaarBackFile && (
  <>
    <p className="mt-3 text-green-600 text-sm font-semibold">
      ✅ {aadhaarBackFile.name}
    </p>

    <p className="text-xs text-gray-500">
      {(aadhaarBackFile.size / 1024 / 1024).toFixed(2)} MB
    </p>

    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        setAadhaarBackFile(null);
      }}
      className="mt-3 text-red-600 text-sm font-semibold hover:underline"
    >
      ❌ Remove File
    </button>
  </>
)}

    <input
      type="file"
       accept=".pdf,.jpg,.jpeg,.png,.webp"
      className="hidden"
      onChange={(e) =>
  selectValidatedFile(
    e.target.files ? e.target.files[0] : null,
    setAadhaarBackFile,
    allowedDocumentTypes,
    "Aadhaar Back"
  )
}
    />

  </label>

  <label
    className="
    cursor-pointer
    border-2
    border-dashed
    border-pink-200
    rounded-3xl
    p-8
    bg-pink-50/50
    hover:border-[#FF165E]
    hover:bg-pink-50
    hover:scale-[1.03]
hover:shadow-xl
    transition-all
    duration-300
    text-center
    "
  >

    <div className="text-5xl mb-4">
      🪪
    </div>

    <h4 className="font-bold text-[#0A1134] mb-2">
  Driving License Front
</h4>

<p className="text-xs text-orange-500 mb-2 font-medium">
  Optional
</p>

    <p className="text-gray-500 text-sm mb-3">
      Drag & Drop or Click To Upload
    </p>
    <p className="text-xs text-gray-400 mt-2">
Maximum Size: 5 MB
</p>

    <p className="text-xs text-gray-400">
      PDF • JPG • PNG
    </p>

    {licenseFrontFile && (
  <>
    <p className="mt-3 text-green-600 text-sm font-semibold">
      ✅ {licenseFrontFile.name}
    </p>

    <p className="text-xs text-gray-500">
      {(licenseFrontFile.size / 1024 / 1024).toFixed(2)} MB
    </p>

    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        setLicenseFrontFile(null);
      }}
      className="mt-3 text-red-600 text-sm font-semibold hover:underline"
    >
      ❌ Remove File
    </button>
  </>
)}

    <input
  type="file"
  accept=".pdf,.jpg,.jpeg,.png,.webp"
  className="hidden"
  onChange={(e) =>
    selectValidatedFile(
      e.target.files ? e.target.files[0] : null,
      setLicenseFrontFile,
      allowedDocumentTypes,
      "Driving license front"
    )
  }
/>

  </label>

  <label
    className="
    cursor-pointer
    border-2
    border-dashed
    border-pink-200
    rounded-3xl
    p-8
    bg-pink-50/50
    hover:border-[#FF165E]
    hover:bg-pink-50
    hover:scale-[1.03]
hover:shadow-xl
    transition-all
    duration-300
    text-center
    "
  >

    <div className="text-5xl mb-4">
      🪪
    </div>

    <h4 className="font-bold text-[#0A1134] mb-2">
  Driving License Back
</h4>

<p className="text-xs text-orange-500 mb-2 font-medium">
  Optional
</p>

    <p className="text-gray-500 text-sm mb-3">
      Drag & Drop or Click To Upload
    </p>
    <p className="text-xs text-gray-400 mt-2">
Maximum Size: 5 MB
</p>

    <p className="text-xs text-gray-400">
      PDF • JPG • PNG
    </p>

    {licenseBackFile && (
  <>
    <p className="mt-3 text-green-600 text-sm font-semibold">
      ✅ {licenseBackFile.name}
    </p>

    <p className="text-xs text-gray-500">
      {(licenseBackFile.size / 1024 / 1024).toFixed(2)} MB
    </p>

    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        setLicenseBackFile(null);
      }}
      className="mt-3 text-red-600 text-sm font-semibold hover:underline"
    >
      ❌ Remove File
    </button>
  </>
)}

    <input
  type="file"
  accept=".pdf,.jpg,.jpeg,.png,.webp"
  className="hidden"
  onChange={(e) =>
    selectValidatedFile(
      e.target.files ? e.target.files[0] : null,
      setLicenseBackFile,
      allowedDocumentTypes,
      "Driving license Back"
    )
  }
/>

  </label>

  <label
  className="
  cursor-pointer
  border-2
  border-dashed
  border-pink-200
  rounded-3xl
  p-8
  bg-pink-50/50
  hover:border-[#FF165E]
  hover:bg-pink-50
  hover:scale-[1.03]
  hover:shadow-xl
  transition-all
  duration-300
  text-center
  "
>

  <div className="text-5xl mb-4">
    📷
  </div>

  <h4 className="font-bold text-[#0A1134] mb-2">
  Profile Photo *
</h4>

<p className="text-xs text-red-500 mb-2 font-medium">
  Required Document
</p>

  <p className="text-gray-500 text-sm mb-3">
    Upload Passport Size Photo
  </p>

  <p className="text-xs text-gray-400">
    JPG • PNG
  </p>

  <p className="text-xs text-gray-400 mt-2">
    Maximum Size: 5 MB
  </p>

 {profilePhoto && (
  <>
    <p className="mt-3 text-green-600 text-sm font-semibold">
      ✅ {profilePhoto.name}
    </p>

    <p className="text-xs text-gray-500">
      {(profilePhoto.size / 1024 / 1024).toFixed(2)} MB
    </p>

    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        setProfilePhoto(null);
      }}
      className="mt-3 text-red-600 text-sm font-semibold hover:underline"
    >
      ❌ Remove File
    </button>
  </>
)}

  <input
  type="file"
  accept=".jpg,.jpeg,.png,.webp"
  className="hidden"
  onChange={(e) =>
    selectValidatedFile(
      e.target.files ? e.target.files[0] : null,
      setProfilePhoto,
      allowedPhotoTypes,
      "Profile photo"
    )
  }
/>

</label>

</div>
                </>
              )}

              {error && (
  <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 font-semibold">
    {error}
  </div>
)}

              <div className="flex justify-between mt-8">

                {step > 1 ? (
                  <button
                    onClick={() => setStep(step - 1)}
                   className="
px-6
py-3
rounded-xl
border
border-gray-300
bg-white
text-[#0A1134]
font-semibold
shadow-sm
hover:bg-gray-50
transition
"
                  >
                    Back
                  </button>
                ) : (
                  <div />
                )}

                {step < 4 ? (
                  <button
  type="button"
  disabled={isContinueDisabled}
  onClick={() => {
    if (isContinueDisabled) {
      setError("Please verify OTP first");
      return;
    }

    if (validateStep()) {
      setStep(step + 1);
    }
  }}
  className={`
    px-8
    py-3
    rounded-xl
    text-white
    font-bold
    shadow-lg
    transition-all
    duration-300
    ${
      isContinueDisabled
        ? "bg-gray-300 cursor-not-allowed shadow-none"
        : "bg-gradient-to-r from-[#16A34A] via-[#22C55E] to-[#18B368] hover:scale-[1.03] hover:shadow-[0_18px_45px_rgba(34,197,94,.35)]"
    }
  `}
>
  {step === 1
    ? "Continue to Verification →"
    : step === 2
    ? "Continue to KYC →"
    : "Continue to Documents →"}
</button>
                ) : (
                  <button
                  disabled={submitting}
  onClick={() => {

    if(validateStep()){
      submitForm();
    }

  }}
  className="
px-8
py-3
rounded-xl
bg-gradient-to-r
from-[#16A34A]
via-[#22C55E]
to-[#18B368]
text-white
font-bold
shadow-lg
transition-all
duration-300
disabled:opacity-50
disabled:cursor-not-allowed
disabled:scale-100
hover:scale-[1.03]
hover:shadow-[0_20px_50px_rgba(34,197,94,.35)]
"
>
  {submitting ? "Creating Rider Account..." : "Submit Registration"}
</button>
                )}

              </div>

            </div>

            <div className="flex flex-wrap gap-4 mt-8">

  <div className="
px-6
py-3
rounded-full
bg-white
border
border-[#DCFCE7]
text-[#16A34A]
text-sm
font-semibold
shadow-sm
transition-all
duration-300
hover:-translate-y-1
hover:shadow-lg
">
    ✓ Aadhaar Protected
  </div>

  <div className="
px-6
py-3
rounded-full
bg-white
border
border-[#DCFCE7]
text-[#16A34A]
text-sm
font-semibold
shadow-sm
transition-all
duration-300
hover:-translate-y-1
hover:shadow-lg
">
    ✓ Secure Registration
  </div>

  <div className="
px-6
py-3
rounded-full
bg-white
border
border-[#DCFCE7]
text-[#16A34A]
text-sm
font-semibold
shadow-sm
transition-all
duration-300
hover:-translate-y-1
hover:shadow-lg
">
    ✓ Verified Platform
  </div>

</div>

          </div>

        </div>

      </div>

    </section>
  );
}