import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./lib";
import { defaultSettings } from "./siteDefaults";

export const getSettings = query({
  args: {},
  handler: async (ctx) => {
    const doc = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "site"))
      .unique();
    if (!doc) return defaultSettings;
    const { _id, _creationTime, ...rest } = doc;
    void _id;
    void _creationTime;
    return { ...defaultSettings, ...rest };
  },
});

const settingsPatch = v.object({
  storeName: v.optional(v.string()),
  tagline: v.optional(v.string()),
  email: v.optional(v.string()),
  phone: v.optional(v.string()),
  whatsapp: v.optional(v.string()),
  address: v.optional(v.string()),
  instagram: v.optional(v.string()),
  facebook: v.optional(v.string()),
  tiktok: v.optional(v.string()),
  pinterest: v.optional(v.string()),
  shippingFee: v.optional(v.number()),
  freeShippingThreshold: v.optional(v.number()),
  codEnabled: v.optional(v.boolean()),
  bankTransferEnabled: v.optional(v.boolean()),
  bankDetails: v.optional(v.string()),
  customSizeEnabled: v.optional(v.boolean()),
  announcementBar: v.optional(v.array(v.string())),
  aboutText: v.optional(v.string()),
  whyChoose: v.optional(
    v.array(v.object({ title: v.string(), description: v.string() })),
  ),
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
  socialGallery: v.optional(
    v.array(v.object({ image: v.string(), href: v.string() })),
  ),
  faqs: v.optional(
    v.array(v.object({ question: v.string(), answer: v.string() })),
  ),
  policyShipping: v.optional(v.string()),
  policyReturns: v.optional(v.string()),
  policyPrivacy: v.optional(v.string()),
  policyTerms: v.optional(v.string()),
});

export const updateSettings = mutation({
  args: { patch: settingsPatch },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "site"))
      .unique();
    const patch = Object.fromEntries(
      Object.entries(args.patch).filter(([, value]) => value !== undefined),
    );
    if (!existing) {
      await ctx.db.insert("settings", {
        ...defaultSettings,
        ...patch,
        key: "site",
        updatedAt: Date.now(),
      });
      return null;
    }
    await ctx.db.patch(existing._id, { ...patch, updatedAt: Date.now() });
    return null;
  },
});

function isVisible<
  T extends { isActive: boolean; startsAt?: number; endsAt?: number },
>(slide: T) {
  const now = Date.now();
  if (!slide.isActive) return false;
  if (slide.startsAt && slide.startsAt > now) return false;
  if (slide.endsAt && slide.endsAt < now) return false;
  return true;
}

export const heroSlides = query({
  args: {},
  handler: async (ctx) => {
    const slides = await ctx.db
      .query("heroSlides")
      .withIndex("by_sortOrder")
      .collect();
    return slides.filter(isVisible);
  },
});

export const adminSlides = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("heroSlides")
      .withIndex("by_sortOrder")
      .collect();
  },
});

export const saveSlide = mutation({
  args: {
    id: v.optional(v.id("heroSlides")),
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
    startsAt: v.optional(v.union(v.number(), v.null())),
    endsAt: v.optional(v.union(v.number(), v.null())),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    if (!args.heading.trim()) throw new Error("Slide heading is required.");
    if (!args.image.trim()) throw new Error("Slide image is required.");
    const { id, startsAt, endsAt, ...fields } = args;
    const payload = {
      ...fields,
      startsAt: startsAt ?? undefined,
      endsAt: endsAt ?? undefined,
    };
    if (id) {
      await ctx.db.patch(id, payload);
      return id;
    }
    return await ctx.db.insert("heroSlides", payload);
  },
});

export const deleteSlide = mutation({
  args: { id: v.id("heroSlides") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
  },
});

export const reorderSlides = mutation({
  args: { ids: v.array(v.id("heroSlides")) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    for (const [index, id] of args.ids.entries()) {
      await ctx.db.patch(id, { sortOrder: index });
    }
  },
});

export const announcements = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("announcements")
      .withIndex("by_sortOrder")
      .collect();
    return rows.filter((row) => row.isActive);
  },
});

export const adminAnnouncements = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("announcements")
      .withIndex("by_sortOrder")
      .collect();
  },
});

export const saveAnnouncement = mutation({
  args: {
    id: v.optional(v.id("announcements")),
    message: v.string(),
    linkLabel: v.optional(v.string()),
    linkHref: v.optional(v.string()),
    sortOrder: v.number(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    if (!args.message.trim()) throw new Error("Announcement text is required.");
    const { id, ...fields } = args;
    if (id) {
      await ctx.db.patch(id, fields);
      return id;
    }
    return await ctx.db.insert("announcements", fields);
  },
});

export const deleteAnnouncement = mutation({
  args: { id: v.id("announcements") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const imageUrlForStorage = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const url = await ctx.storage.getUrl(args.storageId);
    if (!url) throw new Error("Upload could not be read.");
    return url;
  },
});
