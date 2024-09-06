import { z } from "zod";

export const createChatSchema = z.object({
  message: z.string().min(1, "Message is required"),
});

export const sendMessageSchema = z.object({
  message: z.string().min(1, "Message is required"),
});
