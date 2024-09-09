import wooCommerceClient from "../config/woocommerce.config";

import {
  transformCategoriesData,
  transformCustomersData,
  transformOrdersData,
  transformProductsData,
} from "../utils/helpers";

type TransformFunction = (data: any[]) => any;

export const transformations: Record<string, TransformFunction> = {
  products: transformProductsData,
  "products/categories": transformCategoriesData,
  orders: transformOrdersData,
  customers: transformCustomersData,
};

async function searchWooCommerce<T>(
  endpoint: string,
  params?: any
): Promise<T | undefined> {
  try {
    console.log("params: ", params);
    console.log("endpoint: ", endpoint);

    let result = await wooCommerceClient.get(endpoint, params);

    const transformationFunction = transformations[endpoint];

    if (transformationFunction) {
      const transformedResult = transformationFunction(result.data) as T;
      console.log(
        "searchWooCommerce response transformed: ",
        transformedResult
      );

      return transformedResult;
    }

    console.log("searchWooCommerce response: ", result?.data);

    return result?.data;
  } catch (error) {
    console.log("searchWooCommerce error: ", error);
  }
}

export const WooCommerceService = { searchWooCommerce };
