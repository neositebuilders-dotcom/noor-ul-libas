import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { mutation, query, type MutationCtx } from "./_generated/server";
import { evaluateCoupon } from "./coupons";
import {
  getCurrentUser,
  getSignedInUserId,
  normalizePhone,
  requireAdmin,
} from "./lib";
import {
  orderStatusValidator,
  paymentMethodValidator,
  paymentStatusValidator,
} from "./schema";
import { defaultSettings } from "./siteDefaults";

const cartLineInput = v.object({
  productId: v.id("products"),
  quantity: v.number(),
  size: v.optional(v.string()),
  color: v.optional(v.string()),
});

function assertPhone(phone: string) {
  const digits = normalizePhone(phone);
  if (digits.length < 10 || digits.length > 13) {
    throw new Error("Enter a valid Pakistani mobile number, e.g. 0321 3315854.");
  }
  return phone.trim();
}

function validateEmail(email: string) {
  const value = email.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    throw new Error("Enter a valid email address.");
  }
  return value;
}

async function createOrderNumber(ctx: MutationCtx) {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const random = Math.floor(1000 + Math.random() * 9000);
    const candidate = `NL-${new Date()
      .toISOString()
      .slice(2, 10)
      .replace(/-/g, "")}-${random}`;
    const existing = await ctx.db
      .query("orders")
      .withIndex("by_orderNumber", (q) => q.eq("orderNumber", candidate))
      .unique();
    if (!existing) return candidate;
  }
  return `NL-${Date.now()}`;
}

export const create = mutation({
  args: {
    customerName: v.string(),
    phone: v.string(),
    email: v.string(),
    city: v.string(),
    province: v.string(),
    address: v.string(),
    notes: v.optional(v.string()),
    items: v.array(cartLineInput),
    couponCode: v.optional(v.string()),
    paymentMethod: paymentMethodValidator,
  },
  handler: async (ctx, args) => {
    const customerName = args.customerName.trim();
    const city = args.city.trim();
    const province = args.province.trim();
    const address = args.address.trim();
    if (customerName.length < 3) throw new Error("Enter your full name.");
    if (city.length < 2) throw new Error("Enter your city.");
    if (province.length < 2) throw new Error("Select your province.");
    if (address.length < 10)
      throw new Error("Enter a complete shipping address.");
    const phone = assertPhone(args.phone);
    const email = validateEmail(args.email);
    if (args.items.length === 0) throw new Error("Your bag is empty.");

    const settingsDoc = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "site"))
      .unique();
    const settings = { ...defaultSettings, ...(settingsDoc ?? {}) };
    if (args.paymentMethod === "cod" && !settings.codEnabled)
      throw new Error("Cash on delivery is currently unavailable.");
    if (args.paymentMethod === "bank" && !settings.bankTransferEnabled)
      throw new Error("Bank transfer is currently unavailable.");

    const orderItems: Doc<"orders">["items"] = [];
    const lines: { productId: Id<"products">; quantity: number; price: number }[] =
      [];
    const categoriesById = new Map<string, Id<"categories"> | undefined>();
    let subtotal = 0;

    for (const line of args.items) {
      if (!Number.isInteger(line.quantity) || line.quantity < 1)
        throw new Error("Invalid quantity in your bag.");
      const product = await ctx.db.get(line.productId);
      if (!product || product.status !== "published")
        throw new Error("One of the products in your bag is no longer available.");
      if (product.stock < line.quantity)
        throw new Error(
          `Only ${product.stock} piece(s) of ${product.name} remain in stock.`,
        );
      if (
        product.sizes.length > 0 &&
        line.size &&
        line.size !== "Custom" &&
        !product.sizes.includes(line.size)
      ) {
        throw new Error(`Size ${line.size} is not available for ${product.name}.`);
      }
      if (line.size === "Custom" && !settings.customSizeEnabled) {
        throw new Error("Custom sizing is not available at the moment.");
      }
      const price =
        product.salePrice && product.salePrice < product.price
          ? product.salePrice
          : product.price;
      subtotal += price * line.quantity;
      lines.push({
        productId: product._id,
        quantity: line.quantity,
        price,
      });
      categoriesById.set(product._id, product.categoryId);
      orderItems.push({
        productId: product._id,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        image: product.images[0] ?? "",
        price,
        quantity: line.quantity,
        size: line.size,
        color: line.color,
      });
    }

    let discount = 0;
    let couponCode: string | undefined;
    let couponToIncrement: Doc<"coupons"> | undefined;
    const rawCode = args.couponCode?.trim().toUpperCase();
    if (rawCode) {
      const coupon = await ctx.db
        .query("coupons")
        .withIndex("by_code", (q) => q.eq("code", rawCode))
        .unique();
      if (!coupon) throw new Error("The coupon code is not valid.");
      const result = evaluateCoupon(coupon, lines, categoriesById);
      if (result.discount <= 0) throw new Error(result.message);
      discount = result.discount;
      couponCode = coupon.code;
      couponToIncrement = coupon;
    }

    const shipping =
      subtotal >= settings.freeShippingThreshold ? 0 : settings.shippingFee;
    const total = Math.max(0, subtotal - discount) + shipping;
    const orderNumber = await createOrderNumber(ctx);
    const userId = await getSignedInUserId(ctx);

    const orderId = await ctx.db.insert("orders", {
      orderNumber,
      userId: userId ?? undefined,
      customerName,
      phone,
      email,
      city,
      province,
      address,
      notes: args.notes?.trim() || undefined,
      items: orderItems,
      subtotal,
      discount,
      shipping,
      total,
      couponCode,
      paymentMethod: args.paymentMethod,
      paymentStatus: "unpaid",
      status: "new",
      statusHistory: [{ status: "new", at: Date.now() }],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    for (const line of lines) {
      const product = await ctx.db.get(line.productId);
      if (!product) continue;
      await ctx.db.patch(product._id, {
        stock: Math.max(0, product.stock - line.quantity),
        salesCount: product.salesCount + line.quantity,
      });
    }

    if (couponToIncrement) {
      await ctx.db.patch(couponToIncrement._id, {
        usedCount: couponToIncrement.usedCount + 1,
      });
    }

    const user = await getCurrentUser(ctx);
    if (user && (!user.phone || !user.city)) {
      await ctx.db.patch(user._id, { phone, city });
    }

    return { orderId, orderNumber, total, phone };
  },
});

