export type RiderOwnershipUser = {
  uid: string;
  phone: string;
};

export type RiderOwnershipRecord = {
  firebaseUid?: string;
  phone?: string;
  userPhone?: string;
};

export function normalizeIndianPhone(value: unknown): string {
  const digits = String(value ?? "").replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.slice(2);
  }

  if (digits.length === 11 && digits.startsWith("0")) {
    return digits.slice(1);
  }

  if (digits.length === 10) {
    return digits;
  }

  const lastTen = digits.slice(-10);
  if (/^[6-9]\d{9}$/.test(lastTen)) {
    return lastTen;
  }

  return "";
}

export function firebaseUserOwnsRider(
  firebaseUser: RiderOwnershipUser | null,
  rider: RiderOwnershipRecord | null
): boolean {
  if (!firebaseUser || !rider) {
    return false;
  }

  const riderUid = String(rider.firebaseUid || "").trim();
  if (riderUid) {
    return Boolean(firebaseUser.uid && firebaseUser.uid === riderUid);
  }

  const firebasePhone = normalizeIndianPhone(firebaseUser.phone);
  const riderPhones = [rider.phone, rider.userPhone]
    .map((value) => normalizeIndianPhone(value))
    .filter(Boolean);

  return Boolean(firebasePhone && riderPhones.includes(firebasePhone));
}
