import { Request, Response, Router } from "express";

import { redisClient } from "../config/redis.config";
import { SendMessageDto } from "../dtos";
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
    const cookies = req.headers.cookie;

    console.log("Create Chat: req.body");
    console.log(req.body);
    console.log("cookies");
    console.log(cookies);
    const response = await ChatsService.createChat(
      req?.body?.message,
      req?.body?.senderName,
      req?.body?.userDetails,
      req?.body?.userDetails?.cookieValue
      // cookies
    );
    // res.status(201).json({ data: response });
    console.log("response");
    console.log(response);
    res.status(201).send(response);
  }
);

router.post(
  "/:id/messages",
  validateRequest(sendMessageSchema),
  async (req: Request, res: Response) => {
    const body: SendMessageDto = req.body;
    const cookies = req.headers.cookie;

    console.log("Continue Chat: req.body");
    console.log(req.body);
    console.log("cookies");
    console.log(cookies);

    const response = await ChatsService.sendMessage(
      req.params.id,
      body.message,
      body.senderName,
      body.userDetails,
      // cookies
      req?.body?.userDetails?.cookieValue
    );
    console.log("response");
    console.log(response);

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

// router.post("/cart/add-item", async (req: Request, res: Response) => {
//   try {
//     const { id, quantity } = req.query;
//     const nonce = req.headers["nonce"] as string;

//     console.log("nonce");
//     console.log(nonce);
//     console.log("id");
//     console.log(id);
//     console.log("quantity");
//     console.log(quantity);

//     if (!id || !quantity || !nonce) {
//       return res.status(400).json({ error: "Missing required parameters" });
//     }

//     // wooCommerceClient
//     //   .post("cart/add-item", {
//     //     id: 1750,
//     //     quantity: 2,
//     //   })
//     //   .then((response) => {
//     //     console.log(response.data);
//     //     console.log("success");

//     //     res.send(response);
//     //   })
//     //   .catch((error) => {
//     //     console.error(error.response.data);
//     //   });

//     const response = await fetch(
//       "http://localhost/bosa/wp-json/chats/v1/cart/add-item",
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },

//         body: JSON.stringify({
//           id,
//           quantity,
//         }),
//       }
//     );

//     if (!response.ok) {
//       console.log(await response.json());
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const data = await response.json();
//     res.status(200).json(data);
//   } catch (error) {
//     console.log(error);
//     console.error("Error adding item to cart:", error);
//     res
//       .status(500)
//       .json({ error: "An error occurred while adding item to cart" });
//   }
// });

router.post("/cart/add-item", async (req: Request, res: Response) => {
  try {
    const { id, quantity, size } = req.body;
    const cookies = req.headers.cookie;
    console.log("cookies");
    console.log(cookies);

    if (!id || !quantity) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    console.log("Received cookies:", cookies);

    const response = await fetch(
      "http://localhost/bosa/wp-json/bosa/v1/cart/add-item",

      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookies || "", // Send cookies if available
        },
        body: JSON.stringify({
          products: [
            {
              productId: id,
              quantity,
              size,
            },
          ],
        }),
      }
    );

    const responseData = await response.text();
    console.log("WordPress API response:", responseData);

    if (!response.ok) {
      console.log("WordPress API error:", responseData);
      return res.status(response.status).json({ error: responseData });
    }

    // Forward the Set-Cookie header from WordPress to the client
    const wpCookies = response.headers.get("set-cookie");
    if (wpCookies) {
      res.setHeader("Set-Cookie", wpCookies); // Pass session cookies back to the client
    }

    res.status(200).json(JSON.parse(responseData));
  } catch (error) {
    console.error("Error adding item to cart:", error);
    res
      .status(500)
      .json({ error: "An error occurred while adding item to cart" });
  }
});

router.post("/cart/get-item", async (req: Request, res: Response) => {
  try {
    const { id, quantity } = req.body;
    const cookies = req.headers.cookie;
    console.log("cookies");
    console.log(cookies);

    if (!id || !quantity) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    console.log("Received cookies:", cookies);

    const response = await fetch(
      "http://localhost/bosa/wp-json/bosa/v1/cart/get-contents",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookies || "", // Send cookies if available
        },
      }
    );

    const responseData = await response.text();
    console.log("WordPress API response:", responseData);

    if (!response.ok) {
      console.log("WordPress API error:", responseData);
      return res.status(response.status).json({ error: responseData });
    }

    // Forward the Set-Cookie header from WordPress to the client
    const wpCookies = response.headers.get("set-cookie");
    if (wpCookies) {
      res.setHeader("Set-Cookie", wpCookies); // Pass session cookies back to the client
    }

    res.status(200).json(JSON.parse(responseData));
  } catch (error) {
    console.error("Error adding item to cart:", error);
    res
      .status(500)
      .json({ error: "An error occurred while adding item to cart" });
  }
});

// router.post("/cart/add-item", async (req: Request, res: Response) => {
//   try {
//     const { id, quantity, size, variation_id = 0 } = req.body;
//     const cookies = req.headers.cookie;

//     console.log(req.body);

//     if (!id || !quantity) {
//       return res.status(400).json({ error: "Missing required parameters" });
//     }

//     const response = await fetch(
//       "http://localhost/bosa/wp-admin/admin-ajax.php",
//       {
//         method: "POST",
//         body: JSON.stringify({
//           action: "woocommerce_custom_ajax_add_to_cart",
//           product_id: id,
//           quantity: quantity,
//           size: size || "",
//           // variation_id: variation_id.toString(),
//           prdattrname: "XXS",
//           prdattrval: 35,
//           prdAttrTaxonomy: "pa_35",
//           variation_id: 0,
//         } as any),
//       }
//     );

//     const responseData = await response.json();

//     console.log("responseData");
//     console.log(response);

//     if (responseData.success) {
//       // Forward Set-Cookie header if present
//       const wpCookies = response.headers.get("set-cookie");
//       if (wpCookies) {
//         res.setHeader("Set-Cookie", wpCookies);
//       }

//       res.status(200).json({
//         success: true,
//         message: "Product added to cart successfully",
//         data: responseData.data,
//       });
//     } else {
//       res.status(400).json({
//         success: false,
//         message: "Failed to add product to cart",
//         error: responseData.data,
//       });
//     }
//   } catch (error) {
//     console.error("Error adding item to cart:", error);
//     res
//       .status(500)
//       .json({ error: "An error occurred while adding item to cart" });
//   }
// });

export default router;
