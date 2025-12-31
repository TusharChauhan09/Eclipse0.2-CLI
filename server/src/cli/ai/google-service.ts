import { google } from "@ai-sdk/google";
import { generateText, streamText } from "ai";
import { config } from "../../config/google.config.js";
import chalk from "chalk";

export class GoogleService {
  private model: any;
  constructor() {
    if (config.googleApiKey === "") {
      throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is not set in .env");
    }
    this.model = google(config.eclipseModel);
  }

  // @ts-ignore
  async sendMessage(messages, onChunk, tools = undefined, onToolCall = null) {
    try {
      const streamConfig = {
        model: this.model,
        messages: messages,
      };

      const result = streamText(streamConfig);
      let fullResponse = "";

      for await (const chunk of result.textStream) {
        fullResponse += chunk;
        if (onChunk) {
          onChunk(chunk);
        }
      }

      return {
        content: fullResponse,
        finishReason: result.finishReason,
        usage: result.usage,
      }
    } catch (error) {
        console.error(chalk.red("Error in GoogleService sendMessage:"), error);
    }
  }

  // @ts-ignore
  async getMessage(messages, tools = undefined) {
    let fullResponse = "";
    const result = await this.sendMessage(messages, (chunk: any) => {
      fullResponse += chunk;
    }, tools);
    return result?.content;
  }
}
