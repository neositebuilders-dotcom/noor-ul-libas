export function formatPKR(value: number) {
  const amount = Math.round(Number.isFinite(value) ? value : 0);
  return `Rs ${amount.toLocaleString("en-PK")}`;
}

export function formatDate(timestamp: number, withTime = false) {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
  });
}

export function whatsappLink(number: string, message?: string) {
  const digits = number.replace(/\D/g, "");
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export const PROVINCES = [
  "Punjab",
  "Sindh",
  "Khyber Pakhtunkhwa",
  "Balochistan",
  "Islamabad Capital Territory",
  "Gilgit-Baltistan",
  "Azad Kashmir",
] as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  new: "New",
  confirmed: "Confirmed",
  processing: "Processing",
  packed: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  unpaid: "Unpaid",
  paid: "Paid",
  refunded: "Refunded",
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cod: "Cash on delivery",
  bank: "Bank transfer",
};

export const ORDER_STATUS_OPTIONS = [
  "new",
  "confirmed",
  "processing",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
] as const;

export const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "Custom"];

export const FALLBACK_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800"><rect width="600" height="800" fill="#F8F0E5"/><rect x="24" y="24" width="552" height="752" fill="none" stroke="#D9BD88" stroke-width="1"/><circle cx="300" cy="360" r="86" fill="none" stroke="#B68A3A" stroke-width="1.2"/><text x="300" y="382" font-family="Georgia, serif" font-size="54" fill="#B68A3A" text-anchor="middle">N</text><text x="300" y="500" font-family="Georgia, serif" font-size="18" letter-spacing="6" fill="#7C6A5B" text-anchor="middle">NOOR UL LIBAS</text></svg>`,
)}`;
