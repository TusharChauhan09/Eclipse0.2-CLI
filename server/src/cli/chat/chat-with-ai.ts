import chalk from "chalk";
import boxen from "boxen";
import { text, isCancel, cancel, intro, outro } from "@clack/prompts";
import yoctoSpinner from "yocto-spinner";
import { marked } from "marked";
import markedTerminal from "marked-terminal";
import { AIService } from "../ai/google-service.js";
import { ChatService } from "../../service/chat.service.js";
import { getStoredToken } from "../../lib/token.js";
import prisma from "../../lib/db.js";

// Configure marked to use terminal renderer
marked.use({
  renderer: new markedTerminal({
    // Styling options for terminal output
    code: chalk.cyan,
    blockquote: chalk.gray.italic,
    heading: chalk.green.bold,
    firstHeading: chalk.magenta.underline.bold,
    hr: chalk.reset,
    listitem: chalk.reset,
    list: chalk.reset,
    paragraph: chalk.reset,
    strong: chalk.bold,
    em: chalk.italic,
    codespan: chalk.yellow.bgBlack,
    del: chalk.dim.gray.strikethrough,
    link: chalk.blue.underline,
    href: chalk.blue.underline,
  }) as any,
});

const aiService = new AIService();
const chatService = new ChatService();

export async function startChat(mode = "chat", conversationId = null) {
  try {
    intro(
      boxen(chalk.bold.cyan("🚀 Eclipse AI Chat"), {
        padding: 1,
        borderStyle: "double",
        borderColor: "cyan",
      })
    );
    const user = await getUserFromToken();
    const conversation = await initConversation(user.id, conversationId, mode);
    await chatLoop(conversation);

    outro(chalk.bold.cyan("👋 Goodbye from Eclipse AI Chat!"));
  } catch (error: any) {
    const errorBox = boxen(chalk.red.bold(`⚠️ Error: ${error.message}`), {
      padding: 1,
      margin: 1,
      borderStyle: "round",
      borderColor: "red",
    });
    console.log(errorBox);
    process.exit(1);
  }
}
