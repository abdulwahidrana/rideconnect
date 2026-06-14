/**
 * Seed script: creates an admin, a demo passenger and a demo driver.
 * Usage: npm run seed
 * Reads MONGODB_URI from the environment (loads .env.local / .env if dotenv is present).
 */
try {
  require("dotenv").config({ path: ".env.local" });
  require("dotenv").config();
} catch {
  /* dotenv is optional — pass MONGODB_URI inline if you don't use it */
}
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/rideconnect";

const userSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const User = mongoose.models.User || mongoose.model("User", userSchema, "users");

async function run() {
  await mongoose.connect(MONGODB_URI);
  const hash = await bcrypt.hash("Password123!", 10);

  const seedUsers = [
    {
      fullName: "System Admin",
      email: "admin@rideconnect.app",
      phone: "+920000000000",
      password: hash,
      role: "admin",
      isActive: true,
    },
    {
      fullName: "Demo Passenger",
      email: "passenger@rideconnect.app",
      phone: "+921111111111",
      password: hash,
      role: "passenger",
      isActive: true,
    },
    {
      fullName: "Demo Driver",
      email: "driver@rideconnect.app",
      phone: "+922222222222",
      password: hash,
      role: "driver",
      isActive: true,
      isOnline: false,
      vehicle: { name: "Toyota Corolla", number: "LEB-1234", licenseNumber: "DL-998877" },
      rating: 4.9,
      totalEarnings: 0,
    },
  ];

  for (const u of seedUsers) {
    await User.updateOne({ email: u.email }, { $setOnInsert: u }, { upsert: true });
    console.log(`Seeded: ${u.email} (password: Password123!)`);
  }
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
