"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  prefix?: string;
  suffix?: string;
  accent?: "primary" | "sky" | "violet" | "amber" | "rose";
  delay?: number;
}

const ACCENTS = {
  primary: "from-primary-500 to-emerald-600 shadow-primary-500/30",
  sky: "from-sky-500 to-cyan-600 shadow-sky-500/30",
  violet: "from-violet-500 to-purple-600 shadow-violet-500/30",
  amber: "from-amber-500 to-orange-600 shadow-amber-500/30",
  rose: "from-rose-500 to-pink-600 shadow-rose-500/30",
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  prefix = "",
  suffix = "",
  accent = "primary",
  delay = 0,
}: StatCardProps) {
  const { ref, value: animated } = useCountUp(value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      whileHover={{ y: -4 }}
      className="card group p-5"
    >
      <div className="flex items-start justify-between">
        <div ref={ref}>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 font-display text-3xl font-bold tabular-nums text-slate-900 dark:text-white">
            {prefix}
            {animated.toLocaleString()}
            {suffix}
          </p>
        </div>
        <span
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg transition-transform duration-300 group-hover:scale-110",
            ACCENTS[accent]
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </motion.div>
  );
}
