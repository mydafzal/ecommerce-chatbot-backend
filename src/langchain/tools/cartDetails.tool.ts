import { DynamicStructuredTool } from "langchain/tools";
import z from "zod";
import { redisClient } from "../../config/redis.config";

const getCartDetailsSchema = z.object({});

export function createGetCartDetailsTool(chatId: string) {
  return new DynamicStructuredTool({
    name: "get-cart-details-tool",
    description: "A tool for getting cart details from WooCommerce",
    schema: getCartDetailsSchema,
    func: async () => {
      try {
        let cookies = await redisClient.get(`chat_${chatId}_cookies`);
        if (cookies) {
          cookies = JSON.parse(cookies);
        }

        const response = await fetch(
          // "http://localhost/bosa/wp-json/bosa/v1/cart/get-contents",
          "https://houseofbosa.com/staging/wp-json/bosa/v1/cart/get-contents",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Cookie: cookies || "",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: any = await response.json();
        const transformedData = data?.cart_contents?.map(
          ({ product_id, ...rest }: any) => rest
        );

        console.log("Response from WooCommerce:", data);
        return JSON.stringify({
          transformedData,
          cartTotal: data.cart_total,
          cartCount: data.cart_count,
        });
      } catch (error: any) {
        console.error(
          "Error getting cart details:",
          error.response?.data || error.message
        );
        throw new Error("An error occurred while getting cart details");
      }
    },
  });
}
