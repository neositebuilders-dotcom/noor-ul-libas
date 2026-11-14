import { OrderDetailCard, OrderTimeline } from "@/components/site/OrderViews";
import { EmptyState } from "@/components/site/primitives";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { usePageMeta } from "@/lib/seo";
import { useQuery } from "convex/react";
import { Loader2, PackageSearch } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router";

export default function TrackOrder() {
  const [searchParams] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get("order") ?? "");
  const [phone, setPhone] = useState(searchParams.get("phone") ?? "");
  const [query, setQuery] = useState<{ orderNumber: string; phone: string } | null>(
    searchParams.get("order") && searchParams.get("phone")
      ? {
          orderNumber: searchParams.get("order") ?? "",
          phone: searchParams.get("phone") ?? "",
        }
      : null,
  );

  const order = useQuery(
    api.orders.lookup,
    query ? { orderNumber: query.orderNumber, phone: query.phone } : "skip",
  );

  usePageMeta({
    title: "Track your order — Noor ul Libas",
    description:
      "Enter your order number and mobile number to see the status of your delivery.",
  });

  return (
    <div className="container-editorial max-w-3xl py-12 sm:py-16">
      <p className="eyebrow">Order tracking</p>
      <h1 className="mt-3 text-4xl">Where is my parcel?</h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
        Enter the order number from your confirmation and the mobile number you used at
        checkout. Your order number starts with <span className="font-medium">NL-</span>.
      </p>

      <form
        className="mt-7 grid gap-3 border border-border/70 bg-card p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
        onSubmit={(event) => {
          event.preventDefault();
          setQuery({ orderNumber: orderNumber.trim(), phone: phone.trim() });
        }}
      >
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Order number
          </label>
          <input
            required
            value={orderNumber}
            onChange={(event) => setOrderNumber(event.target.value.toUpperCase())}
            placeholder="NL-240101-1234"
            className="field mt-1.5"
          />
        </div>
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Mobile number
          </label>
          <input
            required
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="0321 3315854"
            className="field mt-1.5"
          />
        </div>
        <Button
          type="submit"
          className="h-10 rounded-sm px-6 text-[10px] font-semibold uppercase tracking-[0.16em]"
        >
          Track order
        </Button>
      </form>

      <div className="mt-8">
        {!query && (
          <EmptyState
            icon={<PackageSearch className="size-6" />}
            title="Your order status will appear here"
            description="We update the status as soon as your parcel moves: confirmed, processing, packed, shipped and delivered."
          />
        )}

        {query && order === undefined && (
          <div className="flex justify-center py-10">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {query && order === null && (
          <EmptyState
            icon={<PackageSearch className="size-6" />}
            title="No order found"
            description="Check that the order number and mobile number match your confirmation email. Still stuck? WhatsApp us and we will check for you."
          />
        )}

        {order && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl">Order progress</h2>
              <OrderTimeline order={order} />
            </div>
            <OrderDetailCard order={order} />
          </div>
        )}
      </div>
    </div>
  );
}
