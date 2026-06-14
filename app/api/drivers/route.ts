import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { requireSession, serverError } from "@/lib/api-helpers";

/** GET /api/drivers — list drivers (admin sees all, others see online drivers). */
export async function GET(req: NextRequest) {
  try {
    const { session, error } = await requireSession();
    if (error) return error;

    await connectDB();
    const { searchParams } = new URL(req.url);
    const onlineOnly = searchParams.get("online") === "true";

    const query: Record<string, unknown> = { role: "driver" };
    if (session!.user.role !== "admin" || onlineOnly) query.isOnline = true;
    if (session!.user.role === "admin" && !onlineOnly) delete query.isOnline;

    const drivers = await User.find(query)
      .select("fullName email phone vehicle rating isOnline isActive totalEarnings createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ drivers });
  } catch (e) {
    return serverError(e);
  }
}
