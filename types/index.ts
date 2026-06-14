export type Role = "passenger" | "driver" | "admin";

export type RideStatus =
  | "pending"
  | "driver_assigned"
  | "accepted"
  | "on_the_way"
  | "picked_up"
  | "in_progress"
  | "completed"
  | "cancelled";

export type RideType = "economy" | "comfort" | "premium" | "bike";

export interface SessionUser {
  id: string;
  fullName: string;
  email: string;
  role: Role;
}

export interface Vehicle {
  name: string;
  number: string;
  licenseNumber: string;
}

export interface UserDTO {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  role: Role;
  isActive: boolean;
  isOnline?: boolean;
  vehicle?: Vehicle;
  rating?: number;
  totalEarnings?: number;
  createdAt: string;
}

export interface RideDTO {
  _id: string;
  passenger: UserDTO | string;
  driver?: UserDTO | string | null;
  pickupLocation: string;
  destination: string;
  rideType: RideType;
  notes?: string;
  status: RideStatus;
  fare: number;
  distanceKm: number;
  requestedAt: string;
  acceptedAt?: string;
  completedAt?: string;
  cancelledBy?: Role | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationDTO {
  _id: string;
  user: string;
  title: string;
  message: string;
  type: "ride" | "system" | "payment";
  read: boolean;
  ride?: string;
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  totalPassengers: number;
  totalDrivers: number;
  totalRides: number;
  activeRides: number;
  completedRides: number;
  cancelledRides: number;
  totalRevenue: number;
  ridesPerDay: { date: string; rides: number; revenue: number }[];
  rideTypeDistribution: { name: string; value: number }[];
  statusDistribution: { name: string; value: number }[];
}

export const RIDE_STATUS_LABELS: Record<RideStatus, string> = {
  pending: "Pending",
  driver_assigned: "Driver Assigned",
  accepted: "Accepted",
  on_the_way: "On The Way",
  picked_up: "Passenger Picked Up",
  in_progress: "Ride In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const RIDE_STATUS_FLOW: RideStatus[] = [
  "pending",
  "driver_assigned",
  "accepted",
  "on_the_way",
  "picked_up",
  "in_progress",
  "completed",
];

export const RIDE_TYPES: { id: RideType; label: string; baseFare: number; perKm: number; eta: string }[] = [
  { id: "bike", label: "Bike", baseFare: 80, perKm: 18, eta: "2 min" },
  { id: "economy", label: "Economy", baseFare: 150, perKm: 32, eta: "4 min" },
  { id: "comfort", label: "Comfort", baseFare: 220, perKm: 45, eta: "6 min" },
  { id: "premium", label: "Premium", baseFare: 400, perKm: 70, eta: "8 min" },
];
