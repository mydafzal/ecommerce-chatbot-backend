import { Request, Response, Router } from "express";
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
    const response = await ChatsService.createChat(req.body.message);
    res.status(201).json({ data: response });
  }
);

router.post(
  "/:id/messages",
  validateRequest(sendMessageSchema),
  async (req: Request, res: Response) => {
    const response = await ChatsService.sendMessage(
      req.params.id,
      req.body.message
    );

    res.status(200).json({ data: response });
  }
);

export default router;
