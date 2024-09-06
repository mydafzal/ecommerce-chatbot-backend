import { DynamicStructuredTool } from "langchain/tools";
import z from "zod";
import { WooCommerceService } from "../../services/woocommerce.service";
import { Product } from "../../utils/interfaces/product.interface";
import { WOOCOMMERCE_ENDPOINTS } from "../../utils/constants";

const productSearchSchema = z.object({
  search: z.string().optional().describe("name of a specific product"),
  category: z
    .string()
    .optional()
    .describe(
      "ID of a specific category to search products assigned to this category"
    ),
  max_price: z
    .number()
    .optional()
    .describe("if specificed, search products below this price"),
  min_price: z
    .number()
    .optional()
    .describe("if specificed, search products above this price"),
  on_sale: z
    .boolean()
    .optional()
    .describe("search products that are currently on sale"),
  stock_status: z
    .enum(["instock", "outofstock", "onbackorder"])
    .optional()
    .describe("search products based on their stock status"),
});

export const productSearchTool = new DynamicStructuredTool({
  name: "product-search-tool",
  description:
    "a tool for retreiving or searching product-related information for bosa's product catalog",
  schema: productSearchSchema,
  func: async (params) => {
    const result = await WooCommerceService.searchWooCommerce<Product[]>(
      WOOCOMMERCE_ENDPOINTS.PRODUCTS,
      params
    );

    return JSON.stringify(result);
  },
});
