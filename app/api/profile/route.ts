import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { User, ActivityLog } from "@/models";
import { requireSession, badRequest, serverError } from "@/lib/api-helpers";
import { profileUpdateSchema } from "@/lib/validations";

/** GET /api/profile — current user's profile. */
export async function GET() {
  try {
    const { session, error } = await requireSession();
    if (error) return error;

    await connectDB();
    const user = await User.findById(session!.user.id)
      .select("fullName email phone role isOnline vehicle rating totalEarnings createdAt")
      .lean();
    return NextResponse.json({ user });
  } catch (e) {
    return serverError(e);
  }
}

/** PUT /api/profile — update profile, or toggle driver availability { isOnline }. */
export async function PUT(req: NextRequest) {
  try {
    const { session, error } = await requireSession();
    if (error) return error;

    await connectDB();
    const body = await req.json();

    // Driver online/offline toggle
    if (typeof body.isOnline === "boolean") {
      if (session!.user.role !== "driver") return badRequest("Only drivers can toggle availability");
      const user = await User.findByIdAndUpdate(
        session!.user.id,
        { $set: { isOnline: body.isOnline } },
        { new: true }
      ).select("isOnline");
      await ActivityLog.create({
        user: session!.user.id,
        action: `Driver went ${body.isOnline ? "online" : "offline"}`,
        entity: "user",
        entityId: session!.user.id,
      });
      return NextResponse.json({ message: body.isOnline ? "You are online" : "You are offline", isOnline: user?.isOnline });
    }

    const parsed = profileUpdateSchema.safeParse(body);
    if (!parsed.success) return badRequest("Validation failed", parsed.error.flatten().fieldErrors);

    const update: Record<string, unknown> = {
      fullName: parsed.data.fullName,
      phone: parsed.data.phone,
    };
    if (session!.user.role === "driver" && parsed.data.vehicleName) {
      update["vehicle.name"] = parsed.data.vehicleName;
      if (parsed.data.vehicleNumber) update["vehicle.number"] = parsed.data.vehicleNumber;
    }

    const user = await User.findByIdAndUpdate(session!.user.id, { $set: update }, { new: true })
      .select("fullName email phone role vehicle")
      .lean();

    return NextResponse.json({ message: "Profile updated", user });
  } catch (e) {
    return serverError(e);
  }
}
