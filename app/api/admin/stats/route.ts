import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User, Ride } from "@/models";
import { requireSession, serverError } from "@/lib/api-helpers";
import { RIDE_STATUS_LABELS, type RideStatus } from "@/types";

const ACTIVE = ["pending", "driver_assigned", "accepted", "on_the_way", "picked_up", "in_progress"];

/** GET /api/admin/stats — aggregated platform analytics. */
export async function GET() {
  try {
    const { error } = await requireSession(["admin"]);
    if (error) return error;

    await connectDB();

    const since = new Date();
    since.setDate(since.getDate() - 13);
    since.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      totalPassengers,
      totalDrivers,
      totalRides,
      activeRides,
      completedRides,
      cancelledRides,
      revenueAgg,
      perDay,
      byType,
      byStatus,
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ role: "passenger" }),
      User.countDocuments({ role: "driver" }),
      Ride.countDocuments({}),
      Ride.countDocuments({ status: { $in: ACTIVE } }),
      Ride.countDocuments({ status: "completed" }),
      Ride.countDocuments({ status: "cancelled" }),
      Ride.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: null, total: { $sum: "$fare" } } },
      ]),
      Ride.aggregate([
        { $match: { createdAt: { $gte: since } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            rides: { $sum: 1 },
            revenue: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, "$fare", 0] } },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Ride.aggregate([{ $group: { _id: "$rideType", value: { $sum: 1 } } }]),
      Ride.aggregate([{ $group: { _id: "$status", value: { $sum: 1 } } }]),
    ]);

    // Fill empty days so the chart shows a continuous 14-day window.
    const ridesPerDay: { date: string; rides: number; revenue: number }[] = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(since);
      d.setDate(since.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      const found = perDay.find((p: { _id: string }) => p._id === key);
      ridesPerDay.push({
        date: d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
        rides: found?.rides ?? 0,
        revenue: found?.revenue ?? 0,
      });
    }

    return NextResponse.json({
      totalUsers,
      totalPassengers,
      totalDrivers,
      totalRides,
      activeRides,
      completedRides,
      cancelledRides,
      totalRevenue: revenueAgg[0]?.total ?? 0,
      ridesPerDay,
      rideTypeDistribution: byType.map((t: { _id: string; value: number }) => ({
        name: t._id ? t._id[0].toUpperCase() + t._id.slice(1) : "Unknown",
        value: t.value,
      })),
      statusDistribution: byStatus.map((s: { _id: RideStatus; value: number }) => ({
        name: RIDE_STATUS_LABELS[s._id] ?? s._id,
        value: s.value,
      })),
    });
  } catch (e) {
    return serverError(e);
  }
}
