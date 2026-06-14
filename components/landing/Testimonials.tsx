"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sana R.",
    role: "Daily commuter, Lahore",
    text: "The driver accepted before I had even put my phone down. Status updates the whole way — I never wonder where my ride is.",
  },
  {
    name: "Bilal K.",
    role: "Driver partner",
    text: "Requests appear the second a passenger books. The online toggle means I only get pinged when I actually want trips.",
  },
  {
    name: "Mehak A.",
    role: "University student",
    text: "Fare shown up front, history saved, and cancelling a request takes one tap. Easily the smoothest booking flow I've used.",
  },
];

export function Testimonials() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.55 }}
        className="text-center"
      >
        <span className="text-sm font-semibold uppercase tracking-widest text-primary-600 dark:text-primary-400">Testimonials</span>
        <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Riders and drivers, in their words</h2>
      </motion.div>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {testimonials.map((t, i) => (
          <motion.figure
            key={t.name}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.12 }}
            whileHover={{ y: -5 }}
            className="card"
          >
            <div className="flex gap-1 text-amber-400">
              {Array.from({ length: 5 }).map((_, s) => (
                <Star key={s} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <blockquote className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              &ldquo;{t.text}&rdquo;
            </blockquote>
            <figcaption className="mt-5 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-600/10 font-display font-bold text-primary-600 dark:text-primary-400">
                {t.name[0]}
              </span>
              <div>
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t.role}</p>
              </div>
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  );
}
