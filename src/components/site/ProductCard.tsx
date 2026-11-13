import { Button } from "@/components/ui/button";
import { useShop } from "@/lib/shop";
import type { CardProduct } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Eye, Heart, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { Price, SmartImage } from "./primitives";
import { QuickViewDialog } from "./QuickViewDialog";

export function ProductCard({
  product,
  priority = false,
  className,
}: {
  product: CardProduct;
  priority?: boolean;
  className?: string;
}) {
  const { addItem, toggleWishlist, isWishlisted } = useShop();
  const [quickOpen, setQuickOpen] = useState(false);
  const wished = isWishlisted(product._id);
  const soldOut = product.stock <= 0;

  const addToCart = () => {
    addItem({
      productId: product._id,
      slug: product.slug,
      name: product.name,
      sku: product.sku,
      price: product.effectivePrice,
      image: product.image,
      size: product.sizes[0],
      color: product.colors[0],
      availableSizes: product.sizes,
      maxStock: product.stock,
    });
    toast.success(`${product.name} added to your bag`, {
      description: "Continue shopping or head to checkout.",
    });
  };

  return (
    <article className={cn("group relative flex flex-col", className)}>
      <div className="relative aspect-[3/4] overflow-hidden bg-[#f3ece1]">
        <Link
          to={`/product/${product.slug}`}
          className="absolute inset-0 z-0 block"
          aria-label={product.name}
        >
          <SmartImage
            src={product.image}
            alt={product.name}
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="transition-transform duration-[1100ms] ease-out group-hover:scale-[1.045]"
          />
          {product.images[1] && (
            <SmartImage
              src={product.images[1]}
              alt=""
              className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          )}
        </Link>

        <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-col items-start gap-1.5">
          {product.discountPercent > 0 && (
            <span className="bg-espresso px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-ivory">
              {product.discountPercent}% off
            </span>
          )}
          {product.isNewArrival && (
            <span className="bg-ivory/95 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-espresso">
              New
            </span>
          )}
          {product.isBestSeller && (
            <span className="bg-gold px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
              Best seller
            </span>
          )}
          {soldOut && (
            <span className="bg-white/95 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Sold out
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            const added = toggleWishlist({
              productId: product._id,
              slug: product.slug,
              name: product.name,
              price: product.effectivePrice,
              image: product.image,
              productType: product.productType,
            });
            toast[added ? "success" : "message"](
              added ? "Saved to your wishlist" : "Removed from your wishlist",
            );
          }}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          className={cn(
            "absolute right-3 top-3 z-10 flex size-9 items-center justify-center rounded-full bg-white/90 text-espresso shadow-sm backdrop-blur transition-colors hover:bg-white",
            wished && "text-gold",
          )}
        >
          <Heart className={cn("size-4", wished && "fill-gold")} />
        </button>

        <button
          type="button"
          onClick={() => setQuickOpen(true)}
          aria-label="Quick view"
          className="absolute bottom-3 right-3 z-10 flex size-9 items-center justify-center rounded-full bg-white/90 text-espresso shadow-sm backdrop-blur transition-colors hover:bg-white sm:hidden"
        >
          <Eye className="size-4" />
        </button>

        <div className="absolute inset-x-0 bottom-0 z-10 hidden translate-y-full gap-px bg-border/60 p-px transition-transform duration-300 ease-out group-hover:translate-y-0 sm:flex">
          <button
            type="button"
            onClick={() => setQuickOpen(true)}
            className="flex h-11 flex-1 items-center justify-center gap-2 bg-white/95 text-[11px] font-semibold uppercase tracking-[0.14em] text-espresso backdrop-blur transition-colors hover:bg-white"
          >
            <Eye className="size-3.5" /> Quick view
          </button>
          <button
            type="button"
            disabled={soldOut}
            onClick={() =>
              product.sizes.length > 0 ? setQuickOpen(true) : addToCart()
            }
            className="flex h-11 flex-1 items-center justify-center gap-2 bg-espresso text-[11px] font-semibold uppercase tracking-[0.14em] text-ivory transition-colors hover:bg-espresso/90 disabled:opacity-60"
          >
            <ShoppingBag className="size-3.5" />
            {soldOut ? "Sold out" : "Add to bag"}
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 pt-3.5">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          {product.fabric ? product.fabric : "Noor ul Libas"} · {product.pieceCount} piece
        </p>
        <h3 className="font-display text-[1.15rem] leading-snug">
          <Link
            to={`/product/${product.slug}`}
            className="transition-colors hover:text-gold"
          >
            {product.name}
          </Link>
        </h3>
        <div className="mt-auto flex items-center justify-between pt-1.5">
          <Price price={product.price} salePrice={product.salePrice} />
          {product.colors.length > 0 && (
            <div className="hidden items-center gap-1 sm:flex">
              {product.colors.slice(0, 3).map((color) => (
                <span
                  key={color}
                  title={color}
                  className="size-2.5 rounded-full border border-border"
                  style={{ backgroundColor: colorToSwatch(color) }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <QuickViewDialog
        product={product}
        open={quickOpen}
        onOpenChange={setQuickOpen}
      />
    </article>
  );
}

const SWATCHES: Record<string, string> = {
  ivory: "#F1E7D6",
  "off white": "#F7F3EA",
  "pearl ivory": "#F2EADF",
  pearl: "#EFE9DE",
  champagne: "#E3D3B4",
  "antique gold": "#BFA06A",
  "ivory gold": "#E0CBA2",
  "deep gold": "#A9863F",
  "rose gold": "#C99A84",
  sage: "#A8AE97",
  "dusty rose": "#C79387",
  blush: "#E0B9AF",
  emerald: "#2F5B4A",
  maroon: "#5C2630",
  "deep maroon": "#5A2430",
  midnight: "#1F2A3A",
  camel: "#B98E63",
  almond: "#C9B49C",
  sand: "#D6C3A7",
  stone: "#B7AB9B",
  terracotta: "#B5715A",
  ochre: "#C08A3E",
  lilac: "#B7A8C2",
  sky: "#A9C4D6",
  "powder blue": "#B7CAD6",
  peach: "#E8BFA6",
  coral: "#DE8C77",
  mint: "#B9CFC0",
  olive: "#7C7F5B",
  black: "#2A2622",
  white: "#FBF8F2",
  "ice blue": "#CFE0E6",
  cream: "#F0E6D6",
  "blue grey": "#8D9DA6",
  slate: "#7E8789",
  ecru: "#E3D8C4",
  gold: "#B68A3A",
};

function colorToSwatch(color: string) {
  const key = color.trim().toLowerCase();
  if (SWATCHES[key]) return SWATCHES[key];
  const match = key.match(/^#([0-9a-f]{3,6})$/);
  if (match) return `#${match[1]}`;
  return "#D8C7B2";
}
