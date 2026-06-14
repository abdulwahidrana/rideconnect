"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Power } from "lucide-react";
import { useSocket } from "@/context/SocketContext";
import { useToast } from "@/context/ToastContext";
import { cn } from "@/lib/utils";

/** Driver online/offline availability switch, synced to API + socket rooms. */
export default function OnlineToggle({
  onChange,
}: {
  onChange?: (isOnline: boolean) => void;
}) {
  const { socket } = useSocket();
  const { toast } = useToast();
  const [online, setOnline] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => setOnline(Boolean(d.user?.isOnline)));
  }, []);

  const toggle = async () => {
    if (online === null || busy) return;
    const next = !online;
    setBusy(true);
    setOnline(next);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOnline: next }),
      });
      if (!res.ok) {
        setOnline(!next);
        toast("Could not update availability.", "error");
        return;
      }
      socket?.emit("driver:availability", { isOnline: next });
      onChange?.(next);
      toast(next ? "You're online — new ride requests will stream in." : "You're offline.", next ? "success" : "info");
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.button
      onClick={toggle}
      whileTap={{ scale: 0.97 }}
      disabled={online === null || busy}
      className={cn(
        "flex items-center gap-3 rounded-2xl border px-4 py-3 transition-colors disabled:opacity-60",
        online
          ? "border-primary-300 bg-primary-50 dark:border-primary-500/40 dark:bg-primary-500/10"
          : "border-slate-200 bg-white dark:border-white/10 dark:bg-white/5"
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-xl text-white",
          online ? "bg-primary-600" : "bg-slate-400 dark:bg-slate-600"
        )}
      >
        <Power className="h-4 w-4" />
      </span>
      <span className="text-left">
        <span className="block text-sm font-semibold text-slate-900 dark:text-white">
          {online === null ? "Loading…" : online ? "You're Online" : "You're Offline"}
        </span>
        <span className="block text-xs text-slate-500 dark:text-slate-400">
          {online ? "Receiving ride requests" : "Go online to receive requests"}
        </span>
      </span>
      <span
        className={cn(
          "ml-2 inline-flex h-6 w-11 items-center rounded-full p-0.5 transition-colors",
          online ? "bg-primary-600" : "bg-slate-300 dark:bg-slate-600"
        )}
      >
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 500, damping: 32 }}
          className={cn("h-5 w-5 rounded-full bg-white shadow", online && "ml-auto")}
        />
      </span>
    </motion.button>
  );
}
