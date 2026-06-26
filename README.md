# Ecommerce Chatbot Backend

Ecommerce Chatbot Backend is a TypeScript/Express backend for a WooCommerce-aware AI shopping assistant. It combines LangChain, OpenAI, ChromaDB, Redis caching, scheduled catalog refreshes, and ecommerce tools for product, cart, order, and customer workflows.

The project is designed as a backend service for an embedded storefront chatbot that can answer FAQs, retrieve product context, and call ecommerce actions through structured tools.

## Highlights

- Express API written in TypeScript
- LangChain agent with OpenAI-backed reasoning
- ChromaDB vector retrieval for FAQ and content search
- WooCommerce API tools for products, cart, orders, and customer data
- Redis-backed category caching and scheduled refresh job
- Request validation, DTOs, centralized error handling, and typed interfaces
- Static audio assets for chat-widget interaction feedback

## Tech Stack

- Node.js
- TypeScript
- Express
- LangChain
- OpenAI
- ChromaDB
- Redis / ioredis
- WooCommerce REST API
- Zod
- Helmet
- CORS

## Project Structure

```text
src/
  config/          ChromaDB, Redis, and WooCommerce configuration
  controllers/     chat endpoints
  langchain/       agent, prompts, FAQ content, and ecommerce tools
  services/        chat, category, and WooCommerce services
  jobs/            scheduled category refresh job
  middleware/      error handling and validation
  validators/      request validators
  utils/           constants, formatters, helpers, typed interfaces
```

## Local Development

Install dependencies:

```bash
npm install
```

Create `.env` from `.env.example`, then run:

```bash
npm run dev
```

Build and run production output:

```bash
npm run build
npm start
```

## Security

Do not commit real `.env` files, API keys, WooCommerce credentials, Redis credentials, or customer/store data.

