import z from "zod";
import {
  createChatSchema,
  sendMessageSchema,
  userDetailsSchema,
} from "./validators/chats. validator";

export type UserDetails = z.infer<typeof userDetailsSchema>;
export type SendMessageDto = z.infer<typeof sendMessageSchema>;
export type CreateChatDto = z.infer<typeof createChatSchema>;
