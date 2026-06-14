"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Wallet, CheckCircle2, Route, TrendingUp } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import { RevenueBarChart } from "@/components/charts/Charts";
import { CardSkeleton } from "@/components/ui/Skeletons";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { RideDTO } from "@/types";

export default function DriverEarningsPage() {
  const [rides, setRides] = useState<RideDTO[] | null>(null);

  useEffect(() => {
    fetch("/api/rides?scope=history&status=completed")
      .then((r) => (r.ok ? r.json() : { rides: [] }))
      .then((d) => setRides(d.rides));
  }, []);

  const stats = useMemo(() => {
    const completed = rides ?? [];
    const total = completed.reduce((s, r) => s + r.fare, 0);
    const km = Math.round(completed.reduce((s, r) => s + r.distanceKm, 0));
    const byDay = new Map<string, number>();
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      byDay.set(d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }), 0);
    }
    completed.forEach((r) => {
      const key = new Date(r.completedAt ?? r.updatedAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
      });
      if (byDay.has(key)) byDay.set(key, (byDay.get(key) ?? 0) + r.fare);
    });
    const chart = Array.from(byDay, ([date, revenue]) => ({ date, revenue }));
    const avg = completed.length ? Math.round(total / completed.length) : 0;
    return { total, km, chart, avg, completed };
  }, [rides]);

  if (rides === null) return <CardSkeleton />;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Earnings" value={stats.total} prefix="₨ " icon={Wallet} delay={0.05} />
        <StatCard label="Completed Rides" value={stats.completed.length} icon={CheckCircle2} accent="sky" delay={0.1} />
        <StatCard label="Distance Driven" value={stats.km} suffix=" km" icon={Route} accent="violet" delay={0.15} />
        <StatCard label="Avg Fare / Ride" value={stats.avg} prefix="₨ " icon={TrendingUp} accent="amber" delay={0.2} />
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card p-6">
        <h3 className="mb-4 font-display text-lg font-semibold text-slate-900 dark:text-white">
          Earnings — last 14 days
        </h3>
        <RevenueBarChart data={stats.chart} />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }} className="card overflow-hidden">
        <h3 className="border-b border-slate-100 px-6 py-4 font-display text-lg font-semibold text-slate-900 dark:border-white/5 dark:text-white">
          Recent payouts
        </h3>
        {stats.completed.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
            Complete your first ride to start earning.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-white/5">
            {stats.completed.slice(0, 8).map((r) => (
              <li key={r._id} className="flex items-center justify-between gap-4 px-6 py-3.5 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900 dark:text-white">
                    {r.pickupLocation} → {r.destination}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {formatDate(r.completedAt ?? r.updatedAt)} · {r.distanceKm} km
                  </p>
                </div>
                <span className="shrink-0 font-semibold text-primary-600 dark:text-primary-400">
                  +{formatCurrency(r.fare)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </motion.div>
    </div>
  );
}
