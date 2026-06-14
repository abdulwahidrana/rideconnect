"use client";

import { useEffect, useMemo, useState } from "react";
import { History } from "lucide-react";
import RideCard from "@/components/dashboard/RideCard";
import { ListSkeleton } from "@/components/ui/Skeletons";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";
import type { RideDTO } from "@/types";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
] as const;

export default function DriverHistoryPage() {
  const [rides, setRides] = useState<RideDTO[] | null>(null);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");

  useEffect(() => {
    fetch("/api/rides?scope=history")
      .then((r) => (r.ok ? r.json() : { rides: [] }))
      .then((d) => setRides(d.rides));
  }, []);

  const visible = useMemo(() => {
    if (!rides) return [];
    return filter === "all" ? rides : rides.filter((r) => r.status === filter);
  }, [rides, filter]);

  if (rides === null) return <ListSkeleton />;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              filter === f.id
                ? "bg-primary-600 text-white shadow-lg shadow-primary-500/25"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-white/5 dark:text-slate-300 dark:ring-white/10 dark:hover:bg-white/10"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={<History className="h-6 w-6" />}
          title="No rides found"
          message="Trips you've driven will appear here once completed."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {visible.map((r, i) => (
            <RideCard key={r._id} ride={r} showPassenger delay={Math.min(i * 0.05, 0.4)} />
          ))}
        </div>
      )}
    </div>
  );
}
