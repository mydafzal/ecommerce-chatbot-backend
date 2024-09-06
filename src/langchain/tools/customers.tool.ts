import { DynamicStructuredTool } from "langchain/tools";
import z from "zod";

import { WooCommerceService } from "../../services/woocommerce.service";
import { WOOCOMMERCE_ENDPOINTS } from "../../utils/constants";

const customerSearchSchema = z.object({
  id: z.number().optional().describe("customer's id"),
  email: z.string().email().optional().describe("customer's email"),
});

export const customerSearchTool = new DynamicStructuredTool({
  name: "customer-search-tool",
  description:
    "a tool for retreiving details of a specific customer of Bosa. you can use this tool retrieve a customer's information that you don't have but need to call another tool.",
  schema: customerSearchSchema,
  func: async (params) => {
    let result;

    if (params.id) {
      result = await WooCommerceService.searchWooCommerce(
        `${WOOCOMMERCE_ENDPOINTS.CUSTOMERS}/${params.id}`,
        params
      );
    } else {
      result = await WooCommerceService.searchWooCommerce(
        WOOCOMMERCE_ENDPOINTS.CUSTOMERS,
        { ...params, role: "administrator" }
      );
    }

    return JSON.stringify(result);
  },
});
