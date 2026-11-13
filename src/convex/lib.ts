import { getAuthUserId } from "@convex-dev/auth/server";
import type { Doc } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";

export const BUSINESS_EMAIL = "rq984690@gmail.com";

export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) return null;
  return await ctx.db.get(userId);
}

export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const user = await getCurrentUser(ctx);
  if (!user || user.role !== "admin") {
    throw new Error("Admin access required.");
  }
  return user;
}

export async function getSignedInUserId(ctx: QueryCtx | MutationCtx) {
  return await getAuthUserId(ctx);
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function effectivePrice(product: Doc<"products">) {
  if (
    typeof product.salePrice === "number" &&
    product.salePrice > 0 &&
    product.salePrice < product.price
  ) {
    return product.salePrice;
  }
  return product.price;
}

export function discountPercent(product: Doc<"products">) {
  const sale = product.salePrice;
  if (!sale || sale >= product.price || product.price <= 0) return 0;
  return Math.round(((product.price - sale) / product.price) * 100);
}

export function normalizePhone(input: string) {
  return input.replace(/[^0-9]/g, "");
}

export type ProductCard = {
  _id: Doc<"products">["_id"];
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
  categoryId?: Doc<"products">["categoryId"];
};

export function toProductCard(product: Doc<"products">): ProductCard {
  return {
    _id: product._id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    price: product.price,
    salePrice: product.salePrice,
    effectivePrice: effectivePrice(product),
    discountPercent: discountPercent(product),
    image: product.images[0] ?? "",
    images: product.images,
    colors: product.colors,
    sizes: product.sizes,
    stock: product.stock,
    productType: product.productType,
    pieceCount: product.pieceCount,
    fabric: product.fabric,
    collections: product.collections,
    isFeatured: product.isFeatured,
    isNewArrival: product.isNewArrival,
    isBestSeller: product.isBestSeller,
    salesCount: product.salesCount,
    status: product.status,
    createdAt: product.createdAt,
    categoryId: product.categoryId,
  };
}
