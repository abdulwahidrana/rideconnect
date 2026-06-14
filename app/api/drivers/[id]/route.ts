import { NextResponse, type NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { User, Ride } from "@/models";
import { requireSession, badRequest, notFound, serverError } from "@/lib/api-helpers";

type Params = { params: Promise<{ id: string }> };

/** GET /api/drivers/:id — driver public profile with ride stats. */
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { error } = await requireSession();
    if (error) return error;
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) return badRequest("Invalid driver id");

    await connectDB();
    const driver = await User.findOne({ _id: id, role: "driver" })
      .select("fullName phone vehicle rating isOnline totalEarnings createdAt")
      .lean();
    if (!driver) return notFound("Driver not found");

    const [completedRides, cancelledRides] = await Promise.all([
      Ride.countDocuments({ driver: id, status: "completed" }),
      Ride.countDocuments({ driver: id, status: "cancelled" }),
    ]);

    return NextResponse.json({ driver: { ...driver, completedRides, cancelledRides } });
  } catch (e) {
    return serverError(e);
  }
}
