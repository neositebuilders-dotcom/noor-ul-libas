import { SmartImage } from "@/components/site/primitives";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { ArrowDown, ArrowUp, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ConfirmDelete, ImageField, Panel } from "./shared";

const toDate = (value?: number) =>
  value ? new Date(value).toISOString().slice(0, 10) : "";

export function HomepagePanel() {
  const slides = useQuery(api.site.adminSlides);
  const saveSlide = useMutation(api.site.saveSlide);
  const deleteSlide = useMutation(api.site.deleteSlide);
  const reorderSlides = useMutation(api.site.reorderSlides);
  const announcements = useQuery(api.site.adminAnnouncements);
  const saveAnnouncement = useMutation(api.site.saveAnnouncement);
  const deleteAnnouncement = useMutation(api.site.deleteAnnouncement);
  const settings = useQuery(api.site.getSettings);
  const updateSettings = useMutation(api.site.updateSettings);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState({
    eyebrow: "",
    heading: "",
    subheading: "",
    image: "",
    ctaLabel: "",
    ctaHref: "/shop",
    secondaryLabel: "",
    secondaryHref: "",
    sortOrder: 0,
    isActive: true,
    startsAt: "",
    endsAt: "",
  });

  const [announcementDraft, setAnnouncementDraft] = useState("");
  const [featuredBanner, setFeaturedBanner] = useState({
    eyebrow: "",
    heading: "",
    subheading: "",
    image: "",
    ctaLabel: "",
    ctaHref: "",
    isActive: true,
  });
  const [promoBanner, setPromoBanner] = useState({
    eyebrow: "",
    heading: "",
    subheading: "",
    image: "",
    ctaLabel: "",
    ctaHref: "",
    isActive: true,
  });
  const [gallery, setGallery] = useState<{ image: string; href: string }[]>([]);

  useEffect(() => {
    if (!settings) return;
    if (settings.featuredBanner) setFeaturedBanner(settings.featuredBanner);
    if (settings.promoBanner)
      setPromoBanner({
        eyebrow: settings.promoBanner.eyebrow ?? "",
        heading: settings.promoBanner.heading,
        subheading: settings.promoBanner.subheading,
        image: settings.promoBanner.image,
        ctaLabel: settings.promoBanner.ctaLabel,
        ctaHref: settings.promoBanner.ctaHref,
        isActive: settings.promoBanner.isActive,
      });
    setGallery(settings.socialGallery);
  }, [settings]);

  const openNew = () => {
    setEditing(null);
    setDraft({
      eyebrow: "",
      heading: "",
      subheading: "",
      image: "",
      ctaLabel: "Shop now",
      ctaHref: "/shop",
      secondaryLabel: "",
      secondaryHref: "",
      sortOrder: slides?.length ?? 0,
      isActive: true,
      startsAt: "",
      endsAt: "",
    });
    setOpen(true);
  };

  return (
    <div className="space-y-5">
      <Panel
        title="Hero slider"
        description="The first thing customers see. Images are full-width — upload wide, high-quality photography."
        action={
          <Button onClick={openNew} className="h-9 gap-2 rounded-sm px-4 text-[10px] font-semibold uppercase tracking-[0.14em]">
            <Plus className="size-3.5" /> Add slide
          </Button>
        }
      >
        <div className="space-y-3">
          {(slides ?? []).map((slide, index) => (
            <div
              key={slide._id}
              className="flex flex-col gap-3 border border-border/70 p-3 sm:flex-row sm:items-center"
            >
              <div className="h-20 w-32 shrink-0 overflow-hidden bg-muted">
                <SmartImage src={slide.image} alt="" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-[0.14em] text-gold">
                  {slide.eyebrow}
                </p>
                <p className="font-display text-lg leading-tight">{slide.heading}</p>
                <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
                  {slide.subheading}
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {slide.isActive ? "Visible" : "Hidden"}
                  {slide.startsAt
                    ? ` · from ${new Date(slide.startsAt).toLocaleDateString("en-PK")}`
                    : ""}
                  {slide.endsAt
                    ? ` · until ${new Date(slide.endsAt).toLocaleDateString("en-PK")}`
                    : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={async () => {
                    const ids = (slides ?? []).map((row) => row._id);
                    const next = [...ids];
                    [next[index - 1], next[index]] = [next[index], next[index - 1]];
                    await reorderSlides({ ids: next });
                  }}
                  className="border border-border p-1 disabled:opacity-30"
                  aria-label="Move slide up"
                >
                  <ArrowUp className="size-3" />
                </button>
                <button
                  type="button"
                  disabled={index === (slides?.length ?? 1) - 1}
                  onClick={async () => {
                    const ids = (slides ?? []).map((row) => row._id);
                    const next = [...ids];
                    [next[index + 1], next[index]] = [next[index], next[index + 1]];
                    await reorderSlides({ ids: next });
                  }}
                  className="border border-border p-1 disabled:opacity-30"
                  aria-label="Move slide down"
                >
                  <ArrowDown className="size-3" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(slide._id);
                    setDraft({
                      eyebrow: slide.eyebrow ?? "",
                      heading: slide.heading,
                      subheading: slide.subheading,
                      image: slide.image,
                      ctaLabel: slide.ctaLabel ?? "",
                      ctaHref: slide.ctaHref ?? "",
                      secondaryLabel: slide.secondaryLabel ?? "",
                      secondaryHref: slide.secondaryHref ?? "",
                      sortOrder: slide.sortOrder,
                      isActive: slide.isActive,
                      startsAt: toDate(slide.startsAt),
                      endsAt: toDate(slide.endsAt),
                    });
                    setOpen(true);
                  }}
                  className="flex items-center gap-1 border border-border px-2 py-1 text-[10px] uppercase tracking-[0.1em]"
                >
                  <Pencil className="size-3" /> Edit
                </button>
                <ConfirmDelete onConfirm={() => deleteSlide({ id: slide._id })} />
              </div>
            </div>
          ))}
          {slides && slides.length === 0 && (
            <p className="border border-dashed border-border py-8 text-center text-xs text-muted-foreground">
              No slides — the storefront shows a default hero.
            </p>
          )}
        </div>
      </Panel>

      <Panel
        title="Announcement bar"
        description="Short rotating messages at the very top of the site."
      >
        <div className="flex gap-2">
          <input
            value={announcementDraft}
            onChange={(event) => setAnnouncementDraft(event.target.value)}
            placeholder="New Collection Now Available"
            className="field h-9 text-xs"
          />
          <Button
            onClick={async () => {
              if (!announcementDraft.trim()) return;
              await saveAnnouncement({
                message: announcementDraft.trim(),
                sortOrder: announcements?.length ?? 0,
                isActive: true,
              });
              setAnnouncementDraft("");
              toast.success("Announcement added.");
            }}
            className="h-9 shrink-0 rounded-sm px-4 text-[10px] uppercase tracking-[0.12em]"
          >
            Add
          </Button>
        </div>
        <div className="mt-3 space-y-2">
          {(announcements ?? []).map((announcement) => (
            <div
              key={announcement._id}
              className="flex items-center justify-between gap-2 border border-border/60 px-3 py-2"
            >
              <span className="text-xs">{announcement.message}</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={async () => {
                    await saveAnnouncement({
                      id: announcement._id,
                      message: announcement.message,
                      linkLabel: announcement.linkLabel,
                      linkHref: announcement.linkHref,
                      sortOrder: announcement.sortOrder,
                      isActive: !announcement.isActive,
                    });
                  }}
                  className="text-[9px] uppercase tracking-[0.1em] text-muted-foreground hover:text-espresso"
                >
                  {announcement.isActive ? "Hide" : "Show"}
                </button>
                <button
                  type="button"
                  onClick={() => deleteAnnouncement({ id: announcement._id })}
                  aria-label="Delete announcement"
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel
          title="Featured collection banner"
          description="The split image and text section on the homepage."
        >
          <div className="space-y-3">
            <ImageField
              label="Banner image"
              value={featuredBanner.image}
              onChange={(image) =>
                setFeaturedBanner((current) => ({ ...current, image }))
              }
            />
            <input
              value={featuredBanner.eyebrow}
              onChange={(event) =>
                setFeaturedBanner((current) => ({
                  ...current,
                  eyebrow: event.target.value,
                }))
              }
              placeholder="Eyebrow"
              className="field h-9 text-xs"
            />
            <input
              value={featuredBanner.heading}
              onChange={(event) =>
                setFeaturedBanner((current) => ({
                  ...current,
                  heading: event.target.value,
                }))
              }
              placeholder="Heading"
              className="field h-9 text-xs"
            />
            <textarea
              rows={2}
              value={featuredBanner.subheading}
              onChange={(event) =>
                setFeaturedBanner((current) => ({
                  ...current,
                  subheading: event.target.value,
                }))
              }
              placeholder="Supporting text"
              className="field resize-y text-xs"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                value={featuredBanner.ctaLabel}
                onChange={(event) =>
                  setFeaturedBanner((current) => ({
                    ...current,
                    ctaLabel: event.target.value,
                  }))
                }
                placeholder="Button label"
                className="field h-9 text-xs"
              />
              <input
                value={featuredBanner.ctaHref}
                onChange={(event) =>
                  setFeaturedBanner((current) => ({
                    ...current,
                    ctaHref: event.target.value,
                  }))
                }
                placeholder="/collections/luxury"
                className="field h-9 text-xs"
              />
            </div>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={featuredBanner.isActive}
                onChange={(event) =>
                  setFeaturedBanner((current) => ({
                    ...current,
                    isActive: event.target.checked,
                  }))
                }
                className="size-3.5 accent-[#35251C]"
              />
              Show this section
            </label>
            <Button
              onClick={async () => {
                await updateSettings({ patch: { featuredBanner } });
                toast.success("Featured banner saved.");
              }}
              className="h-9 w-full rounded-sm text-[10px] uppercase tracking-[0.12em]"
            >
              Save featured banner
            </Button>
          </div>
        </Panel>

        <Panel
          title="Promotional banner"
          description="The full-width sale / seasonal banner."
        >
          <div className="space-y-3">
            <ImageField
              label="Banner image"
              value={promoBanner.image}
              onChange={(image) => setPromoBanner((current) => ({ ...current, image }))}
            />
            <input
              value={promoBanner.eyebrow}
              onChange={(event) =>
                setPromoBanner((current) => ({ ...current, eyebrow: event.target.value }))
              }
              placeholder="Eyebrow"
              className="field h-9 text-xs"
            />
            <input
              value={promoBanner.heading}
              onChange={(event) =>
                setPromoBanner((current) => ({ ...current, heading: event.target.value }))
              }
              placeholder="Heading"
              className="field h-9 text-xs"
            />
            <textarea
              rows={2}
              value={promoBanner.subheading}
              onChange={(event) =>
                setPromoBanner((current) => ({
                  ...current,
                  subheading: event.target.value,
                }))
              }
              placeholder="Supporting text"
              className="field resize-y text-xs"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                value={promoBanner.ctaLabel}
                onChange={(event) =>
                  setPromoBanner((current) => ({
                    ...current,
                    ctaLabel: event.target.value,
                  }))
                }
                placeholder="Button label"
                className="field h-9 text-xs"
              />
              <input
                value={promoBanner.ctaHref}
                onChange={(event) =>
                  setPromoBanner((current) => ({
                    ...current,
                    ctaHref: event.target.value,
                  }))
                }
                placeholder="/collections/festive"
                className="field h-9 text-xs"
              />
            </div>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={promoBanner.isActive}
                onChange={(event) =>
                  setPromoBanner((current) => ({
                    ...current,
                    isActive: event.target.checked,
                  }))
                }
                className="size-3.5 accent-[#35251C]"
              />
              Show this section
            </label>
            <Button
              onClick={async () => {
                await updateSettings({ patch: { promoBanner } });
                toast.success("Promotional banner saved.");
              }}
              className="h-9 w-full rounded-sm text-[10px] uppercase tracking-[0.12em]"
            >
              Save promotional banner
            </Button>
          </div>
        </Panel>
      </div>

      <Panel
        title="Instagram gallery"
        description="Images shown in the social section on the homepage."
      >
        <div className="space-y-2">
          {gallery.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="h-12 w-12 shrink-0 overflow-hidden bg-muted">
                <SmartImage src={item.image} alt="" />
              </div>
              <input
                value={item.image}
                onChange={(event) =>
                  setGallery((current) =>
                    current.map((row, i) =>
                      i === index ? { ...row, image: event.target.value } : row,
                    ),
                  )
                }
                placeholder="Image URL"
                className="field h-8 flex-1 text-xs"
              />
              <input
                value={item.href}
                onChange={(event) =>
                  setGallery((current) =>
                    current.map((row, i) =>
                      i === index ? { ...row, href: event.target.value } : row,
                    ),
                  )
                }
                placeholder="Link"
                className="field h-8 w-40 text-xs"
              />
              <button
                type="button"
                onClick={() => setGallery((current) => current.filter((_, i) => i !== index))}
                aria-label="Remove image"
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() =>
              setGallery((current) => [
                ...current,
                { image: "", href: settings?.instagram ?? "" },
              ])
            }
            className="h-8 rounded-sm px-3 text-[10px] uppercase tracking-[0.12em]"
          >
            <Plus className="size-3" /> Add image
          </Button>
          <Button
            onClick={async () => {
              await updateSettings({
                patch: {
                  socialGallery: gallery.filter((item) => item.image.trim()),
                },
              });
              toast.success("Gallery saved.");
            }}
            className="h-8 rounded-sm px-4 text-[10px] uppercase tracking-[0.12em]"
          >
            Save gallery
          </Button>
        </div>
      </Panel>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              {editing ? "Edit slide" : "New slide"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <ImageField
                label="Slide image"
                value={draft.image}
                onChange={(image) => setDraft((current) => ({ ...current, image }))}
                aspect="aspect-[16/9]"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Eyebrow
              </label>
              <input
                value={draft.eyebrow}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, eyebrow: event.target.value }))
                }
                className="field mt-1.5"
                placeholder="New season"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Order
              </label>
              <input
                type="number"
                value={draft.sortOrder}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    sortOrder: Number(event.target.value),
                  }))
                }
                className="field mt-1.5"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Heading
              </label>
              <input
                value={draft.heading}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, heading: event.target.value }))
                }
                className="field mt-1.5"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Supporting text
              </label>
              <textarea
                rows={3}
                value={draft.subheading}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, subheading: event.target.value }))
                }
                className="field mt-1.5 resize-y"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Button label
              </label>
              <input
                value={draft.ctaLabel}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, ctaLabel: event.target.value }))
                }
                className="field mt-1.5"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Button link
              </label>
              <input
                value={draft.ctaHref}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, ctaHref: event.target.value }))
                }
                className="field mt-1.5"
                placeholder="/new-arrivals"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Second button label
              </label>
              <input
                value={draft.secondaryLabel}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    secondaryLabel: event.target.value,
                  }))
                }
                className="field mt-1.5"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Second button link
              </label>
              <input
                value={draft.secondaryHref}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    secondaryHref: event.target.value,
                  }))
                }
                className="field mt-1.5"
                placeholder="/collections/featured"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Schedule start (optional)
              </label>
              <input
                type="date"
                value={draft.startsAt}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, startsAt: event.target.value }))
                }
                className="field mt-1.5"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Schedule end (optional)
              </label>
              <input
                type="date"
                value={draft.endsAt}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, endsAt: event.target.value }))
                }
                className="field mt-1.5"
              />
            </div>
            <label className="flex items-center gap-2 text-xs sm:col-span-2">
              <input
                type="checkbox"
                checked={draft.isActive}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    isActive: event.target.checked,
                  }))
                }
                className="size-3.5 accent-[#35251C]"
              />
              Slide is enabled
            </label>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              className="h-10 rounded-sm text-[10px] uppercase tracking-[0.14em]"
            >
              Cancel
            </Button>
            <Button
              disabled={saving}
              onClick={async () => {
                setSaving(true);
                try {
                  await saveSlide({
                    ...(editing ? { id: editing as Id<"heroSlides"> } : {}),
                    eyebrow: draft.eyebrow || undefined,
                    heading: draft.heading,
                    subheading: draft.subheading,
                    image: draft.image,
                    ctaLabel: draft.ctaLabel || undefined,
                    ctaHref: draft.ctaHref || undefined,
                    secondaryLabel: draft.secondaryLabel || undefined,
                    secondaryHref: draft.secondaryHref || undefined,
                    sortOrder: draft.sortOrder,
                    isActive: draft.isActive,
                    startsAt: draft.startsAt
                      ? new Date(draft.startsAt).getTime()
                      : null,
                    endsAt: draft.endsAt
                      ? new Date(`${draft.endsAt}T23:59:59`).getTime()
                      : null,
                  });
                  toast.success("Slide saved.");
                  setOpen(false);
                } catch (error) {
                  toast.error(
                    error instanceof Error ? error.message : "Could not save slide.",
                  );
                } finally {
                  setSaving(false);
                }
              }}
              className="h-10 rounded-sm px-6 text-[10px] uppercase tracking-[0.14em]"
            >
              {saving && <Loader2 className="size-3.5 animate-spin" />} Save slide
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
