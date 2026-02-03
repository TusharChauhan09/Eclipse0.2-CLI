"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const google_service_1 = require("./src/cli/ai/google-service");
const chat_service_1 = require("./src/service/chat.service");
const token_1 = require("./src/lib/token");
const db_1 = __importDefault(require("./src/lib/db"));
async function testChat() {
  try {
    console.log("Testing chat functionality...\n");
    // Get user from token
    const token = await (0, token_1.getStoredToken)();
    if (!token?.access_token) {
      throw new Error("Not authenticated");
    }
    const user = await db_1.default.user.findFirst({
      where: {
        sessions: {
          some: { token: token.access_token },
        },
      },
    });
    if (!user) {
      throw new Error("User not found");
    }
    console.log(`✓ User authenticated: ${user.name}\n`);
    // Create a test conversation
    const chatService = new chat_service_1.ChatService();
    const conversation = await chatService.createConversation(
      user.id,
      "chat",
      "Test Conversation",
    );
    console.log(`✓ Conversation created: ${conversation.id}\n`);
    // Add a test message
    await chatService.addMessage(
      conversation.id,
      "user",
      "Hello! Can you tell me what 2+2 equals?",
    );
    console.log("✓ User message added\n");
    // Get messages and format for AI
    const messages = await chatService.getMessages(conversation.id);
    const aiMessages = chatService.formatMessagesForAI(messages);
    console.log(`✓ Messages formatted: ${aiMessages.length} message(s)\n`);
    console.log("Messages:", JSON.stringify(aiMessages, null, 2), "\n");
    // Test AI service
    const aiService = new google_service_1.AIService();
    console.log("✓ AI Service initialized\n");
    console.log("Sending to AI...\n");
    let fullResponse = "";
    const result = await aiService.sendMessage(aiMessages, (chunk) => {
      fullResponse += chunk;
      process.stdout.write(chunk);
    });
    console.log("\n\n✓ AI Response received successfully!");
    console.log(`Full response length: ${fullResponse.length} characters\n`);
    // Save AI response
    await chatService.addMessage(conversation.id, "assistant", fullResponse);
    console.log("✓ AI response saved\n");
    // Clean up
    await chatService.deleteConversation(conversation.id, user.id);
    console.log("✓ Test conversation deleted\n");
    console.log("✅ All tests passed!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}
testChat();
//# sourceMappingURL=test-chat.js.map
