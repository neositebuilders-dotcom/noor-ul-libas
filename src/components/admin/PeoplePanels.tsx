import { OrderDetailCard } from "@/components/site/OrderViews";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { formatDate, formatPKR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import {
  Loader2,
  Mail,
  MessageCircle,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ConfirmDelete, Panel } from "./shared";

export function CustomersPanel() {
  const [search, setSearch] = useState("");
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const customers = useQuery(api.admin.customers, {
    ...(search.trim() ? { search: search.trim() } : {}),
  });
  const orders = useQuery(
    api.admin.customerOrders,
    selectedPhone ? { phone: selectedPhone } : "skip",
  );

  return (
    <Panel
      title="Customers"
      description="Everyone who has ordered or registered, with lifetime value and order history."
    >
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search name, phone, email, city…"
          className="field h-9 pl-9 text-xs"
        />
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-xs">
          <thead className="border-y border-border/70 text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
            <tr>
              <th className="py-2.5 pr-3 font-semibold">Customer</th>
              <th className="py-2.5 pr-3 font-semibold">Phone</th>
              <th className="py-2.5 pr-3 font-semibold">City</th>
              <th className="py-2.5 pr-3 font-semibold">Orders</th>
              <th className="py-2.5 pr-3 font-semibold">Total spent</th>
              <th className="py-2.5 pr-3 font-semibold">Last order</th>
              <th className="py-2.5 text-right font-semibold">History</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {(customers ?? []).map((customer) => (
              <tr key={`${customer.phone}-${customer.email}`} className="hover:bg-secondary/30">
                <td className="py-3 pr-3">
                  <p className="font-medium">{customer.name}</p>
                  <p className="text-[10px] text-muted-foreground">{customer.email}</p>
                </td>
                <td className="py-3 pr-3 text-muted-foreground">{customer.phone}</td>
                <td className="py-3 pr-3 text-muted-foreground">{customer.city}</td>
                <td className="py-3 pr-3 tabular-nums">{customer.orders}</td>
                <td className="py-3 pr-3 tabular-nums">{formatPKR(customer.totalSpent)}</td>
                <td className="py-3 pr-3 text-muted-foreground">
                  {formatDate(customer.lastOrderAt)}
                </td>
                <td className="py-3 text-right">
                  <button
                    type="button"
                    onClick={() => setSelectedPhone(customer.phone)}
                    className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground hover:text-espresso"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
            {customers && customers.length === 0 && (
              <tr>
                <td colSpan={7} className="py-10 text-center text-muted-foreground">
                  No customers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog
        open={Boolean(selectedPhone)}
        onOpenChange={(open) => !open && setSelectedPhone(null)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              Order history
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {orders === undefined && <Loader2 className="size-5 animate-spin" />}
            {orders?.map((order) => (
              <OrderDetailCard key={order._id} order={order} compact />
            ))}
            {orders && orders.length === 0 && (
              <p className="text-xs text-muted-foreground">
                This customer has registered but not ordered yet.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Panel>
  );
}

export function MessagesPanel() {
  const messages = useQuery(api.messages.adminList);
  const subscribers = useQuery(api.messages.subscribers);
  const markRead = useMutation(api.messages.markRead);
  const remove = useMutation(api.messages.remove);

  return (
    <div className="space-y-5">
      <Panel
        title="Contact messages"
        description="Enquiries submitted from the contact page."
      >
        <div className="space-y-3">
          {(messages ?? []).map((message) => (
            <div
              key={message._id}
              className={cn(
                "border p-4",
                message.isRead ? "border-border/60" : "border-gold/40 bg-secondary/30",
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">
                    {message.subject}
                    {!message.isRead && (
                      <span className="ml-2 text-[9px] uppercase tracking-[0.1em] text-gold">
                        New
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {message.name} · {message.email}
                    {message.phone ? ` · ${message.phone}` : ""} ·{" "}
                    {formatDate(message.createdAt, true)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href={`mailto:${message.email}?subject=Re: ${encodeURIComponent(
                      message.subject,
                    )}`}
                    className="flex items-center gap-1 text-[10px] uppercase tracking-[0.1em] text-muted-foreground hover:text-espresso"
                  >
                    <Mail className="size-3.5" /> Reply
                  </a>
                  <button
                    type="button"
                    onClick={() =>
                      markRead({ id: message._id, isRead: !message.isRead })
                    }
                    className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground hover:text-espresso"
                  >
                    {message.isRead ? "Mark unread" : "Mark read"}
                  </button>
                  <ConfirmDelete
                    label=""
                    onConfirm={() => remove({ id: message._id })}
                  />
                </div>
              </div>
              <p className="mt-2 text-xs leading-6 text-muted-foreground">
                {message.message}
              </p>
            </div>
          ))}
          {messages && messages.length === 0 && (
            <p className="border border-dashed border-border py-10 text-center text-xs text-muted-foreground">
              No messages yet.
            </p>
          )}
        </div>
      </Panel>

      <Panel
        title="Newsletter subscribers"
        description="Emails collected from the site newsletter form."
      >
        {subscribers && subscribers.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {subscribers.map((subscriber) => (
              <span
                key={subscriber._id}
                className="border border-border bg-secondary/40 px-2.5 py-1 text-[11px]"
              >
                {subscriber.email}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No subscribers yet.</p>
        )}
      </Panel>
    </div>
  );
}

export function InventoryPanel() {
  const lowStock = useQuery(api.products.lowStock);
  const products = useQuery(api.products.adminList);
  const history = useQuery(api.products.inventoryHistory);
  const adjust = useMutation(api.products.adjustStock);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [reasons, setReasons] = useState<Record<string, string>>({});

  return (
    <div className="space-y-5">
      <Panel
        title="Inventory alerts"
        description="Products at or below their low-stock threshold. Adjust counts here — every change is logged."
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-xs">
            <thead className="border-y border-border/70 text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
              <tr>
                <th className="py-2.5 pr-3 font-semibold">Product</th>
                <th className="py-2.5 pr-3 font-semibold">SKU</th>
                <th className="py-2.5 pr-3 font-semibold">Stock</th>
                <th className="py-2.5 pr-3 font-semibold">New stock</th>
                <th className="py-2.5 pr-3 font-semibold">Reason</th>
                <th className="py-2.5 text-right font-semibold">Save</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {(lowStock ?? []).map((product) => (
                <tr key={product._id}>
                  <td className="py-3 pr-3 font-medium">{product.name}</td>
                  <td className="py-3 pr-3 font-mono text-[10px] text-muted-foreground">
                    {product.sku}
                  </td>
                  <td className="py-3 pr-3">
                    <span
                      className={cn(
                        "tabular-nums",
                        product.stock === 0 ? "text-destructive" : "text-gold",
                      )}
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="py-3 pr-3">
                    <input
                      type="number"
                      min={0}
                      value={edits[product._id] ?? String(product.stock)}
                      onChange={(event) =>
                        setEdits((current) => ({
                          ...current,
                          [product._id]: event.target.value,
                        }))
                      }
                      className="field h-8 w-20 text-xs"
                    />
                  </td>
                  <td className="py-3 pr-3">
                    <input
                      value={reasons[product._id] ?? ""}
                      onChange={(event) =>
                        setReasons((current) => ({
                          ...current,
                          [product._id]: event.target.value,
                        }))
                      }
                      placeholder="Restock, correction…"
                      className="field h-8 w-40 text-xs"
                    />
                  </td>
                  <td className="py-3 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        await adjust({
                          id: product._id,
                          newStock: Number(edits[product._id] ?? product.stock),
                          reason: reasons[product._id] || "Manual adjustment",
                        });
                        toast.success("Stock updated.");
                      }}
                      className="h-8 rounded-sm px-3 text-[9px] uppercase tracking-[0.1em]"
                    >
                      Save
                    </Button>
                  </td>
                </tr>
              ))}
              {lowStock && lowStock.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-muted-foreground">
                    All products are above their low-stock threshold.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 border-t border-border/70 pt-5">
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Full stock list
          </h3>
          <div className="mt-3 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
            {(products ?? []).map((product) => (
              <div
                key={product._id}
                className="flex items-center justify-between border border-border/60 px-3 py-2 text-[11px]"
              >
                <span className="truncate pr-2">{product.name}</span>
                <span
                  className={cn(
                    "tabular-nums",
                    product.stock === 0 ? "text-destructive" : "text-muted-foreground",
                  )}
                >
                  {product.stock}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Panel>

      <Panel title="Inventory history" description="The last 60 stock changes.">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-xs">
            <thead className="border-y border-border/70 text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
              <tr>
                <th className="py-2.5 pr-3 font-semibold">Date</th>
                <th className="py-2.5 pr-3 font-semibold">Product</th>
                <th className="py-2.5 pr-3 font-semibold">Change</th>
                <th className="py-2.5 pr-3 font-semibold">Before</th>
                <th className="py-2.5 pr-3 font-semibold">After</th>
                <th className="py-2.5 pr-3 font-semibold">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {(history ?? []).map((entry) => (
                <tr key={entry._id}>
                  <td className="py-2.5 pr-3 text-muted-foreground">
                    {formatDate(entry.createdAt, true)}
                  </td>
                  <td className="py-2.5 pr-3">{entry.productName}</td>
                  <td
                    className={cn(
                      "py-2.5 pr-3 tabular-nums",
                      entry.delta > 0 ? "text-emerald-700" : "text-destructive",
                    )}
                  >
                    {entry.delta > 0 ? `+${entry.delta}` : entry.delta}
                  </td>
                  <td className="py-2.5 pr-3 tabular-nums">{entry.previousStock}</td>
                  <td className="py-2.5 pr-3 tabular-nums">{entry.newStock}</td>
                  <td className="py-2.5 pr-3 text-muted-foreground">{entry.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

type SettingsForm = {
  storeName: string;
  tagline: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  instagram: string;
  facebook: string;
  shippingFee: string;
  freeShippingThreshold: string;
  codEnabled: boolean;
  bankTransferEnabled: boolean;
  bankDetails: string;
  customSizeEnabled: boolean;
  aboutText: string;
  policyShipping: string;
  policyReturns: string;
  policyPrivacy: string;
  policyTerms: string;
  whyChoose: { title: string; description: string }[];
  faqs: { question: string; answer: string }[];
};

const emptySettings: SettingsForm = {
  storeName: "",
  tagline: "",
  email: "",
  phone: "",
  whatsapp: "",
  address: "",
  instagram: "",
  facebook: "",
  shippingFee: "250",
  freeShippingThreshold: "7999",
  codEnabled: true,
  bankTransferEnabled: true,
  bankDetails: "",
  customSizeEnabled: true,
  aboutText: "",
  policyShipping: "",
  policyReturns: "",
  policyPrivacy: "",
  policyTerms: "",
  whyChoose: [],
  faqs: [],
};

export function SettingsPanel() {
  const settings = useQuery(api.site.getSettings);
  const update = useMutation(api.site.updateSettings);
  const [form, setForm] = useState<SettingsForm>(emptySettings);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!settings) return;
    setForm({
      storeName: settings.storeName,
      tagline: settings.tagline ?? "",
      email: settings.email,
      phone: settings.phone,
      whatsapp: settings.whatsapp,
      address: settings.address ?? "",
      instagram: settings.instagram ?? "",
      facebook: settings.facebook ?? "",
      shippingFee: String(settings.shippingFee),
      freeShippingThreshold: String(settings.freeShippingThreshold),
      codEnabled: settings.codEnabled,
      bankTransferEnabled: settings.bankTransferEnabled,
      bankDetails: settings.bankDetails ?? "",
      customSizeEnabled: settings.customSizeEnabled,
      aboutText: settings.aboutText ?? "",
      policyShipping: settings.policyShipping,
      policyReturns: settings.policyReturns,
      policyPrivacy: settings.policyPrivacy,
      policyTerms: settings.policyTerms,
      whyChoose: settings.whyChoose,
      faqs: settings.faqs,
    });
  }, [settings]);

  if (!settings) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const set = <K extends keyof SettingsForm>(key: K, value: SettingsForm[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const save = async () => {
    setSaving(true);
    try {
      await update({
        patch: {
          storeName: form.storeName,
          tagline: form.tagline,
          email: form.email,
          phone: form.phone,
          whatsapp: form.whatsapp,
          address: form.address,
          instagram: form.instagram,
          facebook: form.facebook,
          shippingFee: Number(form.shippingFee) || 0,
          freeShippingThreshold: Number(form.freeShippingThreshold) || 0,
          codEnabled: form.codEnabled,
          bankTransferEnabled: form.bankTransferEnabled,
          bankDetails: form.bankDetails,
          customSizeEnabled: form.customSizeEnabled,
          aboutText: form.aboutText,
          policyShipping: form.policyShipping,
          policyReturns: form.policyReturns,
          policyPrivacy: form.policyPrivacy,
          policyTerms: form.policyTerms,
          whyChoose: form.whyChoose,
          faqs: form.faqs,
        },
      });
      toast.success("Store settings saved.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save settings.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <Panel
        title="Store settings"
        description="Brand, contact, delivery and payment details used across the storefront."
        action={
          <Button
            onClick={save}
            disabled={saving}
            className="h-9 gap-2 rounded-sm px-5 text-[10px] font-semibold uppercase tracking-[0.14em]"
          >
            {saving && <Loader2 className="size-3.5 animate-spin" />} Save settings
          </Button>
        }
      >
        <Accordion
          type="multiple"
          defaultValue={["brand", "shipping"]}
          className="border-t border-border/70"
        >
          <AccordionItem value="brand">
            <AccordionTrigger className="text-[11px] font-semibold uppercase tracking-[0.16em] hover:no-underline">
              Brand & contact
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Business name</Label>
                  <input
                    value={form.storeName}
                    onChange={(event) => set("storeName", event.target.value)}
                    className="field mt-1.5"
                  />
                </div>
                <div>
                  <Label>Tagline</Label>
                  <input
                    value={form.tagline}
                    onChange={(event) => set("tagline", event.target.value)}
                    className="field mt-1.5"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => set("email", event.target.value)}
                    className="field mt-1.5"
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <input
                    value={form.phone}
                    onChange={(event) => set("phone", event.target.value)}
                    className="field mt-1.5"
                  />
                </div>
                <div>
                  <Label>WhatsApp number (international)</Label>
                  <input
                    value={form.whatsapp}
                    onChange={(event) => set("whatsapp", event.target.value)}
                    className="field mt-1.5"
                    placeholder="+923213315854"
                  />
                </div>
                <div>
                  <Label>Studio address</Label>
                  <input
                    value={form.address}
                    onChange={(event) => set("address", event.target.value)}
                    className="field mt-1.5"
                  />
                </div>
                <div>
                  <Label>Instagram URL</Label>
                  <input
                    value={form.instagram}
                    onChange={(event) => set("instagram", event.target.value)}
                    className="field mt-1.5"
                  />
                </div>
                <div>
                  <Label>Facebook URL</Label>
                  <input
                    value={form.facebook}
                    onChange={(event) => set("facebook", event.target.value)}
                    className="field mt-1.5"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label>About text</Label>
                  <textarea
                    rows={4}
                    value={form.aboutText}
                    onChange={(event) => set("aboutText", event.target.value)}
                    className="field mt-1.5 resize-y"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="shipping">
            <AccordionTrigger className="text-[11px] font-semibold uppercase tracking-[0.16em] hover:no-underline">
              Delivery & payments
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Delivery charge (PKR)</Label>
                  <input
                    type="number"
                    value={form.shippingFee}
                    onChange={(event) => set("shippingFee", event.target.value)}
                    className="field mt-1.5"
                  />
                </div>
                <div>
                  <Label>Free delivery threshold (PKR)</Label>
                  <input
                    type="number"
                    value={form.freeShippingThreshold}
                    onChange={(event) =>
                      set("freeShippingThreshold", event.target.value)
                    }
                    className="field mt-1.5"
                  />
                </div>
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={form.codEnabled}
                    onChange={(event) => set("codEnabled", event.target.checked)}
                    className="size-3.5 accent-[#35251C]"
                  />
                  Cash on delivery enabled
                </label>
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={form.bankTransferEnabled}
                    onChange={(event) =>
                      set("bankTransferEnabled", event.target.checked)
                    }
                    className="size-3.5 accent-[#35251C]"
                  />
                  Bank transfer enabled
                </label>
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={form.customSizeEnabled}
                    onChange={(event) => set("customSizeEnabled", event.target.checked)}
                    className="size-3.5 accent-[#35251C]"
                  />
                  Offer custom sizing
                </label>
                <div className="sm:col-span-2">
                  <Label>Bank transfer details</Label>
                  <textarea
                    rows={4}
                    value={form.bankDetails}
                    onChange={(event) => set("bankDetails", event.target.value)}
                    className="field mt-1.5 resize-y"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="homepage">
            <AccordionTrigger className="text-[11px] font-semibold uppercase tracking-[0.16em] hover:no-underline">
              Why choose us & FAQs
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between">
                    <Label>Why choose Noor ul Libas</Label>
                    <button
                      type="button"
                      onClick={() =>
                        set("whyChoose", [
                          ...form.whyChoose,
                          { title: "", description: "" },
                        ])
                      }
                      className="flex items-center gap-1 text-[10px] uppercase tracking-[0.1em] text-gold"
                    >
                      <Plus className="size-3" /> Add block
                    </button>
                  </div>
                  <div className="mt-3 space-y-3">
                    {form.whyChoose.map((item, index) => (
                      <div
                        key={index}
                        className="grid gap-2 border border-border/60 p-3 sm:grid-cols-[1fr_2fr_auto]"
                      >
                        <input
                          value={item.title}
                          onChange={(event) =>
                            set(
                              "whyChoose",
                              form.whyChoose.map((row, i) =>
                                i === index ? { ...row, title: event.target.value } : row,
                              ),
                            )
                          }
                          placeholder="Title"
                          className="field h-8 text-xs"
                        />
                        <input
                          value={item.description}
                          onChange={(event) =>
                            set(
                              "whyChoose",
                              form.whyChoose.map((row, i) =>
                                i === index
                                  ? { ...row, description: event.target.value }
                                  : row,
                              ),
                            )
                          }
                          placeholder="Description"
                          className="field h-8 text-xs"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            set(
                              "whyChoose",
                              form.whyChoose.filter((_, i) => i !== index),
                            )
                          }
                          aria-label="Remove block"
                          className="flex items-center justify-center px-2 text-muted-foreground hover:text-destructive"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <Label>FAQs</Label>
                    <button
                      type="button"
                      onClick={() =>
                        set("faqs", [...form.faqs, { question: "", answer: "" }])
                      }
                      className="flex items-center gap-1 text-[10px] uppercase tracking-[0.1em] text-gold"
                    >
                      <Plus className="size-3" /> Add FAQ
                    </button>
                  </div>
                  <div className="mt-3 space-y-3">
                    {form.faqs.map((faq, index) => (
                      <div key={index} className="border border-border/60 p-3">
                        <div className="flex gap-2">
                          <input
                            value={faq.question}
                            onChange={(event) =>
                              set(
                                "faqs",
                                form.faqs.map((row, i) =>
                                  i === index
                                    ? { ...row, question: event.target.value }
                                    : row,
                                ),
                              )
                            }
                            placeholder="Question"
                            className="field h-8 flex-1 text-xs"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              set("faqs", form.faqs.filter((_, i) => i !== index))
                            }
                            aria-label="Remove FAQ"
                            className="px-2 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                        <textarea
                          rows={2}
                          value={faq.answer}
                          onChange={(event) =>
                            set(
                              "faqs",
                              form.faqs.map((row, i) =>
                                i === index
                                  ? { ...row, answer: event.target.value }
                                  : row,
                              ),
                            )
                          }
                          placeholder="Answer"
                          className="field mt-2 resize-y text-xs"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="policies" className="border-b-0">
            <AccordionTrigger className="text-[11px] font-semibold uppercase tracking-[0.16em] hover:no-underline">
              Policies
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-4">
                {[
                  { key: "policyShipping" as const, label: "Shipping & delivery" },
                  { key: "policyReturns" as const, label: "Returns & exchanges" },
                  { key: "policyPrivacy" as const, label: "Privacy policy" },
                  { key: "policyTerms" as const, label: "Terms & conditions" },
                ].map((policy) => (
                  <div key={policy.key}>
                    <Label>{policy.label}</Label>
                    <textarea
                      rows={5}
                      value={form[policy.key]}
                      onChange={(event) => set(policy.key, event.target.value)}
                      className="field mt-1.5 resize-y text-xs leading-6"
                    />
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="mt-5 flex justify-end">
          <Button
            onClick={save}
            disabled={saving}
            className="h-10 rounded-sm px-6 text-[10px] font-semibold uppercase tracking-[0.14em]"
          >
            {saving && <Loader2 className="size-3.5 animate-spin" />} Save settings
          </Button>
        </div>
      </Panel>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
      {children}
    </label>
  );
}
