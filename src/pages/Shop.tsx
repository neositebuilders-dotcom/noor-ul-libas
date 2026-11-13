import { ProductCard } from "@/components/site/ProductCard";
import { EmptyState, SmartImage } from "@/components/site/primitives";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { api } from "@/convex/_generated/api";
import { usePageMeta } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";

export const COLLECTION_COPY: Record<
  string,
  { title: string; eyebrow: string; description: string }
> = {
  featured: {
    title: "The Featured Collection",
    eyebrow: "Curated",
    description:
      "A considered edit of the pieces we would recommend first — the suits that best show how we cut, finish and embroider.",
  },
  "new-arrivals": {
    title: "New Arrivals",
    eyebrow: "Just in",
    description:
      "The newest pieces to reach the studio. New arrivals are added every week and rarely stay in stock for long.",
  },
  "best-sellers": {
    title: "Best Sellers",
    eyebrow: "Most loved",
    description:
      "Ranked by what our customers have actually bought and reordered — a practical place to start if you are new here.",
  },
  sale: {
    title: "Sale & Clearance",
    eyebrow: "Last pieces",
    description:
      "Reduced pieces from past collections. Prices are marked down on the product itself — no codes needed.",
  },
  unstitched: {
    title: "Unstitched Collection",
    eyebrow: "Fabric sets",
    description:
      "Choose your fabric and take it to your tailor — or ours. Every unstitched set lists exactly what is included.",
  },
  "ready-to-wear": {
    title: "Ready-to-Wear",
    eyebrow: "Finished pieces",
    description:
      "Cut, stitched and finished in standard sizes, ready to wear the day your parcel arrives.",
  },
  "two-piece": {
    title: "Two-Piece Suits",
    eyebrow: "Everyday ease",
    description:
      "Shirt and trouser pairings that are easy to wear through the week, in lawn, cotton and linen.",
  },
  "three-piece": {
    title: "Three-Piece Suits",
    eyebrow: "Complete sets",
    description:
      "Shirt, trouser and dupatta — complete suits with the fabric and finish matched for you.",
  },
  luxury: {
    title: "Luxury & Festive",
    eyebrow: "Occasion wear",
    description:
      "Hand-worked chiffon, organza, raw silk and velvet for weddings, Eid and the evenings in between.",
  },
  festive: {
    title: "Festive Collection",
    eyebrow: "Celebration",
    description:
      "Pieces made for mehndi, Eid and wedding season, in antique gold, ivory and jewel tones.",
  },
  lawn: {
    title: "Lawn Collection",
    eyebrow: "Summer",
    description:
      "Printed and embroidered lawn in breathable weaves — the fabric our customers ask for every summer.",
  },
  chiffon: {
    title: "Chiffon Collection",
    eyebrow: "Evening",
    description:
      "Fluid chiffon and organza with fine embroidery, cut for movement and evening light.",
  },
};

const FABRICS = [
  "Lawn",
  "Cotton",
  "Chiffon",
  "Organza",
  "Khaddar",
  "Linen",
  "Raw Silk",
  "Velvet",
];

const PRICE_BANDS = [
  { label: "Under Rs 5,000", min: undefined, max: 4999 },
  { label: "Rs 5,000 – 10,000", min: 5000, max: 10000 },
  { label: "Rs 10,000 – 20,000", min: 10001, max: 20000 },
  { label: "Rs 20,000 and above", min: 20001, max: undefined },
];

type ListingProps = {
  fixedCategory?: string;
  title?: string;
  eyebrow?: string;
  description?: string;
};

export default function Shop() {
  return <ProductListing />;
}

