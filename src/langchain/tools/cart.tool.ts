import { DynamicStructuredTool } from "langchain/tools";
import z from "zod";
import { WooCommerceService } from "../../services/woocommerce.service";
import { WOOCOMMERCE_ENDPOINTS } from "../../utils/constants";
import wooCommerceClient from "../../config/woocommerce.config";

const addItemToCartSchema = z.object({
  id: z
    .number()
    .describe("ID of the selected product to add to the cart, default 1750"),
  quantity: z
    .number()
    .describe("Quantity of the product to add to the cart, by default 1"),
});

export const addItemToCartTool = new DynamicStructuredTool({
  name: "add-item-to-cart-tool",
  description: "A tool for adding items to the cart in WooCommerce",
  schema: addItemToCartSchema,
  func: async (params) => {
    try {
      console.log("Params received:", params);
      const { id, quantity } = params; // Extract id and quantity
      const response = await fetch(
        `https://localhost/bosa/wp-json/wc/store/v1/cart/add-item?id=${
          id || 1750
        }&quantity=${quantity || 1}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Response from WooCommerce:", data);
      return JSON.stringify(data);
    } catch (error: any) {
      console.error(
        "Error adding item to cart:",
        error.response?.data || error.message
      );
      throw new Error("An error occurred while adding item to cart");
    }
  },
});
