import { connectRedis, redisClient } from "../config/redis.config";
import { WOOCOMMERCE_ENDPOINTS } from "../utils/constants";
import { Category } from "../utils/interfaces/category.interface";
import { WooCommerceService } from "./woocommerce.service";

const CACHE_KEY = "categories";
const CACHE_TTL = 3600; // 1 hour in seconds

async function getCachedCategories() {
  const cachedCategories = await redisClient.get(CACHE_KEY);

  if (cachedCategories) {
    return JSON.parse(cachedCategories);
  }

  return null;
}

async function setCachedCategories(categories: Category[]) {
  // ensure redis is connected
  if (!redisClient.isOpen) {
    await connectRedis();
  }

  await redisClient.set(CACHE_KEY, JSON.stringify(categories), {
    EX: CACHE_TTL,
  });
}

async function fetchAndCacheCategories() {
  try {
    const categories = await WooCommerceService.searchWooCommerce<Category[]>(
      WOOCOMMERCE_ENDPOINTS.CATEGORIES
    );

    if (categories) {
      await setCachedCategories(categories);
    }

    console.log("Categories successfully fetched and cached.");
  } catch (error) {
    console.error("Error fetching categories from API:", error);
  }
}

export const CategoriesService = {
  getCachedCategories,
  fetchAndCacheCategories,
};
