#!/usr/bin/env node

import dotenv from "dotenv";
import chalk from "chalk";
import figlet from "figlet";

import { Command } from "commander";

import { LoginCommand } from "./commands/auth/login";

dotenv.config();

async function main() {
  // CLI Banner
  console.log(
    chalk.cyan(
      figlet.textSync("Eclipse 2.0 CLI", {
        font: "big",
        horizontalLayout: "default",
      })
    )
  );
  console.log(chalk.red("A CLI based AI Tool \n"));

  const program = new Command("eclipse");

  program.version("0.0.1")
  .description("Eclipse 2.0 CLI - A CLI based AI Tool")
  .addCommand(LoginCommand);

  program.action(() => {
    program.help();
  });

  program.parse();
}

main().catch((err) => {
  console.log(chalk.red("Error while running Eclipse CLI:"), err);
  process.exit(1);
});
