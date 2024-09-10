import { SystemMessage } from "@langchain/core/messages";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
  PromptTemplate,
} from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";

import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";

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
import { StructuredToolInterface } from "@langchain/core/tools";
// import { customerSearchTool } from "../tools/customers.tool";

const client = new Redis(`redis://localhost:${process.env.REDIS_PORT}`);

const model = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
});

const tools: StructuredToolInterface[] = [productSearchTool, orderSearchTool];

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
