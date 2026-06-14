"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, UserCheck, UserX, Loader2, Users } from "lucide-react";
import { ListSkeleton } from "@/components/ui/Skeletons";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/context/ToastContext";
import { formatDate, cn } from "@/lib/utils";
import type { Role, UserDTO } from "@/types";

/** Admin user/driver management table with search + activate/deactivate. */
export default function UserTable({ role }: { role: Exclude<Role, "admin"> }) {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserDTO[] | null>(null);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async (query = "") => {
    const res = await fetch(`/api/admin/users?role=${role}&q=${encodeURIComponent(query)}`);
    if (res.ok) setUsers((await res.json()).users);
  }, [role]);

  useEffect(() => {
    const t = setTimeout(() => load(q), 280);
    return () => clearTimeout(t);
  }, [q, load]);

  const toggleActive = async (user: UserDTO) => {
    setBusy(user._id);
    try {
      const res = await fetch(`/api/admin/users/${user._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? "Update failed.", "error");
        return;
      }
      setUsers((prev) => prev?.map((u) => (u._id === user._id ? data.user : u)) ?? null);
      toast(`${user.fullName} ${user.isActive ? "deactivated" : "activated"}.`, "success");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={`Search ${role}s by name or email…`}
          className="input-base pl-10"
        />
      </div>

      {users === null ? (
        <ListSkeleton />
      ) : users.length === 0 ? (
        <EmptyState
          icon={<Users className="h-6 w-6" />}
          title={`No ${role}s found`}
          message="Try a different search term."
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="card overflow-x-auto"
        >
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400 dark:border-white/5">
                <th className="px-5 py-3.5 font-medium">Name</th>
                <th className="px-5 py-3.5 font-medium">Contact</th>
                {role === "driver" && <th className="px-5 py-3.5 font-medium">Vehicle</th>}
                {role === "driver" && <th className="px-5 py-3.5 font-medium">Availability</th>}
                <th className="px-5 py-3.5 font-medium">Joined</th>
                <th className="px-5 py-3.5 font-medium">Status</th>
                <th className="px-5 py-3.5 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {users.map((u) => (
                <tr key={u._id} className="transition-colors hover:bg-slate-50/70 dark:hover:bg-white/[0.03]">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-emerald-600 text-sm font-semibold text-white">
                        {u.fullName.charAt(0)}
                      </span>
                      <span className="font-medium text-slate-900 dark:text-white">{u.fullName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">
                    <p>{u.email}</p>
                    <p className="text-xs">{u.phone}</p>
                  </td>
                  {role === "driver" && (
                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">
                      {u.vehicle ? (
                        <>
                          <p>{u.vehicle.name}</p>
                          <p className="text-xs">{u.vehicle.number}</p>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                  )}
                  {role === "driver" && (
                    <td className="px-5 py-3.5">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
                          u.isOnline
                            ? "bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-300"
                            : "bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400"
                        )}
                      >
                        <span className={cn("h-1.5 w-1.5 rounded-full", u.isOnline ? "bg-primary-500" : "bg-slate-400")} />
                        {u.isOnline ? "Online" : "Offline"}
                      </span>
                    </td>
                  )}
                  <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">{formatDate(u.createdAt)}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-semibold",
                        u.isActive
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                          : "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300"
                      )}
                    >
                      {u.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => toggleActive(u)}
                      disabled={busy === u._id}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-60",
                        u.isActive
                          ? "bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20"
                          : "bg-primary-50 text-primary-700 hover:bg-primary-100 dark:bg-primary-500/10 dark:text-primary-300 dark:hover:bg-primary-500/20"
                      )}
                    >
                      {busy === u._id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : u.isActive ? (
                        <UserX className="h-3.5 w-3.5" />
                      ) : (
                        <UserCheck className="h-3.5 w-3.5" />
                      )}
                      {u.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
}
