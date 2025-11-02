// const bcrypt = require("bcrypt");
// import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient();
// export default prisma;

// async function createAdmin() {
//   const hashedPassword = await bcrypt.hash("admin123", 10);
//   const admin = await prisma.admin.create({
//     data: {
//       name: "Admin",
//       email: "admin@nova.com",
//       password: hashedPassword,
//       role: "superadmin"
//     },
//   });
//   console.log("Admin created:", admin);
// }

// createAdmin().finally(() => prisma.$disconnect());



import prisma from "./prismaClient.js";
import bcrypt from "bcryptjs";

async function createAdmin() {
  const hashedPassword = await bcrypt.hash("ketan123", 10);

  const existing = await prisma.admin.findUnique({
    where: { email: "ketan@nova.com" },
  });

  if (existing) {
    console.log("⚠️ Admin already exists:", existing.email);
    return;
  }

  const admin = await prisma.admin.create({
    data: {
      name: "ketan",
      email: "ketan@nova.com",
      password: hashedPassword,
      role: "superadmin"
    },
  });

  console.log("✅ Admin created:", admin);
}

// ✅ Ensure we disconnect the client cleanly
createAdmin()
  .catch((err) => {
    console.error("Error creating admin:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
