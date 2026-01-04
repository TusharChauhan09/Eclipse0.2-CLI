import chalk from "chalk";
import { Command } from "commander";
import yoctoSpinner from "yocto-spinner";
import { getStoredToken } from "../../../lib/token";
import prisma from "../../../lib/db";
import { select } from "@clack/prompts";

const wakeUpAction = async () => {
  const token = await getStoredToken();

  if (!token) {
    console.log(chalk.red("You must be logged in to wake up the AI service."));
    return;
  }
  const spinner = yoctoSpinner({ text: "Fetching user information..." });
  spinner.start();
  const user = await prisma.user.findFirst({
    where: {
      sessions: {
        some: { token: token.accessToken },
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
  });

  spinner.stop();

  if (!user) {
    console.log(chalk.red("User not found. Please log in again."));
    return;
  }

  console.log(chalk.green(`Welcome back, ${user.name}!\n`));

  const choice = await select({
    message: "Select an option:",
    options: [
      {
        value: "chat",
        label: "Chat",
        hint: "Chat with the AI",
      },
      {
        value: "tool",
        label: "Tool Calling",
        hint: "Chat with tools (Google Search, Code Execution, etc.) ",
      },
      {
        value: "agent",
        label: "Agentic Mode",
        hint: "Advanced AI agent (Coming soon)",
      },
    ],
  });

  switch (choice) {
    case "chat":
      console.log(chalk.yellow("Chat mode is not yet implemented."));
      break;
    case "tool":
      console.log(chalk.yellow("Tool Calling mode is not yet implemented."));
      break;
    case "agent":
      console.log(chalk.yellow("Agentic Mode is not yet implemented."));
      break;
    default:
      console.log(chalk.red("Invalid choice."));
      break;
  }
};

export const wakeUpCommand = new Command("wakeup")
  .description("Wake up the AI service and start interacting")
  .action(wakeUpAction);
