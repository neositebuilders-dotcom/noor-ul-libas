import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { BUSINESS_EMAIL, effectivePrice, getCurrentUser, requireAdmin } from "./lib";

export const status = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    const users = await ctx.db.query("users").collect();
    const hasAdmin = users.some((row) => row.role === "admin");
    return {
      signedIn: Boolean(user),
      email: user?.email ?? null,
      name: user?.name ?? null,
      isAdmin: user?.role === "admin",
      canClaim: Boolean(user?.email) && !hasAdmin,
      hasAdmin,
      businessEmail: BUSINESS_EMAIL,
    };
  },
});

export const claimAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Sign in to continue.");
    if (user.role === "admin") return null;
    if (!user.email) {
      throw new Error(
        "Sign in with your email address so we can verify the administrator account.",
      );
    }
    const users = await ctx.db.query("users").collect();
    if (users.some((row) => row.role === "admin")) {
      throw new Error("This store already has an administrator.");
    }
    await ctx.db.patch(user._id, { role: "admin" });
    return null;
  },
});

export const team = query({
  args: {},
  handler: async (ctx) => {
    const actor = await requireAdmin(ctx);
    const users = await ctx.db.query("users").collect();
    return users
      .filter((user) => Boolean(user.email) && !user.isAnonymous)
      .map((user) => ({
        _id: user._id,
        name: user.name ?? null,
        email: user.email ?? "",
        role: user.role ?? "user",
        createdAt: user._creationTime,
        isSelf: user._id === actor._id,
      }))
      .sort((a, b) => {
        if (a.role === "admin" && b.role !== "admin") return -1;
        if (b.role === "admin" && a.role !== "admin") return 1;
        return a.email.localeCompare(b.email);
      });
  },
});

export const setAdminRole = mutation({
  args: { userId: v.id("users"), makeAdmin: v.boolean() },
  handler: async (ctx, args) => {
    const actor = await requireAdmin(ctx);
    const target = await ctx.db.get(args.userId);
    if (!target) throw new Error("That account no longer exists.");
    if (target._id === actor._id) {
      throw new Error(
        "You cannot change your own access. Ask another administrator to do it.",
      );
    }
    if (target.isAnonymous || !target.email) {
      throw new Error("The account must sign in with an email address first.");
    }
    const alreadyAdmin = target.role === "admin";
    if (alreadyAdmin === args.makeAdmin) return null;
    if (!args.makeAdmin) {
      const admins = (await ctx.db.query("users").collect()).filter(
        (user) => user.role === "admin",
      );
      if (admins.length <= 1) {
        throw new Error("At least one administrator must keep access.");
      }
    }
    await ctx.db.patch(target._id, { role: args.makeAdmin ? "admin" : "user" });
    return null;
  },
});

const DAY = 24 * 60 * 60 * 1000;

