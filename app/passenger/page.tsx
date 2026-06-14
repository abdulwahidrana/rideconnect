"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { PlusCircle, Navigation, History, CheckCircle2, Banknote, Route } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import RideCard from "@/components/dashboard/RideCard";
import MapPlaceholder from "@/components/dashboard/MapPlaceholder";
import { CardSkeleton } from "@/components/ui/Skeletons";
import { EmptyState } from "@/components/ui/EmptyState";
import { useSocket } from "@/context/SocketContext";
import type { RideDTO } from "@/types";

export default function PassengerOverview() {
  const { data: session } = useSession();
  const { socket } = useSocket();
  const [rides, setRides] = useState<RideDTO[] | null>(null);

  const load = async () => {
    const res = await fetch("/api/rides");
    if (res.ok) setRides((await res.json()).rides);
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const onUpdate = () => load();
    socket.on("ride:update", onUpdate);
    return () => {
      socket.off("ride:update", onUpdate);
    };
  }, [socket]);

  const completed = rides?.filter((r) => r.status === "completed") ?? [];
  const active = rides?.find((r) => !["completed", "cancelled"].includes(r.status));
  const totalSpent = completed.reduce((s, r) => s + r.fare, 0);
  const totalKm = Math.round(completed.reduce((s, r) => s + r.distanceKm, 0));

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="card relative overflow-hidden p-6 sm:p-8"
      >
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary-500/10 blur-2xl" />
        <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          Welcome back, {session?.user?.name?.split(" ")[0]} 👋
        </h2>
        <p className="mt-1.5 max-w-lg text-sm text-slate-500 dark:text-slate-400">
          Need to get somewhere? Request a ride and our dispatch system will connect you with the
          nearest online driver in real time.
        </p>
        <Link href="/passenger/request" className="btn-primary mt-5 inline-flex">
          <PlusCircle className="h-4 w-4" />
          Request a Ride
        </Link>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Rides" value={rides?.length ?? 0} icon={History} delay={0.05} />
        <StatCard label="Completed" value={completed.length} icon={CheckCircle2} accent="sky" delay={0.1} />
        <StatCard label="Total Spent" value={totalSpent} prefix="₨ " icon={Banknote} accent="violet" delay={0.15} />
        <StatCard label="Distance Travelled" value={totalKm} suffix=" km" icon={Route} accent="amber" delay={0.2} />
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
            {active ? "Your active ride" : "Recent rides"}
          </h3>
          <Link
            href={active ? "/passenger/active" : "/passenger/history"}
            className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-400"
          >
            View {active ? "details" : "all"}
          </Link>
        </div>

        {rides === null ? (
          <CardSkeleton />
        ) : active ? (
          <div className="grid gap-5 lg:grid-cols-2">
            <RideCard ride={active} showDriver />
            <MapPlaceholder pickup={active.pickupLocation} destination={active.destination} />
          </div>
        ) : rides.length === 0 ? (
          <EmptyState
            icon={<Navigation className="h-6 w-6" />}
            title="No rides yet"
            message="Your ride history will appear here once you book your first trip."
            action={
              <Link href="/passenger/request" className="btn-primary">
                <PlusCircle className="h-4 w-4" /> Book your first ride
              </Link>
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {rides.slice(0, 4).map((r, i) => (
              <RideCard key={r._id} ride={r} showDriver delay={i * 0.06} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
