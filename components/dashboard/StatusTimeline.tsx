"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { RIDE_STATUS_FLOW, RIDE_STATUS_LABELS, type RideStatus } from "@/types";
import { cn } from "@/lib/utils";

/** Vertical animated timeline showing ride progress through every status. */
export default function StatusTimeline({ status }: { status: RideStatus }) {
  const steps = RIDE_STATUS_FLOW;
  const currentIndex = status === "cancelled" ? -1 : steps.indexOf(status);

  return (
    <ol className="space-y-0">
      {steps.map((step, i) => {
        const done = currentIndex > i;
        const active = currentIndex === i;
        return (
          <li key={step} className="relative flex gap-4 pb-6 last:pb-0">
            {i < steps.length - 1 && (
              <span
                className={cn(
                  "absolute left-[13px] top-7 h-[calc(100%-22px)] w-0.5",
                  done ? "bg-primary-500" : "bg-slate-200 dark:bg-white/10"
                )}
              />
            )}
            <motion.span
              initial={false}
              animate={active ? { scale: [1, 1.12, 1] } : {}}
              transition={{ duration: 1.4, repeat: active ? Infinity : 0 }}
              className={cn(
                "relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold",
                done && "border-primary-500 bg-primary-500 text-white",
                active && "border-primary-500 bg-primary-50 text-primary-600 dark:bg-primary-500/15 dark:text-primary-300",
                !done && !active && "border-slate-300 bg-white text-slate-400 dark:border-white/15 dark:bg-slate-900"
              )}
            >
              {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </motion.span>
            <div className="pt-1">
              <p
                className={cn(
                  "text-sm font-medium",
                  active
                    ? "text-primary-700 dark:text-primary-300"
                    : done
                      ? "text-slate-900 dark:text-white"
                      : "text-slate-400 dark:text-slate-500"
                )}
              >
                {RIDE_STATUS_LABELS[step]}
              </p>
              {active && (
                <p className="text-xs text-slate-500 dark:text-slate-400">Current stage</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
