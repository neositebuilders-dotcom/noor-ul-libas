import { api } from "@/convex/_generated/api";
import { whatsappLink } from "@/lib/format";
import { useQuery } from "convex/react";
import {
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { Link } from "react-router";

const shopLinks = [
  { label: "Shop all", href: "/shop" },
  { label: "New arrivals", href: "/new-arrivals" },
  { label: "Best sellers", href: "/best-sellers" },
  { label: "Unstitched", href: "/collections/unstitched" },
  { label: "Ready-to-wear", href: "/collections/ready-to-wear" },
  { label: "Luxury & festive", href: "/collections/luxury" },
  { label: "Sale", href: "/sale" },
];

const helpLinks = [
  { label: "FAQs", href: "/faqs" },
  { label: "Order tracking", href: "/track-order" },
  { label: "Shipping & delivery", href: "/shipping" },
  { label: "Returns & exchanges", href: "/returns" },
  { label: "Contact us", href: "/contact" },
];

const companyLinks = [
  { label: "About us", href: "/about" },
  { label: "Privacy policy", href: "/privacy" },
  { label: "Terms & conditions", href: "/terms" },
];

export function Footer() {
  const settings = useQuery(api.site.getSettings);
  const storeName = settings?.storeName ?? "Noor ul Libas";
  const whatsappNumber = settings?.whatsapp ?? "+923213315854";

  return (
    <footer className="mt-20 border-t border-border/70 bg-espresso text-ivory">
      <div className="container-editorial grid gap-12 py-14 lg:grid-cols-[1.4fr_0.8fr_0.8fr_0.9fr_1.1fr] lg:gap-8">
        <div>
          <p className="font-display text-2xl tracking-[0.18em]">{storeName.toUpperCase()}</p>
          <p className="mt-4 max-w-xs text-xs leading-6 text-ivory/65">
            {settings?.tagline ??
              "Timeless Pakistani elegance, tailored for every moment."}
          </p>
          <div className="mt-6 flex items-center gap-3">
            {settings?.instagram && (
              <a
                href={settings.instagram}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="flex size-9 items-center justify-center border border-ivory/20 text-ivory/70 transition-colors hover:border-gold hover:text-gold"
              >
                <Instagram className="size-4" />
              </a>
            )}
            {settings?.facebook && (
              <a
                href={settings.facebook}
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="flex size-9 items-center justify-center border border-ivory/20 text-ivory/70 transition-colors hover:border-gold hover:text-gold"
              >
                <Facebook className="size-4" />
              </a>
            )}
            <a
              href={whatsappLink(whatsappNumber)}
              target="_blank"
              rel="noreferrer"
              className="flex h-9 items-center gap-2 border border-ivory/20 px-3 text-[10px] uppercase tracking-[0.16em] text-ivory/70 transition-colors hover:border-gold hover:text-gold"
            >
              WhatsApp
            </a>
          </div>
        </div>

        <div>
          <p className="eyebrow text-[9px] text-ivory/45">Shop</p>
          <ul className="mt-4 space-y-2.5">
            {shopLinks.map((link) => (
              <li key={link.href}>
                <Link
                  to={link.href}
                  className="text-xs text-ivory/70 transition-colors hover:text-gold"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow text-[9px] text-ivory/45">Customer care</p>
          <ul className="mt-4 space-y-2.5">
            {helpLinks.map((link) => (
              <li key={link.href}>
                <Link
                  to={link.href}
                  className="text-xs text-ivory/70 transition-colors hover:text-gold"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow text-[9px] text-ivory/45">Company</p>
          <ul className="mt-4 space-y-2.5">
            {companyLinks.map((link) => (
              <li key={link.href}>
                <Link
                  to={link.href}
                  className="text-xs text-ivory/70 transition-colors hover:text-gold"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/account"
                className="text-xs text-ivory/70 transition-colors hover:text-gold"
              >
                My account
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="eyebrow text-[9px] text-ivory/45">Get in touch</p>
          <ul className="mt-4 space-y-3 text-xs text-ivory/70">
            <li>
              <a
                href={`mailto:${settings?.email ?? "rq984690@gmail.com"}`}
                className="flex items-start gap-2.5 transition-colors hover:text-gold"
              >
                <Mail className="mt-0.5 size-3.5 shrink-0 text-gold" />
                {settings?.email ?? "rq984690@gmail.com"}
              </a>
            </li>
            <li>
              <a
                href={`tel:${(settings?.phone ?? "0321 3315854").replace(/\s/g, "")}`}
                className="flex items-start gap-2.5 transition-colors hover:text-gold"
              >
                <Phone className="mt-0.5 size-3.5 shrink-0 text-gold" />
                {settings?.phone ?? "0321 3315854"}
              </a>
            </li>
            <li>
              <a
                href={whatsappLink(whatsappNumber, "Salam! I have a question about your collection.")}
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-2.5 transition-colors hover:text-gold"
              >
                <Phone className="mt-0.5 size-3.5 shrink-0 text-gold" />
                WhatsApp: {whatsappNumber}
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 size-3.5 shrink-0 text-gold" />
              {settings?.address ?? "Lahore, Pakistan"}
            </li>
          </ul>
          <div className="mt-5 flex flex-col gap-2 border-t border-ivory/10 pt-4 text-[10px] text-ivory/55">
            <span className="flex items-center gap-2">
              <Truck className="size-3.5 text-gold" /> Delivery across Pakistan
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck className="size-3.5 text-gold" /> Cash on delivery available
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-ivory/10">
        <div className="container-editorial flex flex-col gap-3 py-5 text-[10px] uppercase tracking-[0.16em] text-ivory/45 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {storeName}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <span>Cash on delivery</span>
            <span>Bank transfer</span>
            <Link to="/privacy" className="hover:text-gold">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-gold">
              Terms
            </Link>
            <Link to="/admin" className="hover:text-gold">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
