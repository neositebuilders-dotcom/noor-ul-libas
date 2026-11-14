import { CategoriesPanel, CouponsPanel, ReviewsPanel } from "@/components/admin/CatalogPanels";
import { HomepagePanel } from "@/components/admin/HomepagePanel";
import { OrdersPanel } from "@/components/admin/OrdersPanel";
import {
  CustomersPanel,
  InventoryPanel,
  MessagesPanel,
  SettingsPanel,
  TeamPanel,
} from "@/components/admin/PeoplePanels";
import { ProductsPanel } from "@/components/admin/ProductsPanel";
import { Panel, StatCard } from "@/components/admin/shared";
import { StatusBadge } from "@/components/site/OrderViews";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { formatDate, formatPKR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import {
  AlertTriangle,
  BarChart3,
  Bookmark,
  Box,
  CalendarDays,
  ClipboardList,
  Download,
  ExternalLink,
  Grid2X2,
  Image as ImageIcon,
  LayoutDashboard,
  Loader2,
  LogOut,
  Mail,
  Menu,
  Package,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Star,
  Store,
  Tag,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

type Section =
  | "overview"
  | "orders"
  | "products"
  | "categories"
  | "homepage"
  | "coupons"
  | "customers"
  | "team"
  | "reviews"
  | "inventory"
  | "reports"
  | "messages"
  | "settings";

const NAV: { key: Section; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "orders", label: "Orders", icon: ClipboardList },
  { key: "products", label: "Products", icon: ShoppingCart },
  { key: "categories", label: "Categories", icon: Grid2X2 },
  { key: "homepage", label: "Homepage", icon: ImageIcon },
  { key: "coupons", label: "Coupons", icon: Tag },
  { key: "customers", label: "Customers", icon: Users },
  { key: "team", label: "Team", icon: ShieldCheck },
  { key: "reviews", label: "Reviews", icon: Star },
  { key: "inventory", label: "Inventory", icon: Box },
  { key: "reports", label: "Reports", icon: BarChart3 },
  { key: "messages", label: "Messages", icon: Mail },
  { key: "settings", label: "Settings", icon: Settings },
];

const TITLES: Record<Section, { title: string; subtitle: string }> = {
  overview: {
    title: "Dashboard",
    subtitle: "Revenue, orders and stock at a glance.",
  },
  orders: { title: "Orders", subtitle: "Fulfilment and payment status." },
  products: { title: "Products", subtitle: "Your collection and inventory." },
  categories: { title: "Categories", subtitle: "How customers browse the store." },
  homepage: { title: "Homepage", subtitle: "Slides, banners and social content." },
  coupons: { title: "Coupons", subtitle: "Discount codes and promotions." },
  customers: { title: "Customers", subtitle: "Order history and lifetime value." },
  team: { title: "Team", subtitle: "Administrator access for your store." },
  reviews: { title: "Reviews", subtitle: "Moderate customer feedback." },
  inventory: { title: "Inventory", subtitle: "Stock levels and adjustments." },
  reports: { title: "Reports", subtitle: "Sales, categories and products." },
  messages: { title: "Messages", subtitle: "Contact form and subscribers." },
  settings: { title: "Settings", subtitle: "Store details, delivery and policies." },
};

const DAY = 24 * 60 * 60 * 1000;

type Preset = "today" | "7d" | "30d" | "month" | "90d" | "custom";

function startOfDay(ts: number) {
  const date = new Date(ts);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

function rangeFor(preset: Preset, customFrom: string, customTo: string) {
  const now = Date.now();
  const today = startOfDay(now);
  switch (preset) {
    case "today":
      return { from: today, to: now };
    case "7d":
      return { from: today - 6 * DAY, to: now };
    case "30d":
      return { from: today - 29 * DAY, to: now };
    case "90d":
      return { from: today - 89 * DAY, to: now };
    case "month": {
      const date = new Date(now);
      date.setDate(1);
      date.setHours(0, 0, 0, 0);
      return { from: date.getTime(), to: now };
    }
    default: {
      const fromValue = customFrom ? new Date(customFrom).getTime() : NaN;
      const toValue = customTo
        ? new Date(`${customTo}T23:59:59`).getTime()
        : NaN;
      return {
        from: Number.isFinite(fromValue) ? fromValue : today - 29 * DAY,
        to: Number.isFinite(toValue) ? toValue : now,
      };
    }
  }
}

function RangeFilter({
  preset,
  setPreset,
  customFrom,
  setCustomFrom,
  customTo,
  setCustomTo,
}: {
  preset: Preset;
  setPreset: (value: Preset) => void;
  customFrom: string;
  setCustomFrom: (value: string) => void;
  customTo: string;
  setCustomTo: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {(
        [
          { key: "today", label: "Today" },
          { key: "7d", label: "7 days" },
          { key: "30d", label: "30 days" },
          { key: "month", label: "This month" },
          { key: "custom", label: "Custom" },
        ] as { key: Preset; label: string }[]
      ).map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => setPreset(item.key)}
          className={cn(
            "border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.1em] transition-colors",
            preset === item.key
              ? "border-espresso bg-espresso text-ivory"
              : "border-border bg-card text-muted-foreground hover:border-foreground",
          )}
        >
          {item.label}
        </button>
      ))}
      {preset === "custom" && (
        <div className="flex items-center gap-1.5">
          <input
            type="date"
            value={customFrom}
            onChange={(event) => setCustomFrom(event.target.value)}
            className="field h-7 w-auto px-2 text-[10px]"
          />
          <span className="text-[10px] text-muted-foreground">to</span>
          <input
            type="date"
            value={customTo}
            onChange={(event) => setCustomTo(event.target.value)}
            className="field h-7 w-auto px-2 text-[10px]"
          />
        </div>
      )}
    </div>
  );
}

