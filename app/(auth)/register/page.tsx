"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Phone, User, Car, CreditCard, Hash, UserPlus, Loader2 } from "lucide-react";
import { driverRegisterSchema, passengerRegisterSchema } from "@/lib/validations";
import { FormField } from "@/components/ui/FormField";
import { useToast } from "@/context/ToastContext";
import { cn } from "@/lib/utils";

type FormValues = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  vehicleName?: string;
  vehicleNumber?: string;
  licenseNumber?: string;
};

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [role, setRole] = useState<"passenger" | "driver">(
    searchParams.get("role") === "driver" ? "driver" : "passenger"
  );
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(role === "driver" ? driverRegisterSchema : passengerRegisterSchema),
  });

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, role }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast(json.error ?? "Registration failed", "error");
        return;
      }
      toast("Account created. Log in to continue.", "success");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="glass-strong rounded-3xl p-8"
    >
      <h1 className="font-display text-2xl font-bold">Create your account</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Ride in minutes — or earn behind the wheel.</p>

      {/* Role tabs */}
      <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100/80 p-1.5 dark:bg-slate-800/80">
        {(["passenger", "driver"] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={cn(
              "relative rounded-xl py-2.5 text-sm font-semibold capitalize transition-colors",
              role === r ? "text-white" : "text-slate-600 dark:text-slate-300"
            )}
          >
            {role === r && (
              <motion.span
                layoutId="role-pill"
                className="absolute inset-0 rounded-xl bg-primary-600 shadow"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <span className="relative">{r}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <FormField label="Full name" placeholder="Fatima Zara" icon={<User className="h-4 w-4" />} registration={register("fullName")} error={errors.fullName?.message} />
        <FormField label="Email" type="email" placeholder="you@example.com" icon={<Mail className="h-4 w-4" />} registration={register("email")} error={errors.email?.message} />
        <FormField label="Phone number" placeholder="+923001234567" icon={<Phone className="h-4 w-4" />} registration={register("phone")} error={errors.phone?.message} />

        <AnimatePresence initial={false}>
          {role === "driver" && (
            <motion.div
              key="driver-fields"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="space-y-4 overflow-hidden"
            >
              <FormField label="Vehicle name" placeholder="Toyota Corolla" icon={<Car className="h-4 w-4" />} registration={register("vehicleName")} error={errors.vehicleName?.message} />
              <FormField label="Vehicle number" placeholder="LEB-1234" icon={<Hash className="h-4 w-4" />} registration={register("vehicleNumber")} error={errors.vehicleNumber?.message} />
              <FormField label="License number" placeholder="DL-998877" icon={<CreditCard className="h-4 w-4" />} registration={register("licenseNumber")} error={errors.licenseNumber?.message} />
            </motion.div>
          )}
        </AnimatePresence>

        <FormField label="Password" type="password" placeholder="Min. 8 chars, 1 uppercase, 1 number" icon={<Lock className="h-4 w-4" />} registration={register("password")} error={errors.password?.message} />

        <button type="submit" disabled={loading} className="btn-primary w-full !py-3">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
          {loading ? "Creating account…" : `Sign up as ${role}`}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary-600 hover:underline dark:text-primary-400">
          Log in
        </Link>
      </p>
    </motion.div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
