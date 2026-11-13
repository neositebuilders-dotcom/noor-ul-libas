import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin, slugify } from "./lib";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("categories")
      .withIndex("by_sortOrder")
      .collect();
    return rows.filter((row) => row.isActive);
  },
});

export const adminList = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const rows = await ctx.db
      .query("categories")
      .withIndex("by_sortOrder")
      .collect();
    const products = await ctx.db.query("products").collect();
    return rows.map((row) => ({
      ...row,
      productCount: products.filter((p) => p.categoryId === row._id).length,
    }));
  },
});

export const save = mutation({
  args: {
    id: v.optional(v.id("categories")),
    name: v.string(),
    description: v.optional(v.string()),
    image: v.optional(v.string()),
    sortOrder: v.number(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const name = args.name.trim();
    if (!name) throw new Error("Category name is required.");
    const baseSlug = slugify(name);
    const existing = await ctx.db.query("categories").collect();
    const clash = existing.find(
      (row) => row.slug === baseSlug && row._id !== args.id,
    );
    const slug = clash ? `${baseSlug}-${Date.now().toString(36).slice(-4)}` : baseSlug;
    const fields = {
      name,
      slug,
      description: args.description,
      image: args.image,
      sortOrder: args.sortOrder,
      isActive: args.isActive,
    };
    if (args.id) {
      await ctx.db.patch(args.id, fields);
      return args.id;
    }
    return await ctx.db.insert("categories", fields);
  },
});

export const remove = mutation({
  args: { id: v.id("categories") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const products = await ctx.db
      .query("products")
      .withIndex("by_category", (q) => q.eq("categoryId", args.id))
      .collect();
    if (products.length > 0) {
      throw new Error(
        `Move the ${products.length} product(s) in this category before deleting it.`,
      );
    }
    await ctx.db.delete(args.id);
  },
});

export const reorder = mutation({
  args: { ids: v.array(v.id("categories")) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    for (const [index, id] of args.ids.entries()) {
      await ctx.db.patch(id, { sortOrder: index });
    }
  },
});
