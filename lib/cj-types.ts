// CJdropshipping API types — based on their OpenAPI 2.0 spec.
// Reference: https://developers.cjdropshipping.com/api2.0/v1/

export type CJCurrency = 'USD' | 'EUR' | 'CNY' | 'SAR';

export type CJWarehouse = 'CN' | 'SA' | 'US' | 'DE' | 'GB' | 'HK' | 'ID';

export type CJCategory = {
  categoryId: number;
  categoryName: string;
  categoryLevel: number;
  parentCategoryId: number | null;
};

export type CJVariant = {
  vid: string;                 // variant id
  name: string;                // "Black", "Red / XL"...
  properties: string;          // "Color:Black;Size:XL"
  price: number;               // USD
  sellPrice?: number;          // suggested retail
  image?: string;
  inventory: number;
  weight: number;              // grams
};

export type CJProduct = {
  id: string;
  name: string;
  nameAr?: string;             // not in API, optional translation
  sku: string;
  categoryId: number;
  categoryName: string;
  brand: string | null;
  description: string;
  descriptionAr?: string;
  images: string[];
  video?: string;
  weight: number;              // grams
  length: number;              // cm
  width: number;
  height: number;
  isFreeShipping: boolean;
  isInventoryWarning: boolean;
  variants: CJVariant[];
  basePrice: number;           // USD (cheapest variant)
  sourceUrl: string;           // original 1688/Taobao link
  // Populated by service:
  warehouse?: CJWarehouse;
  inSaudiWarehouse?: boolean;
  shippingDaysToSA?: number;
};

export type CJProductListResponse = {
  data: CJProduct[];
  total: number;
  pageNum: number;
  pageSize: number;
};

// Local extended product used throughout the storefront.
// Combines CJ data + our pricing rules + Arabic translations.
export type StoreProduct = CJProduct & {
  retailPriceSAR: number;      // our selling price
  costPriceSAR: number;        // our cost (CJ price + shipping estimate)
  margin: number;              // gross margin %
  audience: 'women' | 'men' | 'shared';  // we infer from category
  audienceLabel: string;
  arabicName: string;          // for Arabic display
  arabicDescription: string;
  badge?: 'الأكثر مبيعاً' | 'جديد' | 'شحن سريع' | 'لمسة شخصية';
  rating: number;
  reviewCount: number;
  salesCount: number;
  freeShipping: boolean;
  estimatedDeliveryDays: number;
  cjProductId: string;
};

// CJ API auth response
export type CJAuthResponse = {
  code: number;
  result: boolean;
  message: string;
  data: {
    accessToken: string;
    accessTokenExpiryDate: string; // ISO
  };
};
