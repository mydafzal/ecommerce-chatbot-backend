import { Request, Response, Router } from "express";
import { redisClient } from "../config/redis.config";
import { CreateChatDto, SendMessageDto } from "../dtos";
import { validateRequest } from "../middleware/validator.middleware";
import { ChatsService } from "../services/chats.service";
import {
  createChatSchema,
  sendMessageSchema,
} from "../validators/chats. validator";
import wooCommerceClient from "../config/woocommerce.config";

const router = Router();

router.post(
  "/",
  validateRequest(createChatSchema),
  async (req: Request, res: Response) => {
    console.log("Create Chat: req.body");
    console.log(req.body);
    const response = await ChatsService.createChat(
      req?.body?.message,
      req?.body?.senderName,
      req?.body?.userDetails
    );
    // res.status(201).json({ data: response });
    res.status(201).send(response);
  }
);

router.post(
  "/:id/messages",
  validateRequest(sendMessageSchema),
  async (req: Request, res: Response) => {
    const body: SendMessageDto = req.body;

    console.log("Continue Chat: req.body");
    console.log(req.body);

    const response = await ChatsService.sendMessage(
      req.params.id,
      body.message,
      body.senderName,
      body.userDetails
    );

    // res.status(200).json({ data: response });
    res.status(200).send(response);
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
      senderName: message.data?.additional_kwargs.senderName,
      timestamp: message.data?.additional_kwargs.timestamp,
    };
  });

  // res.status(200).json({ data: messages.reverse() });
  res.status(200).send({ data: messages.reverse() });
});

router.post("/cart/add-item", async (req: Request, res: Response) => {
  try {
    const { id, quantity } = req.query;
    const nonce = req.headers["nonce"] as string;

    console.log("nonce");
    console.log(nonce);
    console.log("id");
    console.log(id);
    console.log("quantity");
    console.log(quantity);

    if (!id || !quantity || !nonce) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    // wooCommerceClient
    //   .post("cart/add-item", {
    //     id: 1750,
    //     quantity: 2,
    //   })
    //   .then((response) => {
    //     console.log(response.data);
    //     console.log("success");

    //     res.send(response);
    //   })
    //   .catch((error) => {
    //     console.error(error.response.data);
    //   });

    const response = await fetch(
      `http://localhost/bosa/wp-json/wc/store/v1/cart/add-item?id=${id}&quantity=${quantity}`,
      {
        method: "POST",
        headers: {
          nonce: nonce,
        },
      }
    );

    if (!response.ok) {
      console.log(await response.json());
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    console.error("Error adding item to cart:", error);
    res
      .status(500)
      .json({ error: "An error occurred while adding item to cart" });
  }
});

export default router;
