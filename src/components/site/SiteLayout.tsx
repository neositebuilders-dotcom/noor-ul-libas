import { api } from "@/convex/_generated/api";
import { whatsappLink } from "@/lib/format";
import { ShopProvider } from "@/lib/shop";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router";
import { Footer } from "./Footer";
import { Header } from "./Header";

function WhatsAppFab() {
  const settings = useQuery(api.site.getSettings);
  const number = settings?.whatsapp ?? "+923213315854";
  return (
    <a
      href={whatsappLink(
        number,
        "Salam! I'd like to ask about a piece from Noor ul Libas.",
      )}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with Noor ul Libas on WhatsApp"
      className="group fixed bottom-5 right-4 z-40 flex items-center gap-2 rounded-full bg-[#1FA855] py-3 pl-3 pr-4 text-white shadow-[0_12px_30px_-8px_rgba(31,168,85,0.55)] transition-transform hover:scale-[1.03] sm:bottom-7 sm:right-7"
    >
      <svg viewBox="0 0 24 24" className="size-5 fill-current" aria-hidden>
        <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.76-1.66-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.06 2.87 1.21 3.07c.15.2 2.09 3.2 5.07 4.37.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2-1.42.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35Z" />
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.91A9.85 9.85 0 0 0 19.04 5a9.9 9.9 0 0 0-7-3Zm0 18.05h-.01a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.11.82.83-3.04-.2-.31a8.18 8.18 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.24-8.23a8.2 8.2 0 0 1 8.22 8.24c0 4.54-3.7 8.22-8.23 8.22Z" />
      </svg>
      <span className="hidden text-[11px] font-semibold uppercase tracking-[0.14em] sm:inline">
        WhatsApp us
      </span>
    </a>
  );
}

export function SiteLayout() {
  const announcements = useQuery(api.site.announcements);
  const settings = useQuery(api.site.getSettings);
  const ensureSeeded = useMutation(api.seed.ensureSeeded);
  const seeded = useRef(false);
  const location = useLocation();

  useEffect(() => {
    if (seeded.current) return;
    seeded.current = true;
    if (sessionStorage.getItem("noor-seeded") === "1") return;
    ensureSeeded()
      .then(() => sessionStorage.setItem("noor-seeded", "1"))
      .catch(() => {
        /* catalog might already exist or the network is offline */
      });
  }, [ensureSeeded]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [location.pathname]);

  const messages =
    announcements && announcements.length > 0
      ? announcements.map((item) => item.message)
      : settings?.announcementBar ?? [];

  return (
    <ShopProvider>
      <div className="flex min-h-screen flex-col">
        <Header announcementMessages={messages} />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
        <WhatsAppFab />
      </div>
    </ShopProvider>
  );
}
