import path from "path";
import * as fs from "node:fs";
import { SystemMessage } from "@langchain/core/messages";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
  PromptTemplate,
} from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { StructuredToolInterface } from "@langchain/core/tools";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { createRetrieverTool } from "langchain/tools/retriever";

import { CategoriesService } from "../../services/categories.service";
import { formatCategoriesToString, formatObject } from "../../utils/formatters";
import {
  chatSystemPromptForCustomers,
  chatSystemPromptForGuestUsers,
} from "../prompts/chat.prompt";
import { orderSearchTool } from "../tools/orders.tool";
import { productSearchTool } from "../tools/products.tool";

import { Redis } from "ioredis";
import { UserDetails } from "../../dtos";
import { ExtendedRedisChatMemory } from "../../utils/helpers";
import { createCustomerSearchTool } from "../tools/customers.tool";
import { chromaStore } from "../../config/chromaDb.config";
// import { customerSearchTool } from "../tools/customers.tool";

const client = new Redis(`redis://localhost:${process.env.REDIS_PORT}`);
const tools: StructuredToolInterface[] = [productSearchTool, orderSearchTool];

const model = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
});
async function addKnowledgeTool() {
  // Use the retriever from Chroma for querying
  const vectorStoreRetriever = chromaStore.asRetriever();
  const retrieverTool = createRetrieverTool(vectorStoreRetriever, {
    name: "FAQ",
    description:
      "This tool is designed to provide answers based solely on Bosa’s policies, FAQs and terms and conditions. Please use it exclusively for inquiries related to Bosa, including topics like general information, payments, orders, intellectual property, shipping and delivery, returns and exchanges, and restrictions. If relevant information is found, provide a clear and accurate response. If no relevant information is available, kindly inform the user that the answer couldn’t be found based on the FAQs and ask for clarification, avoiding independent answers or speculation.",
  });

  tools.push(retrieverTool);
}

async function addFAQDocsToChromaDB() {
  const filePath = path.join(__dirname, "FAQ.txt");

  try {
    const text = fs.readFileSync(filePath, "utf8");
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
    });
    const docs = await textSplitter.createDocuments([text]);

    // Adding documents to Chroma DB
    await chromaStore.addDocuments(docs);

    console.log("FAQ documents successfully added to ChromaDB!");
  } catch (error) {
    console.error("Error adding FAQ documents to ChromaDB:", error);
  }
}

async function addTermsAndConditionsToChromaDB() {
  try {
    const loader = new CheerioWebBaseLoader(
      "https://houseofbosa.com/staging/terms-and-conditions/"
    );
    const termAndConditions = await loader.load();
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
    });
    const docs = await textSplitter.splitDocuments(termAndConditions);

    console.log(docs);
    // Adding documents to Chroma DB
    await chromaStore.addDocuments(docs);

    console.log(
      "Terms and Conditions documents successfully added to ChromaDB!"
    );
  } catch (error) {
    console.error(
      "Error adding Terms and Conditions documents to ChromaDB:",
      error
    );
  }
}

addKnowledgeTool();
// addTermsAndConditionsToChromaDB();
// addFAQDocsToChromaDB();
export async function generateAgentResponse(
  chatId: string,
  userQuery: string,
  userDetails?: UserDetails
) {
  const categories = await CategoriesService.getCachedCategories();

  if (userDetails) {
    const customerSearchTool = createCustomerSearchTool(userDetails.id);
    tools.push(customerSearchTool);
  }

  // const systemPrompt = await PromptTemplate.fromTemplate(
  //   chatSystemPrompt
  // ).format({
  //   categories: formatCategoriesToString(categories),
  // });

  let systemPrompt: any;

  if (userDetails) {
    systemPrompt = await PromptTemplate.fromTemplate(
      chatSystemPromptForCustomers
    ).format({
      categories: formatCategoriesToString(categories),
      customer: formatObject(userDetails),
      customerName: userDetails.name,
    });
  } else {
    systemPrompt = await PromptTemplate.fromTemplate(
      chatSystemPromptForGuestUsers
    ).format({
      categories: formatCategoriesToString(categories),
    });
  }

  let prompt = ChatPromptTemplate.fromMessages([
    new SystemMessage(systemPrompt),
    new MessagesPlaceholder("chat_history"),
    new MessagesPlaceholder("input"),
    new MessagesPlaceholder("agent_scratchpad"),
  ]);

  const agent = await createOpenAIFunctionsAgent({
    llm: model,
    tools,
    prompt,
  });

  const agentExecutor = new AgentExecutor({
    agent,
    tools,
  });

  const agentWithChatHistory = new RunnableWithMessageHistory({
    runnable: agentExecutor,
    getMessageHistory: (sessionId) =>
      new ExtendedRedisChatMemory({
        sessionId,
        client,
      }),
    inputMessagesKey: "input",
    historyMessagesKey: "chat_history",
  });

  const response = await agentWithChatHistory.invoke(
    { input: userQuery },
    { configurable: { sessionId: chatId } }
  );

  return response.output;
}
