import type { Role } from "@/types";

// Client-safe constants. MUST NOT import anything server-only
// (no mongoose models, db, bcrypt, or NextAuth options).
export const ROLE_HOME: Record<Role, string> = {
  passenger: "/passenger",
  driver: "/driver",
  admin: "/admin",
};