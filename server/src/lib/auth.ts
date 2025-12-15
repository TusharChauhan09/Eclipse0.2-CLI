import "dotenv/config";
import { betterAuth } from "better-auth";
import { deviceAuthorization } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./db";


export const auth = betterAuth({
  // Database Config
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  // Auth Config
  basePath: "/api/auth",
  trustedOrigins: ["http://localhost:3000"],
  plugins: [
    deviceAuthorization({
      expiresIn: "30m", 
      interval: "5s",
    }),
  ],
  // Provider Config
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      allowDeviceFlow: true,
    },
  },
});
