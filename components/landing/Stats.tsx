"use client";

import { useCountUp } from "@/hooks/useCountUp";
import { motion } from "framer-motion";

const stats = [
  { value: 120000, suffix: "+", label: "Rides completed" },
  { value: 8500, suffix: "+", label: "Active drivers" },
  { value: 35, suffix: "", label: "Cities covered" },
  { value: 4, suffix: " min", label: "Average pickup time" },
];

function StatItem({ value, suffix, label, delay }: { value: number; suffix: string; label: string; delay: number }) {
  const { ref, value: count } = useCountUp(value);
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="text-center"
    >
      <p className="font-display text-4xl font-bold text-white sm:text-5xl">
        {count.toLocaleString()}
        <span className="text-primary-300">{suffix}</span>
      </p>
      <p className="mt-2 text-sm font-medium text-primary-100/90">{label}</p>
    </motion.div>
  );
}

export function Stats() {
  return (
    <section id="stats" className="mx-auto max-w-6xl px-5 py-12">
      <div className="relative overflow-hidden rounded-3xl bg-secondary px-8 py-16 shadow-2xl">
        <div className="orb -left-20 -top-20 h-72 w-72 bg-primary-500/50" />
        <div className="orb -bottom-24 right-0 h-80 w-80 bg-emerald-500/40" />
        <div className="relative grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <StatItem key={s.label} {...s} delay={i * 0.1} />
          ))}
        </div>
      </div>
    </section>
  );
}
