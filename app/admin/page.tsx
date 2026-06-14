"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Users, ShieldCheck, Route, Navigation, CheckCircle2, Banknote, ArrowRight } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import { RidesAreaChart, DistributionPieChart } from "@/components/charts/Charts";
import { StatSkeleton, CardSkeleton } from "@/components/ui/Skeletons";
import type { AdminStats } from "@/types";

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => setStats(d.stats));
  }, []);

  if (!stats) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatSkeleton /><StatSkeleton /><StatSkeleton />
          <StatSkeleton /><StatSkeleton /><StatSkeleton />
        </div>
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total Users" value={stats.totalUsers} icon={Users} delay={0.02} />
        <StatCard label="Total Drivers" value={stats.totalDrivers} icon={ShieldCheck} accent="sky" delay={0.06} />
        <StatCard label="Total Rides" value={stats.totalRides} icon={Route} accent="violet" delay={0.1} />
        <StatCard label="Active Rides" value={stats.activeRides} icon={Navigation} accent="amber" delay={0.14} />
        <StatCard label="Completed Rides" value={stats.completedRides} icon={CheckCircle2} delay={0.18} />
        <StatCard label="Total Revenue" value={stats.totalRevenue} prefix="₨ " icon={Banknote} accent="rose" delay={0.22} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="card p-6">
          <h3 className="mb-4 font-display text-lg font-semibold text-slate-900 dark:text-white">
            Rides — last 14 days
          </h3>
          <RidesAreaChart data={stats.ridesPerDay} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }} className="card p-6">
          <h3 className="mb-4 font-display text-lg font-semibold text-slate-900 dark:text-white">
            Ride status distribution
          </h3>
          <DistributionPieChart data={stats.statusDistribution} />
        </motion.div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { href: "/admin/users", label: "Manage Users", desc: "Activate or deactivate passenger accounts" },
          { href: "/admin/drivers", label: "Manage Drivers", desc: "Review vehicles and availability" },
          { href: "/admin/rides", label: "Manage Rides", desc: "Monitor, cancel or remove rides" },
        ].map((l, i) => (
          <motion.div key={l.href} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 + i * 0.05 }}>
            <Link href={l.href} className="card group flex items-center justify-between p-5 transition-transform hover:-translate-y-1">
              <div>
                <p className="font-display font-semibold text-slate-900 dark:text-white">{l.label}</p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{l.desc}</p>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-primary-500" />
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
