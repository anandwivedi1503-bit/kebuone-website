"use client";

import { useEffect, useRef, useState } from "react";

import { auth } from "@/lib/firebase";

import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
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

const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
const [licenseFile, setLicenseFile] = useState<File | null>(null);
const [instagramId, setInstagramId] = useState("");
const [facebookId, setFacebookId] = useState("");

const [reference1Name, setReference1Name] = useState("");
const [reference1Phone, setReference1Phone] = useState("");

const [reference2Name, setReference2Name] = useState("");
const [reference2Phone, setReference2Phone] = useState("");
const [profilePhoto, setProfilePhoto] = useState<File | null>(null);

const [error, setError] = useState("");
const [otpMessage, setOtpMessage] = useState("");
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

const uploadFile = async (file: File) => {
  const base64 = await convertToBase64(file);
  showOtpMessage("Uploading document...");
  const response = await fetch("/api/upload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
  file: base64,
  firebaseIdToken,
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
  try {
    setSubmitting(true);
setError("");
    if (!firebaseIdToken) {
  setError("Please verify OTP again before uploading documents.");
  return;
}

    let aadhaarUrl = "";
    let licenseUrl = "";
    let profileUrl = "";

    if (aadhaarFile) {
      aadhaarUrl = await uploadFile(aadhaarFile);
    }

    if (licenseFile) {
      licenseUrl = await uploadFile(licenseFile);
    }

    if (profilePhoto) {
      profileUrl = await uploadFile(profilePhoto);
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
        firebaseUid,
firebaseIdToken,

        aadhaarNumber: aadhaar,
        drivingLicense: license,

        aadhaarFileUrl: aadhaarUrl,
        licenseFileUrl: licenseUrl,
        profilePhotoUrl: profileUrl,

        instagramId,
        facebookId,

        reference1Name,
        reference1Phone,

        reference2Name,
        reference2Phone,
      }),
    });

    const data = await response.json();

    if (data.success) {

  localStorage.setItem(
    "kebu_rider_phone",
    phone
  );

  localStorage.setItem(
    "kebu_rider_id",
    data.data.riderId
  );

  setRegisteredRiderId(data.data.riderId);

  setSubmitted(true);

} else {
  setError(data.errors?.join(" ") || data.message || "Registration failed");
}

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

    const validPhone = cleanDigits(phone).slice(0, 10);

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
    setOtpVerified(false);
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
    showOtpMessage("Phone number verified successfully.");
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
    const validPhone = cleanDigits(phone);
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
    if (!aadhaarFile) {
      setError("Please upload Aadhaar Card");
      return false;
    }

    if (!validateSelectedFile(aadhaarFile, allowedDocumentTypes, "Aadhaar document")) {
      return false;
    }

    if (licenseFile && !validateSelectedFile(licenseFile, allowedDocumentTypes, "Driving license document")) {
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
        p-12
        shadow-[0_30px_100px_rgba(255,22,94,0.12)]
        text-center
        border border-pink-100
        ">

          <div className="text-8xl mb-6 animate-bounce">
✅
</div>

          <h2 className="text-5xl font-black text-[#0A1134] mb-4">
            Registration Submitted
          </h2>

          <p className="text-[#444] text-lg mb-10">
            Your onboarding request has been successfully received.
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

              <h3 className="font-bold text-orange-500">
                Under Verification
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

          </div>

          <p className="text-[#555] mb-8">
            Your documents have been securely submitted.

Our verification team will review your profile.

Once approved, you'll receive confirmation and can immediately book your bike.
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center">

  <button
    onClick={() => window.location.href = "/book-bike"}
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
    Book Your First Bike →
  </button>

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
  className="py-32 bg-gradient-to-b from-white via-[#FFF7FA] to-white"
>
      <div className="max-w-7xl mx-auto px-6">

        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* LEFT VIDEO */}

          <div className="relative hidden lg:block">

            <div className="overflow-hidden rounded-[40px] shadow-[0_30px_100px_rgba(0,0,0,0.18)]">

              <video
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-[620px] object-cover"
              >
                <source src="/kebu-final.mp4" type="video/mp4" />
              </video>

            </div>

            <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-xl rounded-2xl px-6 py-4 shadow-xl">
              <h3 className="font-bold text-[#0A1134]">
                🚲 Kebu Bike On Rent
              </h3>

              <p className="text-sm text-gray-500">
                Smart mobility for Tier-2 India
              </p>
            </div>

            <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-xl rounded-2xl px-5 py-3 shadow-xl">
  <p className="text-[#0A1134] font-bold">
    🚲 Smart Fleet
  </p>
</div>

<div className="absolute top-28 right-6 bg-white/90 backdrop-blur-xl rounded-2xl px-5 py-3 shadow-xl">
  <p className="text-[#0A1134] font-bold">
    📍 Hub-Based Operations
  </p>
