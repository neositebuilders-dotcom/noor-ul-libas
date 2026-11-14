import { SmartImage, Stars } from "@/components/site/primitives";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { formatDate, formatPKR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { Check, Plus, Star, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDelete, ImageField, Panel } from "./shared";

export function CategoriesPanel() {
  const categories = useQuery(api.categories.adminList);
  const save = useMutation(api.categories.save);
  const remove = useMutation(api.categories.remove);
  const reorder = useMutation(api.categories.reorder);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    name: "",
    description: "",
    image: "",
    sortOrder: 0,
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  const openNew = () => {
    setEditing(null);
    setDraft({
      name: "",
      description: "",
      image: "",
      sortOrder: categories?.length ?? 0,
      isActive: true,
    });
    setOpen(true);
  };

  return (
    <Panel
      title="Categories"
      description="The tiles customers use to browse. Order controls how they appear on the homepage."
      action={
        <Button onClick={openNew} className="h-9 gap-2 rounded-sm px-4 text-[10px] font-semibold uppercase tracking-[0.14em]">
          <Plus className="size-3.5" /> Add category
        </Button>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-xs">
          <thead className="border-y border-border/70 text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
            <tr>
              <th className="py-2.5 pr-3 font-semibold">Category</th>
              <th className="py-2.5 pr-3 font-semibold">Slug</th>
              <th className="py-2.5 pr-3 font-semibold">Products</th>
              <th className="py-2.5 pr-3 font-semibold">Order</th>
              <th className="py-2.5 pr-3 font-semibold">Visible</th>
              <th className="py-2.5 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {(categories ?? []).map((category, index) => (
              <tr key={category._id} className="hover:bg-secondary/30">
                <td className="py-3 pr-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-12 w-10 overflow-hidden bg-muted">
                      <SmartImage src={category.image} alt="" />
                    </div>
                    <div>
                      <p className="font-medium">{category.name}</p>
                      <p className="max-w-[220px] truncate text-[10px] text-muted-foreground">
                        {category.description}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-3 pr-3 font-mono text-[10px] text-muted-foreground">
                  {category.slug}
                </td>
                <td className="py-3 pr-3 tabular-nums">{category.productCount}</td>
                <td className="py-3 pr-3">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={async () => {
                        const ids = (categories ?? []).map((row) => row._id);
                        const previous = ids[index - 1];
                        if (!previous) return;
                        const next = [...ids];
                        next[index - 1] = ids[index];
                        next[index] = previous;
                        await reorder({ ids: next });
                      }}
                      className="border border-border px-1.5 text-[10px] disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <span className="ml-1 tabular-nums">{category.sortOrder}</span>
                  </div>
                </td>
                <td className="py-3 pr-3">
                  <span
                    className={cn(
                      "border px-2 py-0.5 text-[9px] uppercase tracking-[0.1em]",
                      category.isActive
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : "border-border text-muted-foreground",
                    )}
                  >
                    {category.isActive ? "Visible" : "Hidden"}
                  </span>
                </td>
                <td className="py-3">
                  <div className="flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(category._id);
                        setDraft({
                          name: category.name,
                          description: category.description ?? "",
                          image: category.image ?? "",
                          sortOrder: category.sortOrder,
                          isActive: category.isActive,
                        });
                        setOpen(true);
                      }}
                      className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground hover:text-espresso"
                    >
                      Edit
                    </button>
                    <ConfirmDelete
                      description={`Delete ${category.name}? Products must be moved first.`}
                      onConfirm={() => remove({ id: category._id })}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              {editing ? "Edit category" : "New category"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Name
              </label>
              <input
                value={draft.name}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, name: event.target.value }))
                }
                className="field mt-1.5"
                placeholder="Lawn Collection"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Description
              </label>
              <textarea
                rows={3}
                value={draft.description}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                className="field mt-1.5 resize-y"
              />
            </div>
            <ImageField
              label="Category image"
              value={draft.image}
              onChange={(image) => setDraft((current) => ({ ...current, image }))}
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Order
                </label>
                <input
                  type="number"
                  value={draft.sortOrder}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      sortOrder: Number(event.target.value),
                    }))
                  }
                  className="field mt-1.5"
                />
              </div>
              <label className="mt-6 flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={draft.isActive}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      isActive: event.target.checked,
                    }))
                  }
                  className="size-3.5 accent-[#35251C]"
                />
                Visible on storefront
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              className="h-10 rounded-sm text-[10px] uppercase tracking-[0.14em]"
            >
              Cancel
            </Button>
            <Button
              disabled={saving}
              onClick={async () => {
                setSaving(true);
                try {
                  await save({
                    ...(editing ? { id: editing as Id<"categories"> } : {}),
                    name: draft.name,
                    description: draft.description || undefined,
                    image: draft.image || undefined,
                    sortOrder: draft.sortOrder,
                    isActive: draft.isActive,
                  });
                  toast.success(editing ? "Category updated." : "Category created.");
                  setOpen(false);
                } catch (error) {
                  toast.error(
                    error instanceof Error ? error.message : "Could not save category.",
                  );
                } finally {
                  setSaving(false);
                }
              }}
              className="h-10 rounded-sm px-6 text-[10px] uppercase tracking-[0.14em]"
            >
              Save category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Panel>
  );
}

