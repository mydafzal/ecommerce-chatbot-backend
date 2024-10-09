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
// import { ChromaClient } from "chromadb";
// const client = new ChromaClient();

// console.log("chroma client");
// console.log(client);

// import { ChatOpenAI } from "@langchain/openai";
// import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";

// import { Chroma } from "@langchain/community/vectorstores/chroma";
// import { OpenAIEmbeddings } from "@langchain/openai";
// import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

// const embeddings = new OpenAIEmbeddings({
//   model: "text-embedding-3-small",
// });

// const vectorStore = new Chroma(embeddings, {
//   collectionName: "a-test-collectio",
//   url: "http://localhost:8000", // Optional, will default to this value
//   collectionMetadata: {
//     "hnsw:space": "cosine",
//   }, // Optional, can be used to specify the distance method of the embedding space https://docs.trychroma.com/usage-guide#changing-the-distance-function
// });

// // Load data from the webpage and store it in the vector store
// async function loadData() {
//   const loader = new CheerioWebBaseLoader(
//     "https://houseofbosa.com/staging/terms-and-conditions/"
//   );

//   const docs = await loader.load();

//   const textSplitter = new RecursiveCharacterTextSplitter({
//     chunkSize: 500,
//     chunkOverlap: 50,
//   });

//   const splitDocs = await textSplitter.splitDocuments(docs);

//   try {
//     console.log("Adding documents to vector store...");
//     await vectorStore.addDocuments(splitDocs);
//     console.log("Documents successfully added to vector store");
//   } catch (error) {
//     console.error("Error adding documents to vector store:", error);
//   }
// }

// async function searchDocuments(query: string) {
//   try {
//     const searchResults = await vectorStore.similaritySearch(query);

//     const readableResults = searchResults.map((result, index) => {
//       return `Result ${index + 1}:\nContent: ${result.pageContent}\nSource: ${
//         result.metadata.source
//       }\n\n`;
//     });

//     return readableResults.join("\n");
//   } catch (error) {
//     console.error("Error during search:", error);
//     return "No results found.";
//   }
// }

// // Load the data into the vector store
// // loadData();

// // Example usage of the search function
// (async () => {
//   const query = "What is bosa?"; // Your search query
//   const searchOutput = await searchDocuments(query);
//   console.log("Search Results:");
//   console.log(searchOutput); // Log human-readable search results
// })();

const app: Express = express();
const port = process.env.PORT || 3000;

// Serve static files from the 'static' directory

// app.use(express.static(path.join(__dirname, "static"))); //local
app.use(
  express.static(path.join("/var/www/bosa-chatbot-backend/src", "static"))
); //deployed

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: ["http://localhost", "https://houseofbosa.com"], // Allowed origins
    credentials: true,
  })
);
// app.use(cors());

app.use(helmet());

app.use("/bosa/chats", chatsController);

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
