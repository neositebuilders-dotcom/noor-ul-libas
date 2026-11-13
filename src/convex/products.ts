import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import {
  effectivePrice,
  requireAdmin,
  slugify,
  toProductCard,
  type ProductCard,
} from "./lib";
import { productTypeValidator } from "./schema";

const sortValidator = v.union(
  v.literal("newest"),
  v.literal("price-asc"),
  v.literal("price-desc"),
  v.literal("popular"),
  v.literal("name"),
);

function matchesCategory(product: Doc<"products">, slug: string) {
  switch (slug) {
    case "unstitched":
    case "unstitched-collection":
      return product.productType === "unstitched";
    case "ready-to-wear":
      return product.productType === "stitched";
    case "two-piece":
    case "two-piece-suits":
      return product.pieceCount === 2;
    case "three-piece":
    case "three-piece-suits":
      return product.pieceCount === 3;
    case "new-arrivals":
      return product.isNewArrival;
    case "best-sellers":
      return product.isBestSeller;
    case "featured":
    case "featured-collection":
      return product.isFeatured;
    case "sale":
    case "sale-clearence":
      return (
        typeof product.salePrice === "number" && product.salePrice < product.price
      );
    default:
      return (
        product.collections.includes(slug) ||
        slugify(product.fabric ?? "") === slug
      );
  }
}

export const list = query({
  args: {
    search: v.optional(v.string()),
    category: v.optional(v.string()),
    productType: v.optional(productTypeValidator),
    pieceCount: v.optional(v.number()),
    fabric: v.optional(v.string()),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
    inStockOnly: v.optional(v.boolean()),
    onSaleOnly: v.optional(v.boolean()),
    sort: v.optional(sortValidator),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("products")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();

    const search = args.search?.trim().toLowerCase();
    let items = rows.filter((product) => {
      if (args.category && !matchesCategory(product, args.category)) return false;
      if (args.productType && product.productType !== args.productType)
        return false;
      if (args.pieceCount && product.pieceCount !== args.pieceCount)
        return false;
      if (args.fabric && product.fabric !== args.fabric) return false;
      if (args.minPrice !== undefined && effectivePrice(product) < args.minPrice)
        return false;
      if (args.maxPrice !== undefined && effectivePrice(product) > args.maxPrice)
        return false;
      if (args.inStockOnly && product.stock <= 0) return false;
      if (args.onSaleOnly && !(product.salePrice && product.salePrice < product.price))
        return false;
      if (search) {
        const haystack = [
          product.name,
          product.sku,
          product.fabric ?? "",
          product.description,
          ...product.collections,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      return true;
    });

    const sort = args.sort ?? "newest";
    items = [...items].sort((a, b) => {
      switch (sort) {
        case "price-asc":
          return effectivePrice(a) - effectivePrice(b);
        case "price-desc":
          return effectivePrice(b) - effectivePrice(a);
        case "popular":
          return b.salesCount - a.salesCount;
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return b.createdAt - a.createdAt;
      }
    });

    const total = items.length;
    if (args.limit) items = items.slice(0, args.limit);
    return { items: items.map(toProductCard), total } as {
      items: ProductCard[];
      total: number;
    };
  },
});

export const adminList = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const [products, categories] = await Promise.all([
      ctx.db.query("products").collect(),
      ctx.db.query("categories").collect(),
    ]);
    return products
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((product) => ({
        ...product,
        categoryName:
          categories.find((c) => c._id === product.categoryId)?.name ?? "—",
        effectivePrice: effectivePrice(product),
      }));
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const product = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (!product || product.status !== "published") return null;

    const category = product.categoryId
      ? await ctx.db.get(product.categoryId)
      : null;

    const relatedRows = await ctx.db
      .query("products")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();

    const related = relatedRows
      .filter(
        (row) =>
          row._id !== product._id &&
          (row.categoryId === product.categoryId ||
            row.collections.some((c) => product.collections.includes(c))),
      )
      .slice(0, 4)
      .map(toProductCard);

    return {
      product: {
        ...product,
        effectivePrice: effectivePrice(product),
      },
      categoryName: category?.name ?? null,
      related,
    };
  },
});

export const lowStock = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const rows = await ctx.db.query("products").collect();
    return rows
      .filter((row) => row.stock <= (row.lowStockThreshold ?? 5))
      .sort((a, b) => a.stock - b.stock);
  },
});

const productInput = {
  name: v.string(),
  slug: v.optional(v.string()),
  sku: v.string(),
  description: v.string(),
  fabricDetails: v.optional(v.string()),
  careInstructions: v.optional(v.string()),
  categoryId: v.optional(v.id("categories")),
  collections: v.array(v.string()),
  productType: productTypeValidator,
  pieceCount: v.number(),
  fabric: v.optional(v.string()),
  includedPieces: v.optional(v.string()),
  price: v.number(),
  salePrice: v.optional(v.union(v.number(), v.null())),
  images: v.array(v.string()),
  colors: v.array(v.string()),
  sizes: v.array(v.string()),
  stock: v.number(),
  lowStockThreshold: v.optional(v.number()),
  isFeatured: v.boolean(),
  isNewArrival: v.boolean(),
  isBestSeller: v.boolean(),
  status: v.union(v.literal("published"), v.literal("draft")),
};