function Overview() {
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
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.series} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#B68A3A" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#B68A3A" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E7DAC9" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value: string) => value.slice(5)}
                      tick={{ fontSize: 9, fill: "#7C6A5B" }}
                      axisLine={false}
                      tickLine={false}
                      minTickGap={24}
                    />
                    <YAxis
                      tick={{ fontSize: 9, fill: "#7C6A5B" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value: number) =>
                        value >= 1000 ? `${Math.round(value / 1000)}k` : String(value)
                      }
                    />
                    <Tooltip
                      formatter={(value: number, name: string) =>
                        name === "revenue" ? formatPKR(value) : value
                      }
                      labelFormatter={(label: string) => formatDate(new Date(label).getTime())}
                      contentStyle={{
                        fontSize: 11,
                        border: "1px solid #E7DAC9",
                        borderRadius: 2,
                        background: "#FFFCF8",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#B68A3A"
                      strokeWidth={1.5}
                      fill="url(#revenueFill)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
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
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.categoryRevenue.slice(0, 6)}
                      layout="vertical"
                      margin={{ left: 6, right: 12, top: 4, bottom: 4 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E7DAC9" horizontal={false} />
                      <XAxis type="number" hide />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={96}
                        tick={{ fontSize: 9, fill: "#7C6A5B" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        formatter={(value: number) => formatPKR(value)}
                        contentStyle={{
                          fontSize: 11,
                          border: "1px solid #E7DAC9",
                          borderRadius: 2,
                          background: "#FFFCF8",
                        }}
                      />
                      <Bar dataKey="revenue" fill="#35251C" radius={[0, 2, 2, 0]} barSize={12} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
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

function Reports() {
  const [preset, setPreset] = useState<Preset>("30d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const { from, to } = rangeFor(preset, customFrom, customTo);
  const data = useQuery(api.admin.dashboard, { from, to });

  const monthly = useMemo(() => {
    if (!data) return [];
    const buckets = new Map<string, { revenue: number; orders: number }>();
    for (const row of data.series) {
      const month = row.date.slice(0, 7);
      const bucket = buckets.get(month) ?? { revenue: 0, orders: 0 };
      bucket.revenue += row.revenue;
      bucket.orders += row.orders;
      buckets.set(month, bucket);
    }
    return [...buckets.entries()].map(([month, value]) => ({ month, ...value }));
  }, [data]);

  const exportSales = () => {
    if (!data) return;
    const rows = [
      ["Date", "Orders", "Revenue"],
      ...data.series.map((row) => [row.date, row.orders, row.revenue]),
    ];
    const csv = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `noor-sales-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

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
        <Button
          variant="outline"
          onClick={exportSales}
          className="h-8 gap-2 rounded-sm px-3 text-[10px] uppercase tracking-[0.12em]"
        >
          <Download className="size-3.5" /> Export sales CSV
        </Button>
      </div>

      {data && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Revenue" value={formatPKR(data.revenue)} icon={Wallet} tone="gold" />
          <StatCard
            label="Orders"
            value={String(data.settledOrderCount)}
            hint={`${data.cancelledOrders} cancelled / returned`}
            icon={ShoppingCart}
          />
          <StatCard
            label="Average order value"
            value={formatPKR(data.averageOrderValue)}
            icon={TrendingUp}
          />
          <StatCard
            label="Product revenue"
            value={formatPKR(
              data.categoryRevenue.reduce((sum, row) => sum + row.revenue, 0),
            )}
            hint="sum of item sales"
            icon={Bookmark}
          />
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Monthly sales" description="Grouped from daily sales in this period.">
          <table className="w-full text-left text-xs">
            <thead className="border-y border-border/70 text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
              <tr>
                <th className="py-2 font-semibold">Month</th>
                <th className="py-2 font-semibold">Orders</th>
                <th className="py-2 text-right font-semibold">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {monthly.map((row) => (
                <tr key={row.month}>
                  <td className="py-2">
                    {new Date(`${row.month}-01`).toLocaleDateString("en-PK", {
                      month: "long",
                      year: "numeric",
                    })}
                  </td>
                  <td className="py-2 tabular-nums">{row.orders}</td>
                  <td className="py-2 text-right tabular-nums">{formatPKR(row.revenue)}</td>
                </tr>
              ))}
              {monthly.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-muted-foreground">
                    No sales in this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Panel>

        <Panel title="Category performance" description="Revenue by category.">
          <table className="w-full text-left text-xs">
            <thead className="border-y border-border/70 text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
              <tr>
                <th className="py-2 font-semibold">Category</th>
                <th className="py-2 text-right font-semibold">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {(data?.categoryRevenue ?? []).map((row) => (
                <tr key={row.name}>
                  <td className="py-2">{row.name}</td>
                  <td className="py-2 text-right tabular-nums">{formatPKR(row.revenue)}</td>
                </tr>
              ))}
              {data && data.categoryRevenue.length === 0 && (
                <tr>
                  <td colSpan={2} className="py-6 text-center text-muted-foreground">
                    No category sales yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Most purchased products" description="Units sold and revenue.">
          <table className="w-full text-left text-xs">
            <thead className="border-y border-border/70 text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
              <tr>
                <th className="py-2 font-semibold">Product</th>
                <th className="py-2 font-semibold">Units</th>
                <th className="py-2 text-right font-semibold">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {(data?.bestSellers ?? []).map((row) => (
                <tr key={row.slug}>
                  <td className="py-2 pr-2">{row.name}</td>
                  <td className="py-2 tabular-nums">{row.sales}</td>
                  <td className="py-2 text-right tabular-nums">{formatPKR(row.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <Panel
          title="Inventory report"
          description="Current stock position for products that need attention."
        >
          <table className="w-full text-left text-xs">
            <thead className="border-y border-border/70 text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
              <tr>
                <th className="py-2 font-semibold">Product</th>
                <th className="py-2 font-semibold">SKU</th>
                <th className="py-2 text-right font-semibold">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {(data?.lowStockProducts ?? []).map((row) => (
                <tr key={row._id}>
                  <td className="py-2 pr-2">{row.name}</td>
                  <td className="py-2 font-mono text-[10px] text-muted-foreground">
                    {row.sku}
                  </td>
                  <td
                    className={cn(
                      "py-2 text-right tabular-nums",
                      row.stock === 0 ? "text-destructive" : "text-gold",
                    )}
                  >
                    {row.stock}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>
    </div>
  );
}

function AdminGate() {
  const status = useQuery(api.admin.status);
  const claim = useMutation(api.admin.claimAdmin);
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  if (status === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!status.isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary/40 px-5">
        <div className="w-full max-w-md border border-border/70 bg-card p-8 text-center">
          <Store className="mx-auto size-6 text-gold" />
          <h1 className="mt-4 text-3xl">Administrator access</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {status.canClaim
              ? "No administrator exists yet. Claim this store with your signed-in email to open the dashboard."
              : "This account does not have permission to open the dashboard. Sign in with the store's business email instead."}
          </p>
          <p className="mt-3 border border-border/70 bg-secondary/40 px-3 py-2 text-[11px] text-muted-foreground">
            Signed in as {status.email ?? user?.email ?? "guest"}
          </p>
          <div className="mt-5 flex flex-col gap-2">
            {status.canClaim && (
              <Button
                onClick={async () => {
                  try {
                    await claim();
                    toast.success("You are now the store administrator.");
                  } catch (error) {
                    toast.error(
                      error instanceof Error ? error.message : "Could not claim store.",
                    );
                  }
                }}
                className="h-11 rounded-sm text-[10px] uppercase tracking-[0.16em]"
              >
                Claim administrator access
              </Button>
            )}
            <Button asChild variant="outline" className="h-11 rounded-sm text-[10px] uppercase tracking-[0.16em]">
              <Link to="/">Back to store</Link>
            </Button>
            <Button
              variant="ghost"
              onClick={async () => {
                await signOut();
                navigate("/auth?returnTo=%2Fadmin");
              }}
              className="h-10 rounded-sm text-[10px] uppercase tracking-[0.16em]"
            >
              Sign in with another email
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <AdminShell />;
}

function AdminShell() {
  const [section, setSection] = useState<Section>("overview");
  const [navOpen, setNavOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const from = Date.now() - 30 * DAY;
  const data = useQuery(api.admin.dashboard, { from, to: Date.now() });
  const messages = useQuery(api.messages.adminList);

  const unread = (messages ?? []).filter((message) => !message.isRead).length;

  const badgeFor = (key: Section) => {
    if (key === "orders" && data?.pendingOrders) return data.pendingOrders;
    if (key === "messages" && unread) return unread;
    if (key === "inventory" && data?.lowStock) return data.lowStock;
    return null;
  };

  const nav = (
    <nav className="flex flex-col gap-0.5 px-3">
      {NAV.map((item) => {
        const badge = badgeFor(item.key);
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => {
              setSection(item.key);
              setNavOpen(false);
            }}
            className={cn(
              "flex items-center gap-2.5 rounded-sm px-3 py-2.5 text-left text-[11px] font-medium tracking-[0.04em] transition-colors",
              section === item.key
                ? "bg-ivory/10 text-ivory"
                : "text-ivory/55 hover:bg-ivory/5 hover:text-ivory/85",
            )}
          >
            <item.icon
              className={cn(
                "size-4 shrink-0",
                section === item.key ? "text-gold" : "text-ivory/40",
              )}
            />
            <span className="flex-1">{item.label}</span>
            {badge ? (
              <span className="flex min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[9px] font-bold text-espresso">
                {badge}
              </span>
            ) : null}
          </button>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#FBF7F1] text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-56 flex-col bg-espresso lg:flex">
        <div className="border-b border-ivory/10 px-5 py-6">
          <Link to="/" className="block">
            <p className="font-display text-base tracking-[0.18em] text-ivory">
              NOOR UL LIBAS
            </p>
            <p className="mt-1 text-[8px] uppercase tracking-[0.3em] text-gold">
              Store dashboard
            </p>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto py-4">{nav}</div>
        <div className="border-t border-ivory/10 p-4">
          <p className="truncate text-[10px] text-ivory/60">{user?.email}</p>
          <div className="mt-3 flex flex-col gap-1.5">
            <Link
              to="/"
              className="flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-ivory/55 hover:text-gold"
            >
              <ExternalLink className="size-3.5" /> View storefront
            </Link>
            <button
              type="button"
              onClick={async () => {
                await signOut();
                navigate("/");
              }}
              className="flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-ivory/55 hover:text-gold"
            >
              <LogOut className="size-3.5" /> Sign out
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-56">
        <header className="sticky top-0 z-20 border-b border-border/70 bg-[#FBF7F1]/95 backdrop-blur">
          <div className="flex items-center gap-3 px-4 py-3.5 sm:px-6">
            <button
              type="button"
              onClick={() => setNavOpen(true)}
              aria-label="Open admin menu"
              className="lg:hidden"
            >
              <Menu className="size-5" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="truncate font-display text-xl leading-tight">
                {TITLES[section].title}
              </h1>
              <p className="truncate text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                {TITLES[section].subtitle}
              </p>
            </div>
            <Link
              to="/"
              className="hidden items-center gap-1.5 border border-border bg-card px-3 py-2 text-[10px] uppercase tracking-[0.12em] text-muted-foreground hover:text-espresso sm:flex"
            >
              <ExternalLink className="size-3.5" /> View store
            </Link>
          </div>
        </header>

        <main className="px-4 py-5 sm:px-6 sm:py-7">
          {section === "overview" && <Overview />}
          {section === "orders" && <OrdersPanel />}
          {section === "products" && <ProductsPanel />}
          {section === "categories" && <CategoriesPanel />}
          {section === "homepage" && <HomepagePanel />}
          {section === "coupons" && <CouponsPanel />}
                        {section === "customers" && <CustomersPanel />}
              {section === "team" && <TeamPanel />}
          {section === "reviews" && <ReviewsPanel />}
          {section === "inventory" && <InventoryPanel />}
          {section === "reports" && <Reports />}
          {section === "messages" && <MessagesPanel />}
          {section === "settings" && <SettingsPanel />}
        </main>
      </div>

      <Sheet open={navOpen} onOpenChange={setNavOpen}>
        <SheetContent side="left" className="w-64 border-r-0 bg-espresso p-0">
          <SheetHeader className="border-b border-ivory/10 px-5 py-5">
            <SheetTitle className="font-display text-base tracking-[0.18em] text-ivory">
              NOOR UL LIBAS
            </SheetTitle>
          </SheetHeader>
          <div className="py-4">{nav}</div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default function Admin() {
  return <AdminGate />;
}
