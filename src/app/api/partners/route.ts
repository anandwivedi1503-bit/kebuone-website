import { requireAdminDashboards } from "@/lib/adminAuth";
import { API_DASHBOARDS } from "@/lib/adminCan";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Partner from "@/models/Partner";
import { clientIp, rateLimitAllowed } from "@/lib/rateLimit";
import { parseListQuery } from "@/lib/listQuery";

const nameRegex = /^[A-Za-z][A-Za-z\s'.-]{2,79}$/;
const phoneRegex = /^[6-9]\d{9}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const partnerTypes = [
  "College Mobility Partner",
  "Bike Rental Franchise Partner",
  "EV Charging Partner",
  "Fleet Partner",
  "Fleet Partner Investment",
  "Hub Operations Partner",
  "Delivery Operations Partner",
  "Smart Parking Partner",
  "EVUDDY Dealer",
  "EVUDDY Distributor",
];

const investmentCapacities = [
  "₹1 Lakh · 3 scooters",
  "₹5 Lakh · 15 scooters",
  "₹10 Lakh · 30 scooters",
  "Below ₹5 Lakhs",
  "₹5 – ₹10 Lakhs",
  "₹10 – ₹25 Lakhs",
  "₹25 – ₹50 Lakhs",
  "₹50 Lakhs+",
  "₹5 Lakhs · Dealer (retail)",
  "₹10 Lakhs · Distributor",
];

const propertyOptions = ["Yes", "No"];
const spaceOptions = ["Below 500 Sq Ft", "500 - 1000 Sq Ft", "1000 - 5000 Sq Ft", "5000+ Sq Ft"];
const experienceOptions = ["Fresher", "1 - 3 Years", "3 - 5 Years", "5+ Years"];
const fleetOptions = ["1 - 10 Vehicles", "10 - 50 Vehicles", "50 - 100 Vehicles", "100+ Vehicles"];

function clean(value: unknown, max = 160) {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, max);
}

export async function POST(req: Request) {
  try {
    if (!(await rateLimitAllowed(`partners:${clientIp(req)}`, 8, 10 * 60 * 1000))) {
      return NextResponse.json(
        { success: false, errors: ["Too many requests. Please try again later."] },
        { status: 429 }
      );
    }

    await connectDB();

    const body = await req.json();

    const fullName = clean(body.fullName, 80);
    const phone = clean(body.phone).replace(/\D/g, "");
    const email = clean(body.email, 120).toLowerCase();
    const organizationName = clean(body.organizationName, 120);
    const state = clean(body.state, 80);
    const city = clean(body.city, 80);
    const territory = clean(body.territory, 120);
    const partnerType = clean(body.partnerType, 120);
    const investmentCapacity = clean(body.investmentCapacity, 80);
    const propertyAvailable = clean(body.propertyAvailable, 20);
    const availableSpace = clean(body.availableSpace, 80);
    const businessExperience = clean(body.businessExperience, 80);
    const plannedFleetSize = clean(body.plannedFleetSize, 80);
    const message = clean(body.message, 800);
    const consentAccepted = Boolean(body.consentAccepted);

    const errors: string[] = [];

    if (!nameRegex.test(fullName)) errors.push("Enter a valid full name.");
    if (!phoneRegex.test(phone)) errors.push("Enter a valid Indian mobile number.");
    if (!emailRegex.test(email)) errors.push("Enter a valid email address.");
    if (organizationName.length < 2) errors.push("Organization name is required.");
    if (state.length < 2) errors.push("State is required.");
    if (city.length < 2) errors.push("City is required.");
    if (territory.length < 2) errors.push("Preferred territory is required.");
    if (!partnerTypes.includes(partnerType)) errors.push("Select a valid partnership type.");
    if (!investmentCapacities.includes(investmentCapacity)) errors.push("Select a valid investment capacity.");
    if (!propertyOptions.includes(propertyAvailable)) errors.push("Select property availability.");
    if (!spaceOptions.includes(availableSpace)) errors.push("Select available space.");
    if (!experienceOptions.includes(businessExperience)) errors.push("Select business experience.");
    if (!fleetOptions.includes(plannedFleetSize)) errors.push("Select planned fleet size.");
    if (!consentAccepted) errors.push("Consent is required.");

    if (errors.length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    const existingPartner = await Partner.findOne({
  $or: [
    { email },
    { phone },
  ],
});

if (existingPartner) {
  return NextResponse.json(
    {
      success: false,
      message:
        "A partner application already exists with this email or phone number.",
    },
    { status: 409 }
  );
}

    const partner = await Partner.create({
      fullName,
      phone,
      email,
      organizationName,
      state,
      city,
      territory,
      partnerType,
      investmentCapacity,
      propertyAvailable,
      availableSpace,
      businessExperience,
      plannedFleetSize,
      message,
      consentAccepted,
      applicationStatus: "Pending",
    });

    return NextResponse.json({
      success: true,
      message: "Partner application submitted.",
      data: partner,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Partner application failed.",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const gate = await requireAdminDashboards(...API_DASHBOARDS.partners);
    if (gate.error) return gate.error;

    await connectDB();
    const url = new URL(req.url);
    const type = url.searchParams.get("type")?.trim() || "";
    const q = url.searchParams.get("q")?.trim() || "";
    const query = parseListQuery(req);

    const filter: Record<string, unknown> = {};
    if (type) filter.partnerType = type;
    if (q) {
      filter.$or = [
        { fullName: { $regex: q, $options: "i" } },
        { phone: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { city: { $regex: q, $options: "i" } },
        { organizationName: { $regex: q, $options: "i" } },
        { partnerType: { $regex: q, $options: "i" } },
      ];
    }

    const [partners, total] = await Promise.all([
      Partner.find(filter)
        .sort({ createdAt: -1 })
        .skip(query.skip)
        .limit(query.limit)
        .lean(),
      Partner.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      data: partners,
      page: query.page,
      limit: query.limit,
      total,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch partners.",
      },
      { status: 500 }
    );
  }
}