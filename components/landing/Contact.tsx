"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { useToast } from "@/context/ToastContext";

export function Contact() {
  const { toast } = useToast();
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      (e.target as HTMLFormElement).reset();
      toast("Message sent. We'll reply within one business day.", "success");
    }, 900);
  };

  return (
    <section id="contact" className="mx-auto max-w-6xl px-5 py-24">
      <div className="grid gap-10 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -28 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55 }}
        >
          <span className="text-sm font-semibold uppercase tracking-widest text-primary-600 dark:text-primary-400">Contact</span>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Talk to the RideConnect team</h2>
          <p className="mt-4 max-w-md text-slate-600 dark:text-slate-400">
            Questions about riding, driving, or partnering with us? Send a message and we&apos;ll get back to you.
          </p>
          <div className="mt-8 space-y-4 text-sm">
            <p className="flex items-center gap-3"><Mail className="h-5 w-5 text-primary-600" /> support@rideconnect.app</p>
            <p className="flex items-center gap-3"><Phone className="h-5 w-5 text-primary-600" /> +92 300 000 0000</p>
            <p className="flex items-center gap-3"><MapPin className="h-5 w-5 text-primary-600" /> Gulberg III, Lahore, Pakistan</p>
          </div>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, x: 28 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55 }}
          className="card space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <input required name="name" placeholder="Your name" className="input-base" />
            <input required type="email" name="email" placeholder="Email address" className="input-base" />
          </div>
          <input required name="subject" placeholder="Subject" className="input-base" />
          <textarea required name="message" rows={4} placeholder="How can we help?" className="input-base resize-none" />
          <button type="submit" disabled={sending} className="btn-primary w-full">
            {sending ? "Sending…" : <>Send message <Send className="h-4 w-4" /></>}
          </button>
        </motion.form>
      </div>
    </section>
  );
}
