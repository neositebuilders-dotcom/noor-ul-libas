import { OrderDetailCard } from "@/components/site/OrderViews";
import { EmptyState } from "@/components/site/primitives";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { formatDate, formatPKR, ORDER_STATUS_LABELS } from "@/lib/format";
import { usePageMeta } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import {
  Heart,
  Loader2,
  LogOut,
  PackageSearch,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

export default function Account() {
  const { user, signOut, isLoading } = useAuth();
  const navigate = useNavigate();
  const orders = useQuery(api.orders.myOrders);
  const adminStatus = useQuery(api.admin.status);
  const updateProfile = useMutation(api.customers.updateProfile);

  const [profile, setProfile] = useState({ name: "", phone: "", city: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name ?? "",
        phone: user.phone ?? "",
        city: user.city ?? "",
      });
    }
  }, [user]);

  usePageMeta({
    title: "My account — Noor ul Libas",
    description: "Your orders, details and saved pieces.",
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const totalSpent = (orders ?? [])
    .filter((order) => order.status !== "cancelled" && order.status !== "returned")
    .reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="container-editorial py-10 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">My account</p>
          <h1 className="mt-3 text-4xl">
            {user?.name ? `Salam, ${user.name.split(" ")[0]}` : "Your account"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{user?.email}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="h-10 rounded-sm px-4 text-[10px] uppercase tracking-[0.14em]">
            <Link to="/wishlist">
              <Heart className="size-3.5" /> Wishlist
            </Link>
          </Button>
          {adminStatus?.isAdmin && (
            <Button asChild variant="outline" className="h-10 rounded-sm px-4 text-[10px] uppercase tracking-[0.14em]">
              <Link to="/admin">
                <ShieldCheck className="size-3.5" /> Admin panel
              </Link>
            </Button>
          )}
          <Button
            variant="outline"
            onClick={async () => {
              await signOut();
              navigate("/");
            }}
            className="h-10 rounded-sm px-4 text-[10px] uppercase tracking-[0.14em]"
          >
            <LogOut className="size-3.5" /> Sign out
          </Button>
        </div>
      </div>

      <div className="mt-9 grid gap-6 lg:grid-cols-[320px_1fr] lg:gap-10">
        <aside className="space-y-4">
          <div className="border border-border/70 bg-card p-5">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-secondary">
                <UserRound className="size-4 text-gold" />
              </span>
              <div>
                <p className="text-sm font-medium">{user?.name ?? "Customer"}</p>
                <p className="text-[11px] text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            <form
              className="mt-5 space-y-3"
              onSubmit={async (event) => {
                event.preventDefault();
                setSaving(true);
                try {
                  await updateProfile({
                    name: profile.name,
                    phone: profile.phone,
                    city: profile.city,
                  });
                  toast.success("Your details have been saved.");
                } catch (error) {
                  toast.error(
                    error instanceof Error ? error.message : "Could not save details.",
                  );
                } finally {
                  setSaving(false);
                }
              }}
            >
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Full name
                </label>
                <input
                  value={profile.name}
                  onChange={(event) =>
                    setProfile((current) => ({ ...current, name: event.target.value }))
                  }
                  className="field mt-1.5"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Mobile number
                </label>
                <input
                  value={profile.phone}
                  onChange={(event) =>
                    setProfile((current) => ({ ...current, phone: event.target.value }))
                  }
                  className="field mt-1.5"
                  placeholder="0321 3315854"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  City
                </label>
                <input
                  value={profile.city}
                  onChange={(event) =>
                    setProfile((current) => ({ ...current, city: event.target.value }))
                  }
                  className="field mt-1.5"
                  placeholder="Lahore"
                />
              </div>
              <Button
                type="submit"
                disabled={saving}
                className="h-10 w-full rounded-sm text-[10px] uppercase tracking-[0.16em]"
              >
                {saving && <Loader2 className="size-3.5 animate-spin" />} Save details
              </Button>
            </form>
          </div>

          <div className="border border-border/70 bg-secondary/40 p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Account summary
            </p>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Orders</span>
                <span className="tabular-nums">{orders?.length ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total spent</span>
                <span className="tabular-nums">{formatPKR(totalSpent)}</span>
              </div>
            </div>
            <p className="mt-3 text-[11px] leading-5 text-muted-foreground">
              Need help with an order? WhatsApp us on 0321 3315854.
            </p>
          </div>
        </aside>

        <div>
          <h2 className="font-display text-2xl">Your orders</h2>
          <div className="mt-4 space-y-4">
            {orders === undefined && (
              <div className="flex justify-center py-10">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            )}
            {orders && orders.length === 0 && (
              <EmptyState
                icon={<PackageSearch className="size-6" />}
                title="No orders yet"
                description="Orders placed with this email will appear here. Guest orders can still be tracked with your order number."
                action={
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button asChild className="h-10 rounded-sm px-5 text-[10px] uppercase tracking-[0.16em]">
                      <Link to="/shop">Start shopping</Link>
                    </Button>
                    <Button asChild variant="outline" className="h-10 rounded-sm px-5 text-[10px] uppercase tracking-[0.16em]">
                      <Link to="/track-order">Track an order</Link>
                    </Button>
                  </div>
                }
              />
            )}
            {orders?.map((order) => (
              <div key={order._id}>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[11px] text-muted-foreground">
                    {formatDate(order.createdAt, true)}
                  </p>
                  <Link
                    to={`/track-order?order=${order.orderNumber}&phone=${encodeURIComponent(
                      order.phone,
                    )}`}
                    className="text-[10px] uppercase tracking-[0.14em] text-gold hover:underline"
                  >
                    Track order
                  </Link>
                </div>
                <OrderDetailCard order={order} compact />
                <p
                  className={cn(
                    "mt-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground",
                  )}
                >
                  Status: {ORDER_STATUS_LABELS[order.status]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
