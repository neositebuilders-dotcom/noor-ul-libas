import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useShop } from "@/lib/shop";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import {
  ChevronDown,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";

const mainNav = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "New Arrivals", href: "/new-arrivals" },
  { label: "Collections", href: "/collections/featured", hasMenu: true },
  { label: "Best Sellers", href: "/best-sellers" },
  { label: "Sale", href: "/sale" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const collections = [
  { label: "Featured Collection", href: "/collections/featured" },
  { label: "Unstitched", href: "/collections/unstitched" },
  { label: "Ready-to-Wear", href: "/collections/ready-to-wear" },
  { label: "Two-Piece Suits", href: "/collections/two-piece" },
  { label: "Three-Piece Suits", href: "/collections/three-piece" },
  { label: "Luxury & Festive", href: "/collections/luxury" },
  { label: "Sale & Clearance", href: "/sale" },
];

export function AnnouncementBar({ messages }: { messages: string[] }) {
  const [index, setIndex] = useState(0);
  const visible = messages.filter(Boolean);

  useEffect(() => {
    if (visible.length < 2) return;
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % visible.length),
      5000,
    );
    return () => window.clearInterval(timer);
  }, [visible.length]);

  if (visible.length === 0) return null;

  return (
    <div className="relative overflow-hidden bg-espresso text-ivory">
      <div className="container-editorial flex h-9 items-center justify-center gap-2 text-[10px] font-medium uppercase tracking-[0.26em]">
        <span key={index} className="animate-announcement text-ivory/85">
          {visible[index]}
        </span>
      </div>
    </div>
  );
}

