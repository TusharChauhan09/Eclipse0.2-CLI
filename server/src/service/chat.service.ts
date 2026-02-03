import prisma from "../lib/db";

export class ChatService {
  async createConversation(
    userId: string,
    mode: string = "chat",
    title: string | null = null,
  ) {
    return await prisma.conversation.create({
      data: {
        userId,
        mode,
        title: title || "New Conversation",
      },
    });
  }

  async getOrCreateConversation(
    userId: string,
    conversationId: string | null = null,
    mode: string = "chat",
  ) {
    if (conversationId) {
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          userId,
        },
        include: {
          message: {
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });
      if (conversation) return conversation;
    }

    return await this.createConversation(userId, mode);
  }

  async addMessage(
    conversationId: string,
    role: string,
    content: string | object,
  ) {
    const contentStr =
      typeof content === "string" ? content : JSON.stringify(content);
    return await prisma.message.create({
      data: {
        conversationId,
        content: contentStr,
        role,
      },
    });
  }

  async getMessages(conversationId: string) {
    const messages = await prisma.message.findMany({
      where: {
        conversationId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
    return messages.map((msg) => ({
      ...msg,
      content: this.parseContent(msg.content),
    }));
  }

  async getUserConversations(userId: string) {
    return await prisma.conversation.findMany({
      where: {
        userId,
      },
      include: {
        message: {
          take: 1,
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });
  }

  async deleteConversation(conversationId: string, userId: string) {
    return await prisma.conversation.deleteMany({
      where: {
        id: conversationId,
        userId,
      },
    });
  }

  async updateTitle(conversationId: string, title: string) {
    return await prisma.conversation.update({
      where: {
        id: conversationId,
      },
      data: { title },
    });
  }

  private parseContent(content: string): string | object {
    try {
      return JSON.parse(content);
    } catch {
      return content;
    }
  }

  formatMessagesForAI(
    messages: Array<{ role: string; content: string | object }>,
  ) {
    if (!messages || messages.length === 0) {
      return [];
    }
    return messages.map((msg) => ({
      role: msg.role,
      content:
        typeof msg.content === "string"
          ? msg.content
          : JSON.stringify(msg.content),
    }));
  }
}
