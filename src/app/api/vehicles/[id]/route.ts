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

const vehicleStatuses = [
  "Available",
  "Booked",
  "Ready For Pickup",
  "In Ride",
  "Maintenance",
  "Low Battery",
];

const batteryTypes = [
  "Chargeable",
  "Swappable",
];

const registrationTypes = [
  "RTO",
  "Non-RTO",
];

const vehicleTypes = [
  "Electric Scooter",
  "Electric Bike",
  "Delivery Bike",
];

const allowedUpdateFields = [
  "registrationType",
  "vehicleType",
  "vehicleModel",
  "batteryType",
  "hourlyRate",
  "dailyRate",
  "weeklyRate",
  "monthlyRate",
  "rentToOwnDailyRate",
  "rentToOwnMonths",
  "securityDeposit",
  "odometer",
  "lastServiceDate",
  "fitnessExpiry",
  "insuranceExpiry",
  "pollutionExpiry",
  "remarks",
  "batteryPercentage",
  "currentHub",
  "vehicleStatus",
];

function clean(value: unknown) {
  return String(value ?? "").trim();
}

function upper(value: unknown) {
  return clean(value).toUpperCase();
}

function isValidNonNegativeNumber(
  value: unknown
) {
  const numberValue = Number(value);

  return (
    Number.isFinite(numberValue) &&
    numberValue >= 0
  );
}

function isValidPercentage(
  value: unknown
) {
  const numberValue = Number(value);

  return (
    Number.isFinite(numberValue) &&
    numberValue >= 0 &&
    numberValue <= 100
  );
}

