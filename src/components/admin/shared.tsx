import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { formatPKR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useMutation } from "convex/react";
import { ImagePlus, Loader2, Star, Trash2, Upload, X } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { SmartImage } from "@/components/site/primitives";

export function Panel({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("border border-border/70 bg-card", className)}>
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border/70 px-5 py-4">
        <div>
          <h2 className="font-display text-xl leading-tight">{title}</h2>
          {description && (
            <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {action}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: React.ComponentType<{ className?: string }>;
  tone?: "default" | "gold" | "alert";
}) {
  return (
    <div className="border border-border/70 bg-card p-5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </p>
        {Icon && (
          <Icon
            className={cn(
              "size-4",
              tone === "gold"
                ? "text-gold"
                : tone === "alert"
                  ? "text-destructive"
                  : "text-muted-foreground/60",
            )}
          />
        )}
      </div>
      <p
        className={cn(
          "mt-3 font-display text-3xl leading-none",
          tone === "alert" && "text-destructive",
        )}
      >
        {value}
      </p>
      {hint && <p className="mt-1.5 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function useImageUpload() {
  const generateUploadUrl = useMutation(api.site.generateUploadUrl);
  const imageUrlForStorage = useMutation(api.site.imageUrlForStorage);
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });
      if (!response.ok) throw new Error("Upload failed. Try a smaller image.");
      const json = (await response.json()) as { storageId: string };
      const url = await imageUrlForStorage({
        storageId: json.storageId as Id<"_storage">,
      });
      return url;
    } finally {
      setUploading(false);
    }
  };

  return { upload, uploading };
}

export function ImageField({
  label,
  value,
  onChange,
  aspect = "aspect-[4/3]",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  aspect?: string;
}) {
  const { upload, uploading } = useImageUpload();
  const inputRef = useRef<HTMLInputElement>(null);
  const [manual, setManual] = useState("");

  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <div className="mt-2 flex gap-3">
        <div className={cn("w-28 shrink-0 overflow-hidden border border-border bg-muted", aspect)}>
          <SmartImage src={value} alt="" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 rounded-sm text-[10px] uppercase tracking-[0.12em]"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Upload className="size-3.5" />
              )}
              Upload
            </Button>
            {value && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 rounded-sm text-[10px] uppercase tracking-[0.12em] text-muted-foreground"
                onClick={() => onChange("")}
              >
                <X className="size-3.5" /> Clear
              </Button>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (!file) return;
              try {
                const url = await upload(file);
                onChange(url);
                toast.success("Image uploaded.");
              } catch (error) {
                toast.error(
                  error instanceof Error ? error.message : "Could not upload image.",
                );
              }
            }}
          />
          <input
            value={manual}
            onChange={(event) => setManual(event.target.value)}
            placeholder="…or paste an image URL"
            className="field h-8 text-xs"
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="h-7 rounded-sm px-3 text-[10px] uppercase tracking-[0.12em]"
            onClick={() => {
              if (!manual.trim()) return;
              onChange(manual.trim());
              setManual("");
            }}
          >
            <ImagePlus className="size-3" /> Use URL
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ImageGalleryField({
  images,
  onChange,
}: {
  images: string[];
  onChange: (images: string[]) => void;
}) {
  const { upload, uploading } = useImageUpload();
  const inputRef = useRef<HTMLInputElement>(null);
  const [manual, setManual] = useState("");

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Product images
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 rounded-sm text-[10px] uppercase tracking-[0.12em]"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Upload className="size-3.5" />
          )}
          Upload
        </Button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={async (event) => {
          const files = Array.from(event.target.files ?? []);
          event.target.value = "";
          for (const file of files) {
            try {
              const url = await upload(file);
              onChange([...images, url]);
            } catch (error) {
              toast.error(
                error instanceof Error ? error.message : "Could not upload image.",
              );
            }
          }
        }}
      />
      <div className="mt-2 flex flex-wrap gap-2">
        {images.map((image, index) => (
          <div
            key={`${image}-${index}`}
            className="group relative h-24 w-20 overflow-hidden border border-border bg-muted"
          >
            <SmartImage src={image} alt="" />
            <button
              type="button"
              onClick={() => onChange(images.filter((_, i) => i !== index))}
              aria-label="Remove image"
              className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-white/90 text-destructive"
            >
              <X className="size-3" />
            </button>
            {index !== 0 && (
              <button
                type="button"
                onClick={() =>
                  onChange([image, ...images.filter((_, i) => i !== index)])
                }
                aria-label="Make cover image"
                className="absolute bottom-1 left-1 flex size-5 items-center justify-center rounded-full bg-white/90 text-gold"
              >
                <Star className="size-3" />
              </button>
            )}
            {index === 0 && (
              <span className="absolute bottom-0 inset-x-0 bg-espresso/80 py-0.5 text-center text-[8px] uppercase tracking-[0.1em] text-ivory">
                Cover
              </span>
            )}
          </div>
        ))}
        {images.length === 0 && (
          <div className="flex h-24 w-20 items-center justify-center border border-dashed border-border text-[10px] text-muted-foreground">
            None
          </div>
        )}
      </div>
      <div className="mt-2 flex gap-2">
        <input
          value={manual}
          onChange={(event) => setManual(event.target.value)}
          placeholder="Paste image URL"
          className="field h-8 text-xs"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 shrink-0 rounded-sm px-3 text-[10px] uppercase tracking-[0.12em]"
          onClick={() => {
            if (!manual.trim()) return;
            onChange([...images, manual.trim()]);
            setManual("");
          }}
        >
          Add
        </Button>
      </div>
    </div>
  );
}

export function ConfirmDelete({
  onConfirm,
  label = "Delete",
  description,
}: {
  onConfirm: () => Promise<unknown> | void;
  label?: string;
  description?: string;
}) {
  return (
    <button
      type="button"
      className="flex items-center gap-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-destructive"
      onClick={async () => {
        if (
          !window.confirm(
            description ?? "Are you sure? This cannot be undone.",
          )
        )
          return;
        try {
          await onConfirm();
          toast.success("Deleted.");
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Could not delete.");
        }
      }}
    >
      <Trash2 className="size-3.5" /> {label}
    </button>
  );
}

export function money(value: number) {
  return formatPKR(value);
}
