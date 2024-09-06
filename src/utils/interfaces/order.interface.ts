export interface Order {
  id: number;
  status: OrderStatus;
  currency: string;
  pricesIncludeTax: true;
  dateCreated: string;
  dateModified: string;
  dateCompleted: null;
  discountTotal: string;
  shippingTotal: string;
  total: string;
  totalTax: string;
  customerId: number;
  customerNote: string;
  paymentMethodTitle: string;
  datePaid: string;
  refunds: number[];
  orderItems: OrderItem[];
  shipping: any;
  billing: any;
}

export enum OrderStatus {
  Pending = "pending",
  Processiong = "processing",
  OnHold = "on-hold",
  Completed = "completed",
  Cancelled = "cancelled",
  Refunded = "refunded",
  Failed = "failed",
  Trash = "trash",
}

export interface OrderItem {
  productName: string;
  quantity: number;
  price: number;
  metadata: OrderItemMetadata[];
}

export interface OrderItemMetadata {
  key: string;
  value: string;
}
