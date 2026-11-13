import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./lib";

type CartLine = {
  productId: Doc<"products">["_id"];
  quantity: number;
  price: number;
};

export function evaluateCoupon(
  coupon: Doc<"coupons">,
  lines: CartLine[],
  categoriesById: Map<string, Id<"categories"> | undefined>,
) {
  const now = Date.now();
  if (!coupon.isActive) return { discount: 0, message: "This coupon is inactive." };
  if (coupon.startsAt && coupon.startsAt > now)
    return { discount: 0, message: "This coupon is not active yet." };
  if (coupon.expiresAt && coupon.expiresAt < now)
    return { discount: 0, message: "This coupon has expired." };
  if (coupon.usageLimit !== undefined && coupon.usedCount >= coupon.usageLimit)
    return { discount: 0, message: "This coupon has reached its usage limit." };

  const subtotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
  if (subtotal < coupon.minOrder)
    return {
      discount: 0,
      message: `Minimum order for this coupon is Rs ${coupon.minOrder.toLocaleString("en-PK")}.`,
    };

  const hasScope =
    (coupon.productIds?.length ?? 0) > 0 || (coupon.categoryIds?.length ?? 0) > 0;

  const eligible = hasScope
    ? lines.filter((line) => {
        if (coupon.productIds?.includes(line.productId)) return true;
        const categoryId = categoriesById.get(line.productId);
        return categoryId ? coupon.categoryIds?.includes(categoryId) : false;
      })
    : lines;

  const eligibleSubtotal = eligible.reduce(
    (sum, line) => sum + line.price * line.quantity,
    0,
  );

  if (eligibleSubtotal <= 0)
    return { discount: 0, message: "This coupon does not apply to your items." };

  const raw =
    coupon.discountType === "percentage"
      ? Math.round((eligibleSubtotal * coupon.value) / 100)
      : coupon.value;

  return {
    discount: Math.max(0, Math.min(raw, eligibleSubtotal)),
    message: "Coupon applied.",
  };
}

export const validate = query({
  args: {
    code: v.string(),
    items: v.array(
      v.object({
        productId: v.id("products"),
        quantity: v.number(),
        price: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const code = args.code.trim().toUpperCase();
    if (!code) return { valid: false, discount: 0, message: "Enter a coupon code." };
    const coupon = await ctx.db
      .query("coupons")
      .withIndex("by_code", (q) => q.eq("code", code))
      .unique();
    if (!coupon)
      return { valid: false, discount: 0, message: "That code is not valid." };

    const categoriesById = new Map<string, Id<"categories"> | undefined>();
    for (const line of args.items) {
      if (categoriesById.has(line.productId)) continue;
      const product = await ctx.db.get(line.productId);
      categoriesById.set(line.productId, product?.categoryId);
    }

    const result = evaluateCoupon(coupon, args.items, categoriesById);
    return {
      valid: result.discount > 0,
      discount: result.discount,
      message: result.message,
      code,
      description: coupon.description ?? "",
    };
  },
});

export const adminList = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("coupons").order("desc").collect();
  },
});

export const save = mutation({
  args: {
    id: v.optional(v.id("coupons")),
    code: v.string(),
    description: v.optional(v.string()),
    discountType: v.union(v.literal("percentage"), v.literal("fixed")),
    value: v.number(),
    minOrder: v.number(),
    startsAt: v.optional(v.union(v.number(), v.null())),
    expiresAt: v.optional(v.union(v.number(), v.null())),
    usageLimit: v.optional(v.union(v.number(), v.null())),
    productIds: v.optional(v.array(v.id("products"))),
    categoryIds: v.optional(v.array(v.id("categories"))),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const code = args.code.trim().toUpperCase().replace(/\s+/g, "");
    if (!code) throw new Error("Coupon code is required.");
    if (args.value <= 0) throw new Error("Discount value must be greater than zero.");
    if (args.discountType === "percentage" && args.value > 90)
      throw new Error("Percentage discount cannot exceed 90%.");
    const duplicate = await ctx.db
      .query("coupons")
      .withIndex("by_code", (q) => q.eq("code", code))
      .unique();
    if (duplicate && duplicate._id !== args.id)
      throw new Error("A coupon with that code already exists.");

    const fields = {
      code,
      description: args.description,
      discountType: args.discountType,
      value: args.value,
      minOrder: args.minOrder,
      startsAt: args.startsAt ?? undefined,
      expiresAt: args.expiresAt ?? undefined,
      usageLimit: args.usageLimit ?? undefined,
      productIds: args.productIds,
      categoryIds: args.categoryIds,
      isActive: args.isActive,
    };

    if (args.id) {
      await ctx.db.patch(args.id, fields);
      return args.id;
    }
    return await ctx.db.insert("coupons", {
      ...fields,
      usedCount: 0,
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("coupons") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
  },
});
