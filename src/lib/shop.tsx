import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  sku: string;
  price: number;
  image: string;
  size?: string;
  color?: string;
  availableSizes?: string[];
  quantity: number;
  maxStock: number;
};

export type WishlistItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  productType: "unstitched" | "stitched";
};

const CART_KEY = "noor-cart-v1";
const WISHLIST_KEY = "noor-wishlist-v1";

function readStored<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as T;
    return fallback;
  } catch {
    return fallback;
  }
}

export function lineKey(item: {
  productId: string;
  size?: string;
  color?: string;
}) {
  return `${item.productId}::${item.size ?? ""}::${item.color ?? ""}`;
}

type ShopContextValue = {
  cart: CartItem[];
  cartCount: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  updateLine: (
    key: string,
    patch: Partial<Pick<CartItem, "size" | "color">>,
  ) => void;
  clearCart: () => void;
  wishlist: WishlistItem[];
  wishlistCount: number;
  toggleWishlist: (item: WishlistItem) => boolean;
  isWishlisted: (productId: string) => boolean;
  removeFromWishlist: (productId: string) => void;
};

const ShopContext = createContext<ShopContextValue | null>(null);

export function ShopProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() =>
    readStored<CartItem[]>(CART_KEY, []),
  );
  const [wishlist, setWishlist] = useState<WishlistItem[]>(() =>
    readStored<WishlistItem[]>(WISHLIST_KEY, []),
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      /* storage full or unavailable — the bag still works for this session */
    }
  }, [cart]);

  useEffect(() => {
    try {
      window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    } catch {
      /* ignore */
    }
  }, [wishlist]);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">, quantity = 1) => {
      setCart((current) => {
        const key = lineKey(item);
        const existing = current.find((row) => lineKey(row) === key);
        if (existing) {
          return current.map((row) =>
            lineKey(row) === key
              ? {
                  ...row,
                  quantity: Math.min(
                    row.quantity + quantity,
                    Math.max(1, row.maxStock || 99),
                  ),
                }
              : row,
          );
        }
        return [...current, { ...item, quantity: Math.max(1, quantity) }];
      });
    },
    [],
  );

  const removeItem = useCallback((key: string) => {
    setCart((current) => current.filter((row) => lineKey(row) !== key));
  }, []);

  const updateQuantity = useCallback((key: string, quantity: number) => {
    setCart((current) =>
      current.map((row) =>
        lineKey(row) === key
          ? {
              ...row,
              quantity: Math.max(
                1,
                Math.min(quantity, Math.max(1, row.maxStock || 99)),
              ),
            }
          : row,
      ),
    );
  }, []);

  const updateLine = useCallback(
    (key: string, patch: Partial<Pick<CartItem, "size" | "color">>) => {
      setCart((current) =>
        current.map((row) => (lineKey(row) === key ? { ...row, ...patch } : row)),
      );
    },
    [],
  );

  const clearCart = useCallback(() => setCart([]), []);

  const toggleWishlist = useCallback((item: WishlistItem) => {
    let added = false;
    setWishlist((current) => {
      const exists = current.some((row) => row.productId === item.productId);
      if (exists) {
        return current.filter((row) => row.productId !== item.productId);
      }
      added = true;
      return [...current, item];
    });
    return added;
  }, []);

  const removeFromWishlist = useCallback((productId: string) => {
    setWishlist((current) =>
      current.filter((row) => row.productId !== productId),
    );
  }, []);

  const isWishlisted = useCallback(
    (productId: string) =>
      wishlist.some((row) => row.productId === productId),
    [wishlist],
  );

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart],
  );
  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart],
  );

  const value = useMemo(
    () => ({
      cart,
      cartCount,
      subtotal,
      addItem,
      removeItem,
      updateQuantity,
      updateLine,
      clearCart,
      wishlist,
      wishlistCount: wishlist.length,
      toggleWishlist,
      isWishlisted,
      removeFromWishlist,
    }),
    [
      cart,
      cartCount,
      subtotal,
      addItem,
      removeItem,
      updateQuantity,
      updateLine,
      clearCart,
      wishlist,
      toggleWishlist,
      isWishlisted,
      removeFromWishlist,
    ],
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error("useShop must be used inside ShopProvider");
  }
  return context;
}

const RECENT_KEY = "noor-recently-viewed-v1";

export function recordRecentlyViewed(slug: string) {
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    const next = [slug, ...list.filter((item) => item !== slug)].slice(0, 8);
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function getRecentlyViewed(): string[] {
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
