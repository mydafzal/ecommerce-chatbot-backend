import { z } from "zod";

export const userDetailsSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
});

export const createChatSchema = z.object({
  message: z.string().min(1, "Message is required"),
  userDetails: userDetailsSchema.optional(),
  senderName: z.string(),
});

export const sendMessageSchema = z.object({
  message: z.string().min(1, "Message is required"),
  userDetails: userDetailsSchema.optional(),
  senderName: z.string(),
});
