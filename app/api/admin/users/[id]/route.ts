import { NextResponse, type NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { User, ActivityLog } from "@/models";
import { requireSession, badRequest, notFound, serverError } from "@/lib/api-helpers";

type Params = { params: Promise<{ id: string }> };

/** PUT /api/admin/users/:id — activate/deactivate an account. */
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { session, error } = await requireSession(["admin"]);
    if (error) return error;
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) return badRequest("Invalid user id");

    const { isActive } = await req.json();
    await connectDB();

    const user = await User.findByIdAndUpdate(id, { $set: { isActive: Boolean(isActive) } }, { new: true })
      .select("fullName email role isActive")
      .lean();
    if (!user) return notFound("User not found");

    await ActivityLog.create({
      user: session!.user.id,
      action: `Admin ${isActive ? "activated" : "deactivated"} ${user.email}`,
      entity: "user",
      entityId: id,
    });

    return NextResponse.json({ message: "User updated", user });
  } catch (e) {
    return serverError(e);
  }
}
