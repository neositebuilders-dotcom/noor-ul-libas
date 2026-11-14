import { StatusBadge } from "@/components/site/OrderViews";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  formatDate,
  formatPKR,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_OPTIONS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  whatsappLink,
} from "@/lib/format";
import { useMutation, useQuery } from "convex/react";
import {
  Download,
  Loader2,
  MessageCircle,
  Printer,
  Search,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Panel } from "./shared";

function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows
    .map((row) =>
      row
        .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
        .join(","),
    )
    .join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function OrdersPanel() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const orders = useQuery(api.orders.adminList, {
    ...(status !== "all" ? { status: status as "new" } : {}),
    ...(search.trim() ? { search: search.trim() } : {}),
  });
  const order = useQuery(
    api.orders.adminGet,
    selectedId ? { id: selectedId as Id<"orders"> } : "skip",
  );
  const settings = useQuery(api.site.getSettings);
  const updateStatus = useMutation(api.orders.updateStatus);
  const updatePayment = useMutation(api.orders.updatePaymentStatus);
  const updateDetails = useMutation(api.orders.updateDetails);

  const [tracking, setTracking] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (order) {
      setTracking(order.trackingNumber ?? "");
      setNotes(order.adminNotes ?? "");
    }
  }, [order]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const row of orders ?? []) counts[row.status] = (counts[row.status] ?? 0) + 1;
    return counts;
  }, [orders]);

  const exportOrders = () => {
    if (!orders || orders.length === 0) {
      toast.error("There are no orders to export.");
      return;
    }
    downloadCsv(`noor-ul-libas-orders-${new Date().toISOString().slice(0, 10)}.csv`, [
      [
        "Order number",
        "Date",
        "Customer",
        "Phone",
        "Email",
        "City",
        "Province",
        "Address",
        "Items",
        "Subtotal",
        "Discount",
        "Shipping",
        "Total",
        "Payment method",
        "Payment status",
        "Order status",
        "Tracking",
      ],
      ...orders.map((row) => [
        row.orderNumber,
        formatDate(row.createdAt, true),
        row.customerName,
        row.phone,
        row.email,
        row.city,
        row.province,
        row.address,
        row.items.map((item) => `${item.name} × ${item.quantity}`).join(" | "),
        row.subtotal,
        row.discount,
        row.shipping,
        row.total,
        PAYMENT_METHOD_LABELS[row.paymentMethod],
        PAYMENT_STATUS_LABELS[row.paymentStatus],
        ORDER_STATUS_LABELS[row.status],
        row.trackingNumber ?? "",
      ]),
    ]);
    toast.success("Orders exported to CSV.");
  };

  const printInvoice = () => {
    if (!order) return;
    const win = window.open("", "_blank", "width=800,height=900");
    if (!win) {
      toast.error("Allow pop-ups to print the invoice.");
      return;
    }
    win.document.write(`<!doctype html><html><head><title>Invoice ${
      order.orderNumber
    }</title><style>
      body{font-family:Georgia,serif;color:#2b1d15;padding:40px;max-width:720px;margin:0 auto}
      h1{font-size:26px;letter-spacing:.14em;margin:0}
      .muted{color:#7c6a5b;font-size:12px}
      .row{display:flex;justify-content:space-between;gap:24px;margin-top:24px}
      table{width:100%;border-collapse:collapse;margin-top:24px;font-size:13px}
      th,td{text-align:left;padding:8px 6px;border-bottom:1px solid #e7dac9}
      th{font-size:10px;text-transform:uppercase;letter-spacing:.12em;color:#7c6a5b}
      .totals{margin-left:auto;width:260px;margin-top:16px;font-size:13px}
      .totals div{display:flex;justify-content:space-between;padding:4px 0}
      .total{border-top:1px solid #b68a3a;font-weight:bold;margin-top:6px;padding-top:8px}
      .badge{display:inline-block;border:1px solid #b68a3a;color:#b68a3a;font-size:10px;letter-spacing:.12em;text-transform:uppercase;padding:4px 8px;margin-top:8px}
    </style></head><body>
      <div class="row"><div><h1>NOOR UL LIBAS</h1>
      <p class="muted">${settings?.address ?? "Lahore, Pakistan"}<br/>${
        settings?.email ?? "rq984690@gmail.com"
      } · ${settings?.phone ?? "0321 3315854"}</p></div>
      <div style="text-align:right"><p class="muted">INVOICE</p><strong>${
        order.orderNumber
      }</strong><br/><span class="muted">${formatDate(order.createdAt, true)}</span></div></div>
      <div class="row"><div><p class="muted">BILL TO</p><strong>${
        order.customerName
      }</strong><br/><span class="muted">${order.address}<br/>${order.city}, ${
        order.province
      }<br/>${order.phone} · ${order.email}</span></div>
      <div style="text-align:right"><p class="muted">PAYMENT</p>${
        PAYMENT_METHOD_LABELS[order.paymentMethod]
      }<br/><span class="muted">${
        PAYMENT_STATUS_LABELS[order.paymentStatus]
      }</span><div class="badge">${ORDER_STATUS_LABELS[order.status]}</div></div></div>
      <table><thead><tr><th>Item</th><th>Size</th><th>Qty</th><th>Price</th><th>Amount</th></tr></thead><tbody>
      ${order.items
        .map(
          (item) =>
            `<tr><td>${item.name}<br/><span class="muted">${item.sku}</span></td><td>${
              item.size ?? "—"
            }</td><td>${item.quantity}</td><td>${formatPKR(
              item.price,
            )}</td><td>${formatPKR(item.price * item.quantity)}</td></tr>`,
        )
        .join("")}
      </tbody></table>
      <div class="totals">
        <div><span>Subtotal</span><span>${formatPKR(order.subtotal)}</span></div>
        ${
          order.discount > 0
            ? `<div><span>Discount</span><span>−${formatPKR(order.discount)}</span></div>`
            : ""
        }
        <div><span>Delivery</span><span>${
          order.shipping === 0 ? "Free" : formatPKR(order.shipping)
        }</span></div>
        <div class="total"><span>Total</span><span>${formatPKR(order.total)}</span></div>
      </div>
      <p class="muted" style="margin-top:32px">Thank you for shopping with Noor ul Libas. Exchanges within 7 days on unworn, unstitched pieces.</p>
      </body></html>`);
    win.document.close();
    win.focus();
    win.print();
  };

  return (
    <Panel
      title="Orders"
      description="Every order, its payment state and delivery progress. Update statuses as parcels move."
      action={
        <Button
          variant="outline"
          onClick={exportOrders}
          className="h-9 gap-2 rounded-sm px-4 text-[10px] font-semibold uppercase tracking-[0.14em]"
        >
          <Download className="size-3.5" /> Export CSV
        </Button>
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search order, name, phone…"
            className="field h-9 pl-9 text-xs"
          />
        </div>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="field h-9 w-auto text-xs"
        >
          <option value="all">All statuses</option>
          {ORDER_STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {ORDER_STATUS_LABELS[option]}
              {statusCounts[option] ? ` (${statusCounts[option]})` : ""}
            </option>
          ))}
        </select>
        <span className="ml-auto text-[11px] text-muted-foreground">
          {orders?.length ?? 0} orders
        </span>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-xs">
          <thead className="border-y border-border/70 text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
            <tr>
              <th className="py-2.5 pr-3 font-semibold">Order</th>
              <th className="py-2.5 pr-3 font-semibold">Customer</th>
              <th className="py-2.5 pr-3 font-semibold">Date</th>
              <th className="py-2.5 pr-3 font-semibold">Items</th>
              <th className="py-2.5 pr-3 font-semibold">Total</th>
              <th className="py-2.5 pr-3 font-semibold">Payment</th>
              <th className="py-2.5 pr-3 font-semibold">Status</th>
              <th className="py-2.5 text-right font-semibold">View</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {orders === undefined &&
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index}>
                  <td colSpan={8} className="py-4">
                    <div className="h-7 w-full animate-pulse bg-muted" />
                  </td>
                </tr>
              ))}
            {orders?.map((row) => (
              <tr key={row._id} className="hover:bg-secondary/30">
                <td className="py-3 pr-3">
                  <button
                    type="button"
                    onClick={() => setSelectedId(row._id)}
                    className="font-medium text-espresso hover:text-gold"
                  >
                    {row.orderNumber}
                  </button>
                </td>
                <td className="py-3 pr-3">
                  <p className="font-medium">{row.customerName}</p>
                  <p className="text-[10px] text-muted-foreground">{row.phone}</p>
                </td>
                <td className="py-3 pr-3 text-muted-foreground">
                  {formatDate(row.createdAt)}
                </td>
                <td className="py-3 pr-3 tabular-nums">{row.items.length}</td>
                <td className="py-3 pr-3 tabular-nums">{formatPKR(row.total)}</td>
                <td className="py-3 pr-3">
                  <p>{PAYMENT_METHOD_LABELS[row.paymentMethod]}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {PAYMENT_STATUS_LABELS[row.paymentStatus]}
                  </p>
                </td>
                <td className="py-3 pr-3">
                  <StatusBadge status={row.status} />
                </td>
                <td className="py-3 text-right">
                  <button
                    type="button"
                    onClick={() => setSelectedId(row._id)}
                    className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground hover:text-espresso"
                  >
                    Open
                  </button>
                </td>
              </tr>
            ))}
            {orders && orders.length === 0 && (
              <tr>
                <td colSpan={8} className="py-10 text-center text-muted-foreground">
                  No orders match this filter yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={Boolean(selectedId)} onOpenChange={(open) => !open && setSelectedId(null)}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
          {order === undefined || order === null ? (
            <div className="flex justify-center py-10">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">
                  {order.orderNumber}
                </DialogTitle>
                <DialogDescription>
                  {formatDate(order.createdAt, true)} · {order.items.length} item(s)
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="border border-border/70 p-4 text-xs">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Customer
                  </p>
                  <p className="mt-2 font-medium">{order.customerName}</p>
                  <p className="mt-1 leading-5 text-muted-foreground">
                    {order.address}
                    <br />
                    {order.city}, {order.province}
                  </p>
                  <p className="mt-1 text-muted-foreground">{order.phone}</p>
                  <p className="text-muted-foreground">{order.email}</p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <a
                      href={whatsappLink(
                        order.phone.startsWith("0")
                          ? `92${order.phone.slice(1)}`
                          : order.phone,
                        `Salam ${order.customerName}! This is Noor ul Libas regarding order ${order.orderNumber}.`,
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.1em] text-[#167a3e]"
                    >
                      <MessageCircle className="size-3.5" /> WhatsApp
                    </a>
                    <a
                      href={`tel:${order.phone}`}
                      className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground hover:text-espresso"
                    >
                      Call
                    </a>
                  </div>
                </div>

                <div className="border border-border/70 p-4 text-xs">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Fulfilment
                  </p>
                  <label className="mt-2 block text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                    Order status
                  </label>
                  <select
                    value={order.status}
                    onChange={async (event) => {
                      await updateStatus({
                        id: order._id,
                        status: event.target.value as (typeof ORDER_STATUS_OPTIONS)[number],
                      });
                      toast.success("Order status updated.");
                    }}
                    className="field mt-1 h-8 text-xs"
                  >
                    {ORDER_STATUS_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {ORDER_STATUS_LABELS[option]}
                      </option>
                    ))}
                  </select>

                  <label className="mt-3 block text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                    Payment status
                  </label>
                  <select
                    value={order.paymentStatus}
                    onChange={async (event) => {
                      await updatePayment({
                        id: order._id,
                        paymentStatus: event.target.value as "unpaid",
                      });
                      toast.success("Payment status updated.");
                    }}
                    className="field mt-1 h-8 text-xs"
                  >
                    {Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>

                  <p className="mt-3 text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                    Method
                  </p>
                  <p>{PAYMENT_METHOD_LABELS[order.paymentMethod]}</p>
                  {order.couponCode && (
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      Coupon: {order.couponCode}
                    </p>
                  )}
                </div>
              </div>

              <div className="border border-border/70">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border/70 text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 font-semibold">Item</th>
                      <th className="px-3 py-2 font-semibold">Size</th>
                      <th className="px-3 py-2 font-semibold">Qty</th>
                      <th className="px-3 py-2 text-right font-semibold">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {order.items.map((item, index) => (
                      <tr key={`${item.productId}-${index}`}>
                        <td className="px-3 py-2">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-[10px] text-muted-foreground">{item.sku}</p>
                        </td>
                        <td className="px-3 py-2">{item.size ?? "—"}</td>
                        <td className="px-3 py-2 tabular-nums">{item.quantity}</td>
                        <td className="px-3 py-2 text-right tabular-nums">
                          {formatPKR(item.price * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="space-y-1 border-t border-border/70 px-3 py-3 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatPKR(order.subtotal)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-gold">
                      <span>Discount</span>
                      <span>−{formatPKR(order.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-muted-foreground">
                    <span>Delivery</span>
                    <span>
                      {order.shipping === 0 ? "Free" : formatPKR(order.shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-border/60 pt-1 font-medium">
                    <span>Total</span>
                    <span>{formatPKR(order.total)}</span>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Tracking number
                  </label>
                  <div className="mt-1.5 flex gap-2">
                    <input
                      value={tracking}
                      onChange={(event) => setTracking(event.target.value)}
                      className="field h-9 text-xs"
                      placeholder="Courier tracking ID"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={async () => {
                        await updateDetails({ id: order._id, trackingNumber: tracking, adminNotes: notes });
                        toast.success("Tracking saved.");
                      }}
                      className="h-9 shrink-0 rounded-sm px-3 text-[10px] uppercase tracking-[0.1em]"
                    >
                      Save
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Internal note
                  </label>
                  <div className="mt-1.5 flex gap-2">
                    <input
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      className="field h-9 text-xs"
                      placeholder="Visible to admins only"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={async () => {
                        await updateDetails({ id: order._id, trackingNumber: tracking, adminNotes: notes });
                        toast.success("Note saved.");
                      }}
                      className="h-9 shrink-0 rounded-sm px-3 text-[10px] uppercase tracking-[0.1em]"
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </div>

              {order.notes && (
                <p className="border border-border/70 bg-secondary/40 p-3 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Customer note: </span>
                  {order.notes}
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={printInvoice}
                  variant="outline"
                  className="h-9 gap-2 rounded-sm px-4 text-[10px] uppercase tracking-[0.12em]"
                >
                  <Printer className="size-3.5" /> Print invoice
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedId(null)}
                  className="h-9 rounded-sm text-[10px] uppercase tracking-[0.12em]"
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Panel>
  );
}
