"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { User as UserIcon, Phone, Car, Hash, Loader2, Save, Mail, BadgeCheck } from "lucide-react";
import { profileUpdateSchema, type ProfileUpdateInput } from "@/lib/validations";
import { FormField } from "@/components/ui/FormField";
import { CardSkeleton } from "@/components/ui/Skeletons";
import { useToast } from "@/context/ToastContext";
import { formatDate } from "@/lib/utils";
import type { UserDTO } from "@/types";

/** Shared profile editor for passengers and drivers. */
export default function ProfileForm({ driverFields = false }: { driverFields?: boolean }) {
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserDTO | null>(null);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileUpdateInput>({ resolver: zodResolver(profileUpdateSchema) });

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => {
        setProfile(d.user);
        reset({
          fullName: d.user.fullName,
          phone: d.user.phone,
          vehicleName: d.user.vehicle?.name ?? "",
          vehicleNumber: d.user.vehicle?.number ?? "",
        });
      });
  }, [reset]);

  const onSubmit = async (values: ProfileUpdateInput) => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? "Could not update profile.", "error");
        return;
      }
      setProfile(data.user);
      toast("Profile updated successfully.", "success");
    } finally {
      setSaving(false);
    }
  };

  if (!profile) return <CardSkeleton />;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card h-fit p-6 text-center">
        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-emerald-600 font-display text-3xl font-bold text-white shadow-xl shadow-primary-500/30">
          {profile.fullName.charAt(0).toUpperCase()}
        </span>
        <h2 className="mt-4 font-display text-xl font-bold text-slate-900 dark:text-white">
          {profile.fullName}
        </h2>
        <p className="mt-1 flex items-center justify-center gap-1.5 text-sm capitalize text-slate-500 dark:text-slate-400">
          <BadgeCheck className="h-4 w-4 text-primary-500" />
          {profile.role} account
        </p>
        <div className="mt-5 space-y-2 text-left text-sm">
          <p className="flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2.5 text-slate-600 dark:bg-white/5 dark:text-slate-300">
            <Mail className="h-4 w-4 text-slate-400" /> {profile.email}
          </p>
          <p className="flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2.5 text-slate-600 dark:bg-white/5 dark:text-slate-300">
            <Phone className="h-4 w-4 text-slate-400" /> {profile.phone}
          </p>
          {profile.vehicle && (
            <p className="flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2.5 text-slate-600 dark:bg-white/5 dark:text-slate-300">
              <Car className="h-4 w-4 text-slate-400" />
              {profile.vehicle.name} · {profile.vehicle.number}
            </p>
          )}
        </div>
        <p className="mt-4 text-xs text-slate-400">Member since {formatDate(profile.createdAt)}</p>
      </motion.div>

      <motion.form
        onSubmit={handleSubmit(onSubmit)}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="card space-y-5 p-6 sm:p-8"
      >
        <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
          Edit profile
        </h3>
        <FormField
          label="Full Name"
          icon={<UserIcon className="h-4 w-4" />}
          registration={register("fullName")}
          error={errors.fullName?.message}
        />
        <FormField
          label="Phone Number"
          icon={<Phone className="h-4 w-4" />}
          registration={register("phone")}
          error={errors.phone?.message}
        />
        {driverFields && (
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              label="Vehicle Name"
              icon={<Car className="h-4 w-4" />}
              registration={register("vehicleName")}
              error={errors.vehicleName?.message}
            />
            <FormField
              label="Vehicle Number"
              icon={<Hash className="h-4 w-4" />}
              registration={register("vehicleNumber")}
              error={errors.vehicleNumber?.message}
            />
          </div>
        )}
        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Changes
        </button>
      </motion.form>
    </div>
  );
}
