import { ProductCard } from "@/components/site/ProductCard";
import { EmptyState, SmartImage } from "@/components/site/primitives";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { usePageMeta } from "@/lib/seo";
import { useShop } from "@/lib/shop";
import { useQuery } from "convex/react";
import { Heart, Trash2 } from "lucide-react";
import { Link } from "react-router";
import { toast } from "sonner";

export default function Wishlist() {
  const { wishlist, removeFromWishlist, wishlistCount } = useShop();
  const products = useQuery(api.products.list, { limit: 60 });

  usePageMeta({
    title: "Your wishlist — Noor ul Libas",
    description: "Pieces you have saved to shop later.",
  });

  return (
    <div className="container-editorial py-10 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Saved pieces</p>
          <h1 className="mt-3 text-4xl">Your wishlist</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {wishlistCount} {wishlistCount === 1 ? "piece" : "pieces"} saved. Sizes are
            chosen when you add to your bag.
          </p>
        </div>
        {wishlist.length > 0 && (
          <Button
            variant="ghost"
            onClick={() => {
              wishlist.forEach((item) => removeFromWishlist(item.productId));
              toast.message("Wishlist cleared");
            }}
            className="h-9 text-[10px] uppercase tracking-[0.16em] text-muted-foreground"
          >
            <Trash2 className="size-3.5" /> Clear wishlist
          </Button>
        )}
      </div>

      {wishlist.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={<Heart className="size-6" />}
            title="Nothing saved yet"
            description="Tap the heart on any piece to keep it here while you decide."
            action={
              <Button asChild className="h-11 rounded-sm px-6 text-[10px] uppercase tracking-[0.18em]">
                <Link to="/shop">Browse the collection</Link>
              </Button>
            }
          />
        </div>
      ) : (
        <div className="mt-9 grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 lg:grid-cols-4">
          {wishlist.map((item) => {
            const product = products?.items.find(
              (row) => row._id === item.productId,
            );
            if (product) return <ProductCard key={item.productId} product={product} />;
            return (
              <article key={item.productId} className="flex flex-col">
                <Link
                  to={`/product/${item.slug}`}
                  className="relative aspect-[3/4] overflow-hidden bg-[#f3ece1]"
                >
                  <SmartImage src={item.image} alt={item.name} />
                  <span className="absolute inset-0 flex items-center justify-center bg-espresso/40 text-[10px] uppercase tracking-[0.14em] text-ivory">
                    No longer available
                  </span>
                </Link>
                <div className="pt-3">
                  <h3 className="font-display text-lg">{item.name}</h3>
                  <button
                    type="button"
                    onClick={() => removeFromWishlist(item.productId)}
                    className="mt-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground underline underline-offset-2"
                  >
                    Remove
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