const toDateInput = (value?: number) =>
  value ? new Date(value).toISOString().slice(0, 10) : "";

export function CouponsPanel() {
  const coupons = useQuery(api.coupons.adminList);
  const products = useQuery(api.products.adminList);
  const categories = useQuery(api.categories.adminList);
  const save = useMutation(api.coupons.save);
  const remove = useMutation(api.coupons.remove);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState({
    code: "",
    description: "",
    discountType: "percentage" as "percentage" | "fixed",
    value: "",
    minOrder: "0",
    startsAt: "",
    expiresAt: "",
    usageLimit: "",
    productIds: [] as string[],
    categoryIds: [] as string[],
    isActive: true,
  });

  const openNew = () => {
    setEditing(null);
    setDraft({
      code: "",
      description: "",
      discountType: "percentage",
      value: "",
      minOrder: "0",
      startsAt: "",
      expiresAt: "",
      usageLimit: "",
      productIds: [],
      categoryIds: [],
      isActive: true,
    });
    setOpen(true);
  };

  return (
    <Panel
      title="Coupons & discounts"
      description="Percentage or fixed-value codes, with minimum order values, expiry and usage limits."
      action={
        <Button onClick={openNew} className="h-9 gap-2 rounded-sm px-4 text-[10px] font-semibold uppercase tracking-[0.14em]">
          <Plus className="size-3.5" /> New coupon
        </Button>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-xs">
          <thead className="border-y border-border/70 text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
            <tr>
              <th className="py-2.5 pr-3 font-semibold">Code</th>
              <th className="py-2.5 pr-3 font-semibold">Discount</th>
              <th className="py-2.5 pr-3 font-semibold">Min. order</th>
              <th className="py-2.5 pr-3 font-semibold">Used</th>
              <th className="py-2.5 pr-3 font-semibold">Expires</th>
              <th className="py-2.5 pr-3 font-semibold">Active</th>
              <th className="py-2.5 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {(coupons ?? []).map((coupon) => (
              <tr key={coupon._id} className="hover:bg-secondary/30">
                <td className="py-3 pr-3">
                  <p className="font-mono text-[11px] font-medium">{coupon.code}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {coupon.description}
                  </p>
                </td>
                <td className="py-3 pr-3">
                  {coupon.discountType === "percentage"
                    ? `${coupon.value}%`
                    : formatPKR(coupon.value)}
                </td>
                <td className="py-3 pr-3 tabular-nums">{formatPKR(coupon.minOrder)}</td>
                <td className="py-3 pr-3 tabular-nums">
                  {coupon.usedCount}
                  {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
                </td>
                <td className="py-3 pr-3 text-muted-foreground">
                  {coupon.expiresAt ? formatDate(coupon.expiresAt) : "—"}
                </td>
                <td className="py-3 pr-3">
                  <button
                    type="button"
                    onClick={async () => {
                      await save({
                        id: coupon._id,
                        code: coupon.code,
                        description: coupon.description,
                        discountType: coupon.discountType,
                        value: coupon.value,
                        minOrder: coupon.minOrder,
                        startsAt: coupon.startsAt ?? null,
                        expiresAt: coupon.expiresAt ?? null,
                        usageLimit: coupon.usageLimit ?? null,
                        productIds: coupon.productIds,
                        categoryIds: coupon.categoryIds,
                        isActive: !coupon.isActive,
                      });
                      toast.success("Coupon updated.");
                    }}
                    className={cn(
                      "border px-2 py-0.5 text-[9px] uppercase tracking-[0.1em]",
                      coupon.isActive
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : "border-border text-muted-foreground",
                    )}
                  >
                    {coupon.isActive ? "Active" : "Off"}
                  </button>
                </td>
                <td className="py-3">
                  <div className="flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(coupon._id);
                        setDraft({
                          code: coupon.code,
                          description: coupon.description ?? "",
                          discountType: coupon.discountType,
                          value: String(coupon.value),
                          minOrder: String(coupon.minOrder),
                          startsAt: toDateInput(coupon.startsAt),
                          expiresAt: toDateInput(coupon.expiresAt),
                          usageLimit: coupon.usageLimit ? String(coupon.usageLimit) : "",
                          productIds: (coupon.productIds ?? []) as string[],
                          categoryIds: (coupon.categoryIds ?? []) as string[],
                          isActive: coupon.isActive,
                        });
                        setOpen(true);
                      }}
                      className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground hover:text-espresso"
                    >
                      Edit
                    </button>
                    <ConfirmDelete onConfirm={() => remove({ id: coupon._id })} />
                  </div>
                </td>
              </tr>
            ))}
            {coupons && coupons.length === 0 && (
              <tr>
                <td colSpan={7} className="py-10 text-center text-muted-foreground">
                  No coupons yet. Create one to run a promotion.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              {editing ? "Edit coupon" : "New coupon"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Code
              </label>
              <input
                value={draft.code}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    code: event.target.value.toUpperCase(),
                  }))
                }
                className="field mt-1.5 font-mono uppercase"
                placeholder="EIDSALE"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Description
              </label>
              <input
                value={draft.description}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                className="field mt-1.5"
                placeholder="Eid promotion"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Type
              </label>
              <select
                value={draft.discountType}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    discountType: event.target.value as "percentage" | "fixed",
                  }))
                }
                className="field mt-1.5"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed amount (PKR)</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Value
              </label>
              <input
                type="number"
                value={draft.value}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, value: event.target.value }))
                }
                className="field mt-1.5"
                placeholder={draft.discountType === "percentage" ? "10" : "1500"}
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Minimum order (PKR)
              </label>
              <input
                type="number"
                value={draft.minOrder}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, minOrder: event.target.value }))
                }
                className="field mt-1.5"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Usage limit
              </label>
              <input
                type="number"
                value={draft.usageLimit}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    usageLimit: event.target.value,
                  }))
                }
                className="field mt-1.5"
                placeholder="Unlimited"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Starts
              </label>
              <input
                type="date"
                value={draft.startsAt}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, startsAt: event.target.value }))
                }
                className="field mt-1.5"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Expires
              </label>
              <input
                type="date"
                value={draft.expiresAt}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, expiresAt: event.target.value }))
                }
                className="field mt-1.5"
              />
            </div>

            <div className="sm:col-span-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Limit to categories (optional)
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(categories ?? []).map((category) => (
                  <button
                    key={category._id}
                    type="button"
                    onClick={() =>
                      setDraft((current) => ({
                        ...current,
                        categoryIds: current.categoryIds.includes(category._id)
                          ? current.categoryIds.filter((id) => id !== category._id)
                          : [...current.categoryIds, category._id],
                      }))
                    }
                    className={cn(
                      "border px-2 py-1 text-[10px]",
                      draft.categoryIds.includes(category._id)
                        ? "border-gold bg-gold/10"
                        : "border-border text-muted-foreground",
                    )}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="sm:col-span-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Limit to products (optional)
              </p>
              <div className="mt-2 max-h-36 overflow-y-auto border border-border/70 p-2">
                {(products ?? []).map((product) => (
                  <label
                    key={product._id}
                    className="flex cursor-pointer items-center gap-2 py-1 text-[11px]"
                  >
                    <input
                      type="checkbox"
                      checked={draft.productIds.includes(product._id)}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          productIds: event.target.checked
                            ? [...current.productIds, product._id]
                            : current.productIds.filter((id) => id !== product._id),
                        }))
                      }
                      className="size-3.5 accent-[#35251C]"
                    />
                    {product.name}
                  </label>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs sm:col-span-2">
              <input
                type="checkbox"
                checked={draft.isActive}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    isActive: event.target.checked,
                  }))
                }
                className="size-3.5 accent-[#35251C]"
              />
              Coupon is active
            </label>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              className="h-10 rounded-sm text-[10px] uppercase tracking-[0.14em]"
            >
              Cancel
            </Button>
            <Button
              disabled={saving}
              onClick={async () => {
                setSaving(true);
                try {
                  await save({
                    ...(editing ? { id: editing as Id<"coupons"> } : {}),
                    code: draft.code,
                    description: draft.description || undefined,
                    discountType: draft.discountType,
                    value: Number(draft.value),
                    minOrder: Number(draft.minOrder) || 0,
                    startsAt: draft.startsAt ? new Date(draft.startsAt).getTime() : null,
                    expiresAt: draft.expiresAt
                      ? new Date(`${draft.expiresAt}T23:59:59`).getTime()
                      : null,
                    usageLimit: draft.usageLimit ? Number(draft.usageLimit) : null,
                    productIds: draft.productIds as Id<"products">[],
                    categoryIds: draft.categoryIds as Id<"categories">[],
                    isActive: draft.isActive,
                  });
                  toast.success("Coupon saved.");
                  setOpen(false);
                } catch (error) {
                  toast.error(
                    error instanceof Error ? error.message : "Could not save coupon.",
                  );
                } finally {
                  setSaving(false);
                }
              }}
              className="h-10 rounded-sm px-6 text-[10px] uppercase tracking-[0.14em]"
            >
              Save coupon
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Panel>
  );
}

