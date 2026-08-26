import crypto from "crypto";

export function uniqueMoneyId(prefix: string) {
  return `${prefix}-${crypto.randomUUID().replace(/-/g, "").slice(0, 20).toUpperCase()}`;
}
