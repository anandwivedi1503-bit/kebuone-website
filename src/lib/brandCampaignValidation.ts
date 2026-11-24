import {
  BRAND_CAMPAIGN_THEMES,
  type BrandCampaignTheme,
} from "@/models/BrandCampaign";

export type BrandCampaignFields = {
  name: string;
  theme: BrandCampaignTheme;
  start: string;
  end: string;
  ribbon: string;
  welcomeTitle: string;
  welcomeBody: string;
  logoAccent: string;
  heroImage: string;
  priority: number;
};

export type ValidationResult =
  | { ok: true; value: BrandCampaignFields }
  | { ok: false; message: string };

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function safeHeroImage(value: string) {
  if (!value) return "";
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes("\\")) {
    const safePath = !value.split("/").some((part) => part === "..");
    const imagePath = /^\/brand\/[a-zA-Z0-9/_-]+\.(?:png|jpe?g|webp)$/i.test(value);
    return safePath && imagePath ? value : null;
  }
  try {
    const url = new URL(value);
    if (
      url.protocol !== "https:" ||
      url.hostname !== "res.cloudinary.com" ||
      url.username ||
      url.password ||
      !url.pathname.includes("/image/upload/")
    ) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function validateBrandCampaignFields(input: unknown): ValidationResult {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, message: "Campaign details are required." };
  }

  const data = input as Record<string, unknown>;
  const name = text(data.name, 100);
  const themeValue = text(data.theme, 30);
  const start = text(data.start, 10);
  const end = text(data.end, 10);
  const ribbon = text(data.ribbon, 180);
  const welcomeTitle = text(data.welcomeTitle, 120);
  const welcomeBody = text(data.welcomeBody, 500);
  const logoAccent = text(data.logoAccent, 7);
  const imageValue = text(data.heroImage, 2048);
  const heroImage = safeHeroImage(imageValue);
  const priority = Number(data.priority);

  if (!name) return { ok: false, message: "Campaign name is required." };
  if (!BRAND_CAMPAIGN_THEMES.includes(themeValue as BrandCampaignTheme)) {
    return { ok: false, message: "Choose a supported campaign theme." };
  }
  if (!validDate(start) || !validDate(end) || start > end) {
    return { ok: false, message: "Enter valid start and end dates; the end cannot be earlier than the start." };
  }
  if (!/^#[0-9A-Fa-f]{6}$/.test(logoAccent)) {
    return { ok: false, message: "Accent must be a six-digit hex color, such as #18B368." };
  }
  if (heroImage === null) {
    return { ok: false, message: "Poster URL must use HTTPS or a safe path on evuddy.com." };
  }
  if (!Number.isInteger(priority) || priority < 0 || priority > 999) {
    return { ok: false, message: "Priority must be a whole number from 0 to 999." };
  }
  if (themeValue !== "normal" && (!ribbon || !welcomeTitle || !welcomeBody)) {
    return { ok: false, message: "Campaigns need a ribbon, welcome title, and welcome message." };
  }

  return {
    ok: true,
    value: {
      name,
      theme: themeValue as BrandCampaignTheme,
      start,
      end,
      ribbon,
      welcomeTitle,
      welcomeBody,
      logoAccent: logoAccent.toUpperCase(),
      heroImage,
      priority,
    },
  };
}
