import DashboardShell from "@/components/dashboard/DashboardShell";
import type { ReactNode } from "react";

export const metadata = { title: "Driver Dashboard | RideConnect" };

export default function DriverLayout({ children }: { children: ReactNode }) {
  return <DashboardShell role="driver">{children}</DashboardShell>;
}
