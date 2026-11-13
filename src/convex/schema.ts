import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

export const ORDER_STATUSES = [
  "new",
  "confirmed",
  "processing",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
] as const;

export const orderStatusValidator = v.union(
  v.literal("new"),
  v.literal("confirmed"),
  v.literal("processing"),
  v.literal("packed"),
  v.literal("shipped"),
  v.literal("delivered"),
  v.literal("cancelled"),
  v.literal("returned"),
);

export const PAYMENT_METHODS = ["cod", "bank"] as const;
export const paymentMethodValidator = v.union(
  v.literal("cod"),
  v.literal("bank"),
);

export const PAYMENT_STATUSES = ["unpaid", "paid", "refunded"] as const;
export const paymentStatusValidator = v.union(
  v.literal("unpaid"),
  v.literal("paid"),
  v.literal("refunded"),
);

export const productTypeValidator = v.union(
  v.literal("unstitched"),
  v.literal("stitched"),
);

export const orderItemValidator = v.object({
  productId: v.id("products"),
  name: v.string(),
  slug: v.string(),
  sku: v.string(),
  image: v.string(),
  price: v.number(),
  quantity: v.number(),
  size: v.optional(v.string()),
  color: v.optional(v.string()),
});

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
      phone: v.optional(v.string()),
      city: v.optional(v.string()),
    }).index("email", ["email"]), // index for the email. do not remove or modify

    categories: defineTable({
      name: v.string(),
      slug: v.string(),
      description: v.optional(v.string()),
      image: v.optional(v.string()),
      sortOrder: v.number(),
      isActive: v.boolean(),
    })
      .index("by_slug", ["slug"])
      .index("by_sortOrder", ["sortOrder"]),

    products: defineTable({
      name: v.string(),
      slug: v.string(),
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
      salePrice: v.optional(v.number()),
      images: v.array(v.string()),
      colors: v.array(v.string()),
      sizes: v.array(v.string()),
      stock: v.number(),
      lowStockThreshold: v.optional(v.number()),
      isFeatured: v.boolean(),
      isNewArrival: v.boolean(),
      isBestSeller: v.boolean(),
      status: v.union(v.literal("published"), v.literal("draft")),
      salesCount: v.number(),
      sortOrder: v.optional(v.number()),
      createdAt: v.number(),
    })
      .index("by_slug", ["slug"])
      .index("by_status", ["status"])
      .index("by_category", ["categoryId"])
      .index("by_createdAt", ["createdAt"])
      .index("by_sku", ["sku"]),

    heroSlides: defineTable({
      eyebrow: v.optional(v.string()),
      heading: v.string(),
      subheading: v.string(),
      image: v.string(),
      ctaLabel: v.optional(v.string()),
      ctaHref: v.optional(v.string()),
      secondaryLabel: v.optional(v.string()),
      secondaryHref: v.optional(v.string()),
      sortOrder: v.number(),
      isActive: v.boolean(),
      startsAt: v.optional(v.number()),
      endsAt: v.optional(v.number()),
    }).index("by_sortOrder", ["sortOrder"]),

    announcements: defineTable({
      message: v.string(),
      linkLabel: v.optional(v.string()),
      linkHref: v.optional(v.string()),
      sortOrder: v.number(),
      isActive: v.boolean(),
    }).index("by_sortOrder", ["sortOrder"]),

    settings: defineTable({
      key: v.string(),
      storeName: v.string(),
      tagline: v.optional(v.string()),
      email: v.string(),
      phone: v.string(),
      whatsapp: v.string(),
      address: v.optional(v.string()),
      instagram: v.optional(v.string()),
      facebook: v.optional(v.string()),
      tiktok: v.optional(v.string()),
      pinterest: v.optional(v.string()),
      shippingFee: v.number(),
      freeShippingThreshold: v.number(),
      codEnabled: v.boolean(),
      bankTransferEnabled: v.boolean(),
      bankDetails: v.optional(v.string()),
      customSizeEnabled: v.boolean(),
      announcementBar: v.optional(v.array(v.string())),
      aboutText: v.optional(v.string()),
      whyChoose: v.array(v.object({ title: v.string(), description: v.string() })),
      promoBanner: v.optional(
        v.object({
          eyebrow: v.optional(v.string()),
          heading: v.string(),
          subheading: v.string(),
          image: v.string(),
          ctaLabel: v.string(),
          ctaHref: v.string(),
          isActive: v.boolean(),
        }),
      ),
      featuredBanner: v.optional(
        v.object({
          eyebrow: v.string(),
          heading: v.string(),
          subheading: v.string(),
          image: v.string(),
          ctaLabel: v.string(),
          ctaHref: v.string(),
          isActive: v.boolean(),
        }),
      ),
      socialGallery: v.array(
        v.object({ image: v.string(), href: v.string() }),
      ),
      faqs: v.array(v.object({ question: v.string(), answer: v.string() })),
      policyShipping: v.string(),
      policyReturns: v.string(),
      policyPrivacy: v.string(),
      policyTerms: v.string(),
      updatedAt: v.number(),
    }).index("by_key", ["key"]),

    orders: defineTable({
      orderNumber: v.string(),
      userId: v.optional(v.id("users")),
      customerName: v.string(),
      phone: v.string(),
      email: v.string(),
      city: v.string(),
      province: v.string(),
      address: v.string(),
      notes: v.optional(v.string()),
      items: v.array(orderItemValidator),
      subtotal: v.number(),
      discount: v.number(),
      shipping: v.number(),
      total: v.number(),
      couponCode: v.optional(v.string()),
      paymentMethod: paymentMethodValidator,
      paymentStatus: paymentStatusValidator,
      status: orderStatusValidator,
      trackingNumber: v.optional(v.string()),
      adminNotes: v.optional(v.string()),
      statusHistory: v.array(
        v.object({ status: orderStatusValidator, at: v.number() }),
      ),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
      .index("by_orderNumber", ["orderNumber"])
      .index("by_createdAt", ["createdAt"])
      .index("by_user", ["userId"])
      .index("by_status", ["status"]),

    coupons: defineTable({
      code: v.string(),
      description: v.optional(v.string()),
      discountType: v.union(v.literal("percentage"), v.literal("fixed")),
      value: v.number(),
      minOrder: v.number(),
      startsAt: v.optional(v.number()),
      expiresAt: v.optional(v.number()),
      usageLimit: v.optional(v.number()),
      usedCount: v.number(),
      productIds: v.optional(v.array(v.id("products"))),
      categoryIds: v.optional(v.array(v.id("categories"))),
      isActive: v.boolean(),
      createdAt: v.number(),
    }).index("by_code", ["code"]),

    reviews: defineTable({
      productId: v.id("products"),
      userId: v.optional(v.id("users")),
      name: v.string(),
      rating: v.number(),
      title: v.optional(v.string()),
      body: v.string(),
      isApproved: v.boolean(),
      isFeatured: v.boolean(),
      createdAt: v.number(),
    })
      .index("by_product", ["productId"])
      .index("by_createdAt", ["createdAt"]),

    messages: defineTable({
      name: v.string(),
      email: v.string(),
      phone: v.optional(v.string()),
      subject: v.string(),
      message: v.string(),
      isRead: v.boolean(),
      createdAt: v.number(),
    }).index("by_createdAt", ["createdAt"]),

    newsletter: defineTable({
      email: v.string(),
      createdAt: v.number(),
    }).index("by_email", ["email"]),

    inventoryLogs: defineTable({
      productId: v.id("products"),
      productName: v.string(),
      delta: v.number(),
      previousStock: v.number(),
      newStock: v.number(),
      reason: v.string(),
      createdAt: v.number(),
    }).index("by_createdAt", ["createdAt"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
