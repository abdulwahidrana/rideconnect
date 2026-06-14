"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Navigation, PlusCircle, XCircle, Loader2, PhoneCall, Star } from "lucide-react";
import RideCard from "@/components/dashboard/RideCard";
import MapPlaceholder from "@/components/dashboard/MapPlaceholder";
import StatusTimeline from "@/components/dashboard/StatusTimeline";
import { CardSkeleton } from "@/components/ui/Skeletons";
import { EmptyState } from "@/components/ui/EmptyState";
import { useSocket } from "@/context/SocketContext";
import { useToast } from "@/context/ToastContext";
import type { RideDTO, UserDTO } from "@/types";

export default function PassengerActiveRidePage() {
  const { socket } = useSocket();
  const { toast } = useToast();
  const [ride, setRide] = useState<RideDTO | null | undefined>(undefined);
  const [cancelling, setCancelling] = useState(false);

  const load = async () => {
    const res = await fetch("/api/rides?scope=active");
    if (res.ok) {
      const data = await res.json();
      setRide(data.rides[0] ?? null);
    } else setRide(null);
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const onUpdate = (updated: RideDTO) => {
      setRide((prev) => {
        if (prev === undefined || prev === null) return prev ?? null;
        if (updated._id !== prev._id) return prev;
        if (["completed", "cancelled"].includes(updated.status)) {
          toast(
            updated.status === "completed"
              ? "Ride completed. Thanks for riding with RideConnect!"
              : "This ride was cancelled.",
            updated.status === "completed" ? "success" : "info"
          );
          return null;
        }
        return updated;
      });
    };
    socket.on("ride:update", onUpdate);
    return () => {
      socket.off("ride:update", onUpdate);
    };
  }, [socket, toast]);

  const cancelRide = async () => {
    if (!ride) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/rides/${ride._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? "Could not cancel ride.", "error");
        return;
      }
      toast("Ride request cancelled.", "info");
      setRide(null);
    } finally {
      setCancelling(false);
    }
  };

  if (ride === undefined) return <CardSkeleton />;

  if (ride === null) {
    return (
      <EmptyState
        icon={<Navigation className="h-6 w-6" />}
        title="No active ride"
        message="You don't have a ride in progress right now. Request one and watch it update live here."
        action={
          <Link href="/passenger/request" className="btn-primary">
            <PlusCircle className="h-4 w-4" /> Request a Ride
          </Link>
        }
      />
    );
  }

  const driver = typeof ride.driver === "object" && ride.driver ? (ride.driver as UserDTO) : null;
  const cancellable = ["pending", "driver_assigned", "accepted"].includes(ride.status);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <div className="space-y-5">
        <MapPlaceholder pickup={ride.pickupLocation} destination={ride.destination} />
        <RideCard
          ride={ride}
          showDriver
          actions={
            cancellable ? (
              <button onClick={cancelRide} disabled={cancelling} className="btn-danger disabled:opacity-60">
                {cancelling ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                Cancel Ride Request
              </button>
            ) : undefined
          }
        />

        {ride.status === "pending" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card flex items-center gap-4 p-5"
          >
            <span className="relative flex h-10 w-10 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400/40" />
              <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary-500 text-white">
                <Navigation className="h-5 w-5" />
              </span>
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Searching for nearby drivers…
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your request has been broadcast to every online driver. You&apos;ll be notified the
                moment one accepts.
              </p>
            </div>
          </motion.div>
        )}

        {driver && (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="card p-5">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Your Driver
            </h3>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-emerald-600 text-lg font-bold text-white">
                  {driver.fullName.charAt(0)}
                </span>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{driver.fullName}</p>
                  <p className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    {(driver.rating ?? 5).toFixed(1)} ·{" "}
                    {driver.vehicle ? `${driver.vehicle.name} · ${driver.vehicle.number}` : "Vehicle on file"}
                  </p>
                </div>
              </div>
              <a href={`tel:${driver.phone}`} className="btn-secondary">
                <PhoneCall className="h-4 w-4" /> {driver.phone}
              </a>
            </div>
          </motion.div>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="card h-fit p-6"
      >
        <h3 className="mb-5 font-display text-lg font-semibold text-slate-900 dark:text-white">
          Live ride progress
        </h3>
        <StatusTimeline status={ride.status} />
      </motion.div>
    </div>
  );
}