export const myOrders = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getSignedInUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const lookup = query({
  args: { orderNumber: v.string(), phone: v.string() },
  handler: async (ctx, args) => {
    const orderNumber = args.orderNumber.trim().toUpperCase();
    const phone = normalizePhone(args.phone);
    if (!orderNumber || phone.length < 10) return null;
    const order = await ctx.db
      .query("orders")
      .withIndex("by_orderNumber", (q) => q.eq("orderNumber", orderNumber))
      .unique();
    if (!order) return null;
    if (normalizePhone(order.phone).slice(-10) !== phone.slice(-10)) return null;
    return order;
  },
});

export const adminList = query({
  args: {
    status: v.optional(orderStatusValidator),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const rows = await ctx.db.query("orders").order("desc").collect();
    const search = args.search?.trim().toLowerCase();
    return rows.filter((order) => {
      if (args.status && order.status !== args.status) return false;
      if (!search) return true;
      return [order.orderNumber, order.customerName, order.phone, order.email, order.city]
        .join(" ")
        .toLowerCase()
        .includes(search);
    });
  },
});

export const adminGet = query({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.get(args.id);
  },
});

export const updateStatus = mutation({
  args: { id: v.id("orders"), status: orderStatusValidator },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const order = await ctx.db.get(args.id);
    if (!order) throw new Error("Order not found.");
    if (order.status === args.status) return null;

    await ctx.db.patch(args.id, {
      status: args.status,
      updatedAt: Date.now(),
      statusHistory: [...order.statusHistory, { status: args.status, at: Date.now() }],
    });

    const wasClosed = order.status === "cancelled" || order.status === "returned";
    const isClosed = args.status === "cancelled" || args.status === "returned";
    if (!wasClosed && isClosed) {
      for (const item of order.items) {
        const product = await ctx.db.get(item.productId);
        if (!product) continue;
        await ctx.db.patch(product._id, {
          stock: product.stock + item.quantity,
          salesCount: Math.max(0, product.salesCount - item.quantity),
        });
      }
    }
    if (wasClosed && !isClosed) {
      for (const item of order.items) {
        const product = await ctx.db.get(item.productId);
        if (!product) continue;
        await ctx.db.patch(product._id, {
          stock: Math.max(0, product.stock - item.quantity),
          salesCount: product.salesCount + item.quantity,
        });
      }
    }
    return null;
  },
});

export const updatePaymentStatus = mutation({
  args: { id: v.id("orders"), paymentStatus: paymentStatusValidator },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.id, {
      paymentStatus: args.paymentStatus,
      updatedAt: Date.now(),
    });
  },
});

export const updateDetails = mutation({
  args: {
    id: v.id("orders"),
    trackingNumber: v.optional(v.string()),
    adminNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.id, {
      trackingNumber: args.trackingNumber?.trim() || undefined,
      adminNotes: args.adminNotes?.trim() || undefined,
      updatedAt: Date.now(),
    });
  },
});
