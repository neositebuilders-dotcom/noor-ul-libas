import type { Id } from "./_generated/dataModel";
import { mutation } from "./_generated/server";
import { IMAGES, PRODUCT_IMAGES } from "./images";
import { defaultSettings } from "./siteDefaults";

const DAY = 24 * 60 * 60 * 1000;

const categorySeed = [
  {
    name: "Unstitched Dresses",
    slug: "unstitched",
    description: "Fabric sets to cut and stitch exactly the way you like.",
    image: IMAGES.catUnstitched,
  },
  {
    name: "Ready-to-Wear",
    slug: "ready-to-wear",
    description: "Finished suits, sized and ready to wear straight away.",
    image: IMAGES.catReadyToWear,
  },
  {
    name: "Two-Piece Suits",
    slug: "two-piece",
    description: "Shirt and trouser or dupatta pairings for everyday ease.",
    image: IMAGES.catTwoPiece,
  },
  {
    name: "Three-Piece Suits",
    slug: "three-piece",
    description: "Complete shirt, trouser and dupatta sets.",
    image: IMAGES.catThreePiece,
  },
  {
    name: "Lawn Collection",
    slug: "lawn",
    description: "Breathable lawn printed and embroidered for the warmer months.",
    image: IMAGES.catLawn,
  },
  {
    name: "Chiffon Collection",
    slug: "chiffon",
    description: "Fluid chiffon and organza for evenings and celebrations.",
    image: IMAGES.catChiffon,
  },
  {
    name: "Luxury Collection",
    slug: "luxury",
    description: "Hand-worked formals with considered detail and finish.",
    image: IMAGES.catLuxury,
  },
  {
    name: "Festive Collection",
    slug: "festive",
    description: "Eid, mehndi and wedding season pieces in gold and jewel tones.",
    image: IMAGES.catFestive,
  },
];

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

type ProductSeed = {
  name: string;
  sku: string;
  category: string;
  productType: "unstitched" | "stitched";
  pieceCount: number;
  fabric: string;
  collections: string[];
  price: number;
  salePrice?: number;
  colors: string[];
  stock: number;
  salesCount: number;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  description: string;
  includedPieces: string;
};