export const dashboard = query({
  args: { from: v.number(), to: v.number() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const [orders, products, categories] = await Promise.all([
      ctx.db.query("orders").collect(),
      ctx.db.query("products").collect(),
      ctx.db.query("categories").collect(),
    ]);

    const inRange = orders.filter(
      (order) => order.createdAt >= args.from && order.createdAt <= args.to,
    );
    const settled = inRange.filter(
      (order) => order.status !== "cancelled" && order.status !== "returned",
    );
    const revenue = settled.reduce((sum, order) => sum + order.total, 0);
    const paidRevenue = settled
      .filter((order) => order.paymentStatus === "paid")
      .reduce((sum, order) => sum + order.total, 0);

    const pendingStatuses: Doc<"orders">["status"][] = [
      "new",
      "confirmed",
      "processing",
      "packed",
    ];

    const productById = new Map(products.map((product) => [product._id, product]));

    const buckets = new Map<string, { revenue: number; orders: number }>();
    const dayCount = Math.min(
      92,
      Math.max(1, Math.ceil((args.to - args.from) / DAY) + 1),
    );
    for (let index = dayCount - 1; index >= 0; index -= 1) {
      const date = new Date(args.to - index * DAY);
      const key = date.toISOString().slice(0, 10);
      buckets.set(key, { revenue: 0, orders: 0 });
    }
    for (const order of settled) {
      const key = new Date(order.createdAt).toISOString().slice(0, 10);
      const bucket = buckets.get(key);
      if (bucket) {
        bucket.revenue += order.total;
        bucket.orders += 1;
      }
    }

    const categoryRevenue = new Map<string, number>();
    for (const order of settled) {
      for (const item of order.items) {
        const product = productById.get(item.productId);
        const categoryName =
          categories.find((category) => category._id === product?.categoryId)?.name ??
          "Uncategorised";
        categoryRevenue.set(
          categoryName,
          (categoryRevenue.get(categoryName) ?? 0) + item.price * item.quantity,
        );
      }
    }

    const customers = new Set(
      orders
        .filter((order) => order.status !== "cancelled")
        .map((order) => order.phone.replace(/\D/g, "").slice(-10)),
    );

    return {
      revenue,
      paidRevenue,
      orderCount: inRange.length,
      settledOrderCount: settled.length,
      averageOrderValue: settled.length ? Math.round(revenue / settled.length) : 0,
      pendingOrders: orders.filter((order) => pendingStatuses.includes(order.status))
        .length,
      completedOrders: orders.filter((order) => order.status === "delivered").length,
      cancelledOrders: orders.filter(
        (order) => order.status === "cancelled" || order.status === "returned",
      ).length,
      totalCustomers: customers.size,
      totalProducts: products.length,
      lowStock: products.filter(
        (product) => product.stock > 0 && product.stock <= (product.lowStockThreshold ?? 5),
      ).length,
      outOfStock: products.filter((product) => product.stock <= 0).length,
      bestSellers: [...products]
        .sort((a, b) => b.salesCount - a.salesCount)
        .slice(0, 5)
        .map((product) => ({
          name: product.name,
          slug: product.slug,
          sales: product.salesCount,
          revenue: product.salesCount * effectivePrice(product),
          image: product.images[0] ?? "",
          stock: product.stock,
        })),
      recentOrders: [...orders]
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 6)
        .map((order) => ({
          _id: order._id,
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          city: order.city,
          total: order.total,
          status: order.status,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          createdAt: order.createdAt,
          itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
        })),
      series: [...buckets.entries()].map(([date, value]) => ({
        date,
        revenue: value.revenue,
        orders: value.orders,
      })),
      categoryRevenue: [...categoryRevenue.entries()]
        .map(([name, value]) => ({ name, revenue: value }))
        .sort((a, b) => b.revenue - a.revenue),
      lowStockProducts: products
        .filter((product) => product.stock <= (product.lowStockThreshold ?? 5))
        .sort((a, b) => a.stock - b.stock)
        .slice(0, 8)
        .map((product) => ({
          _id: product._id,
          name: product.name,
          stock: product.stock,
          sku: product.sku,
        })),
    };
  },
});

export const customers = query({
  args: { search: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const [orders, users] = await Promise.all([
      ctx.db.query("orders").collect(),
      ctx.db.query("users").collect(),
    ]);
    const grouped = new Map<
      string,
      {
        name: string;
        phone: string;
        email: string;
        city: string;
        orders: number;
        totalSpent: number;
        lastOrderAt: number;
        userId: string | null;
      }
    >();

    for (const order of orders) {
      const key = order.phone.replace(/\D/g, "").slice(-10);
      const existing = grouped.get(key);
      const counted = order.status !== "cancelled" && order.status !== "returned";
      if (existing) {
        existing.orders += 1;
        if (counted) existing.totalSpent += order.total;
        if (order.createdAt > existing.lastOrderAt) {
          existing.lastOrderAt = order.createdAt;
          existing.name = order.customerName;
          existing.email = order.email;
          existing.city = order.city;
        }
      } else {
        grouped.set(key, {
          name: order.customerName,
          phone: order.phone,
          email: order.email,
          city: order.city,
          orders: 1,
          totalSpent: counted ? order.total : 0,
          lastOrderAt: order.createdAt,
          userId: order.userId ?? null,
        });
      }
    }

    for (const user of users) {
      if (!user.email) continue;
      const alreadyListed = [...grouped.values()].some(
        (customer) => customer.email === user.email,
      );
      if (alreadyListed || user.isAnonymous) continue;
      grouped.set(`user:${user._id}`, {
        name: user.name ?? "Registered customer",
        phone: user.phone ?? "—",
        email: user.email,
        city: user.city ?? "—",
        orders: 0,
        totalSpent: 0,
        lastOrderAt: user._creationTime,
        userId: user._id,
      });
    }

    const search = args.search?.trim().toLowerCase();
    return [...grouped.values()]
      .filter((customer) =>
        search
          ? [customer.name, customer.email, customer.phone, customer.city]
              .join(" ")
              .toLowerCase()
              .includes(search)
          : true,
      )
      .sort((a, b) => b.totalSpent - a.totalSpent);
  },
});

export const customerOrders = query({
  args: { phone: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const key = args.phone.replace(/\D/g, "").slice(-10);
    const orders = await ctx.db.query("orders").order("desc").collect();
    return orders.filter(
      (order) => order.phone.replace(/\D/g, "").slice(-10) === key,
    );
  },
});
