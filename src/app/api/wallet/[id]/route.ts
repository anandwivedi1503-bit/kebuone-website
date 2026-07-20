import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/adminAuth";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Wallet from "@/models/Wallet";
import WalletTransaction from "@/models/WalletTransaction";

function clean(value: unknown) {
  return String(value || "").trim();
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {

    if (!(await isAdminAuthenticated())) {
      return unauthorizedResponse();
    }

    await connectDB();

    const { id } = await params;

    await Wallet.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Wallet deleted successfully.",
    });

  } catch (error) {

    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 }
    );

  }

}

  export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {

    if (!(await isAdminAuthenticated())) {
      return unauthorizedResponse();
    }

    await connectDB();

    const { id } = await params;

    const body = await req.json();

    const wallet = await Wallet.findByIdAndUpdate(
      id,
      body,
      {
        new: true,
      }
    );

    if (!wallet) {
      return NextResponse.json(
        {
          success: false,
          message: "Wallet not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: wallet,
    });

  } catch (error) {

    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 }
    );

  }
}

