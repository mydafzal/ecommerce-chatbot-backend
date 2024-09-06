import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";
import { BOSA_BASE_URL } from "../utils/constants";

const wooCommerceClient = new WooCommerceRestApi({
  url: BOSA_BASE_URL,
  consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY,
  consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET,
  version: "wc/v3",
});

export default wooCommerceClient;