function optionalDate(
  value: unknown
) {
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

export async function PATCH(
  req: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    if (
      !(await isAdminAuthenticated())
    ) {
      return unauthorizedResponse();
    }

    await connectDB();

    const { id } =
      await params;

    const body =
      await req.json();

    const vehicle =
      await Vehicle.findOne({
        _id: id,
        isDeleted: false,
      });

    if (!vehicle) {
      return NextResponse.json(
        {
          success: false,
          errors: [
            "Vehicle not found.",
          ],
        },
        { status: 404 }
      );
    }

    /*
     * Never allow editing an operationally
     * active vehicle.
     */
    if (
      vehicle.vehicleStatus ===
        "Booked" ||
      vehicle.vehicleStatus ===
        "Ready For Pickup" ||
      vehicle.vehicleStatus ===
        "In Ride"
    ) {
      return NextResponse.json(
        {
          success: false,
          errors: [
            "Vehicle cannot be edited while assigned to an active booking.",
          ],
        },
        { status: 400 }
      );
    }

    const updateData:
      Record<string, unknown> = {};

    const errors: string[] = [];

    /*
     * STRICT WHITELIST
     */
    for (
      const field of allowedUpdateFields
    ) {
      if (
        body[field] !==
        undefined
      ) {
        updateData[field] =
          body[field];
      }
    }

    if (
      Object.keys(updateData)
        .length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          errors: [
            "No valid vehicle update fields received.",
          ],
        },
        { status: 400 }
      );
    }

    if (
      updateData.vehicleStatus !==
        undefined &&
      !vehicleStatuses.includes(
        clean(
          updateData.vehicleStatus
        )
      )
    ) {
      errors.push(
        "Invalid vehicle status."
      );
    }

    if (
      updateData.registrationType !==
        undefined &&
      !registrationTypes.includes(
        clean(
          updateData.registrationType
        )
      )
    ) {
      errors.push(
        "Invalid registration type."
      );
    }

    if (
      updateData.vehicleType !==
        undefined &&
      !vehicleTypes.includes(
        clean(
          updateData.vehicleType
        )
      )
    ) {
      errors.push(
        "Invalid vehicle type."
      );
    }

    if (
      updateData.batteryType !==
        undefined &&
      !batteryTypes.includes(
        clean(
          updateData.batteryType
        )
      )
    ) {
      errors.push(
        "Invalid battery type."
      );
    }

    if (
      updateData.batteryPercentage !==
        undefined &&
      !isValidPercentage(
        updateData.batteryPercentage
      )
    ) {
      errors.push(
        "Battery percentage must be between 0 and 100."
      );
    }

    const numericFields = [
      "hourlyRate",
      "dailyRate",
      "weeklyRate",
      "monthlyRate",
      "rentToOwnDailyRate",
      "rentToOwnMonths",
      "securityDeposit",
      "odometer",
    ];

    for (
      const field of numericFields
    ) {
      if (
        updateData[field] !==
          undefined &&
        !isValidNonNegativeNumber(
          updateData[field]
        )
      ) {
        errors.push(
          `${field} must be a valid non-negative number.`
        );
      }
    }

    if (
      updateData.vehicleModel !==
      undefined
    ) {
      const model =
        clean(
          updateData.vehicleModel
        );

      if (model.length < 2) {
        errors.push(
          "Vehicle model is invalid."
        );
      }

      updateData.vehicleModel =
        model;
    }

    if (
      updateData.remarks !==
      undefined
    ) {
      updateData.remarks =
        clean(
          updateData.remarks
        ).slice(0, 500);
    }

    /*
     * Resolve currentHub.
     *
     * Accept hub code OR hub name,
     * but ALWAYS store hubCode.
     */
    if (
      updateData.currentHub !==
      undefined
    ) {
      const requestedHub =
        clean(
          updateData.currentHub
        );

      if (!requestedHub) {
        errors.push(
          "Current hub is required."
        );
      } else {
        const hub =
          await Hub.findOne({
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
                  requestedHub.toUpperCase(),
              },
              {
                hubName:
                  requestedHub,
              },
            ],
          }).lean<IHub | null>();

        if (!hub) {
          errors.push(
            "Selected hub does not exist or is not operational."
          );
        } else {
          updateData.currentHub =
            hub.hubCode;
        }
      }
    }

    const dateFields = [
      "lastServiceDate",
      "fitnessExpiry",
      "insuranceExpiry",
      "pollutionExpiry",
    ];

    for (
      const field of dateFields
    ) {
      if (
        updateData[field] !==
        undefined
      ) {
        const parsed =
          optionalDate(
            updateData[field]
          );

        if (parsed === null) {
          errors.push(
            `${field} is invalid.`
          );
        } else {
          updateData[field] =
            parsed;
        }
      }
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

    Object.assign(
      vehicle,
      updateData
    );

    /*
     * Server-controlled fields.
     */
    vehicle.updatedBy =
      "Admin";

    /*
     * Operational battery rules.
     */
    vehicle.batteryPercentage =
      Math.max(
        0,
        Math.min(
          100,
          Number(
            vehicle.batteryPercentage
          )
        )
      );

    if (
      vehicle.batteryPercentage ===
      0
    ) {
      vehicle.vehicleStatus =
        "Maintenance";

      vehicle.assignedRider =
        "";

      vehicle.currentBookingId =
        "";

      vehicle.currentRiderId =
        "";
    } else if (
      vehicle.vehicleStatus !==
        "Maintenance" &&
      vehicle.vehicleStatus !==
        "Booked" &&
      vehicle.vehicleStatus !==
        "Ready For Pickup" &&
      vehicle.vehicleStatus !==
        "In Ride" &&
      vehicle.batteryPercentage <
        20
    ) {
      vehicle.vehicleStatus =
        "Low Battery";
    } else if (
      vehicle.vehicleStatus ===
        "Low Battery" &&
      vehicle.batteryPercentage >=
        20
    ) {
      vehicle.vehicleStatus =
        "Available";

      vehicle.assignedRider =
        "";

      vehicle.currentBookingId =
        "";

      vehicle.currentRiderId =
        "";
    }

    /*
     * Available vehicles must start
     * locked.
     */
    if (
      vehicle.vehicleStatus ===
      "Available"
    ) {
      vehicle.lockStatus =
        "Locked";

      vehicle.assignedRider =
        "";

      vehicle.currentBookingId =
        "";

      vehicle.currentRiderId =
        "";
    }

    vehicle.version += 1;

    await vehicle.save();

    return NextResponse.json({
      success: true,
      message:
        "Vehicle updated successfully.",
      data: vehicle,
    });
  } catch (error) {
    console.error(
      "VEHICLE UPDATE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to update vehicle.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    if (
      !(await isAdminAuthenticated())
    ) {
      return unauthorizedResponse();
    }

    await connectDB();

    const { id } =
      await params;

    const vehicle =
      await Vehicle.findOne({
        _id: id,
        isDeleted: false,
      });

    if (!vehicle) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Vehicle not found.",
        },
        { status: 404 }
      );
    }

    if (
      vehicle.vehicleStatus ===
        "Booked" ||
      vehicle.vehicleStatus ===
        "Ready For Pickup" ||
      vehicle.vehicleStatus ===
        "In Ride"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Cannot delete a vehicle that is currently assigned to an active booking.",
        },
        { status: 400 }
      );
    }

    /*
     * SOFT DELETE.
     */
    vehicle.isDeleted =
      true;

    vehicle.deletedAt =
      new Date();

    vehicle.isActive =
      false;

    vehicle.assignedRider =
      "";

    vehicle.currentBookingId =
      "";

    vehicle.currentRiderId =
      "";

    vehicle.lockStatus =
      "Locked";

    vehicle.version += 1;

    vehicle.updatedBy =
      "Admin";

    await vehicle.save();

    return NextResponse.json({
      success: true,
      message:
        "Vehicle deleted successfully.",
    });
  } catch (error) {
    console.error(
      "VEHICLE DELETE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to delete vehicle.",
      },
      { status: 500 }
    );
  }
}