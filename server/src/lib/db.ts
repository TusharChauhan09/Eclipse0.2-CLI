import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

// Polyfill for better-auth accessing DeviceCode
// @ts-ignore
prisma.DeviceCode = prisma.deviceCode;

export default prisma;
