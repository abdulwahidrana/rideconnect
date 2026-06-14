import { z } from "zod";

const phoneRegex = /^\+?[0-9]{10,15}$/;

export const passengerRegisterSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters").max(60),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().regex(phoneRegex, "Enter a valid phone number (10-15 digits)"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Include at least one uppercase letter")
    .regex(/[0-9]/, "Include at least one number"),
});

export const driverRegisterSchema = passengerRegisterSchema.extend({
  vehicleName: z.string().min(2, "Vehicle name is required").max(60),
  vehicleNumber: z.string().min(3, "Vehicle number is required").max(20),
  licenseNumber: z.string().min(4, "License number is required").max(30),
});

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Include at least one uppercase letter")
      .regex(/[0-9]/, "Include at least one number"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const rideRequestSchema = z.object({
  pickupLocation: z.string().min(3, "Pickup location is required").max(160),
  destination: z.string().min(3, "Destination is required").max(160),
  rideType: z.enum(["bike", "economy", "comfort", "premium"]),
  notes: z.string().max(300, "Notes must be under 300 characters").optional().or(z.literal("")),
});

export const profileUpdateSchema = z.object({
  fullName: z.string().min(3).max(60),
  phone: z.string().regex(phoneRegex, "Enter a valid phone number"),
  vehicleName: z.string().max(60).optional(),
  vehicleNumber: z.string().max(20).optional(),
});

export type PassengerRegisterInput = z.infer<typeof passengerRegisterSchema>;
export type DriverRegisterInput = z.infer<typeof driverRegisterSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RideRequestInput = z.infer<typeof rideRequestSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
