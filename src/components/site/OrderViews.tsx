import { Price, SmartImage } from "@/components/site/primitives";
import {
  formatDate,
  formatPKR,
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const FLOW = ["new", "confirmed", "processing", "packed", "shipped", "delivered"];

export function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "delivered"
      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
      : status === "cancelled" || status === "returned"
        ? "bg-destructive/5 text-destructive border-destructive/20"
        : status === "shipped"
          ? "bg-blue-50 text-blue-800 border-blue-200"
          : "bg-secondary text-espresso border-border";
  return (
    <span
      className={cn(
        "inline-flex items-center border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]",
        tone,
      )}
    >
      {ORDER_STATUS_LABELS[status] ?? status}
    </span>
  );
}

type OrderLike = {
  orderNumber: string;
  status: string;
  statusHistory: { status: string; at: number }[];
  createdAt: number;
};

export function OrderTimeline({ order }: { order: OrderLike }) {
  const closed = order.status === "cancelled" || order.status === "returned";
  const currentIndex = FLOW.indexOf(order.status);

  return (
    <div className="mt-4">
      {closed ? (
        <p className="border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          This order was {ORDER_STATUS_LABELS[order.status]?.toLowerCase()}. Contact us
          on WhatsApp if you need help.
        </p>
      ) : (
        <ol className="grid gap-3 sm:grid-cols-6">
          {FLOW.map((step, index) => {
            const history = order.statusHistory.find((entry) => entry.status === step);
            const complete = index <= currentIndex;
            return (
              <li key={step} className="flex items-start gap-2 sm:flex-col sm:gap-1.5">
                <span
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full border text-[9px]",
                    complete
                      ? "border-gold bg-gold text-white"
                      : "border-border bg-card text-muted-foreground",
                  )}
                >
                  {complete ? <Check className="size-3" /> : index + 1}
                </span>
                <span>
                  <span
                    className={cn(
                      "block text-[10px] font-semibold uppercase tracking-[0.1em]",
                      complete ? "text-espresso" : "text-muted-foreground",
                    )}
                  >
                    {ORDER_STATUS_LABELS[step]}
                  </span>
                  {history && (
                    <span className="mt-0.5 block text-[9px] text-muted-foreground">
                      {formatDate(history.at)}
                    </span>
                  )}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

export function OrderDetailCard({
  order,
  compact = false,
}: {
  order: {
    orderNumber: string;
    customerName: string;
    phone: string;
    email: string;
    city: string;
    province: string;
    address: string;
    notes?: string;
    items: {
      productId: string;
      name: string;
      slug: string;
      image: string;
      price: number;
      quantity: number;
      size?: string;
      color?: string;
    }[];
    subtotal: number;
    discount: number;
    shipping: number;
    total: number;
    couponCode?: string;
    paymentMethod: string;
    paymentStatus: string;
    trackingNumber?: string;
    createdAt: number;
  };
  compact?: boolean;
}) {
  return (
    <div className="border border-border/70 bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-5 py-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Order
          </p>
          <p className="font-display text-xl">{order.orderNumber}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Placed {formatDate(order.createdAt, true)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <StatusBadge status={order.status} />
          <span className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            {PAYMENT_METHOD_LABELS[order.paymentMethod]} ·{" "}
            {PAYMENT_STATUS_LABELS[order.paymentStatus]}
          </span>
        </div>
      </div>

      <div className="divide-y divide-border/60">
        {order.items.map((item, index) => (
          <div key={`${item.productId}-${index}`} className="flex gap-3 px-5 py-3.5">
            <div className="h-20 w-16 shrink-0 overflow-hidden bg-[#f3ece1]">
              <SmartImage src={item.image} alt={item.name} sizes="64px" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{item.name}</p>
              <p className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                Qty {item.quantity}
                {item.size ? ` · Size ${item.size}` : ""}
                {item.color ? ` · ${item.color}` : ""}
              </p>
            </div>
            <Price price={item.price * item.quantity} size="sm" />
          </div>
        ))}
      </div>

      <div className="space-y-1.5 border-t border-border/70 px-5 py-4 text-xs">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span className="tabular-nums text-foreground">{formatPKR(order.subtotal)}</span>
        </div>
        {order.discount > 0 && (
          <div className="flex justify-between text-gold">
            <span>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span>
            <span className="tabular-nums">−{formatPKR(order.discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-muted-foreground">
          <span>Delivery</span>
          <span className="tabular-nums text-foreground">
            {order.shipping === 0 ? "Free" : formatPKR(order.shipping)}
          </span>
        </div>
        <div className="flex justify-between border-t border-border/60 pt-2 text-sm">
          <span className="font-medium">Total</span>
          <span className="price">{formatPKR(order.total)}</span>
        </div>
      </div>

      {!compact && (
        <div className="grid gap-4 border-t border-border/70 px-5 py-4 text-xs sm:grid-cols-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Shipping to
            </p>
            <p className="mt-1.5 font-medium">{order.customerName}</p>
            <p className="mt-0.5 leading-5 text-muted-foreground">
              {order.address}
              <br />
              {order.city}, {order.province}
            </p>
            <p className="mt-1.5 text-muted-foreground">{order.phone}</p>
            <p className="text-muted-foreground">{order.email}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Payment
            </p>
            <p className="mt-1.5">{PAYMENT_METHOD_LABELS[order.paymentMethod]}</p>
            <p className="text-muted-foreground">
              {order.paymentStatus === "paid"
                ? "Payment confirmed"
                : order.paymentMethod === "cod"
                  ? "Pay on delivery"
                  : "Awaiting bank transfer confirmation"}
            </p>
            {order.trackingNumber && (
              <>
                <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Tracking number
                </p>
                <p className="mt-1 font-medium">{order.trackingNumber}</p>
              </>
            )}
            {order.notes && (
              <>
                <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Your note
                </p>
                <p className="mt-1 text-muted-foreground">{order.notes}</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
