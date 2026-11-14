import { NewsletterForm } from "@/components/site/NewsletterForm";
import { ProductCard } from "@/components/site/ProductCard";
import {
  SectionHeading,
  SmartImage,
  Stars,
} from "@/components/site/primitives";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { usePageMeta } from "@/lib/seo";
import type { CardProduct } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Gem,
  Instagram,
  PackageCheck,
  RefreshCcw,
  Scissors,
  Sparkles,
  Truck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";

const FALLBACK_SLIDES = [
  {
    _id: "fallback-1",
    eyebrow: "New season",
    heading: "Elegance woven in every thread",
    subheading:
      "Discover timeless Pakistani fashion — embroidered lawn, soft chiffon and considered formals.",
    image:
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=2000&q=80",
    ctaLabel: "Shop new arrivals",
    ctaHref: "/new-arrivals",
    secondaryLabel: "Explore collections",
    secondaryHref: "/collections/featured",
  },
];

function HeroSlider({
  slides,
}: {
  slides: {
    _id: string;
    eyebrow?: string;
    heading: string;
    subheading: string;
    image: string;
    ctaLabel?: string;
    ctaHref?: string;
    secondaryLabel?: string;
    secondaryHref?: string;
  }[];
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;
  const slide = slides[index % count];

  useEffect(() => {
    if (count < 2 || paused) return;
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % count),
      7000,
    );
    return () => window.clearInterval(timer);
  }, [count, paused]);

  useEffect(() => {
    if (index >= count) setIndex(0);
  }, [count, index]);

  return (
    <section
      className="relative isolate overflow-hidden bg-espresso"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative h-[76svh] min-h-[520px] max-h-[820px]">
        <AnimatePresence initial={false} mode="sync">
          <motion.div
            key={slide._id + index}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <SmartImage
              src={slide.image}
              alt={slide.heading}
              priority
              sizes="100vw"
              className="h-full w-full object-cover"
            />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-r from-espresso/85 via-espresso/45 to-espresso/5" />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso/45 via-transparent to-transparent" />

        <div className="container-editorial relative flex h-full flex-col justify-end pb-16 pt-24 sm:justify-center sm:pb-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide._id + index}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-xl text-ivory"
            >
              <div className="flex items-center gap-3">
                <span className="h-px w-9 bg-gold" />
                <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-gold">
                  {slide.eyebrow ?? "Noor ul Libas"}
                </p>
              </div>
              <h1 className="mt-5 text-[2.65rem] leading-[1.02] text-ivory sm:text-6xl lg:text-[4.5rem]">
                {slide.heading}
              </h1>
              <p className="mt-5 max-w-md text-sm leading-7 text-ivory/75 sm:text-[0.95rem]">
                {slide.subheading}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                {slide.ctaLabel && (
                  <Button
                    asChild
                    className="h-12 rounded-sm bg-gold px-7 text-[11px] font-semibold uppercase tracking-[0.18em] text-white hover:bg-gold/90"
                  >
                    <Link to={slide.ctaHref ?? "/shop"}>{slide.ctaLabel}</Link>
                  </Button>
                )}
                {slide.secondaryLabel && (
                  <Button
                    asChild
                    variant="outline"
                    className="h-12 rounded-sm border-ivory/35 bg-transparent px-7 text-[11px] font-semibold uppercase tracking-[0.18em] text-ivory hover:border-ivory hover:bg-ivory/10 hover:text-ivory"
                  >
                    <Link to={slide.secondaryHref ?? "/collections/featured"}>
                      {slide.secondaryLabel}
                    </Link>
                  </Button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="container-editorial absolute inset-x-0 bottom-6 flex items-end justify-between">
          <div className="flex items-center gap-2">
            {slides.map((item, dotIndex) => (
              <button
                key={item._id}
                type="button"
                onClick={() => setIndex(dotIndex)}
                aria-label={`Go to slide ${dotIndex + 1}`}
                className={cn(
                  "h-px transition-all duration-500",
                  dotIndex === index % count
                    ? "w-10 bg-gold"
                    : "w-5 bg-ivory/40 hover:bg-ivory/70",
                )}
              />
            ))}
            <span className="ml-2 text-[10px] tabular-nums tracking-[0.2em] text-ivory/60">
              {String((index % count) + 1).padStart(2, "0")} /{" "}
              {String(count).padStart(2, "0")}
            </span>
          </div>
          {count > 1 && (
            <div className="hidden items-center gap-2 sm:flex">
              <button
                type="button"
                aria-label="Previous slide"
                onClick={() => setIndex((current) => (current - 1 + count) % count)}
                className="flex size-10 items-center justify-center border border-ivory/25 text-ivory/80 transition-colors hover:border-ivory hover:text-ivory"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                aria-label="Next slide"
                onClick={() => setIndex((current) => (current + 1) % count)}
                className="flex size-10 items-center justify-center border border-ivory/25 text-ivory/80 transition-colors hover:border-ivory hover:text-ivory"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ProductGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-9 lg:grid-cols-4 lg:gap-x-6">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="aspect-[3/4] bg-muted" />
          <div className="mt-4 h-2.5 w-24 bg-muted" />
          <div className="mt-2 h-3.5 w-3/4 bg-muted" />
          <div className="mt-2 h-3 w-16 bg-muted" />
        </div>
      ))}
    </div>
  );
}

