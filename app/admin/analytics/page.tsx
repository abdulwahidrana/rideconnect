"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Banknote, CheckCircle2, XCircle } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import { RidesAreaChart, RevenueBarChart, DistributionPieChart } from "@/components/charts/Charts";
import { CardSkeleton } from "@/components/ui/Skeletons";
import type { AdminStats } from "@/types";

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => setStats(d.stats));
  }, []);

  if (!stats) return <CardSkeleton />;

  const completionRate = stats.totalRides
    ? Math.round((stats.completedRides / stats.totalRides) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Completion Rate" value={completionRate} suffix="%" icon={TrendingUp} delay={0.02} />
        <StatCard label="Total Revenue" value={stats.totalRevenue} prefix="₨ " icon={Banknote} accent="sky" delay={0.06} />
        <StatCard label="Completed Rides" value={stats.completedRides} icon={CheckCircle2} accent="violet" delay={0.1} />
        <StatCard label="Cancelled Rides" value={stats.cancelledRides} icon={XCircle} accent="rose" delay={0.14} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="card p-6">
          <h3 className="mb-4 font-display text-lg font-semibold text-slate-900 dark:text-white">
            Ride volume — last 14 days
          </h3>
          <RidesAreaChart data={stats.ridesPerDay} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="card p-6">
          <h3 className="mb-4 font-display text-lg font-semibold text-slate-900 dark:text-white">
            Revenue — last 14 days
          </h3>
          <RevenueBarChart data={stats.ridesPerDay} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }} className="card p-6">
          <h3 className="mb-4 font-display text-lg font-semibold text-slate-900 dark:text-white">
            Ride type distribution
          </h3>
          <DistributionPieChart data={stats.rideTypeDistribution} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-6">
          <h3 className="mb-4 font-display text-lg font-semibold text-slate-900 dark:text-white">
            Status distribution
          </h3>
          <DistributionPieChart data={stats.statusDistribution} />
        </motion.div>
      </div>
    </div>
  );
}
