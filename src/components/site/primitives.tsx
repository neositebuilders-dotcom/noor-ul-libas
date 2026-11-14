import { cn } from "@/lib/utils";
import { FALLBACK_IMAGE, formatPKR } from "@/lib/format";
import { Star } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

export function SmartImage({
  src,
  alt,
  className,
  priority = false,
  sizes,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setFailed(false);
  }, [src]);
  return (
    <img
      src={!src || failed ? FALLBACK_IMAGE : src}
      alt={alt}
      sizes={sizes}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailed(true)}
      className={cn("h-full w-full object-cover", className)}
    />
  );
}

export function Price({
  price,
  salePrice,
  className,
  size = "base",
}: {
  price: number;
  salePrice?: number | null;
  className?: string;
  size?: "sm" | "base" | "lg";
}) {
  const onSale = typeof salePrice === "number" && salePrice > 0 && salePrice < price;
  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-2 tabular-nums",
        size === "lg" ? "text-xl" : size === "sm" ? "text-xs" : "text-sm",
        className,
      )}
    >
      <span className={cn("font-medium", onSale && "text-gold")}>
        {formatPKR(onSale ? (salePrice as number) : price)}
      </span>
      {onSale && (
        <span className="text-xs text-muted-foreground line-through">
          {formatPKR(price)}
        </span>
      )}
    </span>
  );
}

export function Stars({
  rating,
  count,
  size = 13,
  className,
}: {
  rating: number;
  count?: number;
  size?: number;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <span className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            width={size}
            height={size}
            className={
              index < Math.round(rating)
                ? "fill-gold text-gold"
                : "fill-transparent text-border"
            }
          />
        ))}
      </span>
      {count !== undefined && (
        <span className="text-xs text-muted-foreground">({count})</span>
      )}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between",
        align === "center" && "sm:flex-col sm:items-center sm:text-center",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow && (
          <p className={cn("eyebrow mb-3", align === "center" && "justify-center")}>
            {eyebrow}
          </p>
        )}
        <h2 className="text-3xl leading-[1.1] sm:text-[2.6rem]">{title}</h2>
        {description && (
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 border border-dashed border-border/80 bg-card/60 px-6 py-20 text-center">
      {icon && <div className="text-gold">{icon}</div>}
      <div>
        <h3 className="text-2xl">{title}</h3>
        {description && (
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