export function Header({ announcementMessages }: { announcementMessages: string[] }) {
  const { cartCount, wishlistCount } = useShop();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const categories = useQuery(api.categories.list);
  const categoryLinks = useMemo(
    () =>
      (categories ?? []).map((category) => ({
        label: category.name,
        href: `/category/${category.slug}`,
      })),
    [categories],
  );

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setOpenMenu(null);
  }, [location.pathname, location.search]);

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const term = query.trim();
    setSearchOpen(false);
    navigate(term ? `/shop?q=${encodeURIComponent(term)}` : "/shop");
  };

  const isActive = (href: string) =>
    href === "/"
      ? location.pathname === "/"
      : location.pathname === href || location.pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-50">
      <AnnouncementBar messages={announcementMessages} />
      <div className="border-b border-border/70 bg-background/95 backdrop-blur-md">
        <div className="container-editorial flex h-16 items-center justify-between gap-3 lg:h-20">
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="-ml-2 flex size-9 items-center justify-center text-espresso"
            >
              <Menu className="size-5" />
            </button>
          </div>

          <Link
            to="/"
            className="group flex shrink-0 flex-col items-center lg:items-start"
            aria-label="Noor ul Libas — home"
          >
            <span className="font-display text-[1.35rem] leading-none tracking-[0.16em] text-espresso sm:text-[1.55rem]">
              NOOR UL LIBAS
            </span>
            <span className="mt-1 hidden text-[7.5px] uppercase tracking-[0.42em] text-gold sm:block">
              Pakistani atelier
            </span>
          </Link>

          <nav className="hidden items-center gap-5 xl:gap-7 lg:flex">
            {mainNav.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.hasMenu && setOpenMenu(item.label)}
                onMouseLeave={() => item.hasMenu && setOpenMenu(null)}
              >
                <Link
                  to={item.href}
                  className={cn(
                    "relative flex items-center gap-1 py-2 text-[10.5px] font-semibold uppercase tracking-[0.19em] transition-colors",
                    isActive(item.href)
                      ? "text-espresso"
                      : "text-muted-foreground hover:text-espresso",
                  )}
                >
                  {item.label}
                  {item.hasMenu && <ChevronDown className="size-3" />}
                  <span
                    className={cn(
                      "absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-gold transition-transform duration-300",
                      isActive(item.href) && "scale-x-100",
                    )}
                  />
                </Link>

                {item.hasMenu && openMenu === item.label && (
                  <div className="absolute left-1/2 top-full z-50 w-[520px] -translate-x-1/2 pt-3">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-1 border border-border/80 bg-card p-6 shadow-[0_24px_60px_-24px_rgba(53,37,28,0.25)]">
                      <div>
                        <p className="eyebrow mb-3 text-[9px] text-muted-foreground">
                          Collections
                        </p>
                        {collections.map((link) => (
                          <Link
                            key={link.href}
                            to={link.href}
                            className="block py-1.5 text-sm text-foreground/80 transition-colors hover:text-gold"
                          >
                            {link.label}
                          </Link>
                        ))}
                      </div>
                      <div>
                        <p className="eyebrow mb-3 text-[9px] text-muted-foreground">
                          Shop by category
                        </p>
                        {categoryLinks.slice(0, 8).map((link) => (
                          <Link
                            key={link.href}
                            to={link.href}
                            className="block py-1.5 text-sm text-foreground/80 transition-colors hover:text-gold"
                          >
                            {link.label}
                          </Link>
                        ))}
                      </div>
                      <Link
                        to="/shop"
                        className="col-span-2 mt-3 flex items-center justify-between border-t border-border/70 pt-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-espresso hover:text-gold"
                      >
                        Shop all pieces <span aria-hidden>→</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="flex items-center gap-0.5 sm:gap-1">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search products"
              className="flex size-9 items-center justify-center text-espresso/80 transition-colors hover:text-gold"
            >
              <Search className="size-[18px]" />
            </button>
            <Link
              to={isAuthenticated ? "/account" : "/auth?returnTo=%2Faccount"}
              aria-label="My account"
              className="hidden size-9 items-center justify-center text-espresso/80 transition-colors hover:text-gold sm:flex"
            >
              <User className="size-[18px]" />
            </Link>
            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className="relative flex size-9 items-center justify-center text-espresso/80 transition-colors hover:text-gold"
            >
              <Heart className="size-[18px]" />
              {wishlistCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex size-4 items-center justify-center rounded-full bg-gold text-[9px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link
              to="/cart"
              aria-label="Shopping bag"
              className="relative flex size-9 items-center justify-center text-espresso/80 transition-colors hover:text-gold"
            >
              <ShoppingBag className="size-[18px]" />
              {cartCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex size-4 items-center justify-center rounded-full bg-espresso text-[9px] font-bold text-ivory">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="w-[88vw] max-w-sm border-r-border/70 bg-background p-0">
          <SheetHeader className="border-b border-border/70 px-6 py-5">
            <SheetTitle className="font-display text-xl tracking-[0.14em]">
              NOOR UL LIBAS
            </SheetTitle>
          </SheetHeader>
          <div className="flex h-full flex-col overflow-y-auto px-6 pb-24 pt-4">
            <nav className="flex flex-col">
              {mainNav.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className="flex items-center justify-between border-b border-border/50 py-3.5 text-sm font-medium"
                >
                  {item.label}
                  <span aria-hidden className="text-gold">
                    →
                  </span>
                </Link>
              ))}
            </nav>
            <p className="eyebrow mt-7">Categories</p>
            <div className="mt-3 flex flex-col">
              {categoryLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="py-2 text-sm text-muted-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="mt-7 flex flex-col gap-2">
              <Button asChild className="h-11 rounded-sm">
                <Link to="/collections/featured">Shop the collection</Link>
              </Button>
              <Button asChild variant="outline" className="h-11 rounded-sm">
                <Link to="/cart">View bag ({cartCount})</Link>
              </Button>
              <Button asChild variant="ghost" className="h-11 rounded-sm">
                <Link to={isAuthenticated ? "/account" : "/auth?returnTo=%2Faccount"}>
                  {isAuthenticated ? "My account" : "Sign in"}
                </Link>
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent
          showCloseButton={false}
          className="top-[18%] translate-y-0 gap-0 border-border/80 bg-background p-0 sm:max-w-xl"
        >
          <DialogTitle className="sr-only">Search products</DialogTitle>
          <form onSubmit={submitSearch} className="flex items-center border-b border-border/70 px-4">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search lawn, chiffon, festive…"
              className="h-14 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground/70"
            />
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              aria-label="Close search"
              className="flex size-8 items-center justify-center text-muted-foreground"
            >
              <X className="size-4" />
            </button>
          </form>
          <div className="px-4 py-4">
            <p className="eyebrow mb-2 text-[9px] text-muted-foreground">
              Popular searches
            </p>
            <div className="flex flex-wrap gap-2">
              {["Lawn", "Chiffon", "Festive", "Unstitched", "3-piece", "Sale"].map(
                (term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      setSearchOpen(false);
                      navigate(`/shop?q=${encodeURIComponent(term)}`);
                    }}
                    className="border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-gold hover:text-gold"
                  >
                    {term}
                  </button>
                ),
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
