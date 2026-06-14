"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  Car,
  LayoutDashboard,
  PlusCircle,
  Navigation,
  History,
  User,
  Bell,
  LogOut,
  Wallet,
  Users,
  ShieldCheck,
  BarChart3,
  Route,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@/types";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const NAV: Record<Role, NavItem[]> = {
  passenger: [
    { href: "/passenger", label: "Overview", icon: LayoutDashboard },
    { href: "/passenger/request", label: "Request Ride", icon: PlusCircle },
    { href: "/passenger/active", label: "Active Ride", icon: Navigation },
    { href: "/passenger/history", label: "Ride History", icon: History },
    { href: "/passenger/notifications", label: "Notifications", icon: Bell },
    { href: "/passenger/profile", label: "Profile", icon: User },
  ],
  driver: [
    { href: "/driver", label: "Available Rides", icon: LayoutDashboard },
    { href: "/driver/active", label: "Active Ride", icon: Navigation },
    { href: "/driver/history", label: "Ride History", icon: History },
    { href: "/driver/earnings", label: "Earnings", icon: Wallet },
    { href: "/driver/profile", label: "Profile", icon: User },
  ],
  admin: [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/users", label: "Manage Users", icon: Users },
    { href: "/admin/drivers", label: "Manage Drivers", icon: ShieldCheck },
    { href: "/admin/rides", label: "Manage Rides", icon: Route },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  ],
};

export default function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const items = NAV[role];

  const content = (
    <div className="flex h-full flex-col">
      <Link href="/" className="flex items-center gap-2.5 px-5 py-6">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-lg shadow-primary-500/30">
          <Car className="h-5 w-5" />
        </span>
        <span className="font-display text-lg font-bold text-slate-900 dark:text-white">
          Ride<span className="text-primary-600 dark:text-primary-400">Connect</span>
        </span>
      </Link>

      <nav className="flex-1 space-y-1 px-3">
        {items.map((item) => {
          const active =
            item.href === `/${role}` ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "text-primary-700 dark:text-primary-300"
                  : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
              )}
            >
              {active && (
                <motion.span
                  layoutId={`sidebar-active-${role}`}
                  className="absolute inset-0 rounded-xl bg-primary-50 ring-1 ring-primary-200 dark:bg-primary-500/10 dark:ring-primary-500/30"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <item.icon className="relative z-10 h-[18px] w-[18px]" />
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200/70 p-4 dark:border-white/10">
        <div className="mb-3 flex items-center gap-3 px-1">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-emerald-600 text-sm font-semibold text-white">
            {session?.user?.name?.charAt(0).toUpperCase() ?? "U"}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
              {session?.user?.name}
            </p>
            <p className="truncate text-xs capitalize text-slate-500 dark:text-slate-400">{role}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="glass fixed left-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-xl lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5 text-slate-700 dark:text-slate-200" />
      </button>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200/70 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60 lg:block">
        {content}
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 lg:hidden"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
