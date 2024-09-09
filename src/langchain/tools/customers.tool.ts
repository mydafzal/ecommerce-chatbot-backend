import { DynamicStructuredTool } from "langchain/tools";
import z from "zod";

import { WooCommerceService } from "../../services/woocommerce.service";
import { WOOCOMMERCE_ENDPOINTS } from "../../utils/constants";
import { Customer } from "../../utils/interfaces/customer.interface";

const customerSearchSchema = z.object({
  search: z.number().optional().describe("customer's id"),
  email: z.string().email().optional().describe("customer's email"),
});

export const customerSearchTool = new DynamicStructuredTool({
  name: "customer-search-tool",
  description:
    "a tool for retreiving details of a specific customer of Bosa. you can use this tool to retrieve a customer's information that you don't have but need to call another tool.",
  schema: customerSearchSchema,
  func: async (params) => {
    const finalParams: any = {
      ...params,
    };

    if (
      params.search == 1 ||
      params.email == "developer@wordpress-developer.us"
    ) {
      finalParams.role = "administrator";
    }

    const result = await WooCommerceService.searchWooCommerce<Customer>(
      WOOCOMMERCE_ENDPOINTS.CUSTOMERS,
      finalParams
    );

    return JSON.stringify(result);
  },
});
