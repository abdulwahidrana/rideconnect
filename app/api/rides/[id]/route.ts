import { NextResponse, type NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Ride, User, Notification, ActivityLog } from "@/models";
import { requireSession, badRequest, notFound, serverError } from "@/lib/api-helpers";
import { emitToUser, emitToAdmins, emitToOnlineDrivers } from "@/lib/socket-server";
import { RIDE_STATUS_LABELS, type RideStatus } from "@/types";

type Params = { params: Promise<{ id: string }> };

const NEXT_STATUS: Partial<Record<RideStatus, RideStatus>> = {
  accepted: "on_the_way",
  on_the_way: "picked_up",
  picked_up: "in_progress",
  in_progress: "completed",
};

async function notifyAndEmit(userId: string, title: string, message: string, rideId: string, ridePayload: unknown) {
  const notification = await Notification.create({ user: userId, title, message, type: "ride", ride: rideId });
  emitToUser(userId, "notification:new", notification.toObject());
  emitToUser(userId, "ride:update", ridePayload);
}

/** GET /api/rides/:id */
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { session, error } = await requireSession();
    if (error) return error;
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) return badRequest("Invalid ride id");

    await connectDB();
    const ride = await Ride.findById(id)
      .populate("passenger", "fullName email phone rating")
      .populate("driver", "fullName phone vehicle rating")
      .lean();
    if (!ride) return notFound("Ride not found");

    const uid = session!.user.id;
    const isParticipant =
      String((ride.passenger as { _id?: unknown })?._id ?? ride.passenger) === uid ||
      String((ride.driver as { _id?: unknown })?._id ?? ride.driver ?? "") === uid;

    if (session!.user.role !== "admin" && !isParticipant) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ ride });
  } catch (e) {
    return serverError(e);
  }
}

/**
 * PUT /api/rides/:id
 * Body: { action: "accept" | "reject" | "advance" | "cancel" }
 * Drives the full ride lifecycle with real-time updates.
 */
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { session, error } = await requireSession();
    if (error) return error;
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) return badRequest("Invalid ride id");

    const { action } = await req.json();
    await connectDB();

    const ride = await Ride.findById(id);
    if (!ride) return notFound("Ride not found");

    const role = session!.user.role;
    const uid = session!.user.id;

    // ---------- DRIVER ACCEPTS ----------
    if (action === "accept") {
      if (role !== "driver") return badRequest("Only drivers can accept rides");

      // Atomic claim: prevents two drivers from accepting the same ride.
      const claimed = await Ride.findOneAndUpdate(
        { _id: id, status: "pending", driver: null },
        { $set: { driver: uid, status: "accepted", acceptedAt: new Date() } },
        { new: true }
      );
      if (!claimed) return badRequest("This ride has already been taken");

      const populated = await Ride.findById(id)
        .populate("passenger", "fullName email phone rating")
        .populate("driver", "fullName phone vehicle rating")
        .lean();

      await ActivityLog.create({ user: uid, action: "Ride accepted", entity: "ride", entityId: id });

      const driver = await User.findById(uid).lean();
      await notifyAndEmit(
        String(claimed.passenger),
        "Driver assigned",
        `${driver?.fullName ?? "Your driver"} accepted your ride and is getting ready.`,
        id,
        populated
      );
      // Remove this request from every other driver's available list.
      emitToOnlineDrivers("ride:taken", { rideId: id });
      emitToAdmins("ride:update", populated);

      return NextResponse.json({ message: "Ride accepted", ride: populated });
    }

    // ---------- DRIVER REJECTS (local skip, ride stays available) ----------
    if (action === "reject") {
      if (role !== "driver") return badRequest("Only drivers can reject rides");
      await ActivityLog.create({ user: uid, action: "Ride rejected", entity: "ride", entityId: id });
      return NextResponse.json({ message: "Ride skipped" });
    }

    // ---------- DRIVER ADVANCES STATUS ----------
    if (action === "advance") {
      if (role !== "driver" || String(ride.driver) !== uid) {
        return badRequest("Only the assigned driver can update this ride");
      }
      const next = NEXT_STATUS[ride.status];
      if (!next) return badRequest(`Cannot advance a ride that is ${RIDE_STATUS_LABELS[ride.status]}`);

      ride.status = next;
      if (next === "completed") {
        ride.completedAt = new Date();
        await User.findByIdAndUpdate(uid, { $inc: { totalEarnings: ride.fare } });
      }
      await ride.save();

      const populated = await Ride.findById(id)
        .populate("passenger", "fullName email phone rating")
        .populate("driver", "fullName phone vehicle rating")
        .lean();

      await ActivityLog.create({
        user: uid,
        action: `Ride status -> ${RIDE_STATUS_LABELS[next]}`,
        entity: "ride",
        entityId: id,
      });

      const messages: Partial<Record<RideStatus, string>> = {
        on_the_way: "Your driver is on the way to the pickup point.",
        picked_up: "You have been picked up. Enjoy the ride!",
        in_progress: "Your ride is in progress.",
        completed: `Ride completed. Total fare: ${ride.fare} PKR. Thanks for riding with RideConnect!`,
      };
      await notifyAndEmit(String(ride.passenger), RIDE_STATUS_LABELS[next], messages[next] ?? "", id, populated);
      emitToUser(uid, "ride:update", populated);
      emitToAdmins("ride:update", populated);

      return NextResponse.json({ message: "Status updated", ride: populated });
    }

    // ---------- CANCEL ----------
    if (action === "cancel") {
      const isPassenger = role === "passenger" && String(ride.passenger) === uid;
      const isDriver = role === "driver" && String(ride.driver) === uid;
      const isAdmin = role === "admin";
      if (!isPassenger && !isDriver && !isAdmin) return badRequest("You cannot cancel this ride");
      if (["completed", "cancelled"].includes(ride.status)) {
        return badRequest("This ride is already finished");
      }

      ride.status = "cancelled";
      ride.cancelledBy = role;
      await ride.save();

      const populated = await Ride.findById(id)
        .populate("passenger", "fullName email phone rating")
        .populate("driver", "fullName phone vehicle rating")
        .lean();

      await ActivityLog.create({ user: uid, action: `Ride cancelled by ${role}`, entity: "ride", entityId: id });

      await notifyAndEmit(String(ride.passenger), "Ride cancelled", `This ride was cancelled by the ${role}.`, id, populated);
      if (ride.driver) {
        await notifyAndEmit(String(ride.driver), "Ride cancelled", `This ride was cancelled by the ${role}.`, id, populated);
      }
      emitToOnlineDrivers("ride:taken", { rideId: id });
      emitToAdmins("ride:update", populated);

      return NextResponse.json({ message: "Ride cancelled", ride: populated });
    }

    return badRequest("Unknown action");
  } catch (e) {
    return serverError(e);
  }
}

/** DELETE /api/rides/:id — admin removes a ride record. */
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { session, error } = await requireSession(["admin"]);
    if (error) return error;
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) return badRequest("Invalid ride id");

    await connectDB();
    const ride = await Ride.findByIdAndDelete(id);
    if (!ride) return notFound("Ride not found");

    await ActivityLog.create({
      user: session!.user.id,
      action: "Ride deleted by admin",
      entity: "ride",
      entityId: id,
    });

    return NextResponse.json({ message: "Ride deleted" });
  } catch (e) {
    return serverError(e);
  }
}
