/** Shared registration rules for the website and the installed app. */

export type PickupCityAck = "" | "LUCKNOW" | "OTHER";

export type RegistrationClient = {
  /** web = current website. app = a build that names its capabilities. legacy = an older/unknown client. */
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

/** The server enforces the pickup minimum for every client build. */
export function enforcesHalfRentalFirstPayment(headers: Headers): boolean {
  void headers;
  return true;
}

export function normalizePickupCityAck(value: unknown): PickupCityAck {
  const raw = String(value ?? "").trim().toUpperCase();
  if (raw === "LUCKNOW" || raw === "OTHER") return raw;
  return "";
}

/** Null when a new rider may be created. Existing riders are returned before this check. */
export function pickupCityAckError(
  value: PickupCityAck,
  client: RegistrationClient
): string | null {
  if (value === "LUCKNOW") return null;
  if (client.kind === "legacy" || (client.kind === "app" && !client.asksPickupCity)) {
    return "EVUDDY currently accepts new rider registrations for Lucknow pickups only. Update the app, then select Lucknow if you plan to collect your EV from a Lucknow hub. Your Aadhaar address may be elsewhere.";
  }
  if (value === "OTHER") {
    return "EVUDDY currently accepts new rider registrations for Lucknow pickups only. Select Lucknow only if you plan to collect your EV from a Lucknow hub. Your current location and Aadhaar address may be elsewhere.";
  }
  return "Select Lucknow as your intended pickup city to register. Your current location and Aadhaar address may be elsewhere.";
}

/** What both clients can read when they want the same payment rule. */
export function paymentContract() {
  return {
    version: 1,
    firstRentalPayment: {
      website: "server-enforced-pickup-minimum",
      capability: "firstPaymentHalfRental",
      legacyApp: "raised-to-server-minimum",
    },
  };
}

/** What both clients can read when they want the same registration rule. */
export function registrationContract() {
  return {
    version: 2,
    requiredForNewRiders: true,
    activeServiceCity: "Lucknow",
    pickupRequirement: "Collect the EV from a Lucknow hub.",
    aadhaarAddressMustMatchServiceCity: false,
    legacyApp: "Update required for new rider registration.",
    fields: [
      {
        key: "pickupCityAck",
        requiredForNewRiders: true,
        options: [
          {
            value: "LUCKNOW",
            label: "I plan to pick up my EV from a Lucknow hub",
          },
          {
            value: "OTHER",
            label: "I plan to pick up in another city (not available yet)",
          },
        ],
      },
    ],
  };
}
