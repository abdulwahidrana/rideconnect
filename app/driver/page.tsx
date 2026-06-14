"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { Inbox, Check, X, Loader2, Navigation } from "lucide-react";
import RideCard from "@/components/dashboard/RideCard";
import OnlineToggle from "@/components/dashboard/OnlineToggle";
import { ListSkeleton } from "@/components/ui/Skeletons";
import { EmptyState } from "@/components/ui/EmptyState";
import { useSocket } from "@/context/SocketContext";
import { useToast } from "@/context/ToastContext";
import type { RideDTO } from "@/types";

export default function DriverDashboardPage() {
  const { socket } = useSocket();
  const { toast } = useToast();
  const [requests, setRequests] = useState<RideDTO[] | null>(null);
  const [activeRide, setActiveRide] = useState<RideDTO | null>(null);
  const [rejected, setRejected] = useState<Set<string>>(new Set());
  const [acting, setActing] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [availableRes, activeRes] = await Promise.all([
      fetch("/api/rides?scope=available"),
      fetch("/api/rides?scope=active"),
    ]);
    if (availableRes.ok) setRequests((await availableRes.json()).rides);
    if (activeRes.ok) setActiveRide((await activeRes.json()).rides[0] ?? null);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!socket) return;
    const onNew = (ride: RideDTO) => {
      setRequests((prev) => (prev ? [ride, ...prev.filter((r) => r._id !== ride._id)] : [ride]));
      toast("New ride request nearby!", "info");
    };
    const onTaken = ({ rideId }: { rideId: string }) => {
      setRequests((prev) => (prev ? prev.filter((r) => r._id !== rideId) : prev));
    };
    socket.on("ride:new", onNew);
    socket.on("ride:taken", onTaken);
    return () => {
      socket.off("ride:new", onNew);
      socket.off("ride:taken", onTaken);
    };
  }, [socket, toast]);

  const accept = async (ride: RideDTO) => {
    setActing(ride._id);
    try {
      const res = await fetch(`/api/rides/${ride._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accept" }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? "This ride is no longer available.", "error");
        setRequests((prev) => (prev ? prev.filter((r) => r._id !== ride._id) : prev));
        return;
      }
      toast("Ride accepted! The passenger has been notified.", "success");
      setRequests((prev) => (prev ? prev.filter((r) => r._id !== ride._id) : prev));
      setActiveRide(data.ride);
    } finally {
      setActing(null);
    }
  };

  const reject = (rideId: string) => {
    setRejected((prev) => new Set(prev).add(rideId));
    toast("Request hidden from your queue.", "info");
  };

  const visible = (requests ?? []).filter((r) => !rejected.has(r._id));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <OnlineToggle onChange={(isOnline) => isOnline && load()} />
        {activeRide && (
          <Link href="/driver/active" className="btn-primary">
            <Navigation className="h-4 w-4" /> Go to active ride
          </Link>
        )}
      </div>

      {activeRide && (
        <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30">
          You have an active ride in progress. Complete or cancel it before accepting a new request.
        </p>
      )}

      {requests === null ? (
        <ListSkeleton />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={<Inbox className="h-6 w-6" />}
          title="No pending requests"
          message="Stay online — new ride requests from passengers will appear here instantly."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <AnimatePresence>
            {visible.map((r) => (
              <RideCard
                key={r._id}
                ride={r}
                showPassenger
                actions={
                  <>
                    <button
                      onClick={() => accept(r)}
                      disabled={acting === r._id || Boolean(activeRide)}
                      className="btn-primary disabled:opacity-60"
                    >
                      {acting === r._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      Accept Ride
                    </button>
                    <button onClick={() => reject(r._id)} className="btn-secondary">
                      <X className="h-4 w-4" /> Reject
                    </button>
                  </>
                }
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
