import { UserDetails } from "../dtos";
import { generateAgentResponse } from "../langchain/agents/base-agent";
import { generateChatId } from "../utils/helpers";

async function createChat(
  message: string,
  senderName: string,
  userDetails?: UserDetails
) {
  const chatId = generateChatId();
  const agentResponse = await generateAgentResponse(
    chatId,
    message,
    senderName,
    userDetails
  );

  return { chatId, agentResponse };
}

async function sendMessage(
  chatId: string,
  message: string,
  senderName: string,
  userDetails?: UserDetails
) {
  return await generateAgentResponse(chatId, message, senderName, userDetails);
}

export const ChatsService = { createChat, sendMessage };
