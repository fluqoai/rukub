// Normalized CJdropshipping types used by the store.
// The API returns different shapes for list, detail, inventory and freight calls;
// lib/cj-client.ts converts all of them to these stable types.

export type CJCurrency = 'USD' | 'SAR';
export type CJWarehouse = string;

export type CJCategory = {
  categoryId: string;
  categoryName: string;
  categoryLevel: number;
  parentCategoryId: string | null;
};

export type CJInventory = {
  countryCode: string;
  countryName: string;
  warehouseName: string;
  totalInventory: number;
  cjInventory: number;
  factoryInventory: number;
  verified: boolean;
};

export type CJVariant = {
  vid: string;
  name: string;
  properties: string;
  sku?: string;
  price: number;
  suggestedPrice?: number;
  image?: string;
  inventory: number;
  weight: number;
  length?: number;
  width?: number;
  height?: number;
  inventories?: CJInventory[];
};

export type CJProduct = {
  id: string;
  name: string;
  nameAr?: string;
  sku: string;
  categoryId: string | number;
  categoryName: string;
  brand: string | null;
  description: string;
  descriptionAr?: string;
  images: string[];
  videos?: string[];
  weight: number;
  length: number;
  width: number;
  height: number;
  isFreeShipping: boolean;
  isInventoryWarning: boolean;
  variants: CJVariant[];
  basePrice: number;
  sourceUrl: string;
  listedNum?: number;
  warehouse?: CJWarehouse;
  inSaudiWarehouse: boolean;
  shippingDaysToSA?: number;
};

export type CJProductListResponse = {
  data: CJProduct[];
  total: number;
  pageNum: number;
  pageSize: number;
};

export type CJFreightQuote = {
  originCountryCode: string;
  destinationCountryCode: string;
  logisticsName: string;
  priceUSD: number;
  deliveryMinDays: number | null;
  deliveryMaxDays: number | null;
  deliveryLabel: string;
  taxesFeeUSD: number;
  serviceFeeUSD: number;
  currency: CJCurrency;
};

export type CJProductSnapshot = {
  product: CJProduct;
  inventories: CJInventory[];
  selectedVariant: CJVariant | null;
  freight: CJFreightQuote | null;
  checkedAt: string;
};

export type StoreProduct = CJProduct & {
  retailPriceSAR: number;
  costPriceSAR: number;
  margin: number;
  audience: 'women' | 'men' | 'shared';
  audienceLabel: string;
  arabicName: string;
  arabicDescription: string;
  badge?: 'جديد' | 'مختار لركوب' | 'متوفر محلياً';
  rating: number;
  reviewCount: number;
  salesCount: number;
  freeShipping: boolean;
  estimatedDeliveryDays: number;
  deliveryMinDays: number | null;
  deliveryMaxDays: number | null;
  cjProductId: string;
};

export type CJAuthResponse = {
  code: number;
  result: boolean;
  message: string;
  data: {
    accessToken: string;
    accessTokenExpiryDate: string;
  };
};
