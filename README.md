# RideConnect — Real-Time Ride Sharing Dispatch System

A production-grade, Uber/Careem-style ride-sharing platform. Passengers request rides,
online drivers receive them instantly over WebSockets, accept with a single tap, and both
sides track the full ride lifecycle in real time. Admins oversee users, drivers, rides and
analytics.

Built with **Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS · Framer Motion ·
MongoDB/Mongoose · NextAuth (JWT) · Socket.io · React Hook Form + Zod · Recharts · Lucide**.

---

## ✨ What's implemented

- **Auth**: register (passenger & driver), login, forgot/reset password, JWT sessions,
  role-based access control, protected routes via `middleware.ts`.
- **Real-time dispatch (Socket.io)**: ride requests broadcast to online drivers; atomic
  accept (no double-booking); live status + notification pushes to passenger/driver/admin.
- **Passenger**: dashboard, request ride (4 ride types + live fare estimate), active ride
  with status timeline, ride history, notifications, profile.
- **Driver**: online/offline toggle, available requests feed, accept/reject, active ride
  controls (advance status → completed), earnings summary, history, profile.
- **Admin**: stat cards, manage users/drivers/rides, analytics (Recharts), activity logging.
- **Design**: glassmorphism, floating gradient orbs, animated counters, skeleton loaders,
  page/stagger/hover animations, dark & light mode, fully responsive, map placeholder.
- **REST APIs**: auth, rides (CRUD + lifecycle actions), drivers, admin stats, notifications,
  profile.

> Verified: `npx tsc --noEmit` passes with zero errors and `next build` compiles every route
> successfully (see "Build notes" below).

---

## 🚀 Quick start

Requirements: **Node 18.18+** and a **MongoDB** instance (local or Atlas).

```bash
# 1. Install
npm install

# 2. Configure environment
cp .env.example .env.local
#    then edit .env.local — set MONGODB_URI and a long random NEXTAUTH_SECRET
#    (generate one with:  openssl rand -base64 32)

# 3. Seed demo accounts (optional but recommended)
npm run seed

# 4. Run (custom server hosts Next.js + Socket.io in one process)
npm run dev
#    → http://localhost:3000
```

### Demo logins (after `npm run seed`)

| Role      | Email                       | Password       |
|-----------|-----------------------------|----------------|
| Admin     | admin@rideconnect.app       | Password123!   |
| Passenger | passenger@rideconnect.app   | Password123!   |
| Driver    | driver@rideconnect.app      | Password123!   |

**Try the real-time flow:** open two browsers (one passenger, one driver). Toggle the driver
**Online**, request a ride as the passenger, and watch it appear on the driver instantly →
accept → advance status → the passenger's timeline updates live.

---

## 🧱 Project structure

```
rideconnect/
├─ server.js                 # Custom Node server: Next.js + Socket.io (shared process)
├─ middleware.ts             # Route protection + role redirects
├─ app/
│  ├─ layout.tsx  page.tsx   # Root layout + animated landing page
│  ├─ providers.tsx          # Theme + Session + Socket + Toast providers
│  ├─ (auth)/                # login, register, forgot-password, reset-password
│  ├─ passenger/             # dashboard, request, active, history, notifications, profile
│  ├─ driver/                # dashboard, active, earnings, history, profile
│  ├─ admin/                 # dashboard, users, drivers, rides, analytics
│  └─ api/                   # auth · rides · drivers · admin · notifications · profile
├─ components/
│  ├─ landing/               # Navbar, Hero, Features, HowItWorks, Stats, Testimonials, FAQ, Contact, Footer
│  ├─ dashboard/             # Shell, Sidebar, Topbar, StatCard, RideCard, OnlineToggle, MapPlaceholder, ...
│  ├─ charts/                # Recharts wrappers
│  └─ ui/                    # FormField, StatusBadge, Skeletons, GradientOrbs, ThemeToggle, EmptyState
├─ context/                  # SocketContext, ToastContext
├─ hooks/                    # useCountUp, useNotifications
├─ lib/                      # db, auth, socket-server, validations, fare, utils, api-helpers
├─ models/                   # User, Ride, Notification, ActivityLog (Mongoose)
├─ types/                    # shared types + NextAuth augmentation
└─ scripts/seed.js           # demo data
```

---

## 🔌 API reference (summary)

| Method | Route                      | Role        | Purpose                                    |
|--------|----------------------------|-------------|--------------------------------------------|
| POST   | `/api/auth/register`       | public      | Register passenger or driver               |
| POST   | `/api/auth/[...nextauth]`  | public      | Login (NextAuth credentials)               |
| POST   | `/api/auth/forgot-password`| public      | Issue reset token                          |
| POST   | `/api/auth/reset-password` | public      | Set new password from token                |
| GET    | `/api/rides`               | all         | Role-aware list (`?scope=available\|active\|history`) |
| POST   | `/api/rides`               | passenger   | Create request → broadcast to drivers      |
| GET    | `/api/rides/:id`           | participant | Ride details                               |
| PUT    | `/api/rides/:id`           | driver/etc  | `accept` · `reject` · `advance` · `cancel` |
| DELETE | `/api/rides/:id`           | admin       | Remove ride                                |
| GET    | `/api/drivers`             | admin       | List drivers                               |
| GET    | `/api/admin/stats`         | admin       | Dashboard + analytics data                 |

### Ride lifecycle
`pending → driver_assigned/accepted → on_the_way → picked_up → in_progress → completed`
(plus `cancelled`). Accepts are **atomic** (`findOneAndUpdate` on `{status:"pending", driver:null}`)
so two drivers can't claim the same ride.

---

## ⚙️ Build notes & honest caveats

- **Custom server is required for Socket.io.** Always run via `npm run dev` / `npm start`
  (which run `node server.js`), *not* `next dev`. Socket.io can't attach to App-Router
  serverless handlers, so a single shared-process server is the standard pattern used here.
- **First build needs internet for fonts.** `app/layout.tsx` uses `next/font/google`
  (Space Grotesk + Inter). On a network that blocks Google Fonts, swap those two imports for
  a system-font stack — the rest of the app is unaffected.
- **Intentional stubs** (need third-party keys, out of scope for a self-contained repo):
  - *Maps*: `MapPlaceholder` is an animated placeholder. Drop in Mapbox/Google Maps with an API key.
  - *Email*: forgot-password returns the reset token in the API response for demo use instead
    of emailing it. Wire an email provider (Resend/SES) for production.
  - *Payments*: fares are computed and recorded; no payment gateway is connected.
  - *Distance/fare*: `lib/fare.ts` derives a deterministic demo distance from the location
    strings. Replace with a real distance-matrix call when you add maps.
- **Schema note**: the brief listed a separate `Driver` model; this build represents drivers
  as `User` documents with `role:"driver"` + an embedded `vehicle` sub-document. That avoids
  data duplication and keeps auth/relationships simpler. Adjust if your spec requires a
  separate collection.

---

## 🧪 Scripts

| Command         | Description                                    |
|-----------------|------------------------------------------------|
| `npm run dev`   | Dev server (Next.js + Socket.io)               |
| `npm run build` | Production build                               |
| `npm start`     | Production server                              |
| `npm run lint`  | ESLint                                         |
| `npm run seed`  | Seed admin + demo passenger/driver             |
