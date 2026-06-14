"use client";

import { motion } from "framer-motion";
import { MapPin, Users, CarFront, Flag } from "lucide-react";

const steps = [
  { icon: MapPin, title: "Set your route", text: "Enter pickup and destination, choose a ride type that fits your budget." },
  { icon: Users, title: "Drivers respond", text: "Your request reaches every online driver nearby the instant you submit it." },
  { icon: CarFront, title: "Track the pickup", text: "Watch the status move from accepted to on-the-way to picked up, live." },
  { icon: Flag, title: "Arrive & review", text: "Fare is confirmed at completion and the trip lands in your ride history." },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative overflow-hidden py-24">
      <div className="mx-auto max-w-6xl px-5">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55 }}
          className="text-center"
        >
          <span className="text-sm font-semibold uppercase tracking-widest text-primary-600 dark:text-primary-400">How it works</span>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">From request to ride in four steps</h2>
        </motion.div>

        <div className="relative mt-16 grid gap-10 md:grid-cols-4">
          {/* connecting line (the order here is a real sequence) */}
          <div className="absolute left-0 right-0 top-7 hidden h-0.5 bg-gradient-to-r from-primary-200 via-primary-400 to-primary-200 dark:from-primary-900 dark:via-primary-600 dark:to-primary-900 md:block" />
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="relative text-center"
            >
              <div className="relative z-10 mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-glow">
                <s.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-display font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{s.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
