import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-helpers";
import { connectDB } from "@/lib/db";
import ActivityLog from "@/models/ActivityLog";

/**
 * Session invalidation itself is handled client-side by next-auth signOut();
 * this endpoint records the logout event for the activity log.
 */
export async function POST() {
  const { session, error } = await requireSession();
  if (error) return error;

  await connectDB();
  await ActivityLog.create({
    user: session!.user.id,
    action: "User logged out",
    entity: "auth",
    entityId: session!.user.id,
  });

  return NextResponse.json({ message: "Logged out" });
}
