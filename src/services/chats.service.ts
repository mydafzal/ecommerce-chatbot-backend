import { redisClient } from "../config/redis.config";
import { UserDetails } from "../dtos";
import { generateAgentResponse } from "../langchain/agents/base-agent";
import { generateChatId } from "../utils/helpers";

async function createChat(
  message: string,
  senderName: string,
  userDetails?: UserDetails,
  cookies?: any
) {
  const chatId = generateChatId();
  await redisClient.set(`chat_${chatId}_cookies`, JSON.stringify(cookies));

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
  userDetails?: UserDetails,
  cookies?: any
) {
  await redisClient.set(`chat_${chatId}_cookies`, JSON.stringify(cookies));
  return await generateAgentResponse(chatId, message, senderName, userDetails);
}

export const ChatsService = { createChat, sendMessage };