export function ReviewsPanel() {
  const reviews = useQuery(api.reviews.adminList);
  const moderate = useMutation(api.reviews.moderate);
  const remove = useMutation(api.reviews.remove);

  return (
    <Panel
      title="Reviews"
      description="Nothing is published until you approve it. Feature a review to show it on the homepage."
    >
      <div className="space-y-3">
        {(reviews ?? []).map((review) => (
          <div
            key={review._id}
            className="flex flex-col gap-3 border border-border/70 p-4 sm:flex-row"
          >
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <Stars rating={review.rating} />
                <span className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  {formatDate(review.createdAt)}
                </span>
                <span
                  className={cn(
                    "border px-1.5 py-0.5 text-[9px] uppercase tracking-[0.1em]",
                    review.isApproved
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-gold/40 bg-gold/10 text-espresso",
                  )}
                >
                  {review.isApproved ? "Published" : "Pending"}
                </span>
                {review.isFeatured && (
                  <span className="flex items-center gap-1 text-[9px] uppercase tracking-[0.1em] text-gold">
                    <Star className="size-3 fill-gold" /> Featured
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm font-medium">
                {review.name} · <span className="font-normal text-muted-foreground">{review.productName}</span>
              </p>
              {review.title && <p className="mt-1 font-display text-lg">{review.title}</p>}
              <p className="mt-1 text-xs leading-6 text-muted-foreground">{review.body}</p>
            </div>
            <div className="flex flex-wrap items-start gap-2 sm:flex-col">
              <Button
                size="sm"
                variant={review.isApproved ? "ghost" : "default"}
                onClick={async () => {
                  await moderate({ id: review._id, isApproved: !review.isApproved });
                  toast.success(review.isApproved ? "Review unpublished." : "Review published.");
                }}
                className="h-8 rounded-sm px-3 text-[9px] uppercase tracking-[0.1em]"
              >
                {review.isApproved ? <X className="size-3" /> : <Check className="size-3" />}
                {review.isApproved ? "Unpublish" : "Approve"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  await moderate({ id: review._id, isFeatured: !review.isFeatured });
                  toast.success("Review updated.");
                }}
                className="h-8 rounded-sm px-3 text-[9px] uppercase tracking-[0.1em]"
              >
                <Star className="size-3" /> {review.isFeatured ? "Unfeature" : "Feature"}
              </Button>
              <ConfirmDelete
                onConfirm={() => remove({ id: review._id })}
                description="Delete this review permanently?"
              />
            </div>
          </div>
        ))}
        {reviews && reviews.length === 0 && (
          <p className="border border-dashed border-border py-10 text-center text-xs text-muted-foreground">
            No reviews submitted yet. Reviews appear here for approval first.
          </p>
        )}
      </div>
    </Panel>
  );
}
