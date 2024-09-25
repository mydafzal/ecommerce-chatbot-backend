import { RedisChatMessageHistory } from "@langchain/community/stores/message/ioredis";
import { Category } from "./interfaces/category.interface";
import { Order } from "./interfaces/order.interface";
import { Product } from "./interfaces/product.interface";
import { Customer } from "./interfaces/customer.interface";
import { Redis } from "ioredis";

export function generateChatId() {
  const timestamp = Date.now().toString(36);
  const randomString = Math.random().toString(36).substr(2, 5);
  return `chat_${timestamp}_${randomString}`;
}

// export class ExtendedRedisChatMemory extends RedisChatMessageHistory {
//   async addMessage(message: any) {
//     const messages = await this.getMessages();

//     message.additional_kwargs = {
//       timestamp: new Date().getTime(),
//       id: messages.length + 1,
//     };

//     await super.addMessage(message);
//   }
// }

interface ExtendedRedisChatMemoryConfig {
  sessionId: string;
  client: Redis;
  senderName: string; // Add this line
}

export class ExtendedRedisChatMemory extends RedisChatMessageHistory {
  private senderName: string;

  constructor(config: ExtendedRedisChatMemoryConfig) {
    super({ sessionId: config.sessionId, client: config.client });
    this.senderName = config.senderName;
  }

  async addMessage(message: any) {
    const messages = await this.getMessages();

    message.additional_kwargs = {
      ...message.additional_kwargs,
      timestamp: new Date().getTime(),
      id: messages.length + 1,
      senderName: this.senderName,
    };

    await super.addMessage(message);
  }
}

export function transformCategoriesData(rawData: any[]): Category[] {
  return rawData.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    parentCategoryId: item.parent,
  }));
}

export function transformProductsData(rawData: any[]): Product[] {
  return rawData.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description
      ? product.description.substring(0, 300)
      : "",
    shortDescription: product.short_description,
    price: product.price,
    regularPrice: product.regular_price,
    categories: product.categories.map((category: any) => category.name),
    attributes: product.attributes.map((attribute: any) => attribute.id),
    tags: product.tags.map((tag: any) => tag.name),
    images: product.images.map((image: any) => image.src),
    relatedProductIds: product.related_product_ids,
    averageRating: product.average_rating,
    featured: product.featured,
    parentId: product.parent_id,
    permalink: product.permalink,
    purchaseNote: product.purchase_note,
    onSale: product.on_sale,
    salePrice: product.sale_price,
    stockStatus: product.stock_status,
    metadata: extractMetadata(product.meta_data, "product"),
  }));
}

export function transformOrdersData(rawData: any[]): Order[] {
  return rawData.map((order) => ({
    id: order.id,
    billing: order.billing,
    currency: order.currency,
    customerId: order.customer_id,
    customerNote: order.customer_note,
    dateCompleted: order.date_completed,
    dateCreated: order.date_Created,
    dateModified: order.date_codified,
    datePaid: order.date_paid,
    discountTotal: order.discount_total,
    orderItems: extractOrderItems(order),
    paymentMethodTitle: order.payment_method_title,
    pricesIncludeTax: order.prices_include_tax,
    refunds: order.refunds.map((refund: any) => refund.id),
    shipping: order.shipping,
    shippingTotal: order.shipping_total,
    status: order.status,
    total: order.total,
    totalTax: order.total_tax,
  }));
}

function extractOrderItems(order: any) {
  return order.line_items.map((item: any) => ({
    productName: item.name,
    quantity: item.quantity,
    price: item.price,
    metadata: extractMetadata(item.meta_data, "order"),
  }));
}

function extractMetadata(metadata: any[], entity: string) {
  if (entity === "product") {
    metadata = metadata.filter(
      (item: any) => !item.key.startsWith("_") && item.value
    );
  }

  return metadata.map((item: any) => ({
    key: item.key,
    value: item.value,
  }));
}

export function transformCustomersData(rawData: any[]): Customer[] {
  return rawData.map((customer) => ({
    id: customer.id,
    fullName: `${customer.first_name} ${customer.last_name}`,
    email: customer.email,
    avatarUrl: customer.avatar_url,
    billing: customer.billing,
    isPayingCustomer: customer.is_paying_customer,
    shipping: customer.shipping,
  }));
}
