import { NextResponse, type NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import ActivityLog from "@/models/ActivityLog";
import {
  passengerRegisterSchema,
  driverRegisterSchema,
  type DriverRegisterInput,
} from "@/lib/validations";
import { badRequest, serverError } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const role = body.role === "driver" ? "driver" : "passenger";

    const parsed =
      role === "driver" ? driverRegisterSchema.safeParse(body) : passengerRegisterSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest("Validation failed", parsed.error.flatten().fieldErrors);
    }

    await connectDB();

    const exists = await User.findOne({ email: parsed.data.email.toLowerCase() });
    if (exists) return badRequest("An account with this email already exists");

    const hashed = await bcrypt.hash(parsed.data.password, 10);

    const user = await User.create({
      fullName: parsed.data.fullName,
      email: parsed.data.email.toLowerCase(),
      phone: parsed.data.phone,
      password: hashed,
      role,
      ...(role === "driver"
        ? {
            vehicle: {
              name: (parsed.data as DriverRegisterInput).vehicleName,
              number: (parsed.data as DriverRegisterInput).vehicleNumber,
              licenseNumber: (parsed.data as DriverRegisterInput).licenseNumber,
            },
          }
        : {}),
    });

    await ActivityLog.create({
      user: user._id,
      action: `New ${role} registered`,
      entity: "auth",
      entityId: String(user._id),
    });

    return NextResponse.json(
      { message: "Account created successfully", userId: String(user._id) },
      { status: 201 }
    );
  } catch (e) {
    return serverError(e);
  }
}
