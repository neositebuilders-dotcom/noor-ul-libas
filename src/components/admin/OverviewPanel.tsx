import { Panel, StatCard } from "@/components/admin/shared";
import { RangeFilter, rangeFor, type Preset } from "@/components/admin/range";
import { StatusBadge } from "@/components/site/OrderViews";
import { api } from "@/convex/_generated/api";
import { formatDate, formatPKR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import {
  AlertTriangle,
  CalendarDays,
  Package,
  ShoppingCart,
  Store,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { Suspense, lazy, useState } from "react";

// recharts is ~390 kB, so the charts load after the numbers are already on
// screen instead of holding up the whole dashboard.
const RevenueChart = lazy(() =>
  import("@/components/admin/OverviewCharts").then((module) => ({
    default: module.RevenueChart,
  })),
);
const CategoryBarChart = lazy(() =>
  import("@/components/admin/OverviewCharts").then((module) => ({
    default: module.CategoryBarChart,
  })),
);

function ChartSkeleton({ className }: { className: string }) {
  return (
    <div
      className={cn(
        "animate-pulse border border-border/60 bg-secondary/40",
        className,
      )}
    />
  );
}

export function Overview() {
  const [preset, setPreset] = useState<Preset>("30d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const { from, to } = rangeFor(preset, customFrom, customTo);
  const data = useQuery(api.admin.dashboard, { from, to });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <RangeFilter
          preset={preset}
          setPreset={setPreset}
          customFrom={customFrom}
          setCustomFrom={setCustomFrom}
          customTo={customTo}
          setCustomTo={setCustomTo}
        />
        {data && (
          <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            {formatDate(from)} – {formatDate(to)}
          </p>
        )}
      </div>

      {!data ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-28 animate-pulse border border-border/60 bg-card" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Revenue"
              value={formatPKR(data.revenue)}
              hint={`${formatPKR(data.paidRevenue)} confirmed paid`}
              icon={Wallet}
              tone="gold"
            />
            <StatCard
              label="Orders"
              value={String(data.orderCount)}
              hint={`${data.pendingOrders} awaiting fulfilment`}
              icon={ShoppingCart}
            />
            <StatCard
              label="Average order"
              value={formatPKR(data.averageOrderValue)}
              hint="excluding cancelled orders"
              icon={TrendingUp}
            />
            <StatCard
              label="Customers"
              value={String(data.totalCustomers)}
              hint="unique phone numbers"
              icon={Users}
            />
            <StatCard
              label="Products"
              value={String(data.totalProducts)}
              hint={`${data.outOfStock} out of stock`}
              icon={Store}
            />
            <StatCard
              label="Low stock"
              value={String(data.lowStock)}
              hint="at or below threshold"
              icon={AlertTriangle}
              tone={data.lowStock > 0 ? "alert" : "default"}
            />
            <StatCard
              label="Delivered"
              value={String(data.completedOrders)}
              hint="all time"
              icon={Package}
            />
            <StatCard
              label="Cancelled / returned"
              value={String(data.cancelledOrders)}
              hint="all time"
              icon={CalendarDays}
            />
          </div>

          <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
            <Panel
              title="Sales overview"
              description="Revenue and order volume over the selected period."
            >
              <Suspense fallback={<ChartSkeleton className="h-[260px]" />}>
                <RevenueChart series={data.series} />
              </Suspense>
            </Panel>

            <Panel title="Best sellers" description="Ranked by units sold.">
              <div className="space-y-3">
                {data.bestSellers.map((product) => (
                  <div key={product.slug} className="flex items-center gap-3">
                    <span className="w-4 text-[10px] tabular-nums text-muted-foreground">
                      #
                    </span>
                    <div className="h-10 w-8 overflow-hidden bg-muted">
                      {product.image && (
                        <img
                          src={product.image}
                          alt=""
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">{product.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {product.sales} sold · {formatPKR(product.revenue)}
                      </p>
                    </div>
                  </div>
                ))}
                {data.bestSellers.length === 0 && (
                  <p className="text-xs text-muted-foreground">No sales recorded yet.</p>
                )}
              </div>
            </Panel>
          </div>

          <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
            <Panel
              title="Recent orders"
              description="The latest orders placed on the store."
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-xs">
                  <thead className="border-y border-border/70 text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                    <tr>
                      <th className="py-2 font-semibold">Order</th>
                      <th className="py-2 font-semibold">Customer</th>
                      <th className="py-2 font-semibold">Total</th>
                      <th className="py-2 font-semibold">Status</th>
                      <th className="py-2 text-right font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {data.recentOrders.map((order) => (
                      <tr key={order._id}>
                        <td className="py-2.5 font-medium">{order.orderNumber}</td>
                        <td className="py-2.5">
                          <p>{order.customerName}</p>
                          <p className="text-[10px] text-muted-foreground">{order.city}</p>
                        </td>
                        <td className="py-2.5 tabular-nums">{formatPKR(order.total)}</td>
                        <td className="py-2.5">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="py-2.5 text-right text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </td>
                      </tr>
                    ))}
                    {data.recentOrders.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-muted-foreground">
                          No orders yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Panel>

            <Panel title="Revenue by category" description="Within the selected period.">
              {data.categoryRevenue.length > 0 ? (
                <Suspense fallback={<ChartSkeleton className="h-[220px]" />}>
                  <CategoryBarChart data={data.categoryRevenue} />
                </Suspense>
              ) : (
                <p className="text-xs text-muted-foreground">No revenue recorded yet.</p>
              )}
            </Panel>
          </div>

          <Panel
            title="Low stock alerts"
            description="Restock these before they sell out."
          >
            {data.lowStockProducts.length > 0 ? (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {data.lowStockProducts.map((product) => (
                  <div
                    key={product._id}
                    className="flex items-center justify-between border border-border/60 px-3 py-2 text-xs"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{product.name}</p>
                      <p className="text-[10px] text-muted-foreground">{product.sku}</p>
                    </div>
                    <span
                      className={cn(
                        "tabular-nums",
                        product.stock === 0 ? "text-destructive" : "text-gold",
                      )}
                    >
                      {product.stock}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Everything is above its stock threshold.
              </p>
            )}
          </Panel>
        </>
      )}
    </div>
  );
}
