"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Navigation, StickyNote, Loader2, Zap, Car, Bike, Crown, Armchair } from "lucide-react";
import { rideRequestSchema, type RideRequestInput } from "@/lib/validations";
import { estimateDistanceKm, calculateFare } from "@/lib/fare";
import { FormField } from "@/components/ui/FormField";
import MapPlaceholder from "@/components/dashboard/MapPlaceholder";
import { useToast } from "@/context/ToastContext";
import { formatCurrency, cn } from "@/lib/utils";
import { RIDE_TYPES, type RideType } from "@/types";

const TYPE_ICONS: Record<RideType, React.ElementType> = {
  bike: Bike,
  economy: Car,
  comfort: Armchair,
  premium: Crown,
};

export default function RequestRidePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RideRequestInput>({
    resolver: zodResolver(rideRequestSchema),
    defaultValues: { rideType: "economy", pickupLocation: "", destination: "", notes: "" },
  });

  const [pickup, destination, rideType] = [watch("pickupLocation"), watch("destination"), watch("rideType")];

  const estimate = useMemo(() => {
    if (!pickup?.trim() || !destination?.trim()) return null;
    const km = estimateDistanceKm(pickup, destination);
    return { km, fare: calculateFare(rideType, km) };
  }, [pickup, destination, rideType]);

  const onSubmit = async (values: RideRequestInput) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/rides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? "Could not create ride request.", "error");
        return;
      }
      toast("Ride requested! Broadcasting to online drivers…", "success");
      router.push("/passenger/active");
    } catch {
      toast("Network error. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      <motion.form
        onSubmit={handleSubmit(onSubmit)}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="card space-y-5 p-6 sm:p-8"
      >
        <div>
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
            Where are you going?
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Fill in your trip details and we&apos;ll dispatch it to all online drivers instantly.
          </p>
        </div>

        <FormField
          label="Pickup Location"
          placeholder="e.g. Liberty Market, Gulberg"
          icon={<MapPin className="h-4 w-4" />}
          registration={register("pickupLocation")}
          error={errors.pickupLocation?.message}
        />
        <FormField
          label="Destination"
          placeholder="e.g. Allama Iqbal International Airport"
          icon={<Navigation className="h-4 w-4" />}
          registration={register("destination")}
          error={errors.destination?.message}
        />

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Ride Type</label>
          <input type="hidden" {...register("rideType")} />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {RIDE_TYPES.map((t) => {
              const Icon = TYPE_ICONS[t.id];
              const selected = rideType === t.id;
              return (
                <motion.button
                  type="button"
                  key={t.id}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setValue("rideType", t.id, { shouldValidate: true })}
                  className={cn(
                    "relative flex flex-col items-center gap-1.5 rounded-2xl border p-3.5 text-center transition-colors",
                    selected
                      ? "border-primary-500 bg-primary-50 dark:border-primary-500/60 dark:bg-primary-500/10"
                      : "border-slate-200 hover:border-primary-300 dark:border-white/10 dark:hover:border-primary-500/40"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5",
                      selected ? "text-primary-600 dark:text-primary-400" : "text-slate-500 dark:text-slate-400"
                    )}
                  />
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">{t.label}</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    ₨{t.baseFare} + ₨{t.perKm}/km
                  </span>
                  <span className="text-[10px] text-primary-600 dark:text-primary-400">~{t.eta} away</span>
                </motion.button>
              );
            })}
          </div>
          {errors.rideType && <p className="text-xs font-medium text-rose-500">{errors.rideType.message}</p>}
        </div>

        <FormField
          label="Notes (optional)"
          placeholder="e.g. I'm waiting near the main gate, white shirt"
          icon={<StickyNote className="h-4 w-4" />}
          as="textarea"
          registration={register("notes")}
          error={errors.notes?.message}
        />

        <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-60">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
          {submitting ? "Dispatching…" : "Submit Ride Request"}
        </button>
      </motion.form>

      <div className="space-y-5">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <MapPlaceholder
            pickup={pickup?.trim() ? pickup : undefined}
            destination={destination?.trim() ? destination : undefined}
          />
        </motion.div>

        <AnimatePresence>
          {estimate && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              className="card p-6"
            >
              <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Fare Estimate
              </h3>
              <div className="mt-3 flex items-end justify-between">
                <div>
                  <p className="font-display text-3xl font-bold text-slate-900 dark:text-white">
                    {formatCurrency(estimate.fare)}
                  </p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Estimated distance · {estimate.km} km
                  </p>
                </div>
                <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 dark:bg-primary-500/10 dark:text-primary-300">
                  {RIDE_TYPES.find((t) => t.id === rideType)?.label}
                </span>
              </div>
              <p className="mt-4 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500 dark:bg-white/5 dark:text-slate-400">
                Final fare is confirmed when the ride completes. No payment is taken at booking.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
