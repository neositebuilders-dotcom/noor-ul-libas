const KEY = "noor-coupon-v1";

export function getStoredCoupon(): string {
  try {
    return window.localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

export function setStoredCoupon(code: string) {
  try {
    if (code) window.localStorage.setItem(KEY, code);
    else window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
