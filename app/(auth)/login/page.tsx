"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn, Loader2 } from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { FormField } from "@/components/ui/FormField";
import { ROLE_HOME } from "@/lib/routes";
import { useToast } from "@/context/ToastContext";
import type { Role } from "@/types";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    const res = await signIn("credentials", { ...data, redirect: false });
    if (res?.error) {
      toast(res.error, "error");
      setLoading(false);
      return;
    }
    const session = await getSession();
    const role = session?.user?.role as Role | undefined;
    toast("Welcome back!", "success");
    router.push(searchParams.get("callbackUrl") ?? (role ? ROLE_HOME[role] : "/"));
    router.refresh();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="glass-strong rounded-3xl p-8"
    >
      <h1 className="font-display text-2xl font-bold">Log in</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Pick up where you left off.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4">
        <FormField label="Email" type="email" placeholder="you@example.com" icon={<Mail className="h-4 w-4" />} registration={register("email")} error={errors.email?.message} />
        <FormField label="Password" type="password" placeholder="••••••••" icon={<Lock className="h-4 w-4" />} registration={register("password")} error={errors.password?.message} />

        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-xs font-semibold text-primary-600 hover:underline dark:text-primary-400">
            Forgot password?
          </Link>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full !py-3">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        New to RideConnect?{" "}
        <Link href="/register" className="font-semibold text-primary-600 hover:underline dark:text-primary-400">
          Create an account
        </Link>
      </p>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
