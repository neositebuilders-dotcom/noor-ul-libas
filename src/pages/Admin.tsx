import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import {
  BarChart3,
  Box,
  ClipboardList,
  ExternalLink,
  Grid2X2,
  Image as ImageIcon,
  LayoutDashboard,
  Loader2,
  LogOut,
  Mail,
  Menu,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Star,
  Store,
  Tag,
  Users,
} from "lucide-react";
import { Suspense, lazy, useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

const Overview = lazy(() =>
  import("@/components/admin/OverviewPanel").then((module) => ({
    default: module.Overview,
  })),
);
const OrdersPanel = lazy(() =>
  import("@/components/admin/OrdersPanel").then((module) => ({
    default: module.OrdersPanel,
  })),
);
const ProductsPanel = lazy(() =>
  import("@/components/admin/ProductsPanel").then((module) => ({
    default: module.ProductsPanel,
  })),
);
const CategoriesPanel = lazy(() =>
  import("@/components/admin/CatalogPanels").then((module) => ({
    default: module.CategoriesPanel,
  })),
);
const CouponsPanel = lazy(() =>
  import("@/components/admin/CatalogPanels").then((module) => ({
    default: module.CouponsPanel,
  })),
);
const ReviewsPanel = lazy(() =>
  import("@/components/admin/CatalogPanels").then((module) => ({
    default: module.ReviewsPanel,
  })),
);
const HomepagePanel = lazy(() =>
  import("@/components/admin/HomepagePanel").then((module) => ({
    default: module.HomepagePanel,
  })),
);
const CustomersPanel = lazy(() =>
  import("@/components/admin/PeoplePanels").then((module) => ({
    default: module.CustomersPanel,
  })),
);
const InventoryPanel = lazy(() =>
  import("@/components/admin/PeoplePanels").then((module) => ({
    default: module.InventoryPanel,
  })),
);
const MessagesPanel = lazy(() =>
  import("@/components/admin/PeoplePanels").then((module) => ({
    default: module.MessagesPanel,
  })),
);
const SettingsPanel = lazy(() =>
  import("@/components/admin/PeoplePanels").then((module) => ({
    default: module.SettingsPanel,
  })),
);
const TeamPanel = lazy(() =>
  import("@/components/admin/PeoplePanels").then((module) => ({
    default: module.TeamPanel,
  })),
);
const Reports = lazy(() =>
  import("@/components/admin/ReportsPanel").then((module) => ({
    default: module.Reports,
  })),
);

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

function AdminGate() {
  const status = useQuery(api.admin.status);
  const claim = useMutation(api.admin.claimAdmin);
  const acceptInvite = useMutation(api.admin.acceptAdminInvite);
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
            {status.invited
              ? "You have been invited to manage this store. Accept the invitation to open the dashboard."
              : status.canClaim
                ? "No administrator exists yet. Claim this store with your signed-in email to open the dashboard."
                : "This account does not have permission to open the dashboard. Ask an administrator to grant you access, then sign in with that email."}
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
            {status.invited && (
              <Button
                onClick={async () => {
                  try {
                    await acceptInvite();
                    toast.success("Administrator access granted.");
                  } catch (error) {
                    toast.error(
                      error instanceof Error
                        ? error.message
                        : "Could not accept invitation.",
                    );
                  }
                }}
                className="h-11 rounded-sm text-[10px] uppercase tracking-[0.16em]"
              >
                Accept administrator invitation
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
  const counts = useQuery(api.admin.counts);

  const badgeFor = (key: Section) => {
    if (key === "orders" && counts?.pendingOrders) return counts.pendingOrders;
    if (key === "messages" && counts?.unreadMessages) return counts.unreadMessages;
    if (key === "inventory" && counts?.lowStock) return counts.lowStock;
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
          <Suspense
            fallback={
              <div className="flex justify-center py-16">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            }
          >
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
          </Suspense>
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