const productSeed: ProductSeed[] = [
  {
    name: "Noor-e-Sehr Embroidered Lawn Suit",
    sku: "NL-LWN-001",
    category: "lawn",
    productType: "unstitched",
    pieceCount: 3,
    fabric: "Lawn",
    collections: ["lawn", "festive", "summer"],
    price: 8450,
    salePrice: 6990,
    colors: ["Ivory", "Sage", "Dusty Rose"],
    stock: 24,
    salesCount: 86,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    description:
      "A three-piece lawn suit with fine tonal embroidery across the front panel and a printed chiffon dupatta. The palette stays quiet — ivory, sage and dusty rose — so it works for daytime and for evening with the right jewellery.",
    includedPieces:
      "Embroidered lawn shirt (2.5m), dyed lawn trouser (2.5m), printed chiffon dupatta (2.5m)",
  },
  {
    name: "Meher Chiffon Formal Suit",
    sku: "NL-CHF-002",
    category: "luxury",
    productType: "stitched",
    pieceCount: 3,
    fabric: "Chiffon",
    collections: ["chiffon", "luxury", "festive", "wedding"],
    price: 12900,
    salePrice: 10750,
    colors: ["Champagne", "Antique Gold"],
    stock: 12,
    salesCount: 64,
    isFeatured: true,
    isBestSeller: true,
    description:
      "Our signature Meher suit in soft chiffon with hand-finished embroidery at the neckline and cuffs. Cut in a straight silhouette with a sheer embroidered dupatta, it is made for mehndi and wedding receptions.",
    includedPieces:
      "Embroidered chiffon shirt, raw silk trouser, embroidered chiffon dupatta",
  },
  {
    name: "Sana Organza Festive Suit",
    sku: "NL-ORG-003",
    category: "festive",
    productType: "stitched",
    pieceCount: 3,
    fabric: "Organza",
    collections: ["organza", "festive", "luxury", "wedding"],
    price: 16500,
    colors: ["Pearl Ivory", "Rose Gold"],
    stock: 9,
    salesCount: 41,
    isNewArrival: true,
    isFeatured: true,
    description:
      "Layered organza with delicate sequin work and a scalloped dupatta edge. A formal suit that photographs beautifully without feeling heavy to wear.",
    includedPieces:
      "Embroidered organza shirt with lining, raw silk trouser, organza dupatta",
  },
  {
    name: "Aab-e-Rawan Lawn Two-Piece",
    sku: "NL-LWN-004",
    category: "two-piece",
    productType: "unstitched",
    pieceCount: 2,
    fabric: "Lawn",
    collections: ["lawn", "summer", "everyday"],
    price: 4950,
    salePrice: 4190,
    colors: ["Sky", "Off White"],
    stock: 40,
    salesCount: 128,
    isBestSeller: true,
    description:
      "A light two-piece lawn set with a digitally printed shirt and matching trouser. Easy to stitch, easy to wear through summer.",
    includedPieces: "Printed lawn shirt (2.5m), dyed lawn trouser (2.5m)",
  },
  {
    name: "Zohra Cotton Kurta Set",
    sku: "NL-CTN-005",
    category: "ready-to-wear",
    productType: "stitched",
    pieceCount: 2,
    fabric: "Cotton",
    collections: ["cotton", "everyday", "summer"],
    price: 6750,
    colors: ["Ecru", "Olive", "Black"],
    stock: 18,
    salesCount: 73,
    isNewArrival: true,
    description:
      "A relaxed cotton kurta with side slits and a straight trouser, finished with a hand-rolled neckline. Made for long working days and quiet weekends.",
    includedPieces: "Cotton kurta, cotton straight trouser",
  },
  {
    name: "Rida Khaddar Winter Suit",
    sku: "NL-KHD-006",
    category: "three-piece",
    productType: "unstitched",
    pieceCount: 3,
    fabric: "Khaddar",
    collections: ["khaddar", "winter"],
    price: 7250,
    colors: ["Camel", "Deep Maroon"],
    stock: 22,
    salesCount: 55,
    description:
      "Warm khaddar with a tonal embroidered front and a matching woven shawl. A dependable winter three-piece that holds its shape after washing.",
    includedPieces:
      "Embroidered khaddar shirt (2.5m), khaddar trouser (2.5m), woven shawl (2.5m)",
  },
  {
    name: "Mahnoor Linen Two-Piece",
    sku: "NL-LIN-007",
    category: "two-piece",
    productType: "unstitched",
    pieceCount: 2,
    fabric: "Linen",
    collections: ["linen", "summer", "everyday"],
    price: 5450,
    colors: ["Sand", "Sage"],
    stock: 30,
    salesCount: 38,
    description:
      "Slub linen in a soft sand tone with a fine embroidered neckline. Breathable, slightly textured and comfortable in heat.",
    includedPieces: "Embroidered linen shirt (2.5m), linen trouser (2.5m)",
  },
  {
    name: "Gulbahar Embroidered Chiffon",
    sku: "NL-CHF-008",
    category: "chiffon",
    productType: "unstitched",
    pieceCount: 3,
    fabric: "Chiffon",
    collections: ["chiffon", "festive", "luxury"],
    price: 11200,
    salePrice: 8950,
    colors: ["Blush", "Emerald"],
    stock: 14,
    salesCount: 69,
    isFeatured: true,
    isBestSeller: true,
    description:
      "A floral embroidered chiffon set with hand-beaded details along the front. The dupatta carries the same motif on a lighter ground.",
    includedPieces:
      "Embroidered chiffon shirt (2.5m), silk trouser (2.5m), embroidered chiffon dupatta (2.5m)",
  },
  {
    name: "Anaya Raw Silk Formal",
    sku: "NL-SLK-009",
    category: "luxury",
    productType: "stitched",
    pieceCount: 3,
    fabric: "Raw Silk",
    collections: ["luxury", "wedding", "festive"],
    price: 24500,
    colors: ["Deep Gold", "Ivory"],
    stock: 6,
    salesCount: 23,
    isFeatured: true,
    description:
      "A structured raw silk shirt with zardozi-inspired embroidery at the yoke, paired with a slim trouser and organza dupatta. Our most formal silhouette.",
    includedPieces: "Embroidered raw silk shirt, raw silk trouser, organza dupatta",
  },
  {
    name: "Sehrish Everyday Lawn Suit",
    sku: "NL-LWN-010",
    category: "lawn",
    productType: "unstitched",
    pieceCount: 2,
    fabric: "Lawn",
    collections: ["lawn", "everyday", "summer"],
    price: 3990,
    colors: ["Powder Blue", "Peach"],
    stock: 45,
    salesCount: 152,
    isBestSeller: true,
    description:
      "A simple, well-printed two-piece lawn suit for daily wear. Soft colours, crisp print and a generous cut.",
    includedPieces: "Printed lawn shirt (2.5m), dyed lawn trouser (2.5m)",
  },
  {
    name: "Nur Jahan Organza Dupatta Set",
    sku: "NL-ORG-011",
    category: "festive",
    productType: "stitched",
    pieceCount: 3,
    fabric: "Organza",
    collections: ["organza", "festive", "luxury"],
    price: 13800,
    salePrice: 11500,
    colors: ["Antique Gold", "Pearl"],
    stock: 11,
    salesCount: 47,
    isNewArrival: true,
    description:
      "Softly embroidered organza with a metallic edge and a full-length dupatta. Light enough for a long evening, formal enough for a wedding.",
    includedPieces:
      "Embroidered organza shirt with lining, silk trouser, embroidered organza dupatta",
  },
  {
    name: "Amira Chikankari Cotton Kurta",
    sku: "NL-CTN-012",
    category: "ready-to-wear",
    productType: "stitched",
    pieceCount: 1,
    fabric: "Cotton",
    collections: ["cotton", "everyday", "summer"],
    price: 5900,
    colors: ["White", "Ice Blue"],
    stock: 20,
    salesCount: 58,
    isNewArrival: true,
    description:
      "A white cotton kurta with fine chikankari-style embroidery at the placket and sleeve. Wear it with a trouser or with denim.",
    includedPieces: "Embroidered cotton kurta",
  },
  {
    name: "Farah Printed Lawn Three-Piece",
    sku: "NL-LWN-013",
    category: "three-piece",
    productType: "unstitched",
    pieceCount: 3,
    fabric: "Lawn",
    collections: ["lawn", "summer", "everyday"],
    price: 6250,
    salePrice: 4990,
    colors: ["Coral", "Mint"],
    stock: 33,
    salesCount: 94,
    isBestSeller: true,
    description:
      "A three-piece printed lawn set with a contrast dupatta. One of our most reordered everyday designs.",
    includedPieces:
      "Printed lawn shirt (2.5m), dyed lawn trouser (2.5m), printed lawn dupatta (2.5m)",
  },
  {
    name: "Zara Cotton Co-ord",
    sku: "NL-CTN-014",
    category: "ready-to-wear",
    productType: "stitched",
    pieceCount: 2,
    fabric: "Cotton",
    collections: ["cotton", "everyday", "summer"],
    price: 7100,
    colors: ["Stone", "Terracotta"],
    stock: 16,
    salesCount: 31,
    description:
      "A matching cotton co-ord with a boxy shirt and wide-leg trouser. Easy, modern and comfortable in equal measure.",
    includedPieces: "Cotton boxy shirt, cotton wide-leg trouser",
  },
  {
    name: "Hoorain Velvet Festive Suit",
    sku: "NL-VLV-015",
    category: "luxury",
    productType: "stitched",
    pieceCount: 3,
    fabric: "Velvet",
    collections: ["velvet", "luxury", "festive", "wedding", "winter"],
    price: 27900,
    salePrice: 23900,
    colors: ["Deep Maroon", "Midnight"],
    stock: 5,
    salesCount: 19,
    isFeatured: true,
    description:
      "Deep velvet with a hand-embroidered neckline and a tissue dupatta. Our winter wedding piece, cut for a graceful fall.",
    includedPieces: "Embroidered velvet shirt, raw silk trouser, tissue dupatta",
  },
  {
    name: "Roshni Chiffon Two-Piece",
    sku: "NL-CHF-016",
    category: "two-piece",
    productType: "stitched",
    pieceCount: 2,
    fabric: "Chiffon",
    collections: ["chiffon", "festive", "everyday"],
    price: 8400,
    colors: ["Ochre", "Lilac"],
    stock: 19,
    salesCount: 36,
    isNewArrival: true,
    description:
      "A soft chiffon shirt with a lined body and a straight trouser. Understated enough for a dinner, special enough for a celebration.",
    includedPieces: "Chiffon shirt with lining, silk trouser",
  },
  {
    name: "Alina Embroidered Linen Three-Piece",
    sku: "NL-LIN-017",
    category: "three-piece",
    productType: "unstitched",
    pieceCount: 3,
    fabric: "Linen",
    collections: ["linen", "winter", "everyday"],
    price: 9850,
    colors: ["Almond", "Slate"],
    stock: 21,
    salesCount: 44,
    description:
      "An embroidered linen three-piece with a tonal dupatta. The kind of suit that becomes the one you reach for all season.",
    includedPieces:
      "Embroidered linen shirt (2.5m), linen trouser (2.5m), linen dupatta (2.5m)",
  },
  {
    name: "Sahar Lawn Co-ord Set",
    sku: "NL-LWN-018",
    category: "ready-to-wear",
    productType: "stitched",
    pieceCount: 2,
    fabric: "Lawn",
    collections: ["lawn", "summer", "everyday"],
    price: 6450,
    colors: ["Sage", "Cream"],
    stock: 27,
    salesCount: 62,
    isBestSeller: true,
    description:
      "A crisp lawn shirt with a matching cropped trouser, finished with covered buttons. Simple, neat and endlessly wearable.",
    includedPieces: "Lawn shirt, lawn cropped trouser",
  },
  {
    name: "Nida Organza Sharara Set",
    sku: "NL-ORG-019",
    category: "festive",
    productType: "stitched",
    pieceCount: 3,
    fabric: "Organza",
    collections: ["organza", "festive", "wedding", "luxury"],
    price: 19900,
    colors: ["Ivory Gold", "Dusty Rose"],
    stock: 8,
    salesCount: 27,
    isNewArrival: true,
    description:
      "A short embroidered shirt with a flowing organza sharara and a feather-light dupatta. Made for mehndi nights.",
    includedPieces: "Embroidered organza shirt, organza sharara, organza dupatta",
  },
  {
    name: "Rania Lawn Unstitched Three-Piece",
    sku: "NL-LWN-020",
    category: "lawn",
    productType: "unstitched",
    pieceCount: 3,
    fabric: "Lawn",
    collections: ["lawn", "summer", "everyday"],
    price: 5990,
    colors: ["Blue Grey", "Cream"],
    stock: 36,
    salesCount: 105,
    isBestSeller: true,
    description:
      "Printed lawn shirt and dupatta with a dyed trouser — a complete, easy three-piece at a considered price.",
    includedPieces:
      "Printed lawn shirt (2.5m), dyed lawn trouser (2.5m), printed lawn dupatta (2.5m)",
  },
];

