"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Mail, Loader2, KeyRound } from "lucide-react";
import { forgotPasswordSchema } from "@/lib/validations";
import { FormField } from "@/components/ui/FormField";
import { useToast } from "@/context/ToastContext";
import { z } from "zod";

type Values = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [devLink, setDevLink] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (data: Values) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      toast(json.message ?? "Request received", res.ok ? "success" : "error");
      if (json.devResetUrl) setDevLink(json.devResetUrl);
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
      <h1 className="font-display text-2xl font-bold">Forgot password</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Enter your account email and we&apos;ll generate a reset link.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4">
        <FormField label="Email" type="email" placeholder="you@example.com" icon={<Mail className="h-4 w-4" />} registration={register("email")} error={errors.email?.message} />
        <button type="submit" disabled={loading} className="btn-primary w-full !py-3">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
          {loading ? "Sending…" : "Send reset link"}
        </button>
      </form>

      {devLink && (
        <div className="mt-5 rounded-xl bg-primary-50 p-4 text-xs dark:bg-primary-500/10">
          <p className="font-semibold text-primary-700 dark:text-primary-400">Development mode — reset link:</p>
          <Link href={devLink} className="break-all text-primary-600 underline dark:text-primary-300">{devLink}</Link>
        </div>
      )}

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        Remembered it?{" "}
        <Link href="/login" className="font-semibold text-primary-600 hover:underline dark:text-primary-400">Log in</Link>
      </p>
    </motion.div>
  );
}
