import { EmptyState, Price, SmartImage } from "@/components/site/primitives";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { getStoredCoupon, setStoredCoupon } from "@/lib/coupon";
import { formatPKR } from "@/lib/format";
import { usePageMeta } from "@/lib/seo";
import { lineKey, useShop } from "@/lib/shop";
import { useQuery } from "convex/react";
import {
  ArrowRight,
  Loader2,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Trash2,
  Truck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";

export default function Cart() {
  const { cart, subtotal, updateQuantity, updateLine, removeItem, cartCount } =
    useShop();
  const settings = useQuery(api.site.getSettings);
  const [couponInput, setCouponInput] = useState("");
  const [applied, setApplied] = useState("");

  usePageMeta({
    title: "Your bag — Noor ul Libas",
    description: "Review the pieces in your bag before checkout.",
  });

  useEffect(() => {
    const stored = getStoredCoupon();
    if (stored) {
      setApplied(stored);
      setCouponInput(stored);
    }
  }, []);

  const couponArgs = useMemo(
    () =>
      applied && cart.length > 0
        ? {
            code: applied,
            items: cart.map((item) => ({
              productId: item.productId as Id<"products">,
              quantity: item.quantity,
              price: item.price,
            })),
          }
        : "skip",
    [applied, cart],
  );
  const validation = useQuery(api.coupons.validate, couponArgs);

  useEffect(() => {
    if (!applied || validation === undefined) return;
    if (validation.valid) {
      setStoredCoupon(applied);
    } else {
      setStoredCoupon("");
    }
  }, [applied, validation]);

  const discount = validation?.valid ? validation.discount : 0;
  const shipping =
    subtotal === 0
      ? 0
      : subtotal >= (settings?.freeShippingThreshold ?? 7999)
        ? 0
        : (settings?.shippingFee ?? 250);
  const remainingForFree =
    (settings?.freeShippingThreshold ?? 7999) - subtotal;

  if (cart.length === 0) {
    return (
      <div className="container-editorial py-14">
        <p className="eyebrow">Your bag</p>
        <h1 className="mt-3 text-4xl">Your bag is empty</h1>
        <div className="mt-10">
          <EmptyState
            icon={<ShoppingBag className="size-6" />}
            title="Nothing here yet"
            description="Start with the newest pieces, or browse the full collection to find something you love."
            action={
              <div className="flex flex-wrap justify-center gap-3">
                <Button asChild className="h-11 rounded-sm px-6 text-[10px] uppercase tracking-[0.18em]">
                  <Link to="/new-arrivals">Shop new arrivals</Link>
                </Button>
                <Button asChild variant="outline" className="h-11 rounded-sm px-6 text-[10px] uppercase tracking-[0.18em]">
                  <Link to="/shop">Shop all pieces</Link>
                </Button>
              </div>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container-editorial py-10 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Your bag</p>
          <h1 className="mt-3 text-4xl">
            {cartCount} {cartCount === 1 ? "piece" : "pieces"} selected
          </h1>
        </div>
        <Link
          to="/shop"
          className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground hover:text-gold"
        >
          Continue shopping
        </Link>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.5fr_0.9fr] lg:gap-12">
        <div className="divide-y divide-border/70 border-y border-border/70">
          {cart.map((item) => {
            const key = lineKey(item);
            return (
              <div key={key} className="flex gap-4 py-5">
                <Link
                  to={`/product/${item.slug}`}
                  className="block h-28 w-20 shrink-0 overflow-hidden bg-[#f3ece1] sm:h-32 sm:w-24"
                >
                  <SmartImage src={item.image} alt={item.name} sizes="96px" />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        to={`/product/${item.slug}`}
                        className="font-display text-lg leading-snug hover:text-gold"
                      >
                        {item.name}
                      </Link>
                      <p className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {item.sku}
                        {item.color ? ` · ${item.color}` : ""}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        removeItem(key);
                        toast.message("Removed from your bag");
                      }}
                      aria-label={`Remove ${item.name}`}
                      className="text-muted-foreground transition-colors hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    {item.availableSizes && item.availableSizes.length > 0 ? (
                      <label className="flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        Size
                        <select
                          value={item.size ?? ""}
                          onChange={(event) =>
                            updateLine(key, { size: event.target.value })
                          }
                          className="h-8 border border-border bg-card px-2 text-[11px] uppercase tracking-[0.1em] outline-none focus:border-gold"
                        >
                          {[
                            ...(item.availableSizes ?? []),
                            ...(item.size &&
                            !(item.availableSizes ?? []).includes(item.size)
                              ? [item.size]
                              : []),
                          ].map((size) => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                        </select>
                      </label>
                    ) : (
                      <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        Unstitched
                      </span>
                    )}

                    <div className="flex items-center border border-border">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() => updateQuantity(key, item.quantity - 1)}
                        className="flex size-8 items-center justify-center text-muted-foreground hover:text-foreground"
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="w-7 text-center text-xs tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() =>
                          updateQuantity(
                            key,
                            Math.min(item.quantity + 1, item.maxStock || 99),
                          )
                        }
                        className="flex size-8 items-center justify-center text-muted-foreground hover:text-foreground"
                      >
                        <Plus className="size-3" />
                      </button>
                    </div>

                    <Price
                      price={item.price * item.quantity}
                      className="ml-auto"
                    />
                  </div>
                  {item.maxStock <= item.quantity && (
                    <p className="mt-2 text-[10px] text-gold">
                      Only {item.maxStock} available — that is the most we can reserve.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <aside className="lg:sticky lg:top-32 lg:self-start">
          <div className="border border-border/70 bg-card p-6">
            <h2 className="font-display text-2xl">Order summary</h2>

            <div className="mt-5 space-y-2.5 text-sm">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="tabular-nums text-foreground">
                  {formatPKR(subtotal)}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex items-center justify-between text-gold">
                  <span className="flex items-center gap-1.5">
                    <Tag className="size-3.5" /> Discount ({applied})
                  </span>
                  <span className="tabular-nums">−{formatPKR(discount)}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Delivery</span>
                <span className="tabular-nums text-foreground">
                  {shipping === 0 ? "Free" : formatPKR(shipping)}
                </span>
              </div>
              <div className="flex items-baseline justify-between border-t border-border/70 pt-3 text-base">
                <span className="font-medium">Total</span>
                <span className="price text-lg">
                  {formatPKR(Math.max(0, subtotal - discount) + shipping)}
                </span>
              </div>
            </div>

            {remainingForFree > 0 ? (
              <div className="mt-5 border border-border/60 bg-secondary/50 p-3">
                <p className="text-[11px] text-muted-foreground">
                  Add {formatPKR(remainingForFree)} more for free delivery.
                </p>
                <div className="mt-2 h-1 w-full bg-border">
                  <div
                    className="h-1 bg-gold transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        (subtotal / (settings?.freeShippingThreshold ?? 7999)) * 100,
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ) : (
              <p className="mt-5 flex items-center gap-2 border border-emerald-200 bg-emerald-50 p-3 text-[11px] text-emerald-800">
                <Truck className="size-3.5" /> Your order qualifies for free delivery.
              </p>
            )}

            <div className="mt-5">
              <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Coupon code
              </label>
              <div className="mt-1.5 flex gap-2">
                <input
                  value={couponInput}
                  onChange={(event) => setCouponInput(event.target.value.toUpperCase())}
                  placeholder="e.g. WELCOME10"
                  className="field h-10 flex-1 uppercase"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-sm px-4 text-[10px] uppercase tracking-[0.14em]"
                  onClick={() => {
                    const code = couponInput.trim();
                    if (!code) {
                      setApplied("");
                      setStoredCoupon("");
                      return;
                    }
                    setApplied(code);
                  }}
                >
                  Apply
                </Button>
              </div>
              {applied && validation === undefined && (
                <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Loader2 className="size-3 animate-spin" /> Checking code…
                </p>
              )}
              {validation && (
                <p
                  className={`mt-2 text-[11px] ${
                    validation.valid ? "text-emerald-700" : "text-destructive"
                  }`}
                >
                  {validation.message}
                </p>
              )}
              {applied && (
                <button
                  type="button"
                  onClick={() => {
                    setApplied("");
                    setCouponInput("");
                    setStoredCoupon("");
                  }}
                  className="mt-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground underline underline-offset-2"
                >
                  Remove coupon
                </button>
              )}
            </div>

            <Button
              asChild
              className="mt-5 h-12 w-full gap-2 rounded-sm text-[11px] font-semibold uppercase tracking-[0.18em]"
            >
              <Link to="/checkout">
                Proceed to checkout <ArrowRight className="size-4" />
              </Link>
            </Button>

            <div className="mt-4 space-y-2 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              <p className="flex items-center gap-2">
                <ShieldCheck className="size-3.5 text-gold" /> Cash on delivery available
              </p>
              <p className="flex items-center gap-2">
                <Truck className="size-3.5 text-gold" /> Delivery in 2–5 working days
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
