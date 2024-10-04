export interface Product {
  id: number;
  name: string;
  description: string;
  shortDescription: string;
  permalink: string;
  featured: boolean;
  price: string;
  regularPrice: string;
  salePrice: string;
  onSale: boolean;
  averageRating: string;
  parentId: 0;
  purchaseNote: "";
  categories: string[];
  images: string[];
  tags: string[];
  attributes: number[];
  relatedProductIds: number[];
  stockStatus: StockStatus;
  // metadata: ProductMetaData[];
  availableSizes: any;
  productFeatures: any;
}

export enum StockStatus {
  InStock = "instock",
  OutOfStock = "outofstock",
  OnBackorder = "onbackorder",
}

export interface ProductMetaData {
  key: string;
  value: string;
}
