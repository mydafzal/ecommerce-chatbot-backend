import { Request, Response, Router } from "express";
import { redisClient } from "../config/redis.config";
import { CreateChatDto, SendMessageDto } from "../dtos";
import { validateRequest } from "../middleware/validator.middleware";
import { ChatsService } from "../services/chats.service";
import {
  createChatSchema,
  sendMessageSchema,
} from "../validators/chats. validator";

const router = Router();

router.post(
  "/",
  validateRequest(createChatSchema),
  async (req: Request, res: Response) => {
    const body: CreateChatDto = req.body;

    const response = await ChatsService.createChat(
      body.message,
      body.userDetails
    );

    res.status(201).json({ data: response });
  }
);

router.post(
  "/:id/messages",
  validateRequest(sendMessageSchema),
  async (req: Request, res: Response) => {
    const body: SendMessageDto = req.body;

    const response = await ChatsService.sendMessage(
      req.params.id,
      body.message,
      body.userDetails
    );

    res.status(201).json({ data: response });
  }
);

router.get("/:id", async (req: Request, res: Response) => {
  const chatId = req.params.id;

  let messages: any[] = await redisClient.lRange(chatId, 0, -1);

  messages = messages.map((message: any) => {
    message = JSON.parse(message);

    return {
      id: message.data?.additional_kwargs.id,
      type: message.type,
      content: message.data?.content,
      timestamp: message.data?.additional_kwargs.timestamp,
    };
  });

  res.status(200).json({ data: messages.reverse() });
});

export default router;
