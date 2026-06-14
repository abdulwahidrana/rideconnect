"use client";

import { motion } from "framer-motion";
import { Bell, CheckCheck } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { ListSkeleton } from "@/components/ui/Skeletons";
import { EmptyState } from "@/components/ui/EmptyState";
import { timeAgo, cn } from "@/lib/utils";

export default function PassengerNotificationsPage() {
  const { notifications, unread, loading, markAllRead } = useNotifications();

  if (loading) return <ListSkeleton />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {unread > 0 ? `${unread} unread notification${unread > 1 ? "s" : ""}` : "You're all caught up."}
        </p>
        {unread > 0 && (
          <button onClick={markAllRead} className="btn-secondary">
            <CheckCheck className="h-4 w-4" /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="h-6 w-6" />}
          title="No notifications"
          message="Ride updates and system messages will appear here in real time."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((n, i) => (
            <motion.div
              key={n._id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.35) }}
              className={cn("card flex items-start gap-3.5 p-4", !n.read && "ring-1 ring-primary-300/60 dark:ring-primary-500/40")}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                  n.type === "ride"
                    ? "bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400"
                    : "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400"
                )}
              >
                <Bell className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{n.title}</p>
                  <span className="shrink-0 text-[11px] text-slate-400">{timeAgo(n.createdAt)}</span>
                </div>
                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{n.message}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
