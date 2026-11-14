import { OrderDetailCard, OrderTimeline } from "@/components/site/OrderViews";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { formatPKR, whatsappLink } from "@/lib/format";
import { usePageMeta } from "@/lib/seo";
import { useQuery } from "convex/react";
import { CheckCircle2, Loader2, MessageCircle, Package } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router";

export default function OrderConfirmation() {
  const { orderNumber } = useParams();
  const [phone, setPhone] = useState(() => {
    try {
      const raw = sessionStorage.getItem("noor-last-order");
      if (!raw) return "";
      const parsed = JSON.parse(raw) as { orderNumber: string; phone: string };
      if (parsed.orderNumber === orderNumber) return parsed.phone;
      return "";
    } catch {
      return "";
    }
  });
  const [submittedPhone, setSubmittedPhone] = useState(phone);
  const settings = useQuery(api.site.getSettings);

  const lookupArgs = useMemo(
    () =>
      orderNumber && submittedPhone
        ? { orderNumber, phone: submittedPhone }
        : "skip",
    [orderNumber, submittedPhone],
  );
  const order = useQuery(api.orders.lookup, lookupArgs);

  usePageMeta({
    title: `Order ${orderNumber ?? ""} confirmed — Noor ul Libas`,
    description: "Thank you for your order. Your confirmation details are below.",
  });

  if (!submittedPhone) {
    return (
      <div className="container-editorial flex max-w-lg flex-col py-20">
        <p className="eyebrow">Order confirmation</p>
        <h1 className="mt-3 text-4xl">Confirm your number</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          For your privacy, enter the mobile number used on order{" "}
          <span className="font-medium text-foreground">{orderNumber}</span> to see
          the confirmation.
        </p>
        <form
          className="mt-6 flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            setSubmittedPhone(phone);
          }}
        >
          <input
            required
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="0321 3315854"
            className="field"
          />
          <Button type="submit" className="h-10 shrink-0 rounded-sm px-5 text-[10px] uppercase tracking-[0.16em]">
            View order
          </Button>
        </form>
      </div>
    );
  }

  if (order === undefined) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (order === null) {
    return (
      <div className="container-editorial flex max-w-lg flex-col items-center py-20 text-center">
        <Package className="size-6 text-gold" />
        <h1 className="mt-4 text-3xl">We could not find that order</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Check the order number and mobile number. If it still does not appear, message
          us on WhatsApp and we will look it up for you.
        </p>
        <div className="mt-5 flex gap-2">
          <Button asChild className="h-10 rounded-sm px-5 text-[10px] uppercase tracking-[0.16em]">
            <Link to="/track-order">Try order tracking</Link>
          </Button>
          <Button asChild variant="outline" className="h-10 rounded-sm px-5 text-[10px] uppercase tracking-[0.16em]">
            <a
              href={whatsappLink(
                settings?.whatsapp ?? "+923213315854",
                `Salam! I need help finding order ${orderNumber}.`,
              )}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp
            </a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-editorial max-w-4xl py-12 sm:py-16">
      <div className="border border-border/70 bg-card p-6 text-center sm:p-10">
        <CheckCircle2 className="mx-auto size-8 text-emerald-600" />
        <p className="eyebrow mt-4">Order confirmed</p>
        <h1 className="mt-3 text-4xl">Thank you, {order.customerName.split(" ")[0]}</h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
          Your order <span className="font-medium text-foreground">{order.orderNumber}</span>{" "}
          has been received. Our team will confirm it on WhatsApp or by phone, usually
          within one working day.
        </p>
        <p className="mt-5 inline-flex items-baseline gap-2 border border-border/70 bg-secondary/40 px-4 py-2">
          <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Total
          </span>
          <span className="price text-lg">{formatPKR(order.total)}</span>
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button asChild className="h-11 rounded-sm px-6 text-[10px] uppercase tracking-[0.16em]">
            <Link to="/shop">Continue shopping</Link>
          </Button>
          <Button asChild variant="outline" className="h-11 rounded-sm px-6 text-[10px] uppercase tracking-[0.16em]">
            <Link to={`/track-order?order=${order.orderNumber}&phone=${encodeURIComponent(
              order.phone,
            )}`}>
              Track this order
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-11 gap-2 rounded-sm border-[#1FA855]/40 px-6 text-[10px] uppercase tracking-[0.16em] text-[#167a3e]"
          >
            <a
              href={whatsappLink(
                settings?.whatsapp ?? "+923213315854",
                `Salam! I just placed order ${order.orderNumber} for ${formatPKR(
                  order.total,
                )}. I'd like to confirm the details.`,
              )}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle className="size-4" /> Send order on WhatsApp
            </a>
          </Button>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="font-display text-2xl">Order progress</h2>
        <OrderTimeline order={order} />
      </div>

      {order.paymentMethod === "bank" && order.paymentStatus !== "paid" && (
        <div className="mt-8 border border-gold/30 bg-secondary/40 p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold">
            Bank transfer instructions
          </p>
          <p className="mt-2 whitespace-pre-line text-xs leading-6 text-foreground/80">
            {settings?.bankDetails}
          </p>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Your order stays unpaid until we confirm the transfer. We will never mark it
            as paid automatically.
          </p>
        </div>
      )}

      <div className="mt-8">
        <OrderDetailCard order={order} />
      </div>
    </div>
  );
}
