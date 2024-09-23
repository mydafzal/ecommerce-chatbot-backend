import { DynamicStructuredTool } from "langchain/tools";
import z from "zod";
import { WooCommerceService } from "../../services/woocommerce.service";
import { Order } from "../../utils/interfaces/order.interface";
import { WOOCOMMERCE_ENDPOINTS } from "../../utils/constants";

const orderSearchSchema = z.object({
  search: z
    .string()
    .optional()
    .describe("order number, for searching a specific order"),
  status: z
    .enum([
      "any",
      "pending",
      "processing",
      "on-hold",
      "completed",
      "cancelled",
      "refunded",
      "failed",
      "trash",
    ])
    .optional()
    .describe("search orders matching that are currently in a specific status"),
  // customer: z
  //   .number()
  //   .optional()
  //   .describe("search orders for a specific customer"),

  customer: z
    .number()
    .describe(
      " use the logged-in userId to search for a specific customer's orders (an id inside userDetails object)"
    ),
});

export const orderSearchTool = new DynamicStructuredTool({
  name: "order-search-tool",
  description: "a tool for retreiving or searching order-related information",
  schema: orderSearchSchema,
  func: async (params) => {
    const result = await WooCommerceService.searchWooCommerce<Order[]>(
      WOOCOMMERCE_ENDPOINTS.ORDERS,
      params
    );

    console.log("result");
    console.log(result);
    return JSON.stringify(result);
  },
});
