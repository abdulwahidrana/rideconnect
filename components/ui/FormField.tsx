"use client";

import { type ReactNode } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  error?: string;
  icon?: ReactNode;
  type?: string;
  placeholder?: string;
  registration: UseFormRegisterReturn;
  as?: "input" | "textarea";
  rows?: number;
}

export function FormField({
  label,
  error,
  icon,
  type = "text",
  placeholder,
  registration,
  as = "input",
  rows = 3,
}: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </span>
        )}
        {as === "textarea" ? (
          <textarea
            rows={rows}
            placeholder={placeholder}
            className={cn("input-base resize-none", icon ? "pl-10" : "", error && "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20")}
            {...registration}
          />
        ) : (
          <input
            type={type}
            placeholder={placeholder}
            className={cn("input-base", icon ? "pl-10" : "", error && "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20")}
            {...registration}
          />
        )}
      </div>
      {error && <p className="text-xs font-medium text-rose-500">{error}</p>}
    </div>
  );
}
