import { google } from "@ai-sdk/google";
import { generateText, streamText, convertToModelMessages, tool } from "ai";
import { config } from "../../config/google.config.js";
import chalk from "chalk";

export class AIService {
  private model: any;
  constructor() {
    if (config.googleApiKey === "") {
      throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is not set in .env");
    }
    this.model = google(config.eclipseModel);
  }

  // @ts-ignore
  async sendMessage(
    messages: any,
    onChunk: ((chunk: string) => void) | null,
    tools: any = undefined,
    onToolCall: ((toolCall: any) => void) | null = null,
  ) {
    try {
      // Ensure messages is an array and not empty
      if (!Array.isArray(messages) || messages.length === 0) {
        throw new Error("Messages array is required and cannot be empty");
      }

      // Validate message structure
      for (const msg of messages) {
        if (!msg.role || !msg.content) {
          throw new Error(
            "Each message must have 'role' and 'content' properties",
          );
        }
      }

      const streamConfig: any = {
        model: this.model,
        messages: messages,
      };

      if (tools && Object.keys(tools).length > 0) {
        streamConfig.tools = tools;
        streamConfig.maxSteps = 5;

        console.log(
          chalk.gray(`[DEBUG] Tools enabled: ${Object.keys(tools).join(",")}`),
        );
      }

      const result = streamText(streamConfig);
      let fullResponse = "";

      for await (const chunk of result.textStream) {
        fullResponse += chunk;
        if (onChunk) {
          onChunk(chunk);
        }
      }

      const fullResult = result;

      const toolCalls = [];
      const toolResults = [];

      const steps = await fullResult.steps;

      if (steps && steps.length > 0 && Array.isArray(steps)) {
        // Process steps if needed
        for (const step of steps) {
          if (step.toolCalls && step.toolCalls.length > 0) {
            for (const toolCall of step.toolCalls) {
              toolCalls.push(toolCall);
              if (onToolCall) {
                onToolCall(toolCall);
              }
            }
          }
          if (step.toolResults && step.toolResults.length > 0) {
            toolResults.push(...step.toolResults);
          }
        }
      }

      return {
        content: fullResponse,
        finishReason: result.finishReason,
        usage: result.usage,
        toolCalls: toolCalls,
        toolResults: toolResults,
        steps: fullResult.steps,
      };
    } catch (error) {
      console.error(chalk.red("Error in GoogleService sendMessage:"), error);
    }
  }

  // @ts-ignore
  async getMessage(messages, tools = undefined) {
    let fullResponse = "";
    const result = await this.sendMessage(
      messages,
      (chunk: any) => {
        fullResponse += chunk;
      },
      tools,
    );
    return result?.content;
  }
}
