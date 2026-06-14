import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { requireSession, serverError } from "@/lib/api-helpers";

/** GET /api/admin/users?role=passenger|driver — admin user management list. */
export async function GET(req: NextRequest) {
  try {
    const { error } = await requireSession(["admin"]);
    if (error) return error;

    await connectDB();
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const search = searchParams.get("q");

    const query: Record<string, unknown> = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .select("fullName email phone role isActive isOnline vehicle rating totalEarnings createdAt")
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    return NextResponse.json({ users });
  } catch (e) {
    return serverError(e);
  }
}
