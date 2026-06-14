import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Notification from "@/models/Notification";
import { requireSession, serverError } from "@/lib/api-helpers";

/** GET /api/notifications — current user's notifications. */
export async function GET() {
  try {
    const { session, error } = await requireSession();
    if (error) return error;

    await connectDB();
    const notifications = await Notification.find({ user: session!.user.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    const unread = await Notification.countDocuments({ user: session!.user.id, read: false });

    return NextResponse.json({ notifications, unread });
  } catch (e) {
    return serverError(e);
  }
}

/** PUT /api/notifications — mark all as read. */
export async function PUT(_req: NextRequest) {
  try {
    const { session, error } = await requireSession();
    if (error) return error;

    await connectDB();
    await Notification.updateMany({ user: session!.user.id, read: false }, { $set: { read: true } });
    return NextResponse.json({ message: "All notifications marked as read" });
  } catch (e) {
    return serverError(e);
  }
}
