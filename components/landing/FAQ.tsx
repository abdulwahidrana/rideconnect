"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "How fast will a driver accept my ride?",
    a: "Your request is broadcast to every online driver the moment you submit it. In busy areas a driver usually accepts within seconds; you'll see the status flip to 'Driver Assigned' live, without refreshing.",
  },
  {
    q: "Can I cancel a ride after requesting it?",
    a: "Yes. You can cancel while the ride is pending or before pickup from the Active Ride screen. The driver is notified instantly and the request is removed from the dispatch pool.",
  },
  {
    q: "How is the fare calculated?",
    a: "Fare = base fare for your ride type + a per-kilometre rate over the estimated distance. The exact amount is shown before you confirm, so there are no surprises at drop-off.",
  },
  {
    q: "How do I become a driver?",
    a: "Register with the Driver option and add your vehicle name, vehicle number, and license number. Once approved, flip the Online toggle on your dashboard to start receiving requests.",
  },
  {
    q: "Is my data secure?",
    a: "Passwords are hashed with bcrypt, sessions use signed JWTs, and every dashboard route is protected by role-based access control. Drivers never see your account details — only trip information.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="mx-auto max-w-3xl px-5 py-24">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.55 }}
        className="text-center"
      >
        <span className="text-sm font-semibold uppercase tracking-widest text-primary-600 dark:text-primary-400">FAQ</span>
        <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Questions, answered</h2>
      </motion.div>

      <div className="mt-12 space-y-3">
        {faqs.map((f, i) => (
          <motion.div
            key={f.q}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            className="glass overflow-hidden rounded-2xl"
          >
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center justify-between gap-4 p-5 text-left"
              aria-expanded={open === i}
            >
              <span className="font-display font-semibold">{f.q}</span>
              <ChevronDown className={cn("h-5 w-5 shrink-0 text-primary-600 transition-transform duration-300", open === i && "rotate-180")} />
            </button>
            <AnimatePresence initial={false}>
              {open === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <p className="px-5 pb-5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{f.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
