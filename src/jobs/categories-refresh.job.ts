import cron from "node-cron";
import { CategoriesService } from "../services/categories.service";

export function startCategoryRefreshJob() {
  cron.schedule("0 * * * *", async () => {
    await CategoriesService.fetchAndCacheCategories();
  });
}