export const saveProduct = mutation({
  args: { id: v.optional(v.id("products")), input: v.object(productInput) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const input = args.input;
    const name = input.name.trim();
    if (!name) throw new Error("Product name is required.");
    if (input.price <= 0) throw new Error("Price must be greater than zero.");
    if (!Number.isFinite(input.stock) || input.stock < 0)
      throw new Error("Stock must be zero or more.");
    if (input.images.length === 0)
      throw new Error("Add at least one product image.");
    if (
      input.salePrice !== null &&
      input.salePrice !== undefined &&
      (input.salePrice <= 0 || input.salePrice >= input.price)
    ) {
      throw new Error("Sale price must be lower than the regular price.");
    }

    const all = await ctx.db.query("products").collect();
    const baseSlug = slugify(input.slug?.trim() || name);
    const slugClash = all.find(
      (row) => row.slug === baseSlug && row._id !== args.id,
    );
    const slug = slugClash
      ? `${baseSlug}-${Date.now().toString(36).slice(-4)}`
      : baseSlug;

    const sku = input.sku.trim() || `NL-${Date.now().toString(36).toUpperCase()}`;
    if (all.some((row) => row.sku === sku && row._id !== args.id)) {
      throw new Error(`SKU ${sku} is already used by another product.`);
    }

    const payload = {
      name,
      slug,
      sku,
      description: input.description,
      fabricDetails: input.fabricDetails,
      careInstructions: input.careInstructions,
      categoryId: input.categoryId,
      collections: input.collections,
      productType: input.productType,
      pieceCount: input.pieceCount,
      fabric: input.fabric,
      includedPieces: input.includedPieces,
      price: input.price,
      salePrice:
        input.salePrice === null || input.salePrice === undefined
          ? undefined
          : input.salePrice,
      images: input.images,
      colors: input.colors,
      sizes: input.sizes,
      stock: input.stock,
      lowStockThreshold: input.lowStockThreshold ?? 5,
      isFeatured: input.isFeatured,
      isNewArrival: input.isNewArrival,
      isBestSeller: input.isBestSeller,
      status: input.status,
    };

    if (args.id) {
      const previous = await ctx.db.get(args.id);
      await ctx.db.patch(args.id, payload);
      if (previous && previous.stock !== input.stock) {
        await ctx.db.insert("inventoryLogs", {
          productId: args.id,
          productName: name,
          delta: input.stock - previous.stock,
          previousStock: previous.stock,
          newStock: input.stock,
          reason: "Product edited by admin",
          createdAt: Date.now(),
        });
      }
      return args.id;
    }

    const id = await ctx.db.insert("products", {
      ...payload,
      salesCount: 0,
      sortOrder: 0,
      createdAt: Date.now(),
    });
    await ctx.db.insert("inventoryLogs", {
      productId: id,
      productName: name,
      delta: input.stock,
      previousStock: 0,
      newStock: input.stock,
      reason: "Product created",
      createdAt: Date.now(),
    });
    return id;
  },
});

export const removeProduct = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_product", (q) => q.eq("productId", args.id))
      .collect();
    for (const review of reviews) await ctx.db.delete(review._id);
    await ctx.db.delete(args.id);
  },
});

export const duplicateProduct = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const product = await ctx.db.get(args.id);
    if (!product) throw new Error("Product not found.");
    const { _id, _creationTime, ...rest } = product;
    void _id;
    void _creationTime;
    return await ctx.db.insert("products", {
      ...rest,
      name: `${product.name} (Copy)`,
      slug: `${product.slug}-copy-${Date.now().toString(36).slice(-4)}`,
      sku: `${product.sku}-C${Date.now().toString(36).slice(-3).toUpperCase()}`,
      status: "draft",
      salesCount: 0,
      createdAt: Date.now(),
    });
  },
});

export const bulkAction = mutation({
  args: {
    ids: v.array(v.id("products")),
    action: v.union(
      v.literal("publish"),
      v.literal("unpublish"),
      v.literal("feature"),
      v.literal("unfeature"),
      v.literal("bestSeller"),
      v.literal("removeBestSeller"),
      v.literal("delete"),
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    for (const id of args.ids) {
      if (args.action === "delete") {
        const reviews = await ctx.db
          .query("reviews")
          .withIndex("by_product", (q) => q.eq("productId", id))
          .collect();
        for (const review of reviews) await ctx.db.delete(review._id);
        await ctx.db.delete(id);
        continue;
      }
      const patch =
        args.action === "publish"
          ? { status: "published" as const }
          : args.action === "unpublish"
            ? { status: "draft" as const }
            : args.action === "feature"
              ? { isFeatured: true }
              : args.action === "unfeature"
                ? { isFeatured: false }
                : args.action === "bestSeller"
                  ? { isBestSeller: true }
                  : { isBestSeller: false };
      await ctx.db.patch(id, patch);
    }
  },
});

export const adjustStock = mutation({
  args: {
    id: v.id("products"),
    newStock: v.number(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const product = await ctx.db.get(args.id);
    if (!product) throw new Error("Product not found.");
    if (!Number.isFinite(args.newStock) || args.newStock < 0)
      throw new Error("Stock must be zero or more.");
    await ctx.db.patch(args.id, { stock: args.newStock });
    await ctx.db.insert("inventoryLogs", {
      productId: args.id,
      productName: product.name,
      delta: args.newStock - product.stock,
      previousStock: product.stock,
      newStock: args.newStock,
      reason: args.reason || "Manual adjustment",
      createdAt: Date.now(),
    });
  },
});

export const inventoryHistory = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("inventoryLogs")
      .order("desc")
      .take(60);
  },
});
