import { SmartImage } from "@/components/site/primitives";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { formatPKR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import {
  Copy,
  Loader2,
  Pencil,
  Plus,
  Search,
  Upload,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ConfirmDelete,
  ImageGalleryField,
  Panel,
} from "./shared";

const COLLECTIONS = [
  "lawn",
  "cotton",
  "chiffon",
  "organza",
  "khaddar",
  "linen",
  "velvet",
  "raw-silk",
  "festive",
  "luxury",
  "wedding",
  "summer",
  "winter",
  "everyday",
];

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "Custom"];

type Draft = {
  name: string;
  sku: string;
  slug: string;
  description: string;
  fabric: string;
  fabricDetails: string;
  careInstructions: string;
  includedPieces: string;
  productType: "unstitched" | "stitched";
  pieceCount: number;
  price: string;
  salePrice: string;
  stock: string;
  lowStockThreshold: string;
  categoryId: string;
  collections: string[];
  colors: string;
  sizes: string[];
  images: string[];
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  status: "published" | "draft";
};

const emptyDraft: Draft = {
  name: "",
  sku: "",
  slug: "",
  description: "",
  fabric: "",
  fabricDetails: "",
  careInstructions: "",
  includedPieces: "",
  productType: "unstitched",
  pieceCount: 3,
  price: "",
  salePrice: "",
  stock: "10",
  lowStockThreshold: "5",
  categoryId: "",
  collections: [],
  colors: "",
  sizes: [],
  images: [],
  isFeatured: false,
  isNewArrival: true,
  isBestSeller: false,
  status: "published",
};

