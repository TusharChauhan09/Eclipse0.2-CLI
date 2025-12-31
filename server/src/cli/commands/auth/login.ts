import { logger } from "better-auth";
import { createAuthClient } from "better-auth/client";
import { deviceAuthorizationClient } from "better-auth/client/plugins";

import * as z from "zod/v4";
import prisma from "../../../lib/db";
import dotenv from "dotenv";

import { cancel, confirm, intro, isCancel, outro } from "@clack/prompts";

import chalk from "chalk";
import { Command } from "commander";
import fs from "fs/promises";
import open from "open";
import os from "os";
import path from "path";
import yoctoSpinner from "yocto-spinner";

import { loginActionType } from "../../../types/types";
import {
  clearStoreToken,
  getStoredToken,
  isTokenExpire,
  requireAuth,
  storeToken,
} from "../../../lib/token";

dotenv.config();

if (!process.env.GITHUB_CLIENT_ID) {
  const envPath = path.resolve(__dirname, "../../../../.env");
  dotenv.config({ path: envPath });
}

const URL = "http://localhost:3001";
const CLIENT_ID = process.env.GITHUB_CLIENT_ID;

export const CONFIG_DIR = path.join(os.homedir(), ".better-auth");
export const TOKEN_FILE = path.join(CONFIG_DIR, "token.json");

// ! Actions

// Login Action
export async function loginAction(opts: loginActionType) {
  const serverUrl = opts.serverUrl || URL;
  const clientId = opts.clientId || CLIENT_ID;

  if (!clientId) {
    console.error(
      chalk.red(
        "Client ID is missing. Please set GITHUB_CLIENT_ID in your .env file."
      )
    );
    process.exit(1);
  }

  intro(chalk.bold("🔒 Auth CLI Login"));

  // token management logic
  const existingToken = await getStoredToken();
  const expired = await isTokenExpire();

  if (existingToken && !expired) {
    const shouldReAuth = await confirm({
      message: "You are already logged in. Do you want to re-authenticate?",
      initialValue: false,
    });

    if (isCancel(shouldReAuth) || !shouldReAuth) {
      cancel("Login cancelled.");
      process.exit(0);
    }
  }

  // CODE request
  const authClient = createAuthClient({
    baseURL: serverUrl as string,
    plugins: [deviceAuthorizationClient()],
  });

  const spinner = yoctoSpinner({ text: "Requesting device authorization..." });
  spinner.start();

  try {
    const { data, error } = await authClient.device.code({
      client_id: clientId as string,
      scope: "openid profile email",
    });
    spinner.stop();
    if (error || !data) {
      console.error(chalk.red("Failed to request device authorization:"));
      console.error(
        chalk.yellow(JSON.stringify(error, null, 2) || "Unknown error")
      );
      process.exit(1);
    }

    const {
      device_code,
      user_code,
      verification_uri,
      verification_uri_complete,
      expires_in,
      interval,
    } = data;
    console.log(chalk.cyan("Device Authorisation Requested"));

    console.log(
      `Please visit URL: ${chalk.underline.blue(
        verification_uri || verification_uri_complete
      )}`
    );
    console.log(`Enter the code: ${chalk.bold.red(user_code)}`);

    // open in default browser
    const urlOpen = await confirm({
      message: "Open the URL in your default browser?",
      initialValue: true,
    });
    if (!isCancel(urlOpen) && urlOpen) {
      const urlToOpen = verification_uri_complete || verification_uri;
      await open(urlToOpen);
    }

    // Polling for token
    console.log(
      chalk.gray(
        `Waiting for authorization (expires in ${Math.floor(
          expires_in / 60
        )} minutes)...)`
      )
    );

    // Poll Token Function call
    const token = await pollForToken(
      authClient,
      device_code,
      clientId,
      interval
    );

    if (token) {
      const saved = await storeToken(token);
      if (!saved) {
        console.error(
          chalk.yellow("⚠️ Warning: Could not save authentication token.")
        );
        console.error(chalk.yellow("You may need to login again on next use."));
        process.exit(1);
      }

      // TODO:
      outro(chalk.green("Login successful!"));
      console.log(chalk.gray(`\nToken saved to: ${TOKEN_FILE}`));
      console.log(chalk.gray(`\nYou can now use the CLI.`));
    }
  } catch (error) {
    spinner.stop();
    console.error(chalk.red("\nFailed to login:"), error);
    process.exit(1);
  }
}

