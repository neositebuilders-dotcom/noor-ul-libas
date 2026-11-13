export type CardProduct = {
  _id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  salePrice?: number;
  effectivePrice: number;
  discountPercent: number;
  image: string;
  images: string[];
  colors: string[];
  sizes: string[];
  stock: number;
  productType: "unstitched" | "stitched";
  pieceCount: number;
  fabric?: string;
  collections: string[];
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  salesCount: number;
  status: "published" | "draft";
  createdAt: number;
  categoryId?: string;
};

export type ProductDetail = {
  product: Omit<CardProduct, "image"> & {
    description: string;
    fabricDetails?: string;
    careInstructions?: string;
    includedPieces?: string;
    lowStockThreshold?: number;
  };
  categoryName: string | null;
  related: CardProduct[];
};
