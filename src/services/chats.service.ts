import { UserDetails } from "../dtos";
import { generateAgentResponse } from "../langchain/agents/base-agent";
import { generateChatId } from "../utils/helpers";

async function createChat(message: string, userDetails?: UserDetails) {
  const chatId = generateChatId();
  const agentResponse = await generateAgentResponse(
    chatId,
    message,
    userDetails
  );

  return { chatId, agentResponse };
}

async function sendMessage(
  chatId: string,
  message: string,
  userDetails?: UserDetails
) {
  return await generateAgentResponse(chatId, message, userDetails);
}

export const ChatsService = { createChat, sendMessage };
