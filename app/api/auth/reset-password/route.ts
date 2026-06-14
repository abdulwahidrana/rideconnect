import { NextResponse, type NextRequest } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import ActivityLog from "@/models/ActivityLog";
import { resetPasswordSchema } from "@/lib/validations";
import { badRequest, serverError } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest("Validation failed", parsed.error.flatten().fieldErrors);
    }

    await connectDB();
    const hashedToken = crypto.createHash("sha256").update(parsed.data.token).digest("hex");

    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: new Date() },
    }).select("+password");

    if (!user) return badRequest("This reset link is invalid or has expired");

    user.password = await bcrypt.hash(parsed.data.password, 10);
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    await ActivityLog.create({
      user: user._id,
      action: "Password reset completed",
      entity: "auth",
      entityId: String(user._id),
    });

    return NextResponse.json({ message: "Password updated. You can now log in." });
  } catch (e) {
    return serverError(e);
  }
}
