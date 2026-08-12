import {
  isAdminAuthenticated,
  unauthorizedResponse,
} from "@/lib/adminAuth";

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

import Hub from "@/models/Hub";
import Vehicle from "@/models/Vehicle";
import Battery from "@/models/Battery";

const hubTypes = [
  "Main Hub",
  "Mini Hub",
  "Charging Hub",
  "Battery Swap Hub",
];

const hubStatuses = [
  "Active",
  "Inactive",
  "Maintenance",
  "Closed",
];

function clean(value: unknown) {
  return String(value ?? "").trim();
}

function upper(value: unknown) {
  return clean(value).toUpperCase();
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

    const hub =
      await Hub.findOne({
        _id: id,
        isDeleted: false,
      });

    if (!hub) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Hub not found.",
        },
        { status: 404 }
      );
    }

    /*
     * Strict whitelist.
     *
     * hubCode is intentionally NOT editable.
     * availableBikes is derived from Vehicle.
     * lifecycle fields are server controlled.
     */
    const allowedFields = [
      "hubName",
      "hubLocation",
      "hubType",
      "city",
      "hubManager",
      "managerPhone",
      "latitude",
      "longitude",
      "geofenceRadius",
      "capacity",
      "readyBatteries",
      "chargingBatteries",
      "damagedBatteries",
      "openingTime",
      "closingTime",
      "status",
    ];

    const updateData:
      Record<string, unknown> = {};

    for (
      const field of allowedFields
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
          message:
            "No valid hub update fields received.",
        },
        { status: 400 }
      );
    }

    const errors: string[] = [];

    if (
      updateData.hubName !==
      undefined
    ) {
      updateData.hubName =
        clean(
          updateData.hubName
        );

      if (
        String(
          updateData.hubName
        ).length < 2
      ) {
        errors.push(
          "Hub name is invalid."
        );
      }
    }

    if (
      updateData.hubLocation !==
      undefined
    ) {
      updateData.hubLocation =
        clean(
          updateData.hubLocation
        );

      if (
        String(
          updateData.hubLocation
        ).length < 2
      ) {
        errors.push(
          "Hub location is invalid."
        );
      }
    }

    if (
      updateData.city !==
      undefined
    ) {
      updateData.city =
        clean(
          updateData.city
        );

      if (
        String(
          updateData.city
        ).length < 2
      ) {
        errors.push(
          "City is invalid."
        );
      }
    }

    if (
      updateData.hubType !==
        undefined &&
      !hubTypes.includes(
        clean(
          updateData.hubType
        )
      )
    ) {
      errors.push(
        "Invalid hub type."
      );
    }

    if (
      updateData.status !==
        undefined &&
      !hubStatuses.includes(
        clean(
          updateData.status
        )
      )
    ) {
      errors.push(
        "Invalid hub status."
      );
    }

    if (
      updateData.managerPhone !==
      undefined
    ) {
      const phone =
        clean(
          updateData.managerPhone
        );

      if (
        phone &&
        !/^[6-9]\d{9}$/.test(
          phone
        )
      ) {
        errors.push(
          "Manager phone number is invalid."
        );
      }

      updateData.managerPhone =
        phone;
    }

    if (
      updateData.latitude !==
      undefined
    ) {
      const value =
        Number(
          updateData.latitude
        );

      if (
        !Number.isFinite(
          value
        ) ||
        value < -90 ||
        value > 90
      ) {
        errors.push(
          "Latitude must be between -90 and 90."
        );
      } else {
        updateData.latitude =
          value;
      }
    }

    if (
      updateData.longitude !==
      undefined
    ) {
      const value =
        Number(
          updateData.longitude
        );

      if (
        !Number.isFinite(
          value
        ) ||
        value < -180 ||
        value > 180
      ) {
        errors.push(
          "Longitude must be between -180 and 180."
        );
      } else {
        updateData.longitude =
          value;
      }
    }

    const numberFields = [
      "geofenceRadius",
      "capacity",
      "readyBatteries",
      "chargingBatteries",
      "damagedBatteries",
    ];

    for (
      const field of numberFields
    ) {
      if (
        updateData[field] !==
        undefined
      ) {
        const value =
          Number(
            updateData[field]
          );

        if (
          !Number.isFinite(
            value
          ) ||
          value < 0
        ) {
          errors.push(
            `${field} must be a valid non-negative number.`
          );
        } else {
          updateData[field] =
            value;
        }
      }
    }

    if (
      updateData.geofenceRadius !==
        undefined &&
      Number(
        updateData.geofenceRadius
      ) < 1
    ) {
      errors.push(
        "Geofence radius must be greater than 0."
      );
    }

    if (
      updateData.openingTime !==
        undefined &&
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(
        clean(
          updateData.openingTime
        )
      )
    ) {
      errors.push(
        "Opening time is invalid."
      );
    }

    if (
      updateData.closingTime !==
        undefined &&
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(
        clean(
          updateData.closingTime
        )
      )
    ) {
      errors.push(
        "Closing time is invalid."
      );
    }

    /*
     * Prevent duplicate hub names.
     */
    if (
      updateData.hubName !==
      undefined
    ) {
      const duplicate =
        await Hub.findOne({
          _id: {
            $ne: hub._id,
          },
          isDeleted: false,
          hubName:
            updateData.hubName,
        }).lean();

      if (duplicate) {
        errors.push(
          "Another hub already uses this hub name."
        );
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
      hub,
      updateData
    );

    /*
     * availableBikes is NEVER manually
     * changed here.
     */
    hub.updatedBy =
      "Admin";

    hub.version += 1;

    await hub.save();

    return NextResponse.json({
      success: true,
      message:
        "Hub updated successfully.",
      data: hub,
    });
  } catch (error) {
    console.error(
      "HUB UPDATE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to update hub.",
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

    const hub =
      await Hub.findOne({
        _id: id,
        isDeleted: false,
      });

    if (!hub) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Hub not found.",
        },
        { status: 404 }
      );
    }

    /*
     * Do not delete a hub that still has
     * active vehicle records.
     *
     * Supports both the new hubCode
     * and old hubName values.
     */
    const vehicles =
      await Vehicle.countDocuments({
        isDeleted: false,
        $or: [
          {
            currentHub:
              hub.hubCode,
          },
          {
            currentHub:
              hub.hubName,
          },
        ],
      });

    if (vehicles > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Move all vehicles from this hub before deleting it.",
        },
        { status: 400 }
      );
    }

    /*
     * Preserve the existing Battery
     * relationship used by your project.
     */
    const batteries =
      await Battery.countDocuments({
        $or: [
          {
            hubName:
              hub.hubName,
          },
          {
            hubId:
              hub.hubCode,
          },
        ],
      });

    if (batteries > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Move all batteries from this hub before deleting it.",
        },
        { status: 400 }
      );
    }

    /*
     * SOFT DELETE.
     */
    hub.isDeleted =
      true;

    hub.deletedAt =
      new Date();

    hub.status =
      "Closed";

    hub.updatedBy =
      "Admin";

    hub.version += 1;

    await hub.save();

    return NextResponse.json({
      success: true,
      message:
        "Hub deleted successfully.",
    });
  } catch (error) {
    console.error(
      "HUB DELETE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to delete hub.",
      },
      { status: 500 }
    );
  }
}