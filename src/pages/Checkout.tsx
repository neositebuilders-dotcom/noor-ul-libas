import { Price, SmartImage } from "@/components/site/primitives";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { getStoredCoupon, setStoredCoupon } from "@/lib/coupon";
import { formatPKR, PROVINCES, whatsappLink } from "@/lib/format";
import { usePageMeta } from "@/lib/seo";
import { useShop } from "@/lib/shop";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import {
  Building2,
  Check,
  ChevronLeft,
  Loader2,
  Lock,
  MessageCircle,
  Truck,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, subtotal, clearCart } = useShop();
  const settings = useQuery(api.site.getSettings);
  const createOrder = useMutation(api.orders.create);

  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    email: "",
    city: "",
    province: "Punjab",
    address: "",
    notes: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "bank">("cod");
  const [couponInput, setCouponInput] = useState("");
  const [applied, setApplied] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [error, setError] = useState<string | null>(null);

  usePageMeta({
    title: "Checkout — Noor ul Libas",
    description: "Secure checkout with cash on delivery across Pakistan.",
  });

  useEffect(() => {
    const stored = getStoredCoupon();
    if (stored) {
      setApplied(stored);
      setCouponInput(stored);
    }
  }, []);

  useEffect(() => {
    if (settings && settings.codEnabled === false) setPaymentMethod("bank");
  }, [settings]);

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

  const discount = validation?.valid ? validation.discount : 0;
  const shipping =
    subtotal >= (settings?.freeShippingThreshold ?? 7999)
      ? 0
      : (settings?.shippingFee ?? 250);
  const total = Math.max(0, subtotal - discount) + (cart.length > 0 ? shipping : 0);

  if (!placed && cart.length === 0) {
    return (
      <div className="container-editorial flex flex-col items-center gap-4 py-24 text-center">
        <p className="eyebrow">Checkout</p>
        <h1 className="text-4xl">Your bag is empty</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Add a piece to your bag before checking out.
        </p>
        <Button asChild className="mt-2 h-11 rounded-sm px-6 text-[10px] uppercase tracking-[0.18em]">
          <Link to="/shop">Shop all pieces</Link>
        </Button>
      </div>
    );
  }

  const set = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!accepted) {
      setError("Please accept the terms and return policy to continue.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await createOrder({
        customerName: form.customerName,
        phone: form.phone,
        email: form.email,
        city: form.city,
        province: form.province,
        address: form.address,
        notes: form.notes || undefined,
        paymentMethod,
        couponCode: validation?.valid ? applied : undefined,
        items: cart.map((item) => ({
          productId: item.productId as Id<"products">,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
        })),
      });
      setPlaced(true);
      setStoredCoupon("");
      clearCart();
      sessionStorage.setItem(
        "noor-last-order",
        JSON.stringify({ orderNumber: result.orderNumber, phone: result.phone }),
      );
      toast.success("Order placed", {
        description: `Your order number is ${result.orderNumber}.`,
      });
      navigate(`/order/${result.orderNumber}`, { replace: true });
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "Could not place your order.";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-editorial py-10 sm:py-14">
      <Link
        to="/cart"
        className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground hover:text-gold"
      >
        <ChevronLeft className="size-3.5" /> Back to bag
      </Link>
      <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Checkout</p>
          <h1 className="mt-3 text-4xl">Almost yours</h1>
        </div>
        <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          <Lock className="size-3.5 text-gold" /> Your details stay private
        </p>
      </div>

      <form
        onSubmit={submit}
        className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12"
      >
        <div className="space-y-8">
          <section>
            <h2 className="font-display text-2xl">Delivery details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Full name *
                </label>
                <input
                  required
                  value={form.customerName}
                  onChange={(event) => set("customerName", event.target.value)}
                  className="field mt-1.5"
                  placeholder="As it should appear on the parcel"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Mobile number *
                </label>
                <input
                  required
                  type="tel"
                  inputMode="tel"
                  pattern="[0-9+\s-]{10,16}"
                  value={form.phone}
                  onChange={(event) => set("phone", event.target.value)}
                  className="field mt-1.5"
                  placeholder="0321 3315854"
                />
                <p className="mt-1 text-[10px] text-muted-foreground">
                  Used for delivery updates and order tracking.
                </p>
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Email address *
                </label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(event) => set("email", event.target.value)}
                  className="field mt-1.5"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  City *
                </label>
                <input
                  required
                  value={form.city}
                  onChange={(event) => set("city", event.target.value)}
                  className="field mt-1.5"
                  placeholder="Lahore"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Province *
                </label>
                <select
                  value={form.province}
                  onChange={(event) => set("province", event.target.value)}
                  className="field mt-1.5"
                >
                  {PROVINCES.map((province) => (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Complete shipping address *
                </label>
                <textarea
                  required
                  rows={3}
                  value={form.address}
                  onChange={(event) => set("address", event.target.value)}
                  className="field mt-1.5 resize-y"
                  placeholder="House / flat, street, area, nearest landmark, postal code"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Order notes (optional)
                </label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(event) => set("notes", event.target.value)}
                  className="field mt-1.5 resize-y"
                  placeholder="Anything we should know — preferred delivery time, stitching notes…"
                />
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl">Payment</h2>
            <div className="mt-4 space-y-2.5">
              {settings?.codEnabled !== false && (
                <label
                  className={cn(
                    "flex cursor-pointer items-start gap-3 border p-4 transition-colors",
                    paymentMethod === "cod"
                      ? "border-espresso bg-secondary/40"
                      : "border-border hover:border-foreground/40",
                  )}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                    className="mt-1 size-3.5 accent-[#35251C]"
                  />
                  <span className="flex-1">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <Wallet className="size-4 text-gold" /> Cash on delivery
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                      Pay the courier when your parcel arrives. Available across
                      Pakistan.
                    </span>
                  </span>
                </label>
              )}

              {settings?.bankTransferEnabled && (
                <label
                  className={cn(
                    "flex cursor-pointer items-start gap-3 border p-4 transition-colors",
                    paymentMethod === "bank"
                      ? "border-espresso bg-secondary/40"
                      : "border-border hover:border-foreground/40",
                  )}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "bank"}
                    onChange={() => setPaymentMethod("bank")}
                    className="mt-1 size-3.5 accent-[#35251C]"
                  />
                  <span className="flex-1">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <Building2 className="size-4 text-gold" /> Bank transfer
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                      Transfer the total to our account and share the receipt on
                      WhatsApp. We dispatch once it is confirmed.
                    </span>
                    {paymentMethod === "bank" && settings.bankDetails && (
                      <span className="mt-3 block whitespace-pre-line border-t border-border/60 pt-3 text-xs leading-6 text-foreground/80">
                        {settings.bankDetails}
                      </span>
                    )}
                  </span>
                </label>
              )}
            </div>
            <p className="mt-3 text-[11px] leading-5 text-muted-foreground">
              We never mark an order as paid without confirmed payment. Card payments
              are not enabled on this store yet.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl">Before you order</h2>
            <label className="mt-4 flex cursor-pointer items-start gap-3 text-xs leading-6 text-muted-foreground">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(event) => setAccepted(event.target.checked)}
                className="mt-1 size-3.5 accent-[#35251C]"
              />
              <span>
                I agree to the{" "}
                <Link to="/terms" className="text-espresso underline underline-offset-2">
                  terms & conditions
                </Link>{" "}
                and the{" "}
                <Link to="/returns" className="text-espresso underline underline-offset-2">
                  return & exchange policy
                </Link>
                .
              </span>
            </label>

            {error && (
              <p className="mt-4 border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={submitting}
              className="mt-5 h-12 w-full gap-2 rounded-sm text-[11px] font-semibold uppercase tracking-[0.18em] lg:hidden"
            >
              {submitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Check className="size-4" />
              )}
              Place order · {formatPKR(total)}
            </Button>
          </section>
        </div>

        <aside className="lg:sticky lg:top-32 lg:self-start">
          <div className="border border-border/70 bg-card p-6">
            <h2 className="font-display text-2xl">Your order</h2>

            <div className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={`${item.productId}-${item.size}`} className="flex gap-3">
                  <div className="h-20 w-16 shrink-0 overflow-hidden bg-[#f3ece1]">
                    <SmartImage src={item.image} alt={item.name} sizes="64px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.name}</p>
                    <p className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                      Qty {item.quantity}
                      {item.size ? ` · ${item.size}` : ""}
                    </p>
                    <Price price={item.price * item.quantity} size="sm" />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5">
              <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Coupon code
              </label>
              <div className="mt-1.5 flex gap-2">
                <input
                  value={couponInput}
                  onChange={(event) => setCouponInput(event.target.value.toUpperCase())}
                  placeholder="e.g. WELCOME10"
                  className="field h-9 flex-1 uppercase"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setApplied(couponInput.trim())}
                  className="h-9 rounded-sm px-4 text-[10px] uppercase tracking-[0.14em]"
                >
                  Apply
                </Button>
              </div>
              {validation && (
                <p
                  className={`mt-1.5 text-[11px] ${
                    validation.valid ? "text-emerald-700" : "text-destructive"
                  }`}
                >
                  {validation.message}
                </p>
              )}
            </div>

            <div className="mt-5 space-y-2.5 border-t border-border/70 pt-4 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="tabular-nums text-foreground">{formatPKR(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-gold">
                  <span>Discount</span>
                  <span className="tabular-nums">−{formatPKR(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery</span>
                <span className="tabular-nums text-foreground">
                  {shipping === 0 ? "Free" : formatPKR(shipping)}
                </span>
              </div>
              <div className="flex items-baseline justify-between border-t border-border/70 pt-3">
                <span className="font-medium">Total</span>
                <span className="price text-lg">{formatPKR(total)}</span>
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="mt-5 hidden h-12 w-full gap-2 rounded-sm text-[11px] font-semibold uppercase tracking-[0.18em] lg:flex"
            >
              {submitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Check className="size-4" />
              )}
              Place order
            </Button>

            <div className="mt-4 space-y-2 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              <p className="flex items-center gap-2">
                <Truck className="size-3.5 text-gold" /> Dispatched in 1–2 working days
              </p>
              <a
                href={whatsappLink(
                  settings?.whatsapp ?? "+923213315854",
                  "Salam! I need help with my order.",
                )}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 hover:text-gold"
              >
                <MessageCircle className="size-3.5 text-gold" /> Need help? WhatsApp us
              </a>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}