</div>

          </div>

          {/* RIGHT FORM */}

          <div>

            <span className="inline-flex items-center px-5 py-2 rounded-full bg-pink-50 border border-pink-100 text-[#FF165E] font-semibold mb-6">
              Rider Registration
            </span>

            <h2 className="text-4xl md:text-6xl font-black text-[#0A1134] leading-tight">
  Start Your Journey
</h2>

<h3 className="text-3xl md:text-5xl font-black text-[#FF165E] mt-2">
  With Kebu One
</h3>

<p className="text-gray-600 text-lg mt-6 mb-10 max-w-xl">
  Complete your registration, verify your identity and unlock smart mobility designed for Tier-2 India.
</p>

            <div className="flex items-center justify-between mb-8 mt-8">

  <div className="flex flex-col items-center">
  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${step >= 1 ? "bg-[#FF165E] text-white" : "bg-gray-200"}`}>
    1
  </div>

  <span className="text-xs mt-2 text-gray-600 font-medium">
    Personal
  </span>
</div>

  <div className="flex-1 h-1 bg-gray-200 mx-2">
    <div className={`${step >= 2 ? "w-full" : "w-0"} h-full bg-[#FF165E] transition-all duration-500`} />
  </div>

  <div className="flex flex-col items-center">
  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${step >= 2 ? "bg-[#FF165E] text-white" : "bg-gray-200"}`}>
    2
  </div>

  <span className="text-xs mt-2 text-gray-600 font-medium">
    Verify
  </span>
</div>

  <div className="flex-1 h-1 bg-gray-200 mx-2">
    <div className={`${step >= 3 ? "w-full" : "w-0"} h-full bg-[#FF165E] transition-all duration-500`} />
  </div>

  <div className="flex flex-col items-center">
  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${step >= 3 ? "bg-[#FF165E] text-white" : "bg-gray-200"}`}>
    3
  </div>

  <span className="text-xs mt-2 text-gray-600 font-medium">
    KYC
  </span>
</div>

  <div className="flex-1 h-1 bg-gray-200 mx-2">
    <div className={`${step >= 4 ? "w-full" : "w-0"} h-full bg-[#FF165E] transition-all duration-500`} />
  </div>

  <div className="flex flex-col items-center">
  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${step >= 4 ? "bg-[#FF165E] text-white" : "bg-gray-200"}`}>
    4
  </div>

  <span className="text-xs mt-2 text-[#0A1134] font-semibold">
    Documents
  </span>
</div>

</div>

            {/* FORM CARD */}

            <div className="
bg-white/90
backdrop-blur-xl
rounded-[36px]
p-10 md:p-12
border
border-white
shadow-[0_30px_100px_rgba(255,22,94,0.12)]
relative
overflow-hidden
">

              {step === 1 && (
                <>
                  <h3 className="text-2xl font-bold text-[#0A1134] mb-6">
                    Personal Information
                  </h3>

                  <p className="text-gray-500 mt-2 mb-8">
Step 1 of 4
</p>

                  <p className="text-sm text-gray-500 mb-6">
  Fields marked <span className="text-red-500">*</span> are required
</p>

                  <div className="space-y-4">

                    <input
  type="text"
  placeholder="Full Name *"
  value={fullName}
  onChange={(e) => {
  setFullName(e.target.value);
  setError("");
}}
 className="w-full h-14 px-5 rounded-2xl border border-gray-200 bg-white text-[#0A1134] placeholder:text-gray-500 placeholder:opacity-100"
/>

                    <input
  type="tel"
  placeholder="Phone Number *"
  value={phone}
  onChange={(e) => {
  setPhone(e.target.value);
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
border-gray-200
bg-white
text-[#0A1134]
placeholder:text-gray-500
placeholder:opacity-100
shadow-sm
outline-none
focus:border-[#FF165E]
focus:ring-4
focus:ring-pink-100
transition-all
duration-300
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
  className="w-full h-14 px-5 rounded-2xl border border-gray-200 bg-white text-[#0A1134] placeholder:text-gray-500 placeholder:opacity-100"
/>

                  </div>
                </>
              )}

              {step === 2 && (
  <>
  
    <h3 className="text-2xl font-bold text-[#0A1134] mb-6">
      OTP Verification
    </h3>

    <p className="text-gray-500 mt-2 mb-8">
Step 2 of 4
</p>

    <div className="space-y-4">
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
                  <h3 className="text-2xl font-bold text-[#0A1134] mb-6">
                    KYC Details
                  </h3>

                  <p className="text-gray-500 mt-2 mb-8">
                    Step 3 of 4
                  </p>

                  <div className="space-y-4">

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
  className="w-full h-16 px-5 rounded-2xl border border-gray-200 bg-white text-[#0A1134] placeholder:text-gray-500 placeholder:opacity-100 shadow-sm"
/>

<input
  type="text"
  placeholder="Instagram ID (Optional)"
  value={instagramId}
  onChange={(e) => setInstagramId(e.target.value)}
  className="w-full h-16 px-5 rounded-2xl border border-gray-200 bg-white text-[#0A1134] placeholder:text-gray-500 placeholder:opacity-100 shadow-sm"
/>

<input
  type="text"
  placeholder="Facebook ID (Optional)"
  value={facebookId}
  onChange={(e) => setFacebookId(e.target.value)}
  className="w-full h-16 px-5 rounded-2xl border border-gray-200 bg-white text-[#0A1134] placeholder:text-gray-500 placeholder:opacity-100 shadow-sm"
/>

<input
  type="text"
  placeholder="Reference Person 1 Name (Optional)"
  value={reference1Name}
  onChange={(e) => setReference1Name(e.target.value)}
  className="w-full h-16 px-5 rounded-2xl border border-gray-200 bg-white text-[#0A1134] placeholder:text-gray-500 placeholder:opacity-100 shadow-sm"
/>

<input
  type="tel"
  placeholder="Reference Person 1 Phone (Optional)"
  value={reference1Phone}
  onChange={(e) => setReference1Phone(e.target.value)}
 className="w-full h-16 px-5 rounded-2xl border border-gray-200 bg-white text-[#0A1134] placeholder:text-gray-500 placeholder:opacity-100 shadow-sm"
/>

<input
  type="text"
  placeholder="Reference Person 2 Name (Optional)"
  value={reference2Name}
  onChange={(e) => setReference2Name(e.target.value)}
  className="w-full h-16 px-5 rounded-2xl border border-gray-200 bg-white text-[#0A1134] placeholder:text-gray-500 placeholder:opacity-100 shadow-sm"
/>

<input
  type="tel"
  placeholder="Reference Person 2 Phone (Optional)"
  value={reference2Phone}
  onChange={(e) => setReference2Phone(e.target.value)}
  className="w-full h-16 px-5 rounded-2xl border border-gray-200 bg-white text-[#0A1134] placeholder:text-gray-500 placeholder:opacity-100 shadow-sm"
/>

                  </div>
                </>
              )}

              {step === 4 && (
                <>
                  <h3 className="text-2xl font-bold text-[#0A1134] mb-6">
                    Upload Documents
                  </h3>

                  <p className="text-gray-500 mt-2 mb-8">
Step 4 of 4
</p>

                  <div className="grid md:grid-cols-3 gap-6">

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
      Aadhaar Card
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
   {aadhaarFile && (
  <>
    <p className="mt-3 text-green-600 text-sm font-semibold">
      ✅ {aadhaarFile.name}
    </p>

    <p className="text-xs text-gray-500">
      {(aadhaarFile.size / 1024 / 1024).toFixed(2)} MB
    </p>
  </>
)}

    <input
      type="file"
       accept=".pdf,.jpg,.jpeg,.png,.webp"
      className="hidden"
      onChange={(e) =>
  selectValidatedFile(
    e.target.files ? e.target.files[0] : null,
    setAadhaarFile,
    allowedDocumentTypes,
    "Aadhaar document"
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
  Driving License
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

    {licenseFile && (
  <>
    <p className="mt-3 text-green-600 text-sm font-semibold">
      ✅ {licenseFile.name}
    </p>

    <p className="text-xs text-gray-500">
      {(licenseFile.size / 1024 / 1024).toFixed(2)} MB
    </p>
  </>
)}

    <input
  type="file"
  accept=".pdf,.jpg,.jpeg,.png,.webp"
  className="hidden"
  onChange={(e) =>
    selectValidatedFile(
      e.target.files ? e.target.files[0] : null,
      setLicenseFile,
      allowedDocumentTypes,
      "Driving license document"
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
${isContinueDisabled ? "bg-gray-300 cursor-not-allowed shadow-none" : "bg-gradient-to-r from-[#FF165E] to-[#FF5A8B]"}
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
from-[#FF165E]
to-[#FF5A8B]
text-white
font-bold
shadow-lg
disabled:opacity-50
disabled:cursor-not-allowed
"
>
  {submitting ? "Creating Rider Account..." : "Submit Registration"}
</button>
                )}

              </div>

            </div>

            <div className="flex flex-wrap gap-3 mt-8">

  <div className="px-4 py-2 rounded-full bg-pink-50 border border-pink-200 text-[#FF165E] text-sm font-semibold">
    ✓ Aadhaar Protected
  </div>

  <div className="px-4 py-2 rounded-full bg-pink-50 border border-pink-200 text-[#FF165E] text-sm font-semibold">
    ✓ Secure Registration
  </div>

  <div className="px-4 py-2 rounded-full bg-pink-50 border border-pink-200 text-[#FF165E] text-sm font-semibold">
    ✓ Verified Platform
  </div>

</div>

          </div>

        </div>

      </div>

    </section>
  );
}