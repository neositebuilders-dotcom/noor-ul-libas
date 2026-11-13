import { GALLERY_IMAGES, IMAGES } from "./images";

export const defaultSettings = {
  key: "site",
  storeName: "Noor ul Libas",
  tagline: "Timeless Pakistani elegance, tailored for every moment.",
  email: "rq984690@gmail.com",
  phone: "0321 3315854",
  whatsapp: "+923213315854",
  address: "Lahore, Pakistan",
  instagram: "https://instagram.com/noorullibas",
  facebook: "https://facebook.com/noorullibas",
  tiktok: "",
  pinterest: "",
  shippingFee: 250,
  freeShippingThreshold: 7999,
  codEnabled: true,
  bankTransferEnabled: true,
  bankDetails:
    "Bank: Meezan Bank\nAccount title: Noor ul Libas\nAccount number: 0123 4567 8901 2345\nPlease share the transfer receipt on WhatsApp after placing your order.",
  customSizeEnabled: true,
  announcementBar: [
    "New Collection Now Available",
    "Free delivery on orders above Rs 7,999",
    "Cash on Delivery Available",
  ],
  aboutText:
    "Noor ul Libas is a Pakistani women's clothing label built around a simple idea: everyday elegance should feel effortless. We design unstitched fabrics and ready-to-wear suits in lawn, cotton, chiffon, organza and linen, finished with considered embroidery and a palette that moves from quiet neutrals to festive gold. Every piece is cut and checked by our team in Lahore before it is packed for you.",
  whyChoose: [
    {
      title: "Elegant Pakistani Designs",
      description:
        "Silhouettes and embroideries designed for Pakistani women — understated, wearable and always in taste.",
    },
    {
      title: "Quality Fabrics",
      description:
        "Lawn, cotton, chiffon, organza, khaddar and linen sourced from mills we work with season after season.",
    },
    {
      title: "Beautiful Craftsmanship",
      description:
        "Embroidery, finishing and stitching checked by hand before your parcel leaves our studio.",
    },
    {
      title: "Convenient Shopping",
      description:
        "Cash on delivery across Pakistan, WhatsApp support and a straightforward exchange window.",
    },
  ],
  promoBanner: {
    eyebrow: "Seasonal edit",
    heading: "Festive pieces, quietly luxurious",
    subheading:
      "Embroidered chiffon and organza suits for weddings, Eid and every celebration in between.",
    image: IMAGES.bannerTwo,
    ctaLabel: "Shop festive",
    ctaHref: "/collections/festive",
    isActive: true,
  },
  featuredBanner: {
    eyebrow: "The signature collection",
    heading: "The Meher collection",
    subheading:
      "Hand-worked embroidery on soft chiffon, in champagne, ivory and antique gold.",
    image: IMAGES.bannerOne,
    ctaLabel: "Shop collection",
    ctaHref: "/collections/luxury",
    isActive: true,
  },
  socialGallery: GALLERY_IMAGES.map((image) => ({
    image,
    href: "https://instagram.com/noorullibas",
  })),
  faqs: [
    {
      question: "Do you deliver all over Pakistan?",
      answer:
        "Yes. We ship to every city in Pakistan through our courier partners. Orders are usually dispatched within 1–2 working days and delivered within 2–5 working days.",
    },
    {
      question: "Is cash on delivery available?",
      answer:
        "Cash on delivery is available on all orders across Pakistan. You pay the courier when your parcel arrives.",
    },
    {
      question: "How do I know which size to order?",
      answer:
        "Every stitched product page includes a size chart with bust, waist, hip and length measurements. If you are between sizes, we recommend sizing up or messaging us on WhatsApp for guidance.",
    },
    {
      question: "Are the fabrics stitched or unstitched?",
      answer:
        "Both. Each product page clearly states whether the suit is unstitched or ready-to-wear, along with the number of pieces included and the fabric of each piece.",
    },
    {
      question: "Can I exchange an item?",
      answer:
        "Yes. Unworn, unstitched items with tags intact can be exchanged within 7 days of delivery. Sale items and stitched-to-order pieces are not exchangeable.",
    },
    {
      question: "Do you offer custom stitching?",
      answer:
        "Custom sizing is available on selected ready-to-wear articles. Where offered, you will see a ‘Custom size’ option on the product page — share your measurements on WhatsApp after ordering.",
    },
    {
      question: "How long does delivery take?",
      answer:
        "Within 2–5 working days for major cities and 3–6 working days for smaller towns. You can track your order any time from the Order Tracking page.",
    },
    {
      question: "How can I contact you?",
      answer:
        "WhatsApp or call 0321 3315854, or email rq984690@gmail.com. We reply to messages between 10am and 8pm, Monday to Saturday.",
    },
  ],
  policyShipping: `We dispatch orders from our Lahore studio within 1–2 working days of order confirmation. Delivery across Pakistan is typically completed in 2–5 working days for major cities and 3–6 working days for smaller towns.

Delivery charges are a flat Rs 250 nationwide. Orders above Rs 7,999 qualify for free delivery. The exact charge for your order is always shown at checkout before you confirm.

Cash on delivery is available on all orders. For bank transfer orders, we begin processing once the transfer receipt is confirmed on WhatsApp.

If a courier attempt is unsuccessful, our team will contact you on the number provided. Undelivered parcels returned to us after three failed attempts may be cancelled.`,
  policyReturns: `We accept exchanges within 7 days of delivery on unworn, unstitched articles with original tags and packaging intact. Please message us on WhatsApp at 0321 3315854 with your order number and a photo of the item before sending anything back.

Sale and clearance items, stitched-to-order pieces and custom-size orders cannot be exchanged unless the item is faulty or incorrect.

If you receive a damaged or incorrect item, contact us within 48 hours of delivery. We will arrange a replacement or a refund of the item value. Refunds for cash-on-delivery orders are processed through bank transfer within 7–10 working days.

Original delivery charges are non-refundable, and return shipping is the customer's responsibility unless the error was ours.`,
  policyPrivacy: `Noor ul Libas collects only the information needed to process and deliver your order: your name, phone number, email address, city, province and shipping address.

We use this information to confirm orders, arrange delivery, provide customer support and — if you opt in — send occasional collection updates. We do not sell or rent your personal information to third parties.

Payment information for bank transfers is shared by you directly with us and is never stored on this website. Cash-on-delivery orders contain no payment details at all.

Our website may store basic information in your browser, such as your shopping bag and wishlist, so they remain available when you return. You can clear this at any time from your browser settings.

To request a copy of your data or ask us to delete it, email rq984690@gmail.com.`,
  policyTerms: `By placing an order on this website you confirm that the information you provide is accurate and that you are able to accept delivery at the address given.

All prices are listed in Pakistani Rupees (PKR) and include applicable taxes. Prices and availability may change without notice; the price shown at checkout is the price that applies to your order.

Product photographs are styled and lit for presentation. Slight variation in colour, embroidery placement and finish is normal for embroidered and hand-worked fabrics.

Orders are confirmed once our team verifies your details. We may cancel an order if an item is out of stock, if the delivery address cannot be reached, or if we suspect fraudulent activity.

This website and its content belong to Noor ul Libas. Reproduction of our images or copy without permission is not permitted.`,
  updatedAt: 0,
};
