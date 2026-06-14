import DashboardShell from "@/components/dashboard/DashboardShell";
import type { ReactNode } from "react";

export const metadata = { title: "Passenger Dashboard | RideConnect" };

export default function PassengerLayout({ children }: { children: ReactNode }) {
  return <DashboardShell role="passenger">{children}</DashboardShell>;
}
