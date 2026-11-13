import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser, requireAdmin } from "./lib";

export const forProduct = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("reviews")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .order("desc")
      .collect();
    return rows.filter((row) => row.isApproved);
  },
});

export const featured = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("reviews").order("desc").collect();
    const approved = rows.filter((row) => row.isApproved);
    const chosen = approved.filter((row) => row.isFeatured).slice(0, 6);
    const selected = chosen.length > 0 ? chosen : approved.slice(0, 3);
    const products = await ctx.db.query("products").collect();
    return selected.map((review) => ({
      ...review,
      productName:
        products.find((product) => product._id === review.productId)?.name ?? null,
    }));
  },
});

export const create = mutation({
  args: {
    productId: v.id("products"),
    name: v.string(),
    rating: v.number(),
    title: v.optional(v.string()),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const name = args.name.trim();
    const body = args.body.trim();
    if (name.length < 2) throw new Error("Please enter your name.");
    if (body.length < 10) throw new Error("Please write a little more detail.");
    if (!Number.isInteger(args.rating) || args.rating < 1 || args.rating > 5)
      throw new Error("Rating must be between 1 and 5.");
    const product = await ctx.db.get(args.productId);
    if (!product) throw new Error("Product not found.");
    const user = await getCurrentUser(ctx);
    await ctx.db.insert("reviews", {
      productId: args.productId,
      userId: user?._id,
      name,
      rating: args.rating,
      title: args.title?.trim() || undefined,
      body,
      isApproved: false,
      isFeatured: false,
      createdAt: Date.now(),
    });
    return null;
  },
});

export const adminList = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const [rows, products] = await Promise.all([
      ctx.db.query("reviews").order("desc").collect(),
      ctx.db.query("products").collect(),
    ]);
    return rows.map((review) => ({
      ...review,
      productName:
        products.find((product) => product._id === review.productId)?.name ?? "—",
    }));
  },
});

export const moderate = mutation({
  args: {
    id: v.id("reviews"),
    isApproved: v.optional(v.boolean()),
    isFeatured: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.id, {
      ...(args.isApproved !== undefined ? { isApproved: args.isApproved } : {}),
      ...(args.isFeatured !== undefined ? { isFeatured: args.isFeatured } : {}),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("reviews") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
  },
});
