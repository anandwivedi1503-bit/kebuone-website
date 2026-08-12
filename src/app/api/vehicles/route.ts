import {
  isAdminAuthenticated,
  unauthorizedResponse,
} from "@/lib/adminAuth";

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

import Vehicle from "@/models/Vehicle";
import Hub, {
  IHub,
} from "@/models/Hub";

const registrationTypes = [
  "RTO",
  "Non-RTO",
];

const vehicleTypes = [
  "Electric Scooter",
  "Electric Bike",
  "Delivery Bike",
];

const batteryTypes = [
  "Chargeable",
  "Swappable",
];

const gpsStatuses = [
  "ONLINE",
  "OFFLINE",
];

function clean(value: unknown) {
  return String(value ?? "").trim();
}

function upper(value: unknown) {
  return clean(value).toUpperCase();
}

function optionalDate(value: unknown) {
  const text = clean(value);

  if (!text) {
    return undefined;
  }

  const date = new Date(text);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function numberOrDefault(
  value: unknown,
  defaultValue: number
) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return defaultValue;
  }

  const numberValue = Number(value);

  return Number.isFinite(numberValue)
    ? numberValue
    : NaN;
}

export async function POST(req: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return unauthorizedResponse();
    }

    await connectDB();

    const body = await req.json();

    const vehicleId = upper(body.vehicleId);
    const registrationNumber =
      upper(body.registrationNumber);

    const chassisNumber =
      upper(body.chassisNumber);

    const vehicleModel =
      clean(body.vehicleModel);

    const requestedHub =
      upper(body.currentHub);

    const registrationType =
      clean(body.registrationType || "RTO");

    const vehicleType =
      clean(
        body.vehicleType ||
          "Electric Scooter"
      );

    const batteryType =
      clean(
        body.batteryType ||
          "Chargeable"
      );

    const errors: string[] = [];

    if (vehicleId.length < 3) {
      errors.push(
        "Vehicle ID is required."
      );
    }

    if (registrationNumber.length < 3) {
      errors.push(
        "Registration Number is required."
      );
    }

    if (chassisNumber.length < 5) {
      errors.push(
        "Valid chassis number is required."
      );
    }

    if (vehicleModel.length < 2) {
      errors.push(
        "Vehicle Model is required."
      );
    }

    if (!requestedHub) {
      errors.push(
        "Current Hub is required."
      );
    }

    if (
      !registrationTypes.includes(
        registrationType
      )
    ) {
      errors.push(
        "Invalid registration type."
      );
    }

    if (
      !vehicleTypes.includes(
        vehicleType
      )
    ) {
      errors.push(
        "Invalid vehicle type."
      );
    }

    if (
      !batteryTypes.includes(
        batteryType
      )
    ) {
      errors.push(
        "Invalid battery type."
      );
    }

    const batteryPercentage =
      numberOrDefault(
        body.batteryPercentage,
        100
      );

    if (
      !Number.isFinite(
        batteryPercentage
      ) ||
      batteryPercentage < 0 ||
      batteryPercentage > 100
    ) {
      errors.push(
        "Battery percentage must be between 0 and 100."
      );
    }

    const hourlyRate =
      numberOrDefault(
        body.hourlyRate,
        60
      );

    const dailyRate =
      numberOrDefault(
        body.dailyRate,
        230
      );

    const weeklyRate =
      numberOrDefault(
        body.weeklyRate,
        1610
      );

    const monthlyRate =
      numberOrDefault(
        body.monthlyRate,
        6900
      );

    const securityDeposit =
      numberOrDefault(
        body.securityDeposit,
        0
      );

    const odometer =
      numberOrDefault(
        body.odometer,
        0
      );

    if (
      !Number.isFinite(hourlyRate) ||
      hourlyRate < 0
    ) {
      errors.push(
        "Hourly rate must be valid."
      );
    }

    if (
      !Number.isFinite(dailyRate) ||
      dailyRate < 0
    ) {
      errors.push(
        "Daily rate must be valid."
      );
    }

    if (
      !Number.isFinite(weeklyRate) ||
      weeklyRate < 0
    ) {
      errors.push(
        "Weekly rate must be valid."
      );
    }

    if (
      !Number.isFinite(monthlyRate) ||
      monthlyRate < 0
    ) {
      errors.push(
        "Monthly rate must be valid."
      );
    }

    if (
      !Number.isFinite(
        securityDeposit
      ) ||
      securityDeposit < 0
    ) {
      errors.push(
        "Security deposit must be valid."
      );
    }

    if (
      !Number.isFinite(odometer) ||
      odometer < 0
    ) {
      errors.push(
        "Odometer must be valid."
      );
    }

    const gpsStatus =
      clean(
        body.gpsStatus || "ONLINE"
      );

    if (
      !gpsStatuses.includes(
        gpsStatus
      )
    ) {
      errors.push(
        "Invalid GPS status."
      );
    }

    const lastServiceDate =
      optionalDate(
        body.lastServiceDate
      );

    const insuranceExpiry =
      optionalDate(
        body.insuranceExpiry
      );

    const fitnessExpiry =
      optionalDate(
        body.fitnessExpiry
      );

    const pollutionExpiry =
      optionalDate(
        body.pollutionExpiry
      );

    if (
      lastServiceDate === null ||
      insuranceExpiry === null ||
      fitnessExpiry === null ||
      pollutionExpiry === null
    ) {
      errors.push(
        "One or more vehicle dates are invalid."
      );
    }

    if (errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          errors,
        },
        { status: 400 }
      );
    }

    /*
     * Resolve hub by either Hub Code or Hub Name.
     *
     * New vehicles always store hubCode.
     */
    const hub = await Hub.findOne({
      isDeleted: false,
      status: {
        $in: [
          "Active",
          "Maintenance",
        ],
      },
      $or: [
        {
          hubCode:
            requestedHub,
        },
        {
          hubName:
            clean(body.currentHub),
        },
      ],
   }).lean<IHub | null>();

    if (!hub) {
      return NextResponse.json(
        {
          success: false,
          errors: [
            "Selected hub does not exist or is not operational.",
          ],
        },
        { status: 400 }
      );
    }

    /*
     * Prevent duplicate vehicle records.
     */
    const existingVehicle =
      await Vehicle.findOne({
        $or: [
          { vehicleId },
          {
            registrationNumber,
          },
          {
            chassisNumber,
          },
        ],
      }).lean();

    if (existingVehicle) {
      return NextResponse.json(
        {
          success: false,
          errors: [
            "Vehicle ID, Registration Number, or Chassis Number already exists.",
          ],
        },
        { status: 409 }
      );
    }

    /*
     * Backend controls initial operational state.
     *
     * Client is NOT allowed to decide this.
     */
    let vehicleStatus:
      | "Available"
      | "Maintenance"
      | "Low Battery";

    if (batteryPercentage === 0) {
      vehicleStatus =
        "Maintenance";
    } else if (
      batteryPercentage < 20
    ) {
      vehicleStatus =
        "Low Battery";
    } else {
      vehicleStatus =
        "Available";
    }

    /*
     * Only explicitly allowed fields
     * are written to MongoDB.
     */
    const vehicle =
      await Vehicle.create({
        vehicleId,

        registrationNumber,

        registrationType,

        chassisNumber,

        vehicleType,

        vehicleModel,

        batteryType,

        hourlyRate,

        dailyRate,

        weeklyRate,

        monthlyRate,

        securityDeposit,

        odometer,

        batteryPercentage,

        gpsStatus,

        lockStatus: "Locked",

        /*
         * ALWAYS store Hub Code.
         */
        currentHub:
          hub.hubCode,

        vehicleStatus,

        /*
         * Operational assignment is
         * controlled by future booking/
         * assignment modules.
         */
        assignedRider: "",

        currentBookingId: "",

        currentRiderId: "",

        pickupOTPVerified:
          false,

        isActive: true,

        isDeleted: false,

        remarks:
          clean(body.remarks),

        lastServiceDate,

        insuranceExpiry,

        fitnessExpiry,

        pollutionExpiry,

        updatedBy: "Admin",
      });

    return NextResponse.json(
      {
        success: true,
        message:
          "Vehicle created successfully.",
        data: vehicle,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "VEHICLE CREATE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to create vehicle.",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();

    const isAdmin =
      await isAdminAuthenticated().catch(
        () => false
      );

    if (isAdmin) {
      const vehicles =
        await Vehicle.find({
          isDeleted: false,
        })
          .sort({
            createdAt: -1,
          })
          .lean();

      return NextResponse.json({
        success: true,
        data: vehicles,
      });
    }

    /*
     * Public / rider-facing vehicle
     * availability.
     */
    const vehicles =
      await Vehicle.find({
        isDeleted: false,
        isActive: true,
        vehicleStatus: "Available",
      })
        .select(
          [
            "vehicleId",
            "registrationNumber",
            "vehicleType",
            "vehicleModel",
            "batteryType",
            "registrationType",
            "dailyRate",
            "weeklyRate",
            "monthlyRate",
            "securityDeposit",
            "batteryPercentage",
            "currentHub",
            "vehicleStatus",
          ].join(" ")
        )
        .sort({
          createdAt: -1,
        })
        .lean();

    return NextResponse.json({
      success: true,
      data: vehicles,
    });
  } catch (error) {
    console.error(
      "VEHICLE GET ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch vehicles.",
      },
      { status: 500 }
    );
  }
}