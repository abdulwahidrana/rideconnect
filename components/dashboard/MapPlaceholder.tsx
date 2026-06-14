"use client";

import { motion } from "framer-motion";
import { MapPin, Navigation } from "lucide-react";

/**
 * Animated interactive-style map placeholder. Swap with Google Maps /
 * Mapbox in production — the surrounding layout stays the same.
 */
export default function MapPlaceholder({
  pickup,
  destination,
  animated = true,
}: {
  pickup?: string;
  destination?: string;
  animated?: boolean;
}) {
  return (
    <div className="relative h-64 w-full overflow-hidden rounded-2xl border border-slate-200/70 bg-slate-50 dark:border-white/10 dark:bg-slate-900 sm:h-72">
      {/* grid */}
      <svg className="absolute inset-0 h-full w-full opacity-60" aria-hidden>
        <defs>
          <pattern id="map-grid" width="36" height="36" patternUnits="userSpaceOnUse">
            <path
              d="M 36 0 L 0 0 0 36"
              fill="none"
              className="stroke-slate-200 dark:stroke-white/5"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#map-grid)" />
        {/* roads */}
        <path d="M0,170 C140,140 220,210 420,160 S700,120 900,150" fill="none" className="stroke-slate-300 dark:stroke-white/10" strokeWidth="14" strokeLinecap="round" />
        <path d="M120,0 C150,120 90,220 160,320" fill="none" className="stroke-slate-300 dark:stroke-white/10" strokeWidth="10" strokeLinecap="round" />
        <path d="M520,0 C480,140 560,200 530,320" fill="none" className="stroke-slate-300 dark:stroke-white/10" strokeWidth="10" strokeLinecap="round" />
        {/* route */}
        <motion.path
          d="M80,220 C200,180 320,230 440,150 S620,90 760,120"
          fill="none"
          stroke="#16A34A"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="10 8"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.6, ease: "easeInOut" }}
        />
        {animated && (
  <circle r="7" fill="#22C55E" stroke="white" strokeWidth="2.5">
    <animateMotion
      dur="7s"
      repeatCount="indefinite"
      rotate="auto"
      path="M80,220 C200,180 320,230 440,150 S620,90 760,120"
    />
  </circle>
)}
      </svg>

      {/* pins */}
      <div className="absolute left-[8%] top-[58%]">
        <motion.div
          initial={{ y: -12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.2 }}
          className="flex items-center gap-1.5"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg shadow-primary-500/40">
            <MapPin className="h-4 w-4" />
          </span>
          {pickup && (
            <span className="glass rounded-lg px-2 py-1 text-xs font-medium text-slate-700 dark:text-slate-200">
              {pickup}
            </span>
          )}
        </motion.div>
      </div>
      <div className="absolute right-[10%] top-[26%]">
        <motion.div
          initial={{ y: -12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.45 }}
          className="flex items-center gap-1.5"
        >
          {destination && (
            <span className="glass rounded-lg px-2 py-1 text-xs font-medium text-slate-700 dark:text-slate-200">
              {destination}
            </span>
          )}
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg dark:bg-white dark:text-slate-900">
            <Navigation className="h-4 w-4" />
          </span>
        </motion.div>
      </div>

      <span className="absolute bottom-3 right-3 rounded-md bg-white/80 px-2 py-1 text-[10px] font-medium text-slate-500 backdrop-blur dark:bg-slate-900/80 dark:text-slate-400">
        Live map preview
      </span>
    </div>
  );
}
