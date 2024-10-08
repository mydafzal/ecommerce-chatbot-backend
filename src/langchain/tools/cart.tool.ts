import { DynamicStructuredTool } from "langchain/tools";
import z from "zod";
import { WooCommerceService } from "../../services/woocommerce.service";
import { WOOCOMMERCE_ENDPOINTS } from "../../utils/constants";
import wooCommerceClient from "../../config/woocommerce.config";
import { redisClient } from "../../config/redis.config";

const addItemToCartSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z
          .number()
          .describe(
            "ID of the product user wants to add to the cart. You will get this id from the result of product-search-tool."
          ),
        quantity: z
          .number()
          .default(1)
          .describe(
            "Quantity of the product to add to the cart. Default is 1."
          ),
        size: z
          .string()
          .optional()
          .describe("Size of the product e.g., XL - 34 (if applicable)"),
        color: z
          .string()
          .optional()
          .describe("Color of the product (if applicable)"),
      })
    )
    .describe("Array of items to add to the cart"),
});

export function createAddToCartItemTool(chatId: string) {
  return new DynamicStructuredTool({
    name: "add-item-to-cart-tool",
    description: "A tool for adding items to the cart in WooCommerce",
    schema: addItemToCartSchema,
    func: async (params) => {
      try {
        let cookies = await redisClient.get(`chat_${chatId}_cookies`);
        console.log("cookies");
        console.log(cookies);
        if (cookies) {
          cookies = JSON.parse(cookies);
        }

        console.log("Params received:", params);
        // const { productId, quantity, size, color } = params;
        const { items } = params;
        const response = await fetch(
          // "http://localhost/bosa/wp-json/bosa/v1/cart/add-item",
          "https://houseofbosa.com/staging/wp-json/staging/bosa/v1/cart/add-item",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Cookie: cookies || "",
            },
            body: JSON.stringify({
              products: items,
            }),
          }
        );

        if (!response.ok) {
          console.log(response);
          return `Error while adding item to cart. An unknown error occoured.`;
        }

        const data = await response.json();
        console.log("Response from WooCommerce:", data);
        return JSON.stringify(data);
      } catch (error: any) {
        console.error(
          "Error adding item to cart:",
          error.response?.data || error.message
        );
        return "An error occurred while adding item to cart";
      }
    },
  });
}

// export function createAddToCartItemTool(chatId: string) {
//   return new DynamicStructuredTool({
//     name: "add-item-to-cart-tool",
//     description: "A tool for adding multiple items to the cart in WooCommerce",
//     schema: addItemToCartSchema,
//     func: async (params) => {
//       try {
//         let cookies = await redisClient.get(`chat_${chatId}_cookies`);
//         if (cookies) {
//           cookies = JSON.parse(cookies);
//         }

//         console.log("Params received:", params);
//         const { items } = params;

//         const addItemPromises = items.map(async (item) => {
//           const { productId, quantity, size, color } = item;
//           const response = await fetch(
//             "http://localhost/bosa/wp-json/bosa/v1/cart/add-item",
//             {
//               method: "POST",
//               headers: {
//                 "Content-Type": "application/json",
//                 Cookie: cookies || "",
//               },
//               body: JSON.stringify({
//                 id: productId,
//                 quantity,
//                 size,
//                 color,
//               }),
//             }
//           );

//           if (!response.ok) {
//             throw new Error(
//               `Error adding item ${productId} to cart: ${response.statusText}`
//             );
//           }

//           return response.json();
//         });

//         const results = await Promise.all(addItemPromises);
//         console.log("Responses from WooCommerce:", results);
//         return JSON.stringify(results);
//       } catch (error: any) {
//         console.error(
//           "Error adding items to cart:",
//           error.response?.data || error.message
//         );
//         return `An error occurred while adding items to cart: ${error.message}`;
//       }
//     },
//   });
// }
