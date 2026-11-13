import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatPKR } from "@/lib/format";
import { useShop } from "@/lib/shop";
import type { CardProduct } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { Price, SmartImage } from "./primitives";

export function QuickViewDialog({
  product,
  open,
  onOpenChange,
}: {
  product: CardProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { addItem } = useShop();
  const [size, setSize] = useState<string | undefined>();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (open && product) {
      setSize(product.sizes[0]);
      setQuantity(1);
    }
  }, [open, product]);

  if (!product) return null;
  const inStock = product.stock > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden border-border/80 p-0 sm:max-w-3xl">
        <div className="grid sm:grid-cols-2">
          <div className="aspect-[4/5] bg-[#f4ece1] sm:aspect-auto">
            <SmartImage src={product.image} alt={product.name} />
          </div>
          <div className="flex flex-col gap-4 p-6 sm:p-8">
            <div>
              <p className="eyebrow text-[9px] text-muted-foreground">
                {product.fabric ?? "Signature"}
                {product.fabric ? " · " : ""}
                {product.pieceCount} piece
              </p>
              <DialogTitle className="mt-2 font-display text-2xl leading-tight">
                {product.name}
              </DialogTitle>
              <DialogDescription className="mt-2">
                <Price price={product.price} salePrice={product.salePrice} size="base" />
              </DialogDescription>
            </div>

            {product.colors.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Colour
                </p>
                <p className="mt-1 text-sm">{product.colors.join(" · ")}</p>
              </div>
            )}

            {product.sizes.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Size
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {product.sizes.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setSize(option)}
                      className={cn(
                        "min-w-10 border px-2.5 py-1.5 text-xs transition-colors",
                        size === option
                          ? "border-espresso bg-espresso text-ivory"
                          : "border-border hover:border-foreground",
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-auto space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-border">
                  <button
                    type="button"
                    className="flex size-9 items-center justify-center text-muted-foreground hover:text-foreground"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                  >
                    <Minus className="size-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm tabular-nums">{quantity}</span>
                  <button
                    type="button"
                    className="flex size-9 items-center justify-center text-muted-foreground hover:text-foreground"
                    onClick={() =>
                      setQuantity((q) => Math.min(product.stock || 1, q + 1))
                    }
                    aria-label="Increase quantity"
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {inStock ? `${product.stock} in stock` : "Out of stock"}
                </p>
              </div>

              <Button
                className="h-11 w-full gap-2 rounded-sm"
                disabled={!inStock || (product.sizes.length > 0 && !size)}
                onClick={() => {
                  addItem(
                    {
                      productId: product._id,
                      slug: product.slug,
                      name: product.name,
                      sku: product.sku,
                      price: product.effectivePrice,
                      image: product.image,
                      size,
                      color: product.colors[0],
                      availableSizes: product.sizes,
                      maxStock: product.stock,
                    },
                    quantity,
                  );
                  toast.success(`${product.name} added to your bag`, {
                    description: `${quantity} × ${formatPKR(product.effectivePrice)}`,
                  });
                  onOpenChange(false);
                }}
              >
                <ShoppingBag className="size-4" />
                Add to bag
              </Button>

              <Link
                to={`/product/${product.slug}`}
                onClick={() => onOpenChange(false)}
                className="link-quiet flex items-center justify-center gap-1.5 py-1"
              >
                <Check className="size-3.5" /> View full details
              </Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
