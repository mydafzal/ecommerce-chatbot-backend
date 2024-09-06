import { generateAgentResponse } from "../langchain/agents/base-agent";
import { generateChatId } from "../utils/helpers";

async function createChat(message: string) {
  const chatId = generateChatId();
  const agentResponse = await generateAgentResponse(chatId, message);

  return { chatId, agentResponse };
}

async function sendMessage(chatId: string, message: string) {
  return await generateAgentResponse(chatId, message);
}

export const ChatsService = { createChat, sendMessage };