const aboutFabric = {
  Lawn:
    "Soft, breathable lawn cotton. Machine wash cold, gentle cycle, line dry in shade.",
  Chiffon:
    "Lightweight chiffon with a soft drape. Dry clean recommended for embroidered pieces.",
  Organza:
    "Crisp organza with a subtle sheen. Dry clean only; steam lightly to release creases.",
  Cotton:
    "Woven cotton with a matte finish. Machine wash cold, iron on medium while slightly damp.",
  Khaddar:
    "Brushed khaddar for warmth. Hand wash cold separately; do not bleach.",
  Linen:
    "Textured linen that softens with wear. Machine wash cold, line dry, iron on medium.",
  Velvet:
    "Dense velvet with a deep pile. Dry clean only; store folded, never on a wire hanger.",
  "Raw Silk":
    "Structured raw silk with a natural slub. Dry clean only to preserve the finish.",
};

export const ensureSeeded = mutation({
  args: {},
  handler: async (ctx) => {
    const existingProducts = await ctx.db.query("products").collect();
    if (existingProducts.length > 0) {
      return { seeded: false, products: existingProducts.length };
    }

    const now = Date.now();
    const ids: Record<string, Id<"categories">> = {};

    for (const [index, category] of categorySeed.entries()) {
      const id = await ctx.db.insert("categories", {
        name: category.name,
        slug: category.slug,
        description: category.description,
        image: category.image,
        sortOrder: index,
        isActive: true,
      });
      ids[category.slug] = id;
    }

    for (const [index, product] of productSeed.entries()) {
      const primaryImage = PRODUCT_IMAGES[index % PRODUCT_IMAGES.length];
      const secondImage =
        PRODUCT_IMAGES[(index + 7) % PRODUCT_IMAGES.length] ?? primaryImage;
      const createdAt = now - index * DAY;
      await ctx.db.insert("products", {
        name: product.name,
        slug: product.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, ""),
        sku: product.sku,
        description: product.description,
        fabricDetails: aboutFabric[product.fabric as keyof typeof aboutFabric],
        careInstructions:
          product.productType === "unstitched"
            ? "Wash fabric separately before stitching. Colours may soften slightly after the first wash."
            : "Follow the fabric care note above. Store folded, away from direct sunlight.",
        categoryId: ids[product.category],
        collections: product.collections,
        productType: product.productType,
        pieceCount: product.pieceCount,
        fabric: product.fabric,
        includedPieces: product.includedPieces,
        price: product.price,
        salePrice: product.salePrice,
        images: [primaryImage, secondImage],
        colors: product.colors,
        sizes: product.productType === "stitched" ? SIZES : [],
        stock: product.stock,
        lowStockThreshold: 5,
        isFeatured: product.isFeatured ?? false,
        isNewArrival: product.isNewArrival ?? false,
        isBestSeller: product.isBestSeller ?? false,
        status: "published",
        salesCount: product.salesCount,
        sortOrder: index,
        createdAt,
      });
    }

    const slides = [
      {
        eyebrow: "New season",
        heading: "Elegance woven in every thread",
        subheading:
          "Discover timeless Pakistani fashion — embroidered lawn, soft chiffon and considered formals made for the way you actually live.",
        image: IMAGES.heroOne,
        ctaLabel: "Shop new arrivals",
        ctaHref: "/new-arrivals",
        secondaryLabel: "Explore collections",
        secondaryHref: "/collections/featured",
      },
      {
        eyebrow: "Festive edit",
        heading: "Celebrate every moment",
        subheading:
          "Organza, chiffon and velvet pieces for Eid, mehndi and the weddings on your calendar this season.",
        image: IMAGES.heroTwo,
        ctaLabel: "Shop festive",
        ctaHref: "/collections/festive",
        secondaryLabel: "View luxury",
        secondaryHref: "/collections/luxury",
      },
      {
        eyebrow: "The everyday edit",
        heading: "Your style, your noor",
        subheading:
          "Everyday lawn and cotton suits that feel as good as they look — with free delivery above Rs 7,999.",
        image: IMAGES.heroThree,
        ctaLabel: "Shop lawn",
        ctaHref: "/collections/lawn",
        secondaryLabel: "Shop all",
        secondaryHref: "/shop",
      },
    ];

    for (const [index, slide] of slides.entries()) {
      await ctx.db.insert("heroSlides", {
        ...slide,
        sortOrder: index,
        isActive: true,
      });
    }

    const announcements = [
      "New Collection Now Available",
      "Free delivery on orders above Rs 7,999",
      "Cash on Delivery Available",
      "WhatsApp us on 0321 3315854",
    ];
    for (const [index, message] of announcements.entries()) {
      await ctx.db.insert("announcements", {
        message,
        sortOrder: index,
        isActive: true,
      });
    }

    const settingsDoc = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "site"))
      .unique();
    if (!settingsDoc) {
      await ctx.db.insert("settings", { ...defaultSettings, updatedAt: now });
    }

    await ctx.db.insert("coupons", {
      code: "WELCOME10",
      description: "10% off your first order",
      discountType: "percentage",
      value: 10,
      minOrder: 5000,
      usageLimit: 500,
      usedCount: 0,
      isActive: true,
      createdAt: now,
    });
    await ctx.db.insert("coupons", {
      code: "FESTIVE1500",
      description: "Rs 1,500 off festive orders above Rs 12,000",
      discountType: "fixed",
      value: 1500,
      minOrder: 12000,
      usageLimit: 200,
      usedCount: 0,
      isActive: true,
      createdAt: now,
    });

    return { seeded: true, products: productSeed.length };
  },
});
