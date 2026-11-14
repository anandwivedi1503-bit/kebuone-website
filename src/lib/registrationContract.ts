/**
 * Shared registration rules for the website and the installed app.
 *
 * A phone keeps the app build it already has. A website deploy must not
 * reject that build. New answers are required only for clients that say
 * they can collect them.
 */

export type PickupCityAck = "" | "LUCKNOW" | "OTHER";

export type RegistrationClient = {
  /** web = current website. app = a build that names its capabilities. legacy = the app already on phones. */
  kind: "web" | "app" | "legacy";
  /** True when this client has a screen for the Lucknow question. */
  asksPickupCity: boolean;
};

export function readClientCapabilities(headers: Headers): string[] {
  return (headers.get("x-evuddy-client-capabilities") || "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function readRegistrationClient(headers: Headers): RegistrationClient {
  const kind = headers.get("x-evuddy-client")?.trim().toLowerCase();
  const caps = readClientCapabilities(headers);
  if (kind === "web") return { kind: "web", asksPickupCity: true };
  if (kind === "app") {
    return { kind: "app", asksPickupCity: caps.includes("pickupCityAck") };
  }
  return { kind: "legacy", asksPickupCity: false };
}

/**
 * The app already on phones offers a first payment from ₹1 and cannot be
 * changed until a store build. The website, and an app build that names
 * `firstPaymentHalfRental`, keep the 50% rental floor.
 */
export function enforcesHalfRentalFirstPayment(headers: Headers): boolean {
  const client = readRegistrationClient(headers);
  if (client.kind === "web") return true;
  if (client.kind === "app") {
    return readClientCapabilities(headers).includes("firstPaymentHalfRental");
  }
  return false;
}

export function normalizePickupCityAck(value: unknown): PickupCityAck {
  const raw = String(value ?? "").trim().toUpperCase();
  if (raw === "LUCKNOW" || raw === "OTHER") return raw;
  return "";
}

/** Null when the request may continue. */
export function pickupCityAckError(
  value: PickupCityAck,
  client: RegistrationClient
): string | null {
  if (!client.asksPickupCity) return null;
  if (value === "LUCKNOW" || value === "OTHER") return null;
  return "Confirm whether you are in Lucknow or another city.";
}

/** What both clients can read when they want the same payment rule. */
export function paymentContract() {
  return {
    version: 1,
    firstRentalPayment: {
      website: "half-of-rental",
      capability: "firstPaymentHalfRental",
      legacyApp: "from-one-rupee",
    },
  };
}

/** What both clients can read when they want the same question. */
export function registrationContract() {
  return {
    version: 1,
    fields: [
      {
        key: "pickupCityAck",
        requiredWhenClientAsks: true,
        optionalForLegacyApp: true,
        options: [
          {
            value: "LUCKNOW",
            label: "I am in Lucknow (U.P.) and will use a Lucknow hub",
          },
          {
            value: "OTHER",
            label: "I am in another city",
          },
        ],
      },
    ],
  };
}
