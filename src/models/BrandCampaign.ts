import mongoose, { Schema } from "mongoose";

export const BRAND_CAMPAIGN_THEMES = [
  "diwali",
  "chhath",
  "holi",
  "republic",
  "independence",
  "christmas",
  "eid",
  "navratri",
  "rakhi",
  "newyear",
  "childrens",
  "normal",
] as const;

export type BrandCampaignTheme = (typeof BRAND_CAMPAIGN_THEMES)[number];
export type BrandCampaignStatus = "draft" | "published" | "archived";

export interface IBrandCampaign {
  id: string;
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
  status: BrandCampaignStatus;
  createdBy: string;
  updatedBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const BrandCampaignSchema = new Schema<IBrandCampaign>(
  {
    id: { type: String, required: true, trim: true, unique: true, maxlength: 140 },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    theme: { type: String, required: true, enum: BRAND_CAMPAIGN_THEMES },
    start: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    end: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    ribbon: { type: String, default: "", trim: true, maxlength: 180 },
    welcomeTitle: { type: String, default: "", trim: true, maxlength: 120 },
    welcomeBody: { type: String, default: "", trim: true, maxlength: 500 },
    logoAccent: { type: String, default: "#F4C400", match: /^#[0-9A-Fa-f]{6}$/ },
    heroImage: { type: String, default: "", trim: true, maxlength: 2048 },
    priority: { type: Number, default: 0, min: 0, max: 999 },
    status: { type: String, required: true, enum: ["draft", "published", "archived"], default: "draft" },
    createdBy: { type: String, default: "", trim: true, maxlength: 80 },
    updatedBy: { type: String, default: "", trim: true, maxlength: 80 },
  },
  { timestamps: true }
);

BrandCampaignSchema.index({ status: 1, start: 1, end: 1, priority: -1 });

export default mongoose.models.BrandCampaign ||
  mongoose.model<IBrandCampaign>("BrandCampaign", BrandCampaignSchema);
