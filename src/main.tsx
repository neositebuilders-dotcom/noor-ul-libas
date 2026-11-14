import '@vly-ai/integrations';
import { Toaster } from "@/components/ui/sonner";
import { RequireAuth } from "@/components/RequireAuth";
import { SiteLayout } from "@/components/site/SiteLayout";
import { VlyToolbar } from "../vly-toolbar-readonly.tsx";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import React, { StrictMode, useEffect, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router";
import "./index.css";

/* ------------------------------------------------------------------ *
 * Stale-chunk recovery
 *
 * After a new deployment the old hashed chunk files are gone, so a tab
 * still holding an older index.html (or a flaky network request) fails
 * with "Failed to fetch dynamically imported module". Vite reports that as a
 * `vite:preloadError`; we reload once so the browser picks up the current
 * asset names instead of dead-ending on the crash screen.
 * ------------------------------------------------------------------ */
const RELOAD_STAMP_KEY = "noor:chunk-reload-at";
const RELOAD_COOLDOWN_MS = 15_000;

function reloadForFreshAssets() {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_STAMP_KEY) ?? 0);
    if (Date.now() - last < RELOAD_COOLDOWN_MS) return false;
    sessionStorage.setItem(RELOAD_STAMP_KEY, String(Date.now()));
  } catch {
    // Storage can be unavailable; a reload is still the right recovery.
  }
  window.location.reload();
  return true;
}

// Vite fires this when a dynamic import fails to load (e.g. a removed chunk).
window.addEventListener("vite:preloadError", (event) => {
  event.preventDefault();
  reloadForFreshAssets();
});

// Lazy load route components for better code splitting
const Home = lazy(() => import("./pages/Home.tsx"));
const Shop = lazy(() => import("./pages/Shop.tsx"));
const Product = lazy(() => import("./pages/Product.tsx"));
const Cart = lazy(() => import("./pages/Cart.tsx"));
const Wishlist = lazy(() => import("./pages/Wishlist.tsx"));
const Checkout = lazy(() => import("./pages/Checkout.tsx"));
const OrderConfirmation = lazy(() => import("./pages/OrderConfirmation.tsx"));
const TrackOrder = lazy(() => import("./pages/TrackOrder.tsx"));
const Account = lazy(() => import("./pages/Account.tsx"));
const AuthPage = lazy(() => import("./pages/Auth.tsx"));
const Admin = lazy(() => import("./pages/Admin.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

const ShopPages = lazy(() =>
  import("./pages/Shop.tsx").then((module) => ({
    default: module.CategoryPage,
  })),
);
const CollectionPages = lazy(() =>
  import("./pages/Shop.tsx").then((module) => ({
    default: module.CollectionPage,
  })),
);
const NewArrivals = lazy(() =>
  import("./pages/Shop.tsx").then((module) => ({
    default: module.NewArrivalsPage,
  })),
);
const BestSellers = lazy(() =>
  import("./pages/Shop.tsx").then((module) => ({
    default: module.BestSellersPage,
  })),
);
const Sale = lazy(() =>
  import("./pages/Shop.tsx").then((module) => ({
    default: module.SalePage,
  })),
);
const ContentPages = lazy(() =>
  import("./pages/Content.tsx").then((module) => ({
    default: module.AboutPage,
  })),
);
const ContactPage = lazy(() =>
  import("./pages/Content.tsx").then((module) => ({
    default: module.ContactPage,
  })),
);
const FaqsPage = lazy(() =>
  import("./pages/Content.tsx").then((module) => ({
    default: module.FaqsPage,
  })),
);
const PolicyShipping = lazy(() =>
  import("./pages/Content.tsx").then((module) => ({
    default: () => <module.PolicyPage kind="shipping" />,
  })),
);
const PolicyReturns = lazy(() =>
  import("./pages/Content.tsx").then((module) => ({
    default: () => <module.PolicyPage kind="returns" />,
  })),
);
const PolicyPrivacy = lazy(() =>
  import("./pages/Content.tsx").then((module) => ({
    default: () => <module.PolicyPage kind="privacy" />,
  })),
);
const PolicyTerms = lazy(() =>
  import("./pages/Content.tsx").then((module) => ({
    default: () => <module.PolicyPage kind="terms" />,
  })),
);

// Simple loading fallback for route transitions
function RouteLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Loading...</div>
    </div>
  );
}

