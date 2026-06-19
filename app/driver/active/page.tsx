"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Navigation, ArrowRight, XCircle, Loader2, Inbox, PhoneCall, CheckCircle2 } from "lucide-react";
import RideCard from "@/components/dashboard/RideCard";
import LiveMap from "@/components/dashboard/LiveMap";
import StatusTimeline from "@/components/dashboard/StatusTimeline";
import { CardSkeleton } from "@/components/ui/Skeletons";
import { EmptyState } from "@/components/ui/EmptyState";
import { useSocket } from "@/context/SocketContext";
import { useToast } from "@/context/ToastContext";
import { RIDE_STATUS_FLOW, RIDE_STATUS_LABELS, type RideDTO, type RideStatus, type UserDTO } from "@/types";

function nextStatus(status: RideStatus): RideStatus | null {
  const i = RIDE_STATUS_FLOW.indexOf(status);
  if (i === -1 || i === RIDE_STATUS_FLOW.length - 1) return null;
  return RIDE_STATUS_FLOW[i + 1];
}

export default function DriverActiveRidePage() {
  const { socket } = useSocket();
  const { toast } = useToast();
  const [ride, setRide] = useState<RideDTO | null | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [selfCoords, setSelfCoords] = useState<[number, number] | null>(null);

  useEffect(() => {
    fetch("/api/rides?scope=active")
      .then((r) => (r.ok ? r.json() : { rides: [] }))
      .then((d) => setRide(d.rides[0] ?? null));
  }, []);

  useEffect(() => {
    if (!socket) return;
    const onUpdate = (updated: RideDTO) => {
      setRide((prev) => {
        if (!prev || updated._id !== prev._id) return prev ?? null;
        if (updated.status === "cancelled") {
          toast("The passenger cancelled this ride.", "info");
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

  // Broadcast driver GPS to passenger in real time
  useEffect(() => {
    if (!ride || !socket || !navigator.geolocation) return;
    const passenger = typeof ride.passenger === "object" ? (ride.passenger as UserDTO) : null;
    const watchId = navigator.geolocation.watchPosition(
      ({ coords }) => {
        setSelfCoords([coords.latitude, coords.longitude]);
        socket.emit("ride:location", {
          rideId: ride._id,
          passengerId: passenger?._id,
          lat: coords.latitude,
          lng: coords.longitude,
        });
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [ride?._id, socket]);

  const act = async (action: "advance" | "cancel") => {
    if (!ride) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/rides/${ride._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? "Action failed.", "error");
        return;
      }
      if (action === "cancel") {
        toast("Ride cancelled.", "info");
        setRide(null);
        return;
      }
      setRide(data.ride);
      if (data.ride.status === "completed") {
        toast("Ride completed — fare added to your earnings. 🎉", "success");
        setRide(null);
      } else {
        toast(`Status updated: ${RIDE_STATUS_LABELS[data.ride.status as RideStatus]}`, "success");
      }
    } finally {
      setBusy(false);
    }
  };

  if (ride === undefined) return <CardSkeleton />;

  if (ride === null) {
    return (
      <EmptyState
        icon={<Inbox className="h-6 w-6" />}
        title="No active ride"
        message="Accept a request from your dashboard to start a trip."
        action={
          <Link href="/driver" className="btn-primary">
            <Navigation className="h-4 w-4" /> View available requests
          </Link>
        }
      />
    );
  }

  const passenger = typeof ride.passenger === "object" ? (ride.passenger as UserDTO) : null;
  const next = nextStatus(ride.status);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <div className="space-y-5">
        <LiveMap pickup={ride.pickupLocation} destination={ride.destination} driverCoords={selfCoords} />
        <RideCard
          ride={ride}
          showPassenger
          actions={
            <>
              {next && (
                <button onClick={() => act("advance")} disabled={busy} className="btn-primary disabled:opacity-60">
                  {busy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : next === "completed" ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                  {next === "completed" ? "Complete Ride" : `Mark as ${RIDE_STATUS_LABELS[next]}`}
                </button>
              )}
              <button onClick={() => act("cancel")} disabled={busy} className="btn-danger disabled:opacity-60">
                <XCircle className="h-4 w-4" /> Cancel Ride
              </button>
            </>
          }
        />

        {passenger && (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="card p-5">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Passenger
            </h3>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-cyan-600 text-lg font-bold text-white">
                  {passenger.fullName.charAt(0)}
                </span>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{passenger.fullName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{passenger.email}</p>
                </div>
              </div>
              <a href={`tel:${passenger.phone}`} className="btn-secondary">
                <PhoneCall className="h-4 w-4" /> {passenger.phone}
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
          Trip progress
        </h3>
        <StatusTimeline status={ride.status} />
      </motion.div>
    </div>
  );
}
