import { ProductCard } from "@/components/site/ProductCard";
import {
  Price,
  SectionHeading,
  SmartImage,
  Stars,
} from "@/components/site/primitives";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { formatDate, formatPKR, whatsappLink } from "@/lib/format";
import { usePageMeta } from "@/lib/seo";
import {
  getRecentlyViewed,
  recordRecentlyViewed,
  useShop,
} from "@/lib/shop";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Loader2,
  Maximize2,
  MessageCircle,
  Minus,
  Plus,
  Ruler,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";

const SIZE_CHART = [
  { size: "XS", bust: "32", waist: "26", hip: "34", length: "40" },
  { size: "S", bust: "34", waist: "28", hip: "36", length: "41" },
  { size: "M", bust: "36", waist: "30", hip: "38", length: "42" },
  { size: "L", bust: "38", waist: "32", hip: "40", length: "43" },
  { size: "XL", bust: "40", waist: "34", hip: "42", length: "43" },
  { size: "XXL", bust: "42", waist: "36", hip: "44", length: "44" },
];

export default function Product() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem, toggleWishlist, isWishlisted } = useShop();
  const data = useQuery(api.products.getBySlug, slug ? { slug } : "skip");
  const product = data?.product;
  const reviews = useQuery(
    api.reviews.forProduct,
    product ? { productId: product._id } : "skip",
  );
  const settings = useQuery(api.site.getSettings);
  const submitReview = useMutation(api.reviews.create);
  const allProducts = useQuery(api.products.list, { limit: 60 });

  const [size, setSize] = useState<string | undefined>();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const [lightbox, setLightbox] = useState(false);
  const [sizeGuide, setSizeGuide] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    name: "",
    rating: 5,
    title: "",
    body: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [recentSlugs, setRecentSlugs] = useState<string[]>([]);

  useEffect(() => {
    setActiveImage(0);
    setQuantity(1);
    setSize(undefined);
    if (slug) {
      recordRecentlyViewed(slug);
      setRecentSlugs(getRecentlyViewed().filter((item) => item !== slug));
    }
  }, [slug]);

  useEffect(() => {
    if (product && product.sizes.length > 0 && !size) {
      setSize(product.sizes[0]);
    }
  }, [product, size]);

  usePageMeta({
    title: product
      ? `${product.name} — ${formatPKR(product.effectivePrice)} | Noor ul Libas`
      : "Product — Noor ul Libas",
    description: product
      ? `${product.name} — ${product.fabric ?? "Pakistani"} ${product.pieceCount}-piece ${
          product.productType === "unstitched" ? "unstitched suit" : "ready-to-wear suit"
        }. ${product.description.slice(0, 130)}`
      : undefined,
    image: product?.images[0],
    jsonLd:
      product && data
        ? {
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            image: product.images,
            description: product.description,
            sku: product.sku,
            brand: { "@type": "Brand", name: "Noor ul Libas" },
            offers: {
              "@type": "Offer",
              priceCurrency: "PKR",
              price: product.effectivePrice,
              availability:
                product.stock > 0
                  ? "https://schema.org/InStock"
                  : "https://schema.org/OutOfStock",
            },
            aggregateRating:
              reviews && reviews.length > 0
                ? {
                    "@type": "AggregateRating",
                    ratingValue:
                      reviews.reduce((sum, review) => sum + review.rating, 0) /
                      reviews.length,
                    reviewCount: reviews.length,
                  }
                : undefined,
          }
        : undefined,
  });

  const ratingAverage = useMemo(() => {
    if (!reviews || reviews.length === 0) return 0;
    return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  }, [reviews]);

  const recentProducts = useMemo(() => {
    if (!allProducts) return [];
    return recentSlugs
      .map((item) => allProducts.items.find((row) => row.slug === item))
      .filter((row): row is NonNullable<typeof row> => Boolean(row))
      .slice(0, 4);
  }, [allProducts, recentSlugs]);

  if (data === undefined) {
    return (
      <div className="container-editorial grid animate-pulse gap-10 py-14 lg:grid-cols-2">
        <div className="aspect-[4/5] bg-muted" />
        <div className="space-y-4">
          <div className="h-3 w-28 bg-muted" />
          <div className="h-10 w-3/4 bg-muted" />
          <div className="h-5 w-32 bg-muted" />
          <div className="h-24 w-full bg-muted" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-editorial flex flex-col items-center gap-4 py-24 text-center">
        <p className="eyebrow">Not found</p>
        <h1 className="text-4xl">This piece is no longer available</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          It may have sold out or been removed from the collection. Browse what is
          currently in the studio instead.
        </p>
        <Button asChild className="mt-2 h-11 rounded-sm px-6 text-[10px] uppercase tracking-[0.18em]">
          <Link to="/shop">Shop all pieces</Link>
        </Button>
      </div>
    );
  }

  const wished = isWishlisted(product._id);
  const soldOut = product.stock <= 0;
  const onSale = product.salePrice && product.salePrice < product.price;
  const discount = onSale
    ? Math.round(((product.price - (product.salePrice ?? 0)) / product.price) * 100)
    : 0;

  const addToBag = () => {
    addItem(
      {
        productId: product._id,
        slug: product.slug,
        name: product.name,
        sku: product.sku,
        price: product.effectivePrice,
        image: product.images[0] ?? "",
        size,
        color: product.colors[0],
        availableSizes: product.sizes,
        maxStock: product.stock,
      },
      quantity,
    );
    toast.success("Added to your bag", {
      description: `${quantity} × ${product.name}`,
    });
  };

  const buyNow = () => {
    addToBag();
    navigate("/checkout");
  };

  const waMessage = `Salam! I'm interested in ${product.name} (${product.sku}) — ${formatPKR(
    product.effectivePrice,
  )}. ${window.location.href}`;

  return (
    <div className="pb-24 lg:pb-0">
      <div className="container-editorial pt-6">
        <nav className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          <Link to="/" className="hover:text-gold">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-gold">Shop</Link>
          <span>/</span>
          <span className="text-espresso">{product.name}</span>
        </nav>
      </div>

      <div className="container-editorial grid gap-10 py-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:py-10">
        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          <div className="flex gap-2 sm:w-20 sm:flex-col">
            {product.images.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setActiveImage(index)}
                aria-label={`View image ${index + 1}`}
                className={cn(
                  "aspect-[3/4] w-16 shrink-0 overflow-hidden border bg-[#f3ece1] transition-colors sm:w-full",
                  activeImage === index ? "border-espresso" : "border-transparent hover:border-border",
                )}
              >
                <SmartImage src={image} alt="" sizes="80px" />
              </button>
            ))}
          </div>

          <div className="relative flex-1">
            <div
              className="relative aspect-[4/5] cursor-zoom-in overflow-hidden bg-[#f3ece1]"
              onMouseEnter={() => setZoom(true)}
              onMouseLeave={() => setZoom(false)}
              onMouseMove={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                const x = ((event.clientX - rect.left) / rect.width) * 100;
                const y = ((event.clientY - rect.top) / rect.height) * 100;
                setOrigin(`${x}% ${y}%`);
              }}
              onClick={() => setLightbox(true)}
            >
              <SmartImage
                src={product.images[activeImage] ?? product.images[0]}
                alt={product.name}
                priority
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="transition-transform duration-500"
              />
              <div
                className="pointer-events-none absolute inset-0 hidden bg-no-repeat transition-opacity duration-300 lg:block"
                style={{
                  backgroundImage: `url(${product.images[activeImage] ?? product.images[0]})`,
                  backgroundSize: "180%",
                  backgroundPosition: origin,
                  opacity: zoom ? 1 : 0,
                }}
              />
              <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-white/90 px-2.5 py-1.5 text-[10px] uppercase tracking-[0.14em] text-espresso backdrop-blur">
                <Maximize2 className="size-3" /> View larger
              </div>
              {product.images.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous image"
                    onClick={(event) => {
                      event.stopPropagation();
                      setActiveImage(
                        (current) =>
                          (current - 1 + product.images.length) % product.images.length,
                      );
                    }}
                    className="absolute left-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-espresso backdrop-blur transition-colors hover:bg-white"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next image"
                    onClick={(event) => {
                      event.stopPropagation();
                      setActiveImage(
                        (current) => (current + 1) % product.images.length,
                      );
                    }}
                    className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-espresso backdrop-blur transition-colors hover:bg-white"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="lg:sticky lg:top-32 lg:self-start">
          <div className="flex items-center gap-2">
            {product.isNewArrival && (
              <span className="border border-gold/40 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-gold">
                New arrival
              </span>
            )}
            {product.isBestSeller && (
              <span className="bg-espresso px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-ivory">
                Best seller
              </span>
            )}
            {onSale && (
              <span className="bg-gold px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-white">
                {discount}% off
              </span>
            )}
          </div>

          <h1 className="mt-4 text-[2.1rem] leading-[1.08] sm:text-[2.6rem]">
            {product.name}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            <a href="#reviews" className="flex items-center gap-2">
              <Stars rating={ratingAverage} />
              <span className="text-[11px] text-muted-foreground">
                {reviews && reviews.length > 0
                  ? `${ratingAverage.toFixed(1)} · ${reviews.length} review${reviews.length === 1 ? "" : "s"}`
                  : "No reviews yet"}
              </span>
            </a>
            <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              SKU {product.sku}
            </span>
          </div>

          <div className="mt-5 flex items-end gap-3">
            <Price price={product.price} salePrice={product.salePrice} size="lg" />
            {onSale && (
              <span className="pb-0.5 text-[11px] uppercase tracking-[0.14em] text-gold">
                Save {formatPKR(product.price - (product.salePrice ?? 0))}
              </span>
            )}
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Inclusive of all taxes. Delivery calculated at checkout.
          </p>

          <p className="mt-5 text-sm leading-7 text-muted-foreground">
            {product.description}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden border border-border/70 bg-border/70 text-xs">
            <div className="bg-card px-4 py-3">
              <p className="text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
                Fabric
              </p>
              <p className="mt-1 font-medium">{product.fabric ?? "—"}</p>
            </div>
            <div className="bg-card px-4 py-3">
              <p className="text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
                Pieces included
              </p>
              <p className="mt-1 font-medium">{product.pieceCount} piece</p>
            </div>
            <div className="bg-card px-4 py-3">
              <p className="text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
                Type
              </p>
              <p className="mt-1 font-medium capitalize">
                {product.productType === "unstitched" ? "Unstitched" : "Ready-to-wear"}
              </p>
            </div>
            <div className="bg-card px-4 py-3">
              <p className="text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
                Availability
              </p>
              <p
                className={cn(
                  "mt-1 font-medium",
                  soldOut ? "text-destructive" : product.stock <= 5 ? "text-gold" : "text-emerald-700",
                )}
              >
                {soldOut
                  ? "Sold out"
                  : product.stock <= 5
                    ? `Only ${product.stock} left`
                    : "In stock"}
              </p>
            </div>
          </div>

          {product.colors.length > 0 && (
            <div className="mt-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Colour
              </p>
              <p className="mt-1.5 text-sm">{product.colors.join(" · ")}</p>
            </div>
          )}

          {product.sizes.length > 0 && (
            <div className="mt-5">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Size
                </p>
                <button
                  type="button"
                  onClick={() => setSizeGuide(true)}
                  className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-gold hover:underline"
                >
                  <Ruler className="size-3.5" /> Size guide
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.sizes.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSize(option)}
                    className={cn(
                      "min-w-11 border px-3 py-2 text-xs transition-colors",
                      size === option
                        ? "border-espresso bg-espresso text-ivory"
                        : "border-border hover:border-foreground",
                    )}
                  >
                    {option}
                  </button>
                ))}
                {settings?.customSizeEnabled && (
                  <button
                    type="button"
                    onClick={() => setSize("Custom")}
                    className={cn(
                      "border px-3 py-2 text-xs transition-colors",
                      size === "Custom"
                        ? "border-gold bg-gold/10 text-espresso"
                        : "border-dashed border-border text-muted-foreground hover:border-foreground",
                    )}
                  >
                    Custom size
                  </button>
                )}
              </div>
              {size === "Custom" && (
                <p className="mt-2 text-[11px] leading-5 text-muted-foreground">
                  Choose custom size, then send your measurements on WhatsApp after
                  placing the order. Our team will confirm before stitching.
                </p>
              )}
            </div>
          )}

          {product.productType === "unstitched" && product.includedPieces && (
            <div className="mt-5 border border-border/70 bg-secondary/40 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Included in this set
              </p>
              <p className="mt-1.5 text-sm leading-6">{product.includedPieces}</p>
            </div>
          )}

          <div className="mt-6 flex items-stretch gap-3">
            <div className="flex items-center border border-border">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                className="flex size-11 items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <Minus className="size-3.5" />
              </button>
              <span className="w-8 text-center text-sm tabular-nums">{quantity}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() =>
                  setQuantity((value) => Math.min(product.stock || 1, value + 1))
                }
                className="flex size-11 items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <Plus className="size-3.5" />
              </button>
            </div>
            <Button
              onClick={addToBag}
              disabled={soldOut || (product.sizes.length > 0 && !size)}
              className="h-11 flex-1 gap-2 rounded-sm text-[11px] font-semibold uppercase tracking-[0.16em]"
            >
              <ShoppingBag className="size-4" /> Add to bag
            </Button>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <Button
              onClick={buyNow}
              disabled={soldOut || (product.sizes.length > 0 && !size)}
              variant="outline"
              className="h-11 rounded-sm border-espresso/30 text-[11px] font-semibold uppercase tracking-[0.16em]"
            >
              Buy it now
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const added = toggleWishlist({
                  productId: product._id,
                  slug: product.slug,
                  name: product.name,
                  price: product.effectivePrice,
                  image: product.images[0] ?? "",
                  productType: product.productType,
                });
                toast[added ? "success" : "message"](
                  added ? "Saved to your wishlist" : "Removed from your wishlist",
                );
              }}
              className="h-11 gap-2 rounded-sm border-espresso/30 text-[11px] font-semibold uppercase tracking-[0.16em]"
            >
              <Heart className={cn("size-4", wished && "fill-gold text-gold")} />
              {wished ? "Saved" : "Wishlist"}
            </Button>
          </div>

          <a
            href={whatsappLink(settings?.whatsapp ?? "+923213315854", waMessage)}
            target="_blank"
            rel="noreferrer"
            className="mt-3 flex h-11 items-center justify-center gap-2 border border-[#1FA855]/40 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#167a3e] transition-colors hover:bg-[#1FA855]/5"
          >
            <MessageCircle className="size-4" /> Order on WhatsApp
          </a>

          <div className="mt-6 space-y-2.5 border-t border-border/70 pt-5 text-[11px] leading-5 text-muted-foreground">
            <p className="flex items-start gap-2.5">
              <Truck className="mt-0.5 size-4 shrink-0 text-gold" />
              Dispatched in 1–2 working days · delivery in 2–5 working days across
              Pakistan. Free above {formatPKR(settings?.freeShippingThreshold ?? 7999)}.
            </p>
            <p className="flex items-start gap-2.5">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-gold" />
              Cash on delivery available. 7-day exchange on unworn, unstitched pieces.
            </p>
          </div>

          <Accordion type="single" collapsible className="mt-6 border-t border-border/70">
            <AccordionItem value="fabric">
              <AccordionTrigger className="text-[11px] font-semibold uppercase tracking-[0.16em] hover:no-underline">
                Fabric & care
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-6 text-muted-foreground">
                <p>{product.fabricDetails ?? "Fabric details available on request."}</p>
                <p className="mt-3">
                  {product.careInstructions ??
                    "Follow the care label. Store folded, away from direct sunlight."}
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="delivery">
              <AccordionTrigger className="text-[11px] font-semibold uppercase tracking-[0.16em] hover:no-underline">
                Delivery & exchange
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-6 text-muted-foreground">
                <p>
                  Flat delivery of {formatPKR(settings?.shippingFee ?? 250)} nationwide,
                  free on orders above{" "}
                  {formatPKR(settings?.freeShippingThreshold ?? 7999)}. Cash on
                  delivery and bank transfer are both available.
                </p>
                <p className="mt-2">
                  <Link to="/returns" className="text-gold hover:underline">
                    Read the full return & exchange policy
                  </Link>
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      <section id="reviews" className="container-editorial border-t border-border/70 py-14">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Customer reviews</p>
            <h2 className="mt-3 text-3xl">What customers say</h2>
            <div className="mt-3 flex items-center gap-3">
              <Stars rating={ratingAverage} size={15} />
              <span className="text-xs text-muted-foreground">
                {reviews && reviews.length > 0
                  ? `${ratingAverage.toFixed(1)} out of 5 · ${reviews.length} review${reviews.length === 1 ? "" : "s"}`
                  : "No published reviews yet"}
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => setReviewOpen((open) => !open)}
            className="h-10 self-start rounded-sm text-[10px] font-semibold uppercase tracking-[0.16em]"
          >
            Write a review
          </Button>
        </div>

        {reviewOpen && (
          <form
            className="mt-6 grid gap-4 border border-border/70 bg-card p-5 sm:grid-cols-2 sm:p-6"
            onSubmit={async (event) => {
              event.preventDefault();
              setSubmitting(true);
              try {
                await submitReview({
                  productId: product._id as Id<"products">,
                  name: reviewForm.name,
                  rating: reviewForm.rating,
                  title: reviewForm.title || undefined,
                  body: reviewForm.body,
                });
                toast.success("Thank you — your review is with our team", {
                  description:
                    "Reviews are published after a quick check, usually within one working day.",
                });
                setReviewOpen(false);
                setReviewForm({ name: "", rating: 5, title: "", body: "" });
              } catch (error) {
                toast.error(
                  error instanceof Error ? error.message : "Could not send review.",
                );
              } finally {
                setSubmitting(false);
              }
            }}
          >
            <div className="sm:col-span-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Your rating
              </p>
              <div className="mt-2 flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setReviewForm((form) => ({ ...form, rating: value }))}
                    aria-label={`${value} star${value === 1 ? "" : "s"}`}
                  >
                    <Star
                      className={cn(
                        "size-6 transition-colors",
                        value <= reviewForm.rating
                          ? "fill-gold text-gold"
                          : "fill-transparent text-border",
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Your name
              </label>
              <input
                required
                value={reviewForm.name}
                onChange={(event) =>
                  setReviewForm((form) => ({ ...form, name: event.target.value }))
                }
                className="field mt-1.5"
                placeholder="e.g. Ayesha K."
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Headline (optional)
              </label>
              <input
                value={reviewForm.title}
                onChange={(event) =>
                  setReviewForm((form) => ({ ...form, title: event.target.value }))
                }
                className="field mt-1.5"
                placeholder="Beautiful fabric"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Your review
              </label>
              <textarea
                required
                rows={4}
                value={reviewForm.body}
                onChange={(event) =>
                  setReviewForm((form) => ({ ...form, body: event.target.value }))
                }
                className="field mt-1.5 resize-y"
                placeholder="How was the fabric, fit and finish?"
              />
            </div>
            <p className="text-[11px] leading-5 text-muted-foreground sm:col-span-2">
              Reviews are published only after moderation and are never edited. We do
              not delete honest feedback.
            </p>
            <div className="flex gap-2 sm:col-span-2">
              <Button
                type="submit"
                disabled={submitting}
                className="h-10 rounded-sm px-6 text-[10px] uppercase tracking-[0.16em]"
              >
                {submitting && <Loader2 className="size-3.5 animate-spin" />}
                Send review
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setReviewOpen(false)}
                className="h-10 rounded-sm text-[10px] uppercase tracking-[0.16em]"
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {(reviews ?? []).map((review) => (
            <figure
              key={review._id}
              className="border border-border/70 bg-card p-5"
            >
              <div className="flex items-center justify-between">
                <Stars rating={review.rating} />
                <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  {formatDate(review.createdAt)}
                </span>
              </div>
              {review.title && (
                <p className="mt-3 font-display text-lg">{review.title}</p>
              )}
              <blockquote className="mt-1.5 text-sm leading-6 text-muted-foreground">
                {review.body}
              </blockquote>
              <figcaption className="mt-3 text-[11px] font-medium">
                {review.name}
              </figcaption>
            </figure>
          ))}
          {reviews && reviews.length === 0 && (
            <p className="text-sm text-muted-foreground">
              This piece has not been reviewed yet. If you own it, your honest review
              would help the next customer decide.
            </p>
          )}
        </div>
      </section>

      {data.related.length > 0 && (
        <section className="bg-secondary/40 py-14">
          <div className="container-editorial">
            <SectionHeading
              eyebrow="You may also like"
              title="Related pieces"
              action={
                <Link
                  to="/shop"
                  className="text-[11px] font-semibold uppercase tracking-[0.16em] text-espresso hover:text-gold"
                >
                  Shop all
                </Link>
              }
            />
            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
              {data.related.map((item) => (
                <ProductCard key={item._id} product={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      {recentProducts.length > 0 && (
        <section className="container-editorial py-14">
          <SectionHeading eyebrow="Recently viewed" title="Back to these" />
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
            {recentProducts.map((item) => (
              <ProductCard key={item._id} product={item} />
            ))}
          </div>
        </section>
      )}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-3 pr-16">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              {product.name}
            </p>
            <Price price={product.price} salePrice={product.salePrice} />
          </div>
          <Button
            onClick={addToBag}
            disabled={soldOut || (product.sizes.length > 0 && !size)}
            className="h-11 shrink-0 gap-2 rounded-sm px-5 text-[10px] font-semibold uppercase tracking-[0.16em]"
          >
            <ShoppingBag className="size-4" /> {soldOut ? "Sold out" : "Add to bag"}
          </Button>
        </div>
      </div>

      <Dialog open={lightbox} onOpenChange={setLightbox}>
        <DialogContent className="max-w-[92vw] gap-0 border-none bg-transparent p-0 shadow-none sm:max-w-3xl">
          <DialogTitle className="sr-only">{product.name} image</DialogTitle>
          <div className="relative bg-[#f3ece1]">
            <div className="aspect-[4/5] max-h-[82vh] w-full">
              <SmartImage
                src={product.images[activeImage] ?? product.images[0]}
                alt={product.name}
                className="object-contain"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex items-center justify-center gap-3 bg-background/95 py-3">
                {product.images.map((image, index) => (
                  <button
                    key={`${image}-thumb`}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    className={cn(
                      "size-12 overflow-hidden border",
                      activeImage === index ? "border-gold" : "border-border",
                    )}
                  >
                    <SmartImage src={image} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={sizeGuide} onOpenChange={setSizeGuide}>
        <DialogContent className="sm:max-w-lg">
          <DialogTitle className="font-display text-2xl">Size guide</DialogTitle>
          <p className="text-xs text-muted-foreground">
            Body measurements in inches. For ready-to-wear suits, choose the size
            closest to your bust measurement.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                <tr>
                  <th className="py-2.5 pr-3">Size</th>
                  <th className="py-2.5 pr-3">Bust</th>
                  <th className="py-2.5 pr-3">Waist</th>
                  <th className="py-2.5 pr-3">Hip</th>
                  <th className="py-2.5">Shirt length</th>
                </tr>
              </thead>
              <tbody>
                {SIZE_CHART.map((row) => (
                  <tr key={row.size} className="border-b border-border/50 last:border-0">
                    <td className="py-2.5 pr-3 font-medium">{row.size}</td>
                    <td className="py-2.5 pr-3">{row.bust}</td>
                    <td className="py-2.5 pr-3">{row.waist}</td>
                    <td className="py-2.5 pr-3">{row.hip}</td>
                    <td className="py-2.5">{row.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs leading-5 text-muted-foreground">
            Between sizes? Size up for a relaxed fit, or message us on WhatsApp and we
            will help you choose.
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
