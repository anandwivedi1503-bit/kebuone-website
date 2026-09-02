import crypto from "crypto";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function toBase32(bytes: Buffer) {
  let bits = 0;
  let value = 0;
  let output = "";
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) output += ALPHABET[(value << (5 - bits)) & 31];
  return output;
}

export function fromBase32(input: string) {
  const cleaned = String(input || "")
    .toUpperCase()
    .replace(/=+$/g, "")
    .replace(/[^A-Z2-7]/g, "");
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];
  for (const char of cleaned) {
    const idx = ALPHABET.indexOf(char);
    if (idx < 0) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

export function generateTotpSecret() {
  return toBase32(crypto.randomBytes(20));
}

function hotp(secret: Buffer, counter: number) {
  const buf = Buffer.alloc(8);
  buf.writeUInt32BE(Math.floor(counter / 0x100000000), 0);
  buf.writeUInt32BE(counter >>> 0, 4);
  const hmac = crypto.createHmac("sha1", secret).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const code = (hmac.readUInt32BE(offset) & 0x7fffffff) % 1_000_000;
  return String(code).padStart(6, "0");
}

export function totpCode(secretBase32: string, atMs = Date.now()) {
  const counter = Math.floor(atMs / 1000 / 30);
  return hotp(fromBase32(secretBase32), counter);
}

export function totpMatches(secretBase32: string, code: unknown) {
  const expected = String(code || "").replace(/\s+/g, "");
  if (!/^\d{6}$/.test(expected) || !secretBase32) return false;
  const now = Date.now();
  const wanted = Buffer.from(expected);
  return [-1, 0, 1].some((window) => {
    const actual = Buffer.from(totpCode(secretBase32, now + window * 30_000));
    return actual.length === wanted.length && crypto.timingSafeEqual(actual, wanted);
  });
}

export function totpOtpauthUrl(username: string, secret: string) {
  const label = encodeURIComponent(`EVUDDY:${username}`);
  return `otpauth://totp/${label}?secret=${secret}&issuer=EVUDDY&digits=6&period=30`;
}
