"use client";

import { motion } from "framer-motion";
import { Zap, Radio, Route, ShieldCheck } from "lucide-react";

const features = [
  {
    icon: Radio,
    title: "Real-time dispatch",
    text: "Every request is broadcast to online drivers over live sockets — no refresh, no waiting on polling.",
  },
  {
    icon: Zap,
    title: "Fast booking",
    text: "Pick-up, destination, ride type — three fields and your request is in front of drivers in under a second.",
  },
  {
    icon: Route,
    title: "Ride tracking",
    text: "Follow your ride through every stage: assigned, on the way, picked up, in progress, completed.",
  },
  {
    icon: ShieldCheck,
    title: "Secure platform",
    text: "Verified driver profiles, encrypted sessions, and role-based access protect every account.",
  },
];

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-5 py-24">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.55 }}
        className="text-center"
      >
        <span className="text-sm font-semibold uppercase tracking-widest text-primary-600 dark:text-primary-400">Features</span>
        <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Built for the moment you need to move</h2>
      </motion.div>

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            whileHover={{ y: -6 }}
            className="card group hover:shadow-glow"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600/10 text-primary-600 transition-colors group-hover:bg-primary-600 group-hover:text-white dark:text-primary-400">
              <f.icon className="h-6 w-6" />
            </div>
            <h3 className="mt-5 font-display text-lg font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{f.text}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