export function ProductsPanel() {
  const products = useQuery(api.products.adminList);
  const categories = useQuery(api.categories.adminList);
  const saveProduct = useMutation(api.products.saveProduct);
  const removeProduct = useMutation(api.products.removeProduct);
  const duplicateProduct = useMutation(api.products.duplicateProduct);
  const bulkAction = useMutation(api.products.bulkAction);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (products ?? []).filter((product) => {
      if (statusFilter !== "all" && product.status !== statusFilter) return false;
      if (!term) return true;
      return [product.name, product.sku, product.categoryName, product.fabric ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [products, search, statusFilter]);

  const openNew = () => {
    setDraft(emptyDraft);
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEdit = (product: NonNullable<typeof products>[number]) => {
    setDraft({
      name: product.name,
      sku: product.sku,
      slug: product.slug,
      description: product.description,
      fabric: product.fabric ?? "",
      fabricDetails: product.fabricDetails ?? "",
      careInstructions: product.careInstructions ?? "",
      includedPieces: product.includedPieces ?? "",
      productType: product.productType,
      pieceCount: product.pieceCount,
      price: String(product.price),
      salePrice: product.salePrice ? String(product.salePrice) : "",
      stock: String(product.stock),
      lowStockThreshold: String(product.lowStockThreshold ?? 5),
      categoryId: product.categoryId ?? "",
      collections: product.collections,
      colors: product.colors.join(", "),
      sizes: product.sizes,
      images: product.images,
      isFeatured: product.isFeatured,
      isNewArrival: product.isNewArrival,
      isBestSeller: product.isBestSeller,
      status: product.status,
    });
    setEditingId(product._id);
    setDialogOpen(true);
  };

  const submit = async () => {
    if (!draft.name.trim()) {
      toast.error("Product name is required.");
      return;
    }
    if (Number(draft.price) <= 0) {
      toast.error("Enter a price greater than zero.");
      return;
    }
    if (draft.images.length === 0) {
      toast.error("Add at least one product image.");
      return;
    }
    setSaving(true);
    try {
      await saveProduct({
        ...(editingId ? { id: editingId as Id<"products"> } : {}),
        input: {
          name: draft.name,
          sku: draft.sku,
          slug: draft.slug,
          description: draft.description,
          fabricDetails: draft.fabricDetails,
          careInstructions: draft.careInstructions,
          categoryId: draft.categoryId
            ? (draft.categoryId as Id<"categories">)
            : undefined,
          collections: draft.collections,
          productType: draft.productType,
          pieceCount: draft.pieceCount,
          fabric: draft.fabric,
          includedPieces: draft.includedPieces,
          price: Number(draft.price),
          salePrice: draft.salePrice ? Number(draft.salePrice) : null,
          images: draft.images,
          colors: draft.colors
            .split(",")
            .map((color) => color.trim())
            .filter(Boolean),
          sizes: draft.sizes,
          stock: Number(draft.stock) || 0,
          lowStockThreshold: Number(draft.lowStockThreshold) || 5,
          isFeatured: draft.isFeatured,
          isNewArrival: draft.isNewArrival,
          isBestSeller: draft.isBestSeller,
          status: draft.status,
        },
      });
      toast.success(editingId ? "Product updated." : "Product created.");
      setDialogOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save the product.",
      );
    } finally {
      setSaving(false);
    }
  };

  const allSelected = rows.length > 0 && selected.length === rows.length;

  return (
    <div className="space-y-5">
      <Panel
        title="Products"
        description="Create, edit and publish the pieces in your collection. Changes appear on the storefront immediately."
        action={
          <Button onClick={openNew} className="h-9 gap-2 rounded-sm px-4 text-[10px] font-semibold uppercase tracking-[0.14em]">
            <Plus className="size-3.5" /> Add product
          </Button>
        }
      >
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, SKU, category…"
              className="field h-9 pl-9 text-xs"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="field h-9 w-auto text-xs"
          >
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          <span className="ml-auto text-[11px] text-muted-foreground">
            {rows.length} products
          </span>
        </div>

        {selected.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2 border border-gold/30 bg-secondary/50 px-3 py-2">
            <span className="text-[11px] font-medium">
              {selected.length} selected
            </span>
            {[
              { action: "publish" as const, label: "Publish" },
              { action: "unpublish" as const, label: "Unpublish" },
              { action: "feature" as const, label: "Feature" },
              { action: "unfeature" as const, label: "Unfeature" },
              { action: "bestSeller" as const, label: "Mark best seller" },
              { action: "removeBestSeller" as const, label: "Unmark best seller" },
            ].map((item) => (
              <button
                key={item.action}
                type="button"
                onClick={async () => {
                  await bulkAction({
                    ids: selected as Id<"products">[],
                    action: item.action,
                  });
                  setSelected([]);
                  toast.success("Products updated.");
                }}
                className="border border-border bg-card px-2 py-1 text-[10px] uppercase tracking-[0.1em] text-muted-foreground hover:border-gold hover:text-espresso"
              >
                {item.label}
              </button>
            ))}
            <ConfirmDelete
              label="Delete selected"
              description={`Delete ${selected.length} product(s)? This cannot be undone.`}
              onConfirm={async () => {
                await bulkAction({
                  ids: selected as Id<"products">[],
                  action: "delete",
                });
                setSelected([]);
              }}
            />
            <button
              type="button"
              onClick={() => setSelected([])}
              className="ml-auto text-[10px] uppercase tracking-[0.1em] text-muted-foreground underline underline-offset-2"
            >
              Clear
            </button>
          </div>
        )}

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-xs">
            <thead className="border-y border-border/70 text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
              <tr>
                <th className="w-8 py-2.5">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(event) =>
                      setSelected(
                        event.target.checked ? rows.map((row) => row._id) : [],
                      )
                    }
                    className="size-3.5 accent-[#35251C]"
                  />
                </th>
                <th className="py-2.5 pr-3 font-semibold">Product</th>
                <th className="py-2.5 pr-3 font-semibold">Category</th>
                <th className="py-2.5 pr-3 font-semibold">Price</th>
                <th className="py-2.5 pr-3 font-semibold">Stock</th>
                <th className="py-2.5 pr-3 font-semibold">Status</th>
                <th className="py-2.5 pr-3 font-semibold">Tags</th>
                <th className="py-2.5 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {products === undefined &&
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td colSpan={8} className="py-4">
                      <div className="h-8 w-full bg-muted" />
                    </td>
                  </tr>
                ))}
              {rows.map((product) => (
                <tr key={product._id} className="align-middle hover:bg-secondary/30">
                  <td className="py-2.5">
                    <input
                      type="checkbox"
                      checked={selected.includes(product._id)}
                      onChange={(event) =>
                        setSelected((current) =>
                          event.target.checked
                            ? [...current, product._id]
                            : current.filter((id) => id !== product._id),
                        )
                      }
                      className="size-3.5 accent-[#35251C]"
                    />
                  </td>
                  <td className="py-2.5 pr-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-12 w-9 shrink-0 overflow-hidden bg-muted">
                        <SmartImage src={product.images[0]} alt="" />
                      </div>
                      <div className="min-w-0">
                        <p className="max-w-[220px] truncate font-medium">{product.name}</p>
                        <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                          {product.sku}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 pr-3 text-muted-foreground">{product.categoryName}</td>
                  <td className="py-2.5 pr-3 tabular-nums">
                    <span className={cn(product.salePrice && "text-gold")}>
                      {formatPKR(product.effectivePrice)}
                    </span>
                    {product.salePrice && (
                      <span className="ml-1.5 text-[10px] text-muted-foreground line-through">
                        {formatPKR(product.price)}
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 pr-3">
                    <span
                      className={cn(
                        "tabular-nums",
                        product.stock === 0
                          ? "text-destructive"
                          : product.stock <= 5
                            ? "text-gold"
                            : "",
                      )}
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3">
                    <button
                      type="button"
                      onClick={async () => {
                        await saveProduct({
                          id: product._id,
                          input: {
                            name: product.name,
                            slug: product.slug,
                            sku: product.sku,
                            description: product.description,
                            fabricDetails: product.fabricDetails,
                            careInstructions: product.careInstructions,
                            categoryId: product.categoryId,
                            collections: product.collections,
                            productType: product.productType,
                            pieceCount: product.pieceCount,
                            fabric: product.fabric,
                            includedPieces: product.includedPieces,
                            price: product.price,
                            salePrice: product.salePrice ?? null,
                            images: product.images,
                            colors: product.colors,
                            sizes: product.sizes,
                            stock: product.stock,
                            lowStockThreshold: product.lowStockThreshold,
                            isFeatured: product.isFeatured,
                            isNewArrival: product.isNewArrival,
                            isBestSeller: product.isBestSeller,
                            status: product.status === "published" ? "draft" : "published",
                          },
                        });
                        toast.success("Status updated.");
                      }}
                      className={cn(
                        "border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em]",
                        product.status === "published"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                          : "border-border bg-secondary text-muted-foreground",
                      )}
                    >
                      {product.status}
                    </button>
                  </td>
                  <td className="py-2.5 pr-3">
                    <div className="flex flex-wrap gap-1">
                      {product.isFeatured && <Tag>Featured</Tag>}
                      {product.isNewArrival && <Tag>New</Tag>}
                      {product.isBestSeller && <Tag>Best</Tag>}
                    </div>
                  </td>
                  <td className="py-2.5">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => openEdit(product)}
                        className="flex items-center gap-1 text-[10px] uppercase tracking-[0.1em] text-muted-foreground hover:text-espresso"
                      >
                        <Pencil className="size-3.5" /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          await duplicateProduct({ id: product._id });
                          toast.success("Product duplicated as a draft.");
                        }}
                        className="flex items-center gap-1 text-[10px] uppercase tracking-[0.1em] text-muted-foreground hover:text-espresso"
                      >
                        <Copy className="size-3.5" /> Copy
                      </button>
                      <ConfirmDelete
                        onConfirm={() => removeProduct({ id: product._id })}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && products !== undefined && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-muted-foreground">
                    No products match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              {editingId ? "Edit product" : "New product"}
            </DialogTitle>
            <DialogDescription>
              Everything here is shown on the storefront. Publish when you are ready.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <ImageGalleryField
                images={draft.images}
                onChange={(images) => setDraft((d) => ({ ...d, images }))}
              />
            </div>

            <div>
              <Label>Product name *</Label>
              <input
                value={draft.name}
                onChange={(event) =>
                  setDraft((d) => ({ ...d, name: event.target.value }))
                }
                className="field mt-1.5"
                placeholder="Meher Chiffon Formal Suit"
              />
            </div>
            <div>
              <Label>SKU</Label>
              <input
                value={draft.sku}
                onChange={(event) => setDraft((d) => ({ ...d, sku: event.target.value }))}
                className="field mt-1.5"
                placeholder="Leave blank to generate"
              />
            </div>

            <div className="sm:col-span-2">
              <Label>Description</Label>
              <textarea
                rows={4}
                value={draft.description}
                onChange={(event) =>
                  setDraft((d) => ({ ...d, description: event.target.value }))
                }
                className="field mt-1.5 resize-y"
                placeholder="Tell the customer about the cut, embroidery and how it wears."
              />
            </div>

            <div>
              <Label>Category</Label>
              <select
                value={draft.categoryId}
                onChange={(event) =>
                  setDraft((d) => ({ ...d, categoryId: event.target.value }))
                }
                className="field mt-1.5"
              >
                <option value="">Uncategorised</option>
                {(categories ?? []).map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Product type</Label>
              <select
                value={draft.productType}
                onChange={(event) =>
                  setDraft((d) => ({
                    ...d,
                    productType: event.target.value as Draft["productType"],
                  }))
                }
                className="field mt-1.5"
              >
                <option value="unstitched">Unstitched</option>
                <option value="stitched">Ready-to-wear</option>
              </select>
            </div>

            <div>
              <Label>Pieces included</Label>
              <select
                value={draft.pieceCount}
                onChange={(event) =>
                  setDraft((d) => ({ ...d, pieceCount: Number(event.target.value) }))
                }
                className="field mt-1.5"
              >
                {[1, 2, 3, 4].map((count) => (
                  <option key={count} value={count}>
                    {count} piece
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Fabric</Label>
              <input
                value={draft.fabric}
                onChange={(event) =>
                  setDraft((d) => ({ ...d, fabric: event.target.value }))
                }
                className="field mt-1.5"
                placeholder="Lawn, Chiffon, Organza…"
              />
            </div>

            <div className="sm:col-span-2">
              <Label>Included pieces detail</Label>
              <input
                value={draft.includedPieces}
                onChange={(event) =>
                  setDraft((d) => ({ ...d, includedPieces: event.target.value }))
                }
                className="field mt-1.5"
                placeholder="Embroidered shirt (2.5m), trouser (2.5m), dupatta (2.5m)"
              />
            </div>

            <div>
              <Label>Fabric & care</Label>
              <textarea
                rows={3}
                value={draft.fabricDetails}
                onChange={(event) =>
                  setDraft((d) => ({ ...d, fabricDetails: event.target.value }))
                }
                className="field mt-1.5 resize-y"
                placeholder="Fabric composition and washing instructions"
              />
            </div>
            <div>
              <Label>Care instructions</Label>
              <textarea
                rows={3}
                value={draft.careInstructions}
                onChange={(event) =>
                  setDraft((d) => ({ ...d, careInstructions: event.target.value }))
                }
                className="field mt-1.5 resize-y"
                placeholder="Dry clean recommended…"
              />
            </div>

            <div>
              <Label>Regular price (PKR) *</Label>
              <input
                type="number"
                min={0}
                value={draft.price}
                onChange={(event) =>
                  setDraft((d) => ({ ...d, price: event.target.value }))
                }
                className="field mt-1.5"
              />
            </div>
            <div>
              <Label>Sale price (PKR)</Label>
              <input
                type="number"
                min={0}
                value={draft.salePrice}
                onChange={(event) =>
                  setDraft((d) => ({ ...d, salePrice: event.target.value }))
                }
                className="field mt-1.5"
                placeholder="Leave blank for no sale"
              />
            </div>

            <div>
              <Label>Stock quantity</Label>
              <input
                type="number"
                min={0}
                value={draft.stock}
                onChange={(event) =>
                  setDraft((d) => ({ ...d, stock: event.target.value }))
                }
                className="field mt-1.5"
              />
            </div>
            <div>
              <Label>Low stock alert at</Label>
              <input
                type="number"
                min={0}
                value={draft.lowStockThreshold}
                onChange={(event) =>
                  setDraft((d) => ({ ...d, lowStockThreshold: event.target.value }))
                }
                className="field mt-1.5"
              />
            </div>

            <div>
              <Label>Colours (comma separated)</Label>
              <input
                value={draft.colors}
                onChange={(event) =>
                  setDraft((d) => ({ ...d, colors: event.target.value }))
                }
                className="field mt-1.5"
                placeholder="Ivory, Sage, Dusty Rose"
              />
            </div>
            <div>
              <Label>Sizes available</Label>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {SIZE_OPTIONS.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        sizes: d.sizes.includes(size)
                          ? d.sizes.filter((value) => value !== size)
                          : [...d.sizes, size],
                      }))
                    }
                    className={cn(
                      "border px-2 py-1 text-[10px]",
                      draft.sizes.includes(size)
                        ? "border-espresso bg-espresso text-ivory"
                        : "border-border text-muted-foreground",
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground">
                Leave empty for unstitched pieces.
              </p>
            </div>

            <div className="sm:col-span-2">
              <Label>Collections & tags</Label>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {COLLECTIONS.map((collection) => (
                  <button
                    key={collection}
                    type="button"
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        collections: d.collections.includes(collection)
                          ? d.collections.filter((value) => value !== collection)
                          : [...d.collections, collection],
                      }))
                    }
                    className={cn(
                      "border px-2 py-1 text-[10px] capitalize",
                      draft.collections.includes(collection)
                        ? "border-gold bg-gold/10 text-espresso"
                        : "border-border text-muted-foreground",
                    )}
                  >
                    {collection.replace("-", " ")}
                  </button>
                ))}
              </div>
            </div>

            <div className="sm:col-span-2 grid gap-3 border-t border-border/70 pt-4 sm:grid-cols-4">
              <Toggle
                label="Featured"
                checked={draft.isFeatured}
                onChange={(value) => setDraft((d) => ({ ...d, isFeatured: value }))}
              />
              <Toggle
                label="New arrival"
                checked={draft.isNewArrival}
                onChange={(value) => setDraft((d) => ({ ...d, isNewArrival: value }))}
              />
              <Toggle
                label="Best seller"
                checked={draft.isBestSeller}
                onChange={(value) => setDraft((d) => ({ ...d, isBestSeller: value }))}
              />
              <div>
                <Label>Status</Label>
                <select
                  value={draft.status}
                  onChange={(event) =>
                    setDraft((d) => ({
                      ...d,
                      status: event.target.value as Draft["status"],
                    }))
                  }
                  className="field mt-1.5 h-9"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setDialogOpen(false)}
              className="h-10 rounded-sm text-[10px] uppercase tracking-[0.14em]"
            >
              Cancel
            </Button>
            <Button
              onClick={submit}
              disabled={saving}
              className="h-10 gap-2 rounded-sm px-6 text-[10px] font-semibold uppercase tracking-[0.14em]"
            >
              {saving ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Upload className="size-3.5" />
              )}
              {editingId ? "Save changes" : "Create product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="border border-border bg-secondary px-1.5 py-0.5 text-[8px] uppercase tracking-[0.08em] text-muted-foreground">
      {children}
    </span>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-[11px]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-3.5 accent-[#35251C]"
      />
      {label}
    </label>
  );
}
