import dotenv from "dotenv";
import express, { Express, Request, Response } from "express";
import path from "path";

import cors from "cors";
import helmet from "helmet";

dotenv.config({
  path: path.join(process.cwd(), ".env"),
});

import chatsController from "./controllers/chats.controller";
import { errorHandler } from "./middleware/error-handler.middleware";

import { startCategoryRefreshJob } from "./jobs/categories-refresh.job";
import { CategoriesService } from "./services/categories.service";
import { connectRedis } from "./config/redis.config";

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());

app.use("/chats", chatsController);

app.get("/", (_req: Request, res: Response) => {
  res.send("Server is running...");
});

app.use(errorHandler);

async function startServer() {
  await connectRedis();

  await CategoriesService.fetchAndCacheCategories();

  // initialize a scheduler for periodically updating cached categories
  startCategoryRefreshJob();

  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server: ", error);
  process.exit(1);
});
