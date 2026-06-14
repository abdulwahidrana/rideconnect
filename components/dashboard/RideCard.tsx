"use client";

import { motion } from "framer-motion";
import { MapPin, Navigation, Clock, Banknote, Route, StickyNote } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { RIDE_TYPES, type RideDTO, type UserDTO } from "@/types";
import type { ReactNode } from "react";

function person(p: RideDTO["passenger"] | RideDTO["driver"]): UserDTO | null {
  return typeof p === "object" && p !== null ? (p as UserDTO) : null;
}

export default function RideCard({
  ride,
  actions,
  showPassenger,
  showDriver,
  delay = 0,
}: {
  ride: RideDTO;
  actions?: ReactNode;
  showPassenger?: boolean;
  showDriver?: boolean;
  delay?: number;
}) {
  const passenger = person(ride.passenger);
  const driver = person(ride.driver ?? null);
  const typeLabel = RIDE_TYPES.find((t) => t.id === ride.rideType)?.label ?? ride.rideType;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.35, delay }}
      className="card p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <StatusBadge status={ride.status} />
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-white/5 dark:text-slate-300">
            {typeLabel}
          </span>
        </div>
        <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Clock className="h-3.5 w-3.5" />
          {formatDate(ride.requestedAt ?? ride.createdAt)}
        </p>
      </div>

      <div className="mt-4 space-y-2.5">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
            <MapPin className="h-3.5 w-3.5" />
          </span>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Pickup</p>
            <p className="text-sm font-medium text-slate-900 dark:text-white">{ride.pickupLocation}</p>
          </div>
        </div>
        <div className="ml-3 h-4 w-px border-l-2 border-dashed border-slate-300 dark:border-white/15" />
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200">
            <Navigation className="h-3.5 w-3.5" />
          </span>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Destination</p>
            <p className="text-sm font-medium text-slate-900 dark:text-white">{ride.destination}</p>
          </div>
        </div>
      </div>

      {ride.notes && (
        <p className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
          <StickyNote className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {ride.notes}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-100 pt-4 text-sm dark:border-white/5">
        <span className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
          <Banknote className="h-4 w-4 text-primary-500" />
          {formatCurrency(ride.fare)}
        </span>
        <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
          <Route className="h-4 w-4" />
          {ride.distanceKm} km
        </span>
        {showPassenger && passenger && (
          <span className="text-slate-500 dark:text-slate-400">
            Passenger: <span className="font-medium text-slate-800 dark:text-slate-200">{passenger.fullName}</span>
            {passenger.phone ? ` · ${passenger.phone}` : ""}
          </span>
        )}
        {showDriver && driver && (
          <span className="text-slate-500 dark:text-slate-400">
            Driver: <span className="font-medium text-slate-800 dark:text-slate-200">{driver.fullName}</span>
            {driver.vehicle ? ` · ${driver.vehicle.name} (${driver.vehicle.number})` : ""}
          </span>
        )}
      </div>

      {actions && <div className="mt-4 flex flex-wrap gap-2">{actions}</div>}
    </motion.div>
  );
}