export function ProductListing({
  fixedCategory,
  title,
  eyebrow,
  description,
}: ListingProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const categories = useQuery(api.categories.list);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchDraft, setSearchDraft] = useState(searchParams.get("q") ?? "");

  const activeCategory = fixedCategory ?? searchParams.get("category") ?? undefined;
  const sort = searchParams.get("sort") ?? "newest";
  const productType = searchParams.get("type") ?? undefined;
  const pieceCount = searchParams.get("pieces")
    ? Number(searchParams.get("pieces"))
    : undefined;
  const minPrice = searchParams.get("min")
    ? Number(searchParams.get("min"))
    : undefined;
  const maxPrice = searchParams.get("max")
    ? Number(searchParams.get("max"))
    : undefined;
  const inStockOnly = searchParams.get("stock") === "1";
  const onSaleOnly = searchParams.get("sale") === "1";
  const search = searchParams.get("q") ?? undefined;
  const fabric = searchParams.get("fabric") ?? undefined;

  useEffect(() => {
    setSearchDraft(searchParams.get("q") ?? "");
  }, [searchParams]);

  const args = useMemo(
    () => ({
      ...(search ? { search } : {}),
      ...(activeCategory ? { category: activeCategory } : {}),
      ...(productType ? { productType: productType as "stitched" | "unstitched" } : {}),
      ...(pieceCount ? { pieceCount } : {}),
      ...(minPrice !== undefined ? { minPrice } : {}),
      ...(maxPrice !== undefined ? { maxPrice } : {}),
      ...(fabric ? { fabric } : {}),
      ...(inStockOnly ? { inStockOnly: true } : {}),
      ...(onSaleOnly ? { onSaleOnly: true } : {}),
      sort: sort as "newest" | "price-asc" | "price-desc" | "popular" | "name",
      limit: 60,
    }),
    [
      search,
      activeCategory,
      productType,
      pieceCount,
      minPrice,
      maxPrice,
      fabric,
      inStockOnly,
      onSaleOnly,
      sort,
    ],
  );

  const result = useQuery(api.products.list, args);
  const products = result?.items ?? [];
  const decor = COLLECTION_COPY[activeCategory ?? ""] ?? null;
  const category = categories?.find((row) => row.slug === activeCategory);
  const pageTitle = title ?? category?.name ?? decor?.title ?? "Shop All";
  const pageEyebrow = eyebrow ?? decor?.eyebrow ?? "The collection";
  const pageDescription =
    description ??
    category?.description ??
    decor?.description ??
    "Every piece in the studio — unstitched fabric sets and ready-to-wear suits in lawn, cotton, chiffon, organza and linen.";

  usePageMeta({
    title: `${pageTitle} — Noor ul Libas`,
    description: pageDescription,
    image: category?.image,
  });

  const updateParam = (key: string, value?: string | number | null) => {
    const next = new URLSearchParams(searchParams);
    if (value === undefined || value === null || value === "") next.delete(key);
    else next.set(key, String(value));
    setSearchParams(next, { replace: true });
  };

  const clearAll = () => setSearchParams(new URLSearchParams(), { replace: true });

  const activeChips: { label: string; clear: () => void }[] = [];
  if (search) activeChips.push({ label: `“${search}”`, clear: () => updateParam("q") });
  if (activeCategory && !fixedCategory)
    activeChips.push({
      label: category?.name ?? activeCategory,
      clear: () => updateParam("category"),
    });
  if (productType)
    activeChips.push({
      label: productType === "stitched" ? "Ready-to-wear" : "Unstitched",
      clear: () => updateParam("type"),
    });
  if (pieceCount)
    activeChips.push({ label: `${pieceCount} piece`, clear: () => updateParam("pieces") });
  if (fabric) activeChips.push({ label: fabric, clear: () => updateParam("fabric") });
  if (minPrice !== undefined)
    activeChips.push({
      label: `From Rs ${minPrice.toLocaleString("en-PK")}`,
      clear: () => updateParam("min"),
    });
  if (maxPrice !== undefined)
    activeChips.push({
      label: `Up to Rs ${maxPrice.toLocaleString("en-PK")}`,
      clear: () => updateParam("max"),
    });
  if (inStockOnly) activeChips.push({ label: "In stock", clear: () => updateParam("stock") });
  if (onSaleOnly) activeChips.push({ label: "On sale", clear: () => updateParam("sale") });

  const FilterPanel = (
    <div className="space-y-1">
      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Search
        </p>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            updateParam("q", searchDraft.trim());
          }}
          className="relative"
        >
          <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchDraft}
            onChange={(event) => setSearchDraft(event.target.value)}
            placeholder="Search the collection"
            className="h-10 w-full border border-input bg-card pl-9 pr-3 text-sm outline-none focus:border-gold"
          />
        </form>
      </div>

      <Accordion type="multiple" defaultValue={["category", "type", "price", "fabric"]}>
        <AccordionItem value="category" className="border-border/60">
          <AccordionTrigger className="py-3 text-[11px] font-semibold uppercase tracking-[0.18em] hover:no-underline">
            Category
          </AccordionTrigger>
          <AccordionContent className="pb-3 pt-0">
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => updateParam("category")}
                className={cn(
                  "text-left text-sm transition-colors hover:text-gold",
                  !activeCategory ? "font-medium text-espresso" : "text-muted-foreground",
                )}
              >
                All pieces
              </button>
              {(categories ?? []).map((row) => (
                <button
                  key={row._id}
                  type="button"
                  onClick={() => updateParam("category", row.slug)}
                  className={cn(
                    "text-left text-sm transition-colors hover:text-gold",
                    activeCategory === row.slug
                      ? "font-medium text-espresso"
                      : "text-muted-foreground",
                  )}
                >
                  {row.name}
                </button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="type" className="border-border/60">
          <AccordionTrigger className="py-3 text-[11px] font-semibold uppercase tracking-[0.18em] hover:no-underline">
            Product type
          </AccordionTrigger>
          <AccordionContent className="pb-3 pt-0">
            <div className="flex flex-col gap-1.5">
              {[
                { label: "All", value: "" },
                { label: "Unstitched", value: "unstitched" },
                { label: "Ready-to-wear", value: "stitched" },
              ].map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => updateParam("type", option.value || undefined)}
                  className={cn(
                    "text-left text-sm transition-colors hover:text-gold",
                    (productType ?? "") === option.value
                      ? "font-medium text-espresso"
                      : "text-muted-foreground",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="pieces" className="border-border/60">
          <AccordionTrigger className="py-3 text-[11px] font-semibold uppercase tracking-[0.18em] hover:no-underline">
            Pieces
          </AccordionTrigger>
          <AccordionContent className="pb-3 pt-0">
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() =>
                    updateParam("pieces", pieceCount === count ? undefined : count)
                  }
                  className={cn(
                    "border px-3 py-1.5 text-xs transition-colors",
                    pieceCount === count
                      ? "border-espresso bg-espresso text-ivory"
                      : "border-border text-muted-foreground hover:border-foreground",
                  )}
                >
                  {count} piece
                </button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="price" className="border-border/60">
          <AccordionTrigger className="py-3 text-[11px] font-semibold uppercase tracking-[0.18em] hover:no-underline">
            Price
          </AccordionTrigger>
          <AccordionContent className="pb-3 pt-0">
            <div className="flex flex-col gap-1.5">
              {PRICE_BANDS.map((band) => {
                const active = minPrice === band.min && maxPrice === band.max;
                return (
                  <button
                    key={band.label}
                    type="button"
                    onClick={() => {
                      const next = new URLSearchParams(searchParams);
                      if (active) {
                        next.delete("min");
                        next.delete("max");
                      } else {
                        if (band.min === undefined) next.delete("min");
                        else next.set("min", String(band.min));
                        if (band.max === undefined) next.delete("max");
                        else next.set("max", String(band.max));
                      }
                      setSearchParams(next, { replace: true });
                    }}
                    className={cn(
                      "text-left text-sm transition-colors hover:text-gold",
                      active ? "font-medium text-espresso" : "text-muted-foreground",
                    )}
                  >
                    {band.label}
                  </button>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="fabric" className="border-border/60">
          <AccordionTrigger className="py-3 text-[11px] font-semibold uppercase tracking-[0.18em] hover:no-underline">
            Fabric
          </AccordionTrigger>
          <AccordionContent className="pb-3 pt-0">
            <div className="grid grid-cols-2 gap-1.5">
              {FABRICS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => updateParam("fabric", fabric === option ? undefined : option)}
                  className={cn(
                    "text-left text-sm transition-colors hover:text-gold",
                    fabric === option
                      ? "font-medium text-espresso"
                      : "text-muted-foreground",
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="availability" className="border-b-0 border-border/60">
          <AccordionTrigger className="py-3 text-[11px] font-semibold uppercase tracking-[0.18em] hover:no-underline">
            Availability
          </AccordionTrigger>
          <AccordionContent className="pb-3 pt-0">
            <label className="flex cursor-pointer items-center gap-2.5 py-1 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(event) =>
                  updateParam("stock", event.target.checked ? "1" : undefined)
                }
                className="size-3.5 accent-[#35251C]"
              />
              In stock only
            </label>
            <label className="flex cursor-pointer items-center gap-2.5 py-1 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={onSaleOnly}
                onChange={(event) =>
                  updateParam("sale", event.target.checked ? "1" : undefined)
                }
                className="size-3.5 accent-[#35251C]"
              />
              Reduced pieces
            </label>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {activeChips.length > 0 && (
        <Button
          variant="ghost"
          onClick={clearAll}
          className="h-9 w-full justify-start px-0 text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
        >
          Clear all filters
        </Button>
      )}
    </div>
  );

  return (
    <div>
      <div className="relative isolate overflow-hidden border-b border-border/70 bg-secondary/60">
        {category?.image && (
          <>
            <div className="absolute inset-0 opacity-[0.14]">
              <SmartImage src={category.image} alt="" sizes="100vw" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/40" />
          </>
        )}
        <div className="container-editorial relative py-12 sm:py-16">
          <nav className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            <Link to="/" className="hover:text-gold">
              Home
            </Link>
            <span>/</span>
            <span className="text-espresso">{pageTitle}</span>
          </nav>
          <p className="eyebrow mt-6">{pageEyebrow}</p>
          <h1 className="mt-3 max-w-2xl text-4xl leading-[1.05] sm:text-[3.2rem]">
            {pageTitle}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
            {pageDescription}
          </p>
        </div>
      </div>

      <div className="container-editorial py-8 sm:py-12">
        <div className="grid gap-8 lg:grid-cols-[240px_1fr] lg:gap-10">
          <aside className="hidden lg:block">
            <div className="sticky top-32">{FilterPanel}</div>
          </aside>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setFiltersOpen(true)}
                  className="flex h-9 items-center gap-2 border border-border px-3 text-[10px] font-semibold uppercase tracking-[0.16em] lg:hidden"
                >
                  <SlidersHorizontal className="size-3.5" /> Filters
                  {activeChips.length > 0 && (
                    <span className="flex size-4 items-center justify-center rounded-full bg-espresso text-[9px] text-ivory">
                      {activeChips.length}
                    </span>
                  )}
                </button>
                <p className="text-xs text-muted-foreground">
                  {result === undefined
                    ? "Loading pieces…"
                    : `${result.total} ${result.total === 1 ? "piece" : "pieces"}`}
                </p>
              </div>
              <div className="relative">
                <select
                  value={sort}
                  onChange={(event) => updateParam("sort", event.target.value)}
                  aria-label="Sort products"
                  className="h-9 appearance-none border border-border bg-card pl-3 pr-8 text-[10px] font-semibold uppercase tracking-[0.14em] outline-none focus:border-gold"
                >
                  <option value="newest">Newest first</option>
                  <option value="price-asc">Price: low to high</option>
                  <option value="price-desc">Price: high to low</option>
                  <option value="popular">Most popular</option>
                  <option value="name">Name A–Z</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>

            {activeChips.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {activeChips.map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={chip.clear}
                    className="flex items-center gap-1.5 border border-border bg-card px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-espresso hover:text-espresso"
                  >
                    {chip.label}
                    <X className="size-3" />
                  </button>
                ))}
              </div>
            )}

            <div className="mt-6">
              {result === undefined ? (
                <div className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 lg:gap-x-6">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="animate-pulse">
                      <div className="aspect-[3/4] bg-muted" />
                      <div className="mt-4 h-2.5 w-24 bg-muted" />
                      <div className="mt-2 h-3.5 w-3/4 bg-muted" />
                    </div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <EmptyState
                  icon={<Search className="size-6" />}
                  title="No pieces match those filters"
                  description="Try removing a filter, or browse the full collection to see everything currently available."
                  action={
                    <Button
                      onClick={clearAll}
                      className="h-10 rounded-sm px-6 text-[10px] uppercase tracking-[0.18em]"
                    >
                      Clear filters
                    </Button>
                  }
                />
              ) : (
                <div className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 lg:gap-x-6">
                  {products.map((product, index) => (
                    <ProductCard key={product._id} product={product} priority={index < 4} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetContent side="left" className="w-[86vw] max-w-xs overflow-y-auto">
          <SheetHeader className="border-b border-border/60 px-5 py-4">
            <SheetTitle className="font-display text-xl">Filters</SheetTitle>
          </SheetHeader>
          <div className="px-5 pb-20 pt-4">{FilterPanel}</div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export function CategoryPage() {
  const { slug } = useParams();
  return <ProductListing fixedCategory={slug} />;
}

export function CollectionPage() {
  const { slug } = useParams();
  return <ProductListing fixedCategory={slug} />;
}

export function NewArrivalsPage() {
  return <ProductListing fixedCategory="new-arrivals" />;
}

export function BestSellersPage() {
  return <ProductListing fixedCategory="best-sellers" />;
}

export function SalePage() {
  return <ProductListing fixedCategory="sale" />;
}
