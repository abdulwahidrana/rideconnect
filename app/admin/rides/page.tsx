"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Route, Trash2, XCircle, Loader2 } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ListSkeleton } from "@/components/ui/Skeletons";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/context/ToastContext";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { RIDE_STATUS_LABELS, type RideDTO, type RideStatus, type UserDTO } from "@/types";

const STATUS_FILTERS: ("all" | RideStatus)[] = [
  "all",
  "pending",
  "accepted",
  "in_progress",
  "completed",
  "cancelled",
];

function name(p: RideDTO["passenger"]) {
  return typeof p === "object" && p ? (p as UserDTO).fullName : "—";
}

export default function AdminRidesPage() {
  const { toast } = useToast();
  const [rides, setRides] = useState<RideDTO[] | null>(null);
  const [filter, setFilter] = useState<(typeof STATUS_FILTERS)[number]>("all");
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async (status: typeof filter) => {
    const res = await fetch(`/api/rides${status !== "all" ? `?status=${status}` : ""}`);
    if (res.ok) setRides((await res.json()).rides);
  }, []);

  useEffect(() => {
    load(filter);
  }, [filter, load]);

  const cancelRide = async (ride: RideDTO) => {
    setBusy(ride._id);
    try {
      const res = await fetch(`/api/rides/${ride._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? "Could not cancel ride.", "error");
        return;
      }
      setRides((prev) => prev?.map((r) => (r._id === ride._id ? data.ride : r)) ?? null);
      toast("Ride cancelled by admin.", "success");
    } finally {
      setBusy(null);
    }
  };

  const deleteRide = async (ride: RideDTO) => {
    setBusy(ride._id);
    try {
      const res = await fetch(`/api/rides/${ride._id}`, { method: "DELETE" });
      if (!res.ok) {
        toast("Could not delete ride.", "error");
        return;
      }
      setRides((prev) => prev?.filter((r) => r._id !== ride._id) ?? null);
      toast("Ride record deleted.", "success");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors",
              filter === f
                ? "bg-primary-600 text-white shadow-lg shadow-primary-500/25"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-white/5 dark:text-slate-300 dark:ring-white/10 dark:hover:bg-white/10"
            )}
          >
            {f === "all" ? "All" : RIDE_STATUS_LABELS[f]}
          </button>
        ))}
      </div>

      {rides === null ? (
        <ListSkeleton />
      ) : rides.length === 0 ? (
        <EmptyState icon={<Route className="h-6 w-6" />} title="No rides found" message="Rides matching this filter will appear here." />
      ) : (
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="card overflow-x-auto">
          <table className="w-full min-w-[840px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400 dark:border-white/5">
                <th className="px-5 py-3.5 font-medium">Route</th>
                <th className="px-5 py-3.5 font-medium">Passenger</th>
                <th className="px-5 py-3.5 font-medium">Driver</th>
                <th className="px-5 py-3.5 font-medium">Fare</th>
                <th className="px-5 py-3.5 font-medium">Status</th>
                <th className="px-5 py-3.5 font-medium">Requested</th>
                <th className="px-5 py-3.5 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {rides.map((r) => {
                const active = !["completed", "cancelled"].includes(r.status);
                return (
                  <tr key={r._id} className="transition-colors hover:bg-slate-50/70 dark:hover:bg-white/[0.03]">
                    <td className="max-w-[220px] px-5 py-3.5">
                      <p className="truncate font-medium text-slate-900 dark:text-white">{r.pickupLocation}</p>
                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">→ {r.destination}</p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">{name(r.passenger)}</td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">{r.driver ? name(r.driver) : "—"}</td>
                    <td className="px-5 py-3.5 font-medium text-slate-900 dark:text-white">{formatCurrency(r.fare)}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={r.status} /></td>
                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">{formatDate(r.requestedAt ?? r.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-2">
                        {active && (
                          <button
                            onClick={() => cancelRide(r)}
                            disabled={busy === r._id}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-100 disabled:opacity-60 dark:bg-amber-500/10 dark:text-amber-300 dark:hover:bg-amber-500/20"
                          >
                            {busy === r._id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
                            Cancel
                          </button>
                        )}
                        <button
                          onClick={() => deleteRide(r)}
                          disabled={busy === r._id}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-100 disabled:opacity-60 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20"
                        >
                          {busy === r._id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
}
