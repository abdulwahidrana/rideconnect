import { NextResponse, type NextRequest } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { forgotPasswordSchema } from "@/lib/validations";
import { badRequest, serverError } from "@/lib/api-helpers";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) return badRequest("Enter a valid email address");

    await connectDB();
    const user = await User.findOne({ email: parsed.data.email.toLowerCase() });

    // Always respond the same way to avoid leaking which emails exist.
    const genericResponse = NextResponse.json({
      message: "If an account exists for this email, a reset link has been generated.",
    });

    if (!user) return genericResponse;

    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = crypto.createHash("sha256").update(token).digest("hex");
    user.resetTokenExpiry = new Date(Date.now() + 1000 * 60 * 30); // 30 minutes
    await user.save();

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || ""}/reset-password?token=${token}`;

    try {
      await sendPasswordResetEmail(user.email, resetUrl);
    } catch {
      // In dev without email config, fall back to returning the link directly.
      if (process.env.NODE_ENV !== "production") {
        return NextResponse.json({
          message: "If an account exists for this email, a reset link has been generated.",
          devResetUrl: resetUrl,
        });
      }
      return serverError("Failed to send reset email. Please try again later.");
    }

    return NextResponse.json({
      message: "If an account exists for this email, a reset link has been generated.",
    });
  } catch (e) {
    return serverError(e);
  }
}
