import path from "path";
import * as fs from "node:fs";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
  PromptTemplate,
} from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { StructuredToolInterface } from "@langchain/core/tools";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { AgentExecutor, createOpenAIToolsAgent } from "langchain/agents";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { createRetrieverTool } from "langchain/tools/retriever";

import { CategoriesService } from "../../services/categories.service";
import { formatCategoriesToString, formatObject } from "../../utils/formatters";
import {
  chatSystemPromptForCustomers,
  chatSystemPromptForGuestCustomers,
} from "../prompts/chat.prompt";
import { orderSearchTool } from "../tools/orders.tool";
import { productSearchTool } from "../tools/products.tool";

import { Redis } from "ioredis";
import { UserDetails } from "../../dtos";
import { createCustomerSearchTool } from "../tools/customers.tool";
import { chromaStore } from "../../config/chromaDb.config";
import { createAddToCartItemTool } from "../tools/cart.tool";
import { createGetCartDetailsTool } from "../tools/cartDetails.tool";
import { RedisChatMessageHistory } from "@langchain/community/stores/message/ioredis";
// import { customerSearchTool } from "../tools/customers.tool";

import { AIMessage, FunctionMessage } from "@langchain/core/messages";
import { formatToOpenAIFunctionMessages } from "langchain/agents/format_scratchpad";

// interface ToolCall {
//   id: string;
//   type: "function";
//   function: {
//     name: string;
//     arguments: string;
//   };
// }

const client = new Redis(`redis://localhost:${process.env.REDIS_PORT}`, {
  password: process.env.REDIS_PASSWORD,
});
const tools: StructuredToolInterface[] = [productSearchTool];

const model = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
});
async function addKnowledgeTool() {
  // Use the retriever from Chroma for querying
  const vectorStoreRetriever = chromaStore.asRetriever();
  const retrieverTool = createRetrieverTool(vectorStoreRetriever, {
    name: "information-retriever-tool",
    description:
      "This tool retrieves information on frequently asked questions (FAQs), brand details, business policies, and similar queries. Use this tool to provide accurate responses to those types of questions.",
  });

  tools.push(retrieverTool);
}

async function addFAQDocsToChromaDB() {
  // const filePath = path.join(__dirname, "FAQ.txt"); //For local
  const filePath = "/var/www/bosa-chatbot-backend/src/langchain/agents/FAQ.txt"; // for deployment

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
  senderName: string,
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
  const addItemToCartTool = createAddToCartItemTool(chatId);
  const getCartDetailsTool = createGetCartDetailsTool(chatId);
  if (userDetails) {
    tools.push(orderSearchTool);
    tools.push(addItemToCartTool);
    tools.push(getCartDetailsTool);
    systemPrompt = await PromptTemplate.fromTemplate(
      chatSystemPromptForCustomers
    ).format({
      categories: formatCategoriesToString(categories),
      customer: formatObject(userDetails),
      customerName: userDetails.name,
      loggedInCustomerId: userDetails.id,
    });
  } else {
    console.log("userDetails");
    console.log(userDetails);
    console.log("Guest - User");
    systemPrompt = await PromptTemplate.fromTemplate(
      chatSystemPromptForGuestCustomers
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

  const agent = await createOpenAIToolsAgent({
    llm: model,
    tools,
    prompt,
  });

  const agentExecutor = new AgentExecutor({
    agent,
    tools,
    returnIntermediateSteps: true,
  });

  // Retrieve chat history from Redis
  const chatHistory = new RedisChatMessageHistory({
    sessionId: chatId,
    client,
  });
  const history = await chatHistory.getMessages();

  // Execute agent with chat history
  const response = await agentExecutor.invoke(
    { input: userQuery, chat_history: history },
    { configurable: { sessionId: chatId } }
  );

  // Format the response using the langchain formatter
  const formattedMessages = formatToOpenAIFunctionMessages(
    response.intermediateSteps
  );

  // Create a new AIMessage with the formatted content
  const aiMessage = new AIMessage({
    content: response.output,
    additional_kwargs: {
      function_call:
        formattedMessages.length > 0 &&
        "function_call" in formattedMessages[formattedMessages.length - 1]
          ? (formattedMessages[formattedMessages.length - 1] as any)
              .function_call
          : undefined,
      timestamp: new Date().getTime(),
      id: history.length + 1,
      senderName: senderName,
    },
  });

  // Store the messages in Redis

  const humanMessage = new HumanMessage({
    content: userQuery,
    additional_kwargs: {
      timestamp: new Date().getTime(),
      id: history.length + 1,
      senderName: senderName,
    },
  });
  await chatHistory.addMessage(humanMessage);
  await chatHistory.addMessage(aiMessage);

  // Add tool response messages
  for (const message of formattedMessages) {
    if (message instanceof FunctionMessage) {
      await chatHistory.addMessage(
        new FunctionMessage({
          content: message.content,
          name: message.name ?? "",
        })
      );
    }
  }

  return response.output;
}