// Poll Token Function
async function pollForToken(
  authClient: any,
  device_code: String,
  client_id: String,
  initialInterval: number
) {
  let pollingInterval = initialInterval;
  const spinner = yoctoSpinner({ text: "", color: "cyan" });
  let dots = 0;

  return new Promise((resolve, reject) => {
    const poll = async () => {
      dots = (dots + 1) % 4;
      spinner.text = chalk.gray(
        `Polling for authorization${".".repeat(dots)}${" ".repeat(3 - dots)}`
      );
      if (!spinner.isSpinning) spinner.start();
      try {
        const { data, error } = await authClient.device.token({
          grant_type: "urn:ietf:params:oauth:grant-type:device_code",
          device_code: device_code,
          client_id: client_id,
          fetchOptions: {
            "user-agent": "My CLI",
          },
        });

        if (data?.access_token) {
          console.log(
            chalk.bold.yellow(`Your access token: ${data.access_token}`)
          );

          spinner.stop();
          resolve(data);
          return;
        } else if (error) {
          switch (error.error) {
            case "authorization_pending":
              break;
            case "slow_down":
              pollingInterval += 5;
              break;
            case "access_denied":
              console.error("Access was denied by the user");
              return;
            case "expired_token":
              console.error("The device code has expired. Please try again.");
              return;
            default:
              spinner.stop();
              logger.error(`Error: ${error.error_description}`);
              process.exit(1);
          }
        }
      } catch (error) {
        spinner.stop();
        logger.error(`Network Error: ${error}`);
        process.exit(1);
      }
      setTimeout(poll, pollingInterval * 1000);
    };
    setTimeout(poll, pollingInterval * 1000);
  });
}

//
export async function logoutAction() {
  intro(chalk.bold("🔒 Auth CLI Logout"));
  const token = await getStoredToken();

  if (!token) {
    console.log(chalk.yellow("You are not logged in."));
    process.exit(0);
  }

  const shouldLogout = await confirm({
    message: "Are you sure you want to logout?",
    initialValue: false,
  });

  if (isCancel(shouldLogout) || !shouldLogout) {
    cancel("Logout cancelled.");
    process.exit(0);
  }

  const cleared = await clearStoreToken();
  if (cleared) {
    outro(chalk.green("Logout successful!"));
  } else {
    console.error(chalk.red("⚠️ Failed to logout. Please try again."));
  }
}

export async function whoamiAction() {
  const token = await requireAuth();
  if (!token) {
    console.log("No access token found. Please login first.");
    process.exit(1);
  }
  const user = await prisma.user.findFirst({
    where: {
      sessions: {
        some: {
          token: token.access_token,
        },
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
  });
  console.log(
    chalk.bold.green(`\n👤 User: ${user?.name} \n📧 Email: ${user?.email}\n🆔 ID: ${user?.id}\n`)
  );
}

// ! Command setup for CLI

// Login Command
export const LoginCommand = new Command("login")
  .description("Login to the CLI Authenticator")
  .option("--server-url <url>", "CLI Authenticator Url", URL)
  .option("--client-id <id>", "OAuth Client ID", CLIENT_ID)
  .action(loginAction);

export const logoutCommand = new Command("logout")
  .description("Logout from the CLI Authenticator")
  .action(logoutAction);

export const whoami = new Command("whoami")
  .description("Display information about the currently logged-in user")
  .action(whoamiAction);
