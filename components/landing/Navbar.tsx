"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Car, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useSession } from "next-auth/react";
import { ROLE_HOME } from "@/lib/routes";

const links = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#stats", label: "Stats" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "Contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const dashboardHref = session?.user?.role ? ROLE_HOME[session.user.role] : "/login";

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <nav className="glass-strong mx-auto mt-4 flex max-w-6xl items-center justify-between rounded-2xl px-5 py-3">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white shadow-glow">
            <Car className="h-5 w-5" />
          </span>
          RideConnect
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-medium text-slate-600 transition-colors hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400">
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          {session ? (
            <Link href={dashboardHref} className="btn-primary !py-2">Dashboard</Link>
          ) : (
            <>
              <Link href="/login" className="btn-secondary !py-2">Log in</Link>
              <Link href="/register" className="btn-primary !py-2">Get started</Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button onClick={() => setOpen(!open)} className="glass flex h-9 w-9 items-center justify-center rounded-xl" aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="glass-strong mx-auto mt-2 max-w-6xl rounded-2xl p-5 md:hidden"
          >
            <div className="flex flex-col gap-4">
              {links.map((l) => (
                <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-sm font-medium">
                  {l.label}
                </a>
              ))}
              <div className="flex gap-3 pt-2">
                {session ? (
                  <Link href={dashboardHref} className="btn-primary flex-1">Dashboard</Link>
                ) : (
                  <>
                    <Link href="/login" className="btn-secondary flex-1">Log in</Link>
                    <Link href="/register" className="btn-primary flex-1">Get started</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
