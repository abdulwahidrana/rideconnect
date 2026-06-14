"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Wifi, WifiOff } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { useSocket } from "@/context/SocketContext";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { timeAgo, cn } from "@/lib/utils";
import type { Role } from "@/types";

export default function Topbar({ title, role }: { title: string; role: Role }) {
  const { notifications, unread, markAllRead } = useNotifications();
  const { connected } = useSocket();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/70 px-4 py-4 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/60 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-4 pl-12 lg:pl-0">
        <div>
          <h1 className="font-display text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
            {title}
          </h1>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            {connected ? (
              <>
                <Wifi className="h-3.5 w-3.5 text-primary-500" />
                Live dispatch connected
              </>
            ) : (
              <>
                <WifiOff className="h-3.5 w-3.5 text-slate-400" />
                Connecting…
              </>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="relative" ref={panelRef}>
            <button
              onClick={() => {
                setOpen((o) => !o);
                if (!open && unread > 0) markAllRead();
              }}
              className="glass relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition-colors hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unread > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white"
                >
                  {unread > 9 ? "9+" : unread}
                </motion.span>
              )}
            </button>

            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.97 }}
                  transition={{ duration: 0.18 }}
                  className="glass-strong absolute right-0 mt-3 w-[min(92vw,360px)] overflow-hidden rounded-2xl"
                >
                  <div className="flex items-center justify-between border-b border-slate-200/70 px-4 py-3 dark:border-white/10">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      Notifications
                    </p>
                    {role !== "admin" && (
                      <Link
                        href={`/${role}/notifications`}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "text-xs font-medium text-primary-600 hover:underline dark:text-primary-400",
                          role === "driver" && "hidden"
                        )}
                      >
                        View all
                      </Link>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                        No notifications yet.
                      </p>
                    ) : (
                      notifications.slice(0, 8).map((n) => (
                        <div
                          key={n._id}
                          className="border-b border-slate-100 px-4 py-3 last:border-0 dark:border-white/5"
                        >
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {n.title}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                            {n.message}
                          </p>
                          <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                            {timeAgo(n.createdAt)}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
