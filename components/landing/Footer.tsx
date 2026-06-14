import Link from "next/link";
import { Car } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200/70 dark:border-slate-800">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white">
              <Car className="h-5 w-5" />
            </span>
            RideConnect
          </Link>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Real-time ride dispatch for passengers and drivers — fast, tracked, secure.
          </p>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold uppercase tracking-wide">Platform</h4>
          <ul className="mt-4 space-y-2 text-sm text-slate-500 dark:text-slate-400">
            <li><a href="#features" className="hover:text-primary-600">Features</a></li>
            <li><a href="#how-it-works" className="hover:text-primary-600">How it works</a></li>
            <li><a href="#faq" className="hover:text-primary-600">FAQ</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold uppercase tracking-wide">Accounts</h4>
          <ul className="mt-4 space-y-2 text-sm text-slate-500 dark:text-slate-400">
            <li><Link href="/register" className="hover:text-primary-600">Ride with us</Link></li>
            <li><Link href="/register?role=driver" className="hover:text-primary-600">Drive with us</Link></li>
            <li><Link href="/login" className="hover:text-primary-600">Log in</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold uppercase tracking-wide">Contact</h4>
          <ul className="mt-4 space-y-2 text-sm text-slate-500 dark:text-slate-400">
            <li>support@rideconnect.app</li>
            <li>+92 300 000 0000</li>
            <li>Lahore, Pakistan</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-200/70 py-5 text-center text-xs text-slate-400 dark:border-slate-800">
        © {new Date().getFullYear()} RideConnect. All rights reserved.
      </div>
    </footer>
  );
}
