"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Navigation, ShieldCheck, Timer } from "lucide-react";
import { GradientOrbs } from "@/components/ui/GradientOrbs";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-hero-grid bg-[size:42px_42px] pt-36 pb-24">
      <GradientOrbs />
      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 lg:grid-cols-2">
        <motion.div variants={container} initial="hidden" animate="show">
          <motion.span variants={item} className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold text-primary-700 dark:text-primary-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute h-full w-full animate-ping rounded-full bg-primary-500 opacity-70" />
              <span className="relative h-2 w-2 rounded-full bg-primary-500" />
            </span>
            Live dispatch — drivers matched in seconds
          </motion.span>

          <motion.h1 variants={item} className="mt-6 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Your ride, dispatched{" "}
            <span className="bg-gradient-to-r from-primary-600 to-emerald-400 bg-clip-text text-transparent">
              in real time
            </span>
          </motion.h1>

          <motion.p variants={item} className="mt-5 max-w-lg text-lg text-slate-600 dark:text-slate-400">
            Request a ride, watch nearby drivers respond instantly, and follow every status update live — from pickup to drop-off.
          </motion.p>

          <motion.div variants={item} className="mt-8 flex flex-wrap gap-4">
            <Link href="/register" className="btn-primary !px-7 !py-3 !text-base group">
              Book your first ride
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/register?role=driver" className="btn-secondary !px-7 !py-3 !text-base">
              Drive with us
            </Link>
          </motion.div>

          <motion.div variants={item} className="mt-10 flex flex-wrap gap-6 text-sm text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-2"><Timer className="h-4 w-4 text-primary-500" /> Avg. pickup 4 min</span>
            <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary-500" /> Verified drivers</span>
            <span className="flex items-center gap-2"><Navigation className="h-4 w-4 text-primary-500" /> Live tracking</span>
          </motion.div>
        </motion.div>

        {/* Animated booking illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.25, ease: "easeOut" }}
          className="relative"
        >
          <div className="glass-strong relative overflow-hidden rounded-3xl p-6">
            {/* Map placeholder backdrop */}
            <div className="relative h-72 overflow-hidden rounded-2xl bg-gradient-to-br from-primary-50 to-emerald-100 dark:from-slate-800 dark:to-slate-900">
              <svg className="absolute inset-0 h-full w-full opacity-50" aria-hidden>
                <defs>
                  <pattern id="roads" width="80" height="80" patternUnits="userSpaceOnUse">
                    <path d="M 80 0 L 0 0 0 80" fill="none" stroke="currentColor" strokeWidth="1" className="text-primary-300 dark:text-slate-700" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#roads)" />
              </svg>
              {/* Route line */}
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 288" fill="none">
                <motion.path
                  d="M 60 230 C 120 200, 140 120, 210 110 S 330 70, 350 50"
                  stroke="#16A34A"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeDasharray="8 8"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2.2, delay: 0.8, ease: "easeInOut" }}
                />
              </svg>
              <motion.div
                className="absolute left-[10%] bottom-[16%]"
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.9, type: "spring" }}
              >
                <MapPin className="h-7 w-7 text-primary-600 drop-shadow" fill="currentColor" fillOpacity={0.2} />
              </motion.div>
              <motion.div
                className="absolute right-[10%] top-[12%]"
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2.8, type: "spring" }}
              >
                <span className="relative flex h-5 w-5">
                  <span className="absolute h-full w-full animate-pulse-ring rounded-full bg-primary-500" />
                  <span className="relative h-5 w-5 rounded-full border-2 border-white bg-primary-600 shadow" />
                </span>
              </motion.div>
              {/* Driving car */}
              <motion.div
                className="absolute bottom-8 left-0 text-2xl"
                animate={{ x: ["-10%", "420px"] }}
                transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
              >
                🚗
              </motion.div>
            </div>

            {/* Floating ride card */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="glass-strong absolute left-8 top-10 w-56 rounded-2xl p-4"
            >
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Driver found</p>
              <p className="mt-1 font-display font-bold">Ahmed · Corolla</p>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-primary-600 dark:text-primary-400 font-semibold">3 min away</span>
                <span className="rounded-full bg-primary-100 px-2 py-0.5 font-semibold text-primary-700 dark:bg-primary-500/15 dark:text-primary-400">★ 4.9</span>
              </div>
            </motion.div>

            <div className="mt-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Gulberg → DHA Phase 5</p>
                <p className="font-display text-lg font-bold">PKR 540 · 12.4 km</p>
              </div>
              <span className="btn-primary pointer-events-none !py-2 text-xs">Confirm ride</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