/** Silent error boundary — if VlyToolbar crashes it renders nothing instead of
 *  crashing the whole app (e.g. hook errors in the browser runtime). */
class ToolbarErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err: Error) {
    console.warn("[VlyToolbar] Caught error, toolbar disabled:", err.message);
  }
  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

/** Hard guard so runtime errors never leave the preview as a blank page. */
class RootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string; stack: string }
> {
  state = { hasError: false, message: "", stack: "" };
  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      message: error.message || "Unknown runtime error",
      stack: error.stack || "",
    };
  }
  componentDidCatch(err: Error) {
    console.error("[Preview] Root crash:", err);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
          <div className="max-w-lg text-center">
            <p className="text-sm font-semibold">Preview runtime error</p>
            <p className="mt-2 text-xs text-muted-foreground break-words">
              {this.state.message}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-sm border border-border px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] hover:bg-muted"
            >
              Reload page
            </button>
            {this.state.stack && (
              <pre className="mt-3 text-left text-[10px] leading-4 text-muted-foreground/80 max-h-40 overflow-auto rounded border border-border/60 p-2">
                {this.state.stack}
              </pre>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

function RouteSyncer() {
  const location = useLocation();
  useEffect(() => {
    window.parent.postMessage(
      { type: "iframe-route-change", path: location.pathname },
      "*",
    );
  }, [location.pathname]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "navigate") {
        if (event.data.direction === "back") window.history.back();
        if (event.data.direction === "forward") window.history.forward();
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return null;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RootErrorBoundary>
      <ToolbarErrorBoundary>
        <VlyToolbar />
      </ToolbarErrorBoundary>
      <ConvexAuthProvider client={convex}>
        <BrowserRouter>
          <RouteSyncer />
          <Suspense fallback={<RouteLoading />}>
            <Routes>
              <Route element={<SiteLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/new-arrivals" element={<NewArrivals />} />
                <Route path="/best-sellers" element={<BestSellers />} />
                <Route path="/sale" element={<Sale />} />
                <Route path="/collections/:slug" element={<CollectionPages />} />
                <Route path="/category/:slug" element={<ShopPages />} />
                <Route path="/product/:slug" element={<Product />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order/:orderNumber" element={<OrderConfirmation />} />
                <Route path="/track-order" element={<TrackOrder />} />
                <Route
                  path="/account"
                  element={
                    <RequireAuth
                      redirectImmediately
                      title="Sign in to your account"
                      description="Your orders, details and saved pieces live here."
                    >
                      <Account />
                    </RequireAuth>
                  }
                />
                <Route path="/dashboard" element={<Navigate to="/account" replace />} />
                <Route path="/about" element={<ContentPages />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/faqs" element={<FaqsPage />} />
                <Route path="/shipping" element={<PolicyShipping />} />
                <Route path="/returns" element={<PolicyReturns />} />
                <Route path="/privacy" element={<PolicyPrivacy />} />
                <Route path="/terms" element={<PolicyTerms />} />
                <Route path="*" element={<NotFound />} />
              </Route>
              <Route
                path="/auth"
                element={<AuthPage redirectAfterAuth="/account" />}
              />
              <Route
                path="/admin"
                element={
                  <RequireAuth
                    redirectImmediately
                    title="Sign in to manage your store"
                    description="The dashboard is restricted to store administrators."
                  >
                    <Admin />
                  </RequireAuth>
                }
              />
            </Routes>
          </Suspense>
          <Toaster />
        </BrowserRouter>
      </ConvexAuthProvider>
    </RootErrorBoundary>
  </StrictMode>,
);
