"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import { GradientOrbs } from "@/components/ui/GradientOrbs";
import type { Role } from "@/types";
import type { ReactNode } from "react";

const TITLES: Record<string, string> = {
  "/passenger": "Passenger Overview",
  "/passenger/request": "Request a Ride",
  "/passenger/active": "Active Ride",
  "/passenger/history": "Ride History",
  "/passenger/notifications": "Notifications",
  "/passenger/profile": "Profile",
  "/driver": "Available Ride Requests",
  "/driver/active": "Active Ride",
  "/driver/history": "Ride History",
  "/driver/earnings": "Earnings Summary",
  "/driver/profile": "Profile",
  "/admin": "Admin Overview",
  "/admin/users": "Manage Users",
  "/admin/drivers": "Manage Drivers",
  "/admin/rides": "Manage Rides",
  "/admin/analytics": "Analytics & Reports",
};

export default function DashboardShell({ role, children }: { role: Role; children: ReactNode }) {
  const pathname = usePathname();
  const title = TITLES[pathname] ?? "Dashboard";

  return (
    <div className="relative min-h-screen bg-background dark:bg-slate-950">
      <GradientOrbs />
      <Sidebar role={role} />
      <div className="relative lg:pl-64">
        <Topbar title={title} role={role} />
        <AnimatePresence mode="wait">
          <motion.main
            key={pathname}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8"
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  );
}
