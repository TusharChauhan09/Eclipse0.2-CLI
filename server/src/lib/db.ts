import dotenv from "dotenv";
import path from "path";

// Load .env from the server root directory
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

// Polyfill for better-auth accessing DeviceCode
// @ts-ignore
prisma.DeviceCode = prisma.deviceCode;

export default prisma;
