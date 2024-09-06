import { Category } from "./interfaces/category.interface";
import { Order } from "./interfaces/order.interface";
import { Product } from "./interfaces/product.interface";

export function generateChatId() {
  const timestamp = Date.now().toString(36);
  const randomString = Math.random().toString(36).substr(2, 5);
  return `chat_${timestamp}_${randomString}`;
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
  return rawData.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description ? item.description.substring(0, 300) : "",
    shortDescription: item.short_description,
    price: item.price,
    regularPrice: item.regular_price,
    categories: item.categories.map((category: any) => category.name),
    attributes: item.attributes.map((attribute: any) => attribute.id),
    tags: item.tags.map((tag: any) => tag.name),
    images: item.images.map((image: any) => image.src),
    relatedProductIds: item.related_product_ids,
    averageRating: item.average_rating,
    featured: item.featured,
    parentId: item.parent_id,
    permalink: item.permalink,
    purchaseNote: item.purchase_note,
    onSale: item.on_sale,
    salePrice: item.sale_price,
    stockStatus: item.stock_status,
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
    metadata: extractMetadata(item.meta_data),
  }));
}

function extractMetadata(metadata: any) {
  return metadata.map((item: any) => ({
    key: item.key,
    value: item.value,
  }));
}
