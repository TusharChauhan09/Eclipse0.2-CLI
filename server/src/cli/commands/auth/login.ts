import { logger, Logger } from "better-auth";
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

dotenv.config();

const URL = "http://localhost:3001";
const CLIENT_ID = process.env.GITHUB_CLIENT_ID;

const CONFIG_DIR = path.join(os.homedir(), ".better-auth");
const TOKEN_FILE = path.join(CONFIG_DIR, "token.json");

// ! Actions

// Login Action
export async function loginAction(opts: loginActionType) {
  const serverUrl = opts.serverUrl || URL;
  const clientId = opts.clientId || CLIENT_ID;

  intro(chalk.bold("🔒 Auth CLI Login"));

  // TODO: Apply token management logic
  const existingToken = false;
  const expired = false;

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
    serverUrl,
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
      logger.error(
        `Failed to request device authorization: ${
          error?.error_description || error || "Unknown error"
        }`
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
      const urlToOpen = verification_uri || verification_uri_complete;
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
  } catch (error) {}
}

// ! Command setup for CLI

// Login Command
export const LoginCommand = new Command("login")
  .description("Login to the CLI Authenticator")
  .option("--server-url <url>", "CLI Authenticator Url", URL)
  .option("--client-id <id>", "OAuth Client ID", CLIENT_ID)
  .action(loginAction);
