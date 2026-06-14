import DashboardShell from "@/components/dashboard/DashboardShell";
import type { ReactNode } from "react";

export const metadata = { title: "Admin Dashboard | RideConnect" };

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <DashboardShell role="admin">{children}</DashboardShell>;
}
