import { RangeFilter, rangeFor, type Preset } from "@/components/admin/range";
import { Panel, StatCard } from "@/components/admin/shared";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { formatPKR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { Bookmark, Download, ShoppingCart, TrendingUp, Wallet } from "lucide-react";
import { useMemo, useState } from "react";

export function Reports() {
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
