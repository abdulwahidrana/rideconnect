"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Lock, Loader2, ShieldCheck } from "lucide-react";
import { resetPasswordSchema } from "@/lib/validations";
import { FormField } from "@/components/ui/FormField";
import { useToast } from "@/context/ToastContext";
import { z } from "zod";

type Values = z.infer<typeof resetPasswordSchema>;

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token },
  });

  const onSubmit = async (data: Values) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        toast(json.error ?? "Reset failed", "error");
        return;
      }
      toast(json.message, "success");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-strong rounded-3xl p-8"
    >
      <h1 className="font-display text-2xl font-bold">Set a new password</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Choose a strong password you haven&apos;t used before.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4">
        <input type="hidden" {...register("token")} />
        <FormField label="New password" type="password" placeholder="••••••••" icon={<Lock className="h-4 w-4" />} registration={register("password")} error={errors.password?.message} />
        <FormField label="Confirm password" type="password" placeholder="••••••••" icon={<Lock className="h-4 w-4" />} registration={register("confirmPassword")} error={errors.confirmPassword?.message} />
        <button type="submit" disabled={loading || !token} className="btn-primary w-full !py-3">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
          {loading ? "Updating…" : "Update password"}
        </button>
        {!token && <p className="text-center text-xs text-rose-500">This page needs a valid reset link. Request one from the forgot password page.</p>}
      </form>

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        <Link href="/login" className="font-semibold text-primary-600 hover:underline dark:text-primary-400">Back to login</Link>
      </p>
    </motion.div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  );
}
