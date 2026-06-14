import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Ride, User, Notification, ActivityLog } from "@/models";
import { rideRequestSchema } from "@/lib/validations";
import { requireSession, badRequest, serverError } from "@/lib/api-helpers";
import { estimateDistanceKm, calculateFare } from "@/lib/fare";
import { emitToOnlineDrivers, emitToAdmins, emitToUser } from "@/lib/socket-server";

const ACTIVE_STATUSES = ["pending", "driver_assigned", "accepted", "on_the_way", "picked_up", "in_progress"];

/** POST /api/rides — passenger creates a ride request, broadcast to online drivers. */
export async function POST(req: NextRequest) {
  try {
    const { session, error } = await requireSession(["passenger"]);
    if (error) return error;

    const body = await req.json();
    const parsed = rideRequestSchema.safeParse(body);
    if (!parsed.success) return badRequest("Validation failed", parsed.error.flatten().fieldErrors);

    await connectDB();

    const existing = await Ride.findOne({
      passenger: session!.user.id,
      status: { $in: ACTIVE_STATUSES },
    });
    if (existing) return badRequest("You already have an active ride. Complete or cancel it first.");

    const distanceKm = estimateDistanceKm(parsed.data.pickupLocation, parsed.data.destination);
    const fare = calculateFare(parsed.data.rideType, distanceKm);

    const ride = await Ride.create({
      passenger: session!.user.id,
      pickupLocation: parsed.data.pickupLocation,
      destination: parsed.data.destination,
      rideType: parsed.data.rideType,
      notes: parsed.data.notes || undefined,
      status: "pending",
      fare,
      distanceKm,
      requestedAt: new Date(),
    });

    const populated = await ride.populate("passenger", "fullName email phone rating");

    await ActivityLog.create({
      user: session!.user.id,
      action: "Ride requested",
      entity: "ride",
      entityId: String(ride._id),
      metadata: { pickup: ride.pickupLocation, destination: ride.destination },
    });

    // ---- Real-time dispatch: broadcast to every online driver ----
    emitToOnlineDrivers("ride:new", populated.toObject());
    emitToAdmins("ride:new", populated.toObject());

    return NextResponse.json({ message: "Ride requested", ride: populated }, { status: 201 });
  } catch (e) {
    return serverError(e);
  }
}

/** GET /api/rides — role-aware listing with filters: ?status=&scope=available|active|history */
export async function GET(req: NextRequest) {
  try {
    const { session, error } = await requireSession();
    if (error) return error;

    await connectDB();
    const { searchParams } = new URL(req.url);
    const scope = searchParams.get("scope");
    const status = searchParams.get("status");
    const role = session!.user.role;
    const uid = session!.user.id;

    const query: Record<string, unknown> = {};

    if (role === "passenger") query.passenger = uid;
    if (role === "driver") {
      if (scope === "available") {
        query.status = "pending";
        query.driver = null;
      } else {
        query.driver = uid;
      }
    }

    if (scope === "active") query.status = { $in: ["driver_assigned", "accepted", "on_the_way", "picked_up", "in_progress", ...(role === "passenger" ? ["pending"] : [])] };
    if (scope === "history") query.status = { $in: ["completed", "cancelled"] };
    if (status) query.status = status;

    const rides = await Ride.find(query)
      .populate("passenger", "fullName email phone rating")
      .populate("driver", "fullName phone vehicle rating")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return NextResponse.json({ rides });
  } catch (e) {
    return serverError(e);
  }
}
