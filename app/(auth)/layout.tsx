import Link from "next/link";
import { Car } from "lucide-react";
import { GradientOrbs } from "@/components/ui/GradientOrbs";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-hero-grid bg-[size:42px_42px] px-4 py-10">
      <GradientOrbs />
      <div className="absolute right-5 top-5 z-10"><ThemeToggle /></div>
      <div className="relative z-10 w-full max-w-md">
        <Link href="/" className="mb-6 flex items-center justify-center gap-2 font-display text-xl font-bold">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white shadow-glow">
            <Car className="h-5 w-5" />
          </span>
          RideConnect
        </Link>
        {children}
      </div>
    </main>
  );
}
