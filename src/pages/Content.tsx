import { NewsletterForm } from "@/components/site/NewsletterForm";
import { SectionHeading, SmartImage } from "@/components/site/primitives";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { api } from "@/convex/_generated/api";
import { whatsappLink } from "@/lib/format";
import { usePageMeta } from "@/lib/seo";
import { useMutation, useQuery } from "convex/react";
import {
  ArrowRight,
  Check,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Scissors,
  Sparkles,
  Truck,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";

export function AboutPage() {
  const settings = useQuery(api.site.getSettings);
  const categories = useQuery(api.categories.list);

  usePageMeta({
    title: "About Noor ul Libas — Pakistani women's clothing",
    description:
      "Noor ul Libas is a Pakistani women's clothing label working in lawn, cotton, chiffon, organza and linen. Read how we design, finish and ship every piece.",
    image: categories?.[6]?.image,
  });

  return (
    <div>
      <div className="border-b border-border/70 bg-secondary/50">
        <div className="container-editorial grid items-center gap-8 py-12 lg:grid-cols-2 lg:gap-16 lg:py-20">
          <div>
            <p className="eyebrow">Our story</p>
            <h1 className="mt-4 text-4xl leading-[1.03] sm:text-5xl lg:text-[3.6rem]">
              Quiet elegance, made for Pakistani women
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-7 text-muted-foreground">
              {settings?.aboutText ??
                "Noor ul Libas designs unstitched fabrics and ready-to-wear suits for the way women in Pakistan actually dress — considered, comfortable and quietly beautiful."}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild className="h-11 rounded-sm px-6 text-[10px] uppercase tracking-[0.18em]">
                <Link to="/shop">
                  Shop the collection <ArrowRight className="size-3.5" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-11 rounded-sm px-6 text-[10px] uppercase tracking-[0.18em]">
                <Link to="/contact">Talk to us</Link>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="aspect-[3/4] overflow-hidden bg-[#f3ece1]">
              <SmartImage
                src={categories?.[4]?.image ?? categories?.[0]?.image}
                alt="Noor ul Libas lawn collection"
                priority
              />
            </div>
            <div className="mt-8 aspect-[3/4] overflow-hidden bg-[#f3ece1]">
              <SmartImage
                src={categories?.[6]?.image ?? categories?.[1]?.image}
                alt="Noor ul Libas luxury collection"
              />
            </div>
          </div>
        </div>
      </div>

      <section className="container-editorial py-14 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <p className="eyebrow">What we do</p>
            <h2 className="mt-3 text-3xl leading-tight sm:text-4xl">
              Fabric first, trend second
            </h2>
          </div>
          <div className="space-y-4 text-sm leading-7 text-muted-foreground">
            <p>
              We start with fabric. Lawn that breathes in June, chiffon that moves
              properly, organza stiff enough to hold a dupatta, linen that softens with
              every wash. Only then do we decide on embroidery, print and silhouette.
            </p>
            <p>
              Every unstitched set lists exactly what is included — shirt, trouser,
              dupatta, shawl — with the meterage. Every ready-to-wear piece is cut in
              standard sizes, checked on a form and finished by hand before it is packed.
            </p>
            <p>
              We are based in Lahore and ship across Pakistan. If you are unsure about a
              size, a colour or whether a fabric will suit the occasion, message us on
              WhatsApp — you will be speaking to the same team that packs your parcel.
            </p>
          </div>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden border border-border/70 bg-border/70 sm:grid-cols-2 lg:grid-cols-4">
          {(settings?.whyChoose ?? []).map((item, index) => (
            <div key={item.title} className="bg-card p-6">
              <p className="font-display text-2xl text-gold/60">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-4 font-display text-xl">{item.title}</h3>
              <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border/70 bg-secondary/40">
        <div className="container-editorial grid gap-6 py-12 sm:grid-cols-3">
          {[
            {
              icon: Sparkles,
              title: "Designed in Lahore",
              copy: "Our studio designs, checks and packs every piece.",
            },
            {
              icon: Scissors,
              title: "Unstitched & stitched",
              copy: "Choose fabric to tailor, or a finished suit in your size.",
            },
            {
              icon: Truck,
              title: "Nationwide delivery",
              copy: "Cash on delivery to every city in Pakistan.",
            },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3">
              <item.icon className="mt-0.5 size-4 shrink-0 text-gold" />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">
                  {item.title}
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.copy}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-editorial py-14 text-center">
        <h2 className="text-3xl sm:text-4xl">Come and see what is new</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
          New pieces are added to the studio every week, in small runs.
        </p>
        <Button asChild className="mt-6 h-11 rounded-sm px-7 text-[10px] uppercase tracking-[0.18em]">
          <Link to="/new-arrivals">Shop new arrivals</Link>
        </Button>
      </section>
    </div>
  );
}

export function ContactPage() {
  const settings = useQuery(api.site.getSettings);
  const sendMessage = useMutation(api.messages.send);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  usePageMeta({
    title: "Contact Noor ul Libas",
    description:
      "Contact Noor ul Libas by WhatsApp on 0321 3315854, by phone, or email rq984690@gmail.com.",
  });

  const whatsappNumber = settings?.whatsapp ?? "+923213315854";

  return (
    <div className="container-editorial py-12 sm:py-16">
      <div className="max-w-2xl">
        <p className="eyebrow">Contact</p>
        <h1 className="mt-4 text-4xl leading-tight sm:text-5xl">
          We are here to help
        </h1>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          Questions about sizing, fabric, an existing order or a custom request? Send a
          message below or WhatsApp us — we reply between 10am and 8pm, Monday to
          Saturday.
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
        <div className="border border-border/70 bg-card p-6 sm:p-8">
          {sent ? (
            <div className="flex flex-col items-start gap-3 py-8">
              <span className="flex size-10 items-center justify-center rounded-full bg-emerald-50">
                <Check className="size-4 text-emerald-700" />
              </span>
              <h2 className="text-2xl">Message received</h2>
              <p className="max-w-md text-sm leading-6 text-muted-foreground">
                Thank you for writing. Our team will reply to {form.email} as soon as we
                can. For anything urgent, WhatsApp is the fastest way to reach us.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button asChild variant="outline" className="h-10 rounded-sm px-5 text-[10px] uppercase tracking-[0.16em]">
                  <a
                    href={whatsappLink(
                      whatsappNumber,
                      "Salam! I just sent a message through your website.",
                    )}
                    target="_blank"
                    rel="noreferrer"
                  >
                    WhatsApp us
                  </a>
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSent(false);
                    setForm({ name: "", email: "", phone: "", subject: "", message: "" });
                  }}
                  className="h-10 rounded-sm text-[10px] uppercase tracking-[0.16em]"
                >
                  Send another message
                </Button>
              </div>
            </div>
          ) : (
            <form
              className="grid gap-4 sm:grid-cols-2"
              onSubmit={async (event) => {
                event.preventDefault();
                setLoading(true);
                try {
                  await sendMessage({
                    name: form.name,
                    email: form.email,
                    phone: form.phone || undefined,
                    subject: form.subject,
                    message: form.message,
                  });
                  setSent(true);
                  toast.success("Thank you — your message has been sent.");
                } catch (error) {
                  toast.error(
                    error instanceof Error ? error.message : "Could not send message.",
                  );
                } finally {
                  setLoading(false);
                }
              }}
            >
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Your name *
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, name: event.target.value }))
                  }
                  className="field mt-1.5"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Email address *
                </label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, email: event.target.value }))
                  }
                  className="field mt-1.5"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Phone / WhatsApp
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, phone: event.target.value }))
                  }
                  className="field mt-1.5"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Subject
                </label>
                <input
                  value={form.subject}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, subject: event.target.value }))
                  }
                  className="field mt-1.5"
                  placeholder="Size help, order query…"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Message *
                </label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, message: event.target.value }))
                  }
                  className="field mt-1.5 resize-y"
                />
              </div>
              <div className="sm:col-span-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-11 w-full gap-2 rounded-sm text-[10px] font-semibold uppercase tracking-[0.18em] sm:w-auto sm:px-7"
                >
                  {loading ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Mail className="size-3.5" />
                  )}
                  Send message
                </Button>
                <p className="mt-3 text-[11px] leading-5 text-muted-foreground">
                  We use your details only to reply to this message.
                </p>
              </div>
            </form>
          )}
        </div>

        <aside className="space-y-3">
          <div className="border border-border/70 bg-secondary/40 p-6">
            <p className="eyebrow">Noor ul Libas</p>
            <h2 className="mt-2 font-display text-2xl">Reach us directly</h2>
            <ul className="mt-5 space-y-4 text-sm">
              <li>
                <a
                  href={`mailto:${settings?.email ?? "rq984690@gmail.com"}`}
                  className="flex items-start gap-3 text-muted-foreground hover:text-gold"
                >
                  <Mail className="mt-0.5 size-4 shrink-0 text-gold" />
                  <span>
                    <span className="block text-[10px] uppercase tracking-[0.14em] text-muted-foreground/80">
                      Email
                    </span>
                    {settings?.email ?? "rq984690@gmail.com"}
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={`tel:${(settings?.phone ?? "0321 3315854").replace(/\s/g, "")}`}
                  className="flex items-start gap-3 text-muted-foreground hover:text-gold"
                >
                  <Phone className="mt-0.5 size-4 shrink-0 text-gold" />
                  <span>
                    <span className="block text-[10px] uppercase tracking-[0.14em] text-muted-foreground/80">
                      Phone
                    </span>
                    {settings?.phone ?? "0321 3315854"}
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={whatsappLink(
                    whatsappNumber,
                    "Salam! I'd like to ask about a piece from Noor ul Libas.",
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start gap-3 text-muted-foreground hover:text-gold"
                >
                  <MessageCircle className="mt-0.5 size-4 shrink-0 text-gold" />
                  <span>
                    <span className="block text-[10px] uppercase tracking-[0.14em] text-muted-foreground/80">
                      WhatsApp
                    </span>
                    {whatsappNumber}
                  </span>
                </a>
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <MapPin className="mt-0.5 size-4 shrink-0 text-gold" />
                <span>
                  <span className="block text-[10px] uppercase tracking-[0.14em] text-muted-foreground/80">
                    Studio
                  </span>
                  {settings?.address ?? "Lahore, Pakistan"}
                </span>
              </li>
            </ul>
          </div>
          <div className="border border-border/70 bg-card p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">
              Opening hours
            </p>
            <p className="mt-2 text-xs leading-6 text-muted-foreground">
              Monday – Saturday, 10am – 8pm (PKT). Messages sent outside these hours are
              answered the next working day.
            </p>
            <p className="mt-3 text-xs leading-6 text-muted-foreground">
              For order-related queries, please include your order number starting with
              <span className="font-medium text-foreground"> NL-</span>.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

export function FaqsPage() {
  const settings = useQuery(api.site.getSettings);
  usePageMeta({
    title: "FAQs — Noor ul Libas",
    description:
      "Answers about delivery, cash on delivery, sizing, fabric, exchanges and stitching for Noor ul Libas orders.",
  });

  return (
    <div className="container-editorial py-12 sm:py-16">
      <div className="max-w-2xl">
        <p className="eyebrow">Help centre</p>
        <h1 className="mt-4 text-4xl leading-tight sm:text-5xl">
          Frequently asked questions
        </h1>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          Everything customers usually ask before ordering. If your question is not here,
          WhatsApp us on {settings?.phone ?? "0321 3315854"}.
        </p>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.3fr_0.7fr]">
        <Accordion type="single" collapsible className="border-t border-border/70">
          {(settings?.faqs ?? []).map((faq, index) => (
            <AccordionItem key={faq.question} value={`faq-${index}`}>
              <AccordionTrigger className="py-5 text-left font-display text-xl hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-sm leading-7 text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <aside className="h-fit space-y-3">
          <div className="border border-border/70 bg-secondary/40 p-6">
            <h2 className="font-display text-2xl">Still unsure?</h2>
            <p className="mt-2 text-xs leading-6 text-muted-foreground">
              Send us the product name and your usual size. We will tell you honestly
              which size to take.
            </p>
            <Button
              asChild
              className="mt-4 h-10 w-full gap-2 rounded-sm text-[10px] uppercase tracking-[0.16em]"
            >
              <a
                href={whatsappLink(
                  settings?.whatsapp ?? "+923213315854",
                  "Salam! I need help choosing a size.",
                )}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle className="size-3.5" /> WhatsApp us
              </a>
            </Button>
          </div>
          <div className="border border-border/70 bg-card p-6 text-xs">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Useful pages
            </p>
            <div className="mt-3 flex flex-col gap-2">
              {[
                { label: "Shipping & delivery", href: "/shipping" },
                { label: "Returns & exchanges", href: "/returns" },
                { label: "Order tracking", href: "/track-order" },
                { label: "Contact us", href: "/contact" },
              ].map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-muted-foreground hover:text-gold"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

const POLICY_META = {
  shipping: {
    title: "Shipping & Delivery Policy",
    eyebrow: "Delivery",
    field: "policyShipping" as const,
    description:
      "Delivery times, charges, cash on delivery and what happens if a courier attempt fails.",
  },
  returns: {
    title: "Return & Exchange Policy",
    eyebrow: "Exchanges",
    field: "policyReturns" as const,
    description:
      "How to exchange an item, what qualifies, and how refunds are handled.",
  },
  privacy: {
    title: "Privacy Policy",
    eyebrow: "Privacy",
    field: "policyPrivacy" as const,
    description:
      "What information we collect, how we use it and how to ask us to delete it.",
  },
  terms: {
    title: "Terms & Conditions",
    eyebrow: "Terms",
    field: "policyTerms" as const,
    description:
      "The terms that apply when you order from Noor ul Libas.",
  },
};

export function PolicyPage({ kind }: { kind: keyof typeof POLICY_META }) {
  const settings = useQuery(api.site.getSettings);
  const meta = POLICY_META[kind];
  const body = settings?.[meta.field] ?? "";

  usePageMeta({
    title: `${meta.title} — Noor ul Libas`,
    description: meta.description,
  });

  return (
    <div className="container-editorial py-12 sm:py-16">
      <div className="grid gap-10 lg:grid-cols-[240px_1fr] lg:gap-16">
        <aside className="lg:sticky lg:top-32 lg:self-start">
          <p className="eyebrow">Policies</p>
          <nav className="mt-4 flex flex-col gap-2 border-t border-border/70 pt-4 text-sm">
            {(Object.keys(POLICY_META) as (keyof typeof POLICY_META)[]).map((key) => (
              <Link
                key={key}
                to={`/${key === "shipping" ? "shipping" : key}`}
                className={
                  key === kind
                    ? "font-medium text-espresso"
                    : "text-muted-foreground hover:text-gold"
                }
              >
                {POLICY_META[key].title}
              </Link>
            ))}
          </nav>
          <div className="mt-6 border border-border/70 bg-secondary/40 p-4 text-xs leading-6 text-muted-foreground">
            Questions about a specific order?{" "}
            <Link to="/contact" className="text-espresso underline underline-offset-2">
              Contact us
            </Link>
            .
          </div>
        </aside>

        <article className="max-w-2xl">
          <p className="eyebrow">{meta.eyebrow}</p>
          <h1 className="mt-4 text-4xl leading-tight sm:text-5xl">{meta.title}</h1>
          <div className="mt-6 space-y-4 text-sm leading-7 text-muted-foreground">
            {body.split(/\n{2,}/).map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
          <p className="mt-8 border-t border-border/70 pt-4 text-[11px] leading-5 text-muted-foreground">
            This policy applies to orders placed on this website. For anything unclear,
            email{" "}
            <a
              href={`mailto:${settings?.email ?? "rq984690@gmail.com"}`}
              className="text-espresso underline underline-offset-2"
            >
              {settings?.email ?? "rq984690@gmail.com"}
            </a>{" "}
            or WhatsApp {settings?.phone ?? "0321 3315854"}.
          </p>
        </article>
      </div>

      <div className="mt-16 border-t border-border/70 pt-10">
        <SectionHeading
          eyebrow="Stay close"
          title="New collections, quietly delivered"
        />
        <div className="mt-5 max-w-lg">
          <NewsletterForm />
        </div>
      </div>
    </div>
  );
}