function ProductRow({
  products,
  loading,
}: {
  products: CardProduct[];
  loading: boolean;
}) {
  if (loading) return <ProductGridSkeleton />;
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-9 lg:grid-cols-4 lg:gap-x-6">
      {products.map((product, index) => (
        <ProductCard key={product._id} product={product} priority={index < 2} />
      ))}
    </div>
  );
}

const trustItems = [
  { icon: Truck, title: "Delivery across Pakistan", copy: "2–5 working days" },
  { icon: PackageCheck, title: "Cash on delivery", copy: "Pay when it arrives" },
  { icon: RefreshCcw, title: "7-day exchange", copy: "On unworn pieces" },
  { icon: BadgeCheck, title: "Hand-finished", copy: "Checked before dispatch" },
];

export default function Home() {
  const settings = useQuery(api.site.getSettings);
  const slideRows = useQuery(api.site.heroSlides);
  const categories = useQuery(api.categories.list);
  const featured = useQuery(api.products.list, {
    category: "featured",
    limit: 8,
  });
  const newArrivals = useQuery(api.products.list, {
    category: "new-arrivals",
    limit: 4,
  });
  const bestSellers = useQuery(api.products.list, {
    category: "best-sellers",
    limit: 4,
  });
  const reviews = useQuery(api.reviews.featured);

  usePageMeta({
    title: "Noor ul Libas — Pakistani Women's Clothing & Designer Suits",
    description:
      "Shop unstitched and ready-to-wear Pakistani suits in lawn, cotton, chiffon and organza. Cash on delivery across Pakistan. Noor ul Libas.",
    image: slideRows?.[0]?.image,
  });

  const slides =
    slideRows && slideRows.length > 0 ? slideRows : FALLBACK_SLIDES;
  const categoryTiles = categories ?? [];
  const instagramHandle =
    settings?.instagram?.replace(/\/+$/, "").split("/").pop() || "noorullibas";

  return (
    <div>
      <HeroSlider slides={slides} />

      <section className="border-b border-border/70 bg-secondary/60">
        <div className="container-editorial grid grid-cols-2 gap-6 py-7 lg:grid-cols-4">
          {trustItems.map((item) => (
            <div key={item.title} className="flex items-start gap-3">
              <item.icon className="mt-0.5 size-4 shrink-0 text-gold" />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-espresso">
                  {item.title}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{item.copy}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-editorial py-16 sm:py-20">
        <SectionHeading
          eyebrow="Shop by category"
          title="Find your next favourite"
          description="From everyday lawn to hand-worked festive formals — every edit is cut, checked and packed by our team in Lahore."
          action={
            <Link
              to="/shop"
              className="group inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-espresso"
            >
              View all products
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          }
        />

        <div className="mt-9 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {categoryTiles.length === 0
            ? Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "animate-pulse bg-muted",
                    index < 2 ? "col-span-2 aspect-[16/10]" : "aspect-[3/4]",
                  )}
                />
              ))
            : categoryTiles.map((category, index) => {
                const wide =
                  index < 2 ||
                  (categoryTiles.length >= 8 && index >= categoryTiles.length - 2);
                return (
                <Link
                  key={category._id}
                  to={`/category/${category.slug}`}
                  className={cn(
                    "group relative overflow-hidden bg-[#f3ece1]",
                    wide
                      ? "col-span-2 aspect-[16/10] lg:col-span-2"
                      : "aspect-[3/4]",
                  )}
                >
                  <SmartImage
                    src={category.image}
                    alt={category.name}
                    sizes={index < 2 ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"}
                    className="transition-transform duration-[1200ms] ease-out group-hover:scale-[1.05]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-espresso/75 via-espresso/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:p-5">
                    <div>
                      <h3 className="font-display text-xl leading-tight text-ivory sm:text-2xl">
                        {category.name}
                      </h3>
                      <p className="mt-1 hidden max-w-[16rem] text-[11px] leading-5 text-ivory/65 sm:block">
                        {category.description}
                      </p>
                    </div>
                    <span className="mb-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-ivory/40 text-ivory transition-colors group-hover:border-gold group-hover:bg-gold group-hover:text-white">
                      <ArrowRight className="size-3.5" />
                    </span>
                  </div>
                </Link>
                );
              })}
        </div>
      </section>

      <section className="border-y border-border/70 bg-card">
        <div className="container-editorial py-16 sm:py-20">
          <SectionHeading
            eyebrow="The edit"
            title="Featured pieces"
            description="A considered selection from the current collection — the suits our customers return for."
            action={
              <Button
                asChild
                variant="outline"
                className="h-11 rounded-sm border-espresso/25 px-6 text-[10px] font-semibold uppercase tracking-[0.18em]"
              >
                <Link to="/collections/featured">View all products</Link>
              </Button>
            }
          />
          <div className="mt-9">
            {featured === undefined ? (
              <ProductRow products={[]} loading />
            ) : featured.items.length === 0 ? (
              <div className="border border-dashed border-border px-6 py-12 text-center">
                <p className="font-display text-2xl">Featured pieces coming soon</p>
                <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                  The featured edit is being updated. Browse everything currently in
                  the studio in the meantime.
                </p>
                <Button
                  asChild
                  className="mt-5 h-10 rounded-sm px-5 text-[10px] uppercase tracking-[0.16em]"
                >
                  <Link to="/shop">Shop all pieces</Link>
                </Button>
              </div>
            ) : (
              <ProductRow products={featured.items} loading={false} />
            )}
          </div>
        </div>
      </section>

      {settings?.featuredBanner?.isActive && (
        <section className="relative isolate overflow-hidden bg-espresso">
          <div className="grid lg:grid-cols-2">
            <div className="relative min-h-[340px] lg:min-h-[560px]">
              <SmartImage
                src={settings.featuredBanner.image}
                alt={settings.featuredBanner.heading}
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
              <div className="absolute inset-0 bg-espresso/10" />
            </div>
            <div className="flex items-center px-6 py-14 sm:px-12 lg:px-16">
              <div className="max-w-md">
                <p className="eyebrow">{settings.featuredBanner.eyebrow}</p>
                <h2 className="mt-4 text-4xl leading-[1.05] text-ivory sm:text-5xl">
                  {settings.featuredBanner.heading}
                </h2>
                <p className="mt-4 text-sm leading-7 text-ivory/70">
                  {settings.featuredBanner.subheading}
                </p>
                <Button
                  asChild
                  className="mt-8 h-12 rounded-sm bg-ivory px-7 text-[11px] font-semibold uppercase tracking-[0.18em] text-espresso hover:bg-ivory/90"
                >
                  <Link to={settings.featuredBanner.ctaHref}>
                    {settings.featuredBanner.ctaLabel}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="container-editorial py-16 sm:py-20">
        <SectionHeading
          eyebrow="Just arrived"
          title="New arrivals"
          description="The latest pieces to reach the studio, added this week."
          action={
            <Link
              to="/new-arrivals"
              className="group inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-espresso"
            >
              See all new arrivals
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          }
        />
        <div className="mt-9">
          <ProductRow
            products={newArrivals?.items ?? []}
            loading={newArrivals === undefined}
          />
        </div>
      </section>

      <section className="bg-secondary/50 py-16 sm:py-20">
        <div className="container-editorial">
          <SectionHeading
            eyebrow="Most loved"
            title="Best sellers"
            description="The pieces our customers keep coming back to, ranked by what has actually sold."
            action={
              <Link
                to="/best-sellers"
                className="group inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-espresso"
              >
                Shop best sellers
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            }
          />
          <div className="mt-9">
            <ProductRow
              products={bestSellers?.items ?? []}
              loading={bestSellers === undefined}
            />
          </div>
        </div>
      </section>

      <section className="container-editorial py-16 sm:py-20">
        <SectionHeading
          eyebrow="Why Noor ul Libas"
          title="Made with care, worn with ease"
          align="center"
        />
        <div className="mt-12 grid gap-px overflow-hidden border border-border/70 bg-border/70 sm:grid-cols-2 lg:grid-cols-4">
          {(settings?.whyChoose ?? []).map((item, index) => (
            <div key={item.title} className="bg-card p-7">
              <p className="font-display text-2xl text-gold/60">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-5 font-display text-xl leading-snug">{item.title}</h3>
              <p className="mt-2.5 text-[13px] leading-6 text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {settings?.promoBanner?.isActive && (
        <section className="relative isolate overflow-hidden">
          <div className="absolute inset-0">
            <SmartImage
              src={settings.promoBanner.image}
              alt={settings.promoBanner.heading}
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-espresso/70" />
          </div>
          <div className="container-editorial relative flex min-h-[380px] flex-col items-center justify-center py-16 text-center">
            <p className="eyebrow">{settings.promoBanner.eyebrow ?? "Seasonal edit"}</p>
            <h2 className="mt-4 max-w-2xl text-4xl leading-[1.05] text-ivory sm:text-5xl">
              {settings.promoBanner.heading}
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-7 text-ivory/75">
              {settings.promoBanner.subheading}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button
                asChild
                className="h-12 rounded-sm bg-gold px-7 text-[11px] font-semibold uppercase tracking-[0.18em] text-white hover:bg-gold/90"
              >
                <Link to={settings.promoBanner.ctaHref}>
                  {settings.promoBanner.ctaLabel}
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-12 rounded-sm border-ivory/35 bg-transparent px-7 text-[11px] font-semibold uppercase tracking-[0.18em] text-ivory hover:bg-ivory/10 hover:text-ivory"
              >
                <Link to="/sale">Shop sale</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      <section className="container-editorial py-16 sm:py-20">
        <SectionHeading
          eyebrow="In their words"
          title="Customer notes"
          description="Real feedback from customers who have ordered and worn these pieces."
          align="center"
        />
        {reviews && reviews.length > 0 ? (
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {reviews.slice(0, 3).map((review) => (
              <figure
                key={review._id}
                className="flex h-full flex-col border border-border/70 bg-card p-7"
              >
                <Stars rating={review.rating} />
                <blockquote className="mt-4 flex-1 font-display text-lg leading-relaxed text-foreground/90">
                  “{review.body}”
                </blockquote>
                <figcaption className="mt-6 border-t border-border/60 pt-4">
                  <p className="text-sm font-medium">{review.name}</p>
                  <p className="mt-0.5 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    {review.productName ?? "Noor ul Libas customer"}
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <div className="mx-auto mt-10 flex max-w-2xl flex-col items-center gap-4 border border-dashed border-border px-6 py-12 text-center">
            <Sparkles className="size-5 text-gold" />
            <p className="font-display text-2xl">Reviewed by the women who wear them</p>
            <p className="max-w-md text-sm leading-6 text-muted-foreground">
              We publish reviews only after a verified order, so there is nothing to
              show yet. Ordered with us? We would love to hear how the fabric and fit
              worked for you.
            </p>
            <Button asChild variant="outline" className="mt-1 h-10 rounded-sm text-[10px] uppercase tracking-[0.18em]">
              <Link to="/contact">Share your feedback</Link>
            </Button>
          </div>
        )}
      </section>

      {settings && settings.socialGallery.length > 0 && (
        <section className="border-y border-border/70 bg-card py-14">
          <div className="container-editorial">
            <div className="flex flex-col items-center text-center">
              <Instagram className="size-5 text-gold" />
              <h2 className="mt-3 text-3xl">@{instagramHandle}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Studio notes, new drops and styling from our customers.
              </p>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-6">
              {settings.socialGallery.slice(0, 6).map((item, index) => (
                <a
                  key={`${item.image}-${index}`}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative aspect-square overflow-hidden bg-[#f3ece1]"
                >
                  <SmartImage
                    src={item.image}
                    alt="Noor ul Libas on Instagram"
                    sizes="(min-width: 1024px) 16vw, 33vw"
                    className="transition-transform duration-700 group-hover:scale-105"
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-espresso/45 opacity-0 transition-opacity group-hover:opacity-100">
                    <Instagram className="size-6 text-ivory" />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-secondary">
        <div className="container-editorial grid items-center gap-8 py-16 lg:grid-cols-2 lg:py-20">
          <div>
            <p className="eyebrow">Stay close</p>
            <h2 className="mt-4 text-4xl leading-[1.05] sm:text-5xl">
              New collections, quietly delivered
            </h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground">
              Join our list for first access to new drops, festive edits and studio
              notes. No noise — just the pieces worth knowing about.
            </p>
          </div>
          <div className="lg:pl-10">
            <NewsletterForm />
            <p className="mt-3 text-[11px] text-muted-foreground">
              By subscribing you agree to our{" "}
              <Link to="/privacy" className="underline underline-offset-2">
                privacy policy
              </Link>
              . Unsubscribe any time.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              <span className="flex items-center gap-2">
                <Gem className="size-3.5 text-gold" /> Considered design
              </span>
              <span className="flex items-center gap-2">
                <Scissors className="size-3.5 text-gold" /> Fabric-first
              </span>
              <span className="flex items-center gap-2">
                <Truck className="size-3.5 text-gold" /> Nationwide delivery
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
