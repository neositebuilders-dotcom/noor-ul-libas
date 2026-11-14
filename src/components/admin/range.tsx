import { cn } from "@/lib/utils";

export const DAY = 24 * 60 * 60 * 1000;

export type Preset = "today" | "7d" | "30d" | "month" | "90d" | "custom";

export function startOfDay(ts: number) {
  const date = new Date(ts);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export function rangeFor(preset: Preset, customFrom: string, customTo: string) {
  const now = Date.now();
  const today = startOfDay(now);
  switch (preset) {
    case "today":
      return { from: today, to: now };
    case "7d":
      return { from: today - 6 * DAY, to: now };
    case "30d":
      return { from: today - 29 * DAY, to: now };
    case "90d":
      return { from: today - 89 * DAY, to: now };
    case "month": {
      const date = new Date(now);
      date.setDate(1);
      date.setHours(0, 0, 0, 0);
      return { from: date.getTime(), to: now };
    }
    default: {
      const fromValue = customFrom ? new Date(customFrom).getTime() : NaN;
      const toValue = customTo
        ? new Date(`${customTo}T23:59:59`).getTime()
        : NaN;
      return {
        from: Number.isFinite(fromValue) ? fromValue : today - 29 * DAY,
        to: Number.isFinite(toValue) ? toValue : now,
      };
    }
  }
}

export function RangeFilter({
  preset,
  setPreset,
  customFrom,
  setCustomFrom,
  customTo,
  setCustomTo,
}: {
  preset: Preset;
  setPreset: (value: Preset) => void;
  customFrom: string;
  setCustomFrom: (value: string) => void;
  customTo: string;
  setCustomTo: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {(
        [
          { key: "today", label: "Today" },
          { key: "7d", label: "7 days" },
          { key: "30d", label: "30 days" },
          { key: "month", label: "This month" },
          { key: "custom", label: "Custom" },
        ] as { key: Preset; label: string }[]
      ).map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => setPreset(item.key)}
          className={cn(
            "border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.1em] transition-colors",
            preset === item.key
              ? "border-espresso bg-espresso text-ivory"
              : "border-border bg-card text-muted-foreground hover:border-foreground",
          )}
        >
          {item.label}
        </button>
      ))}
      {preset === "custom" && (
        <div className="flex items-center gap-1.5">
          <input
            type="date"
            value={customFrom}
            onChange={(event) => setCustomFrom(event.target.value)}
            className="field h-7 w-auto px-2 text-[10px]"
          />
          <span className="text-[10px] text-muted-foreground">to</span>
          <input
            type="date"
            value={customTo}
            onChange={(event) => setCustomTo(event.target.value)}
            className="field h-7 w-auto px-2 text-[10px]"
          />
        </div>
      )}
    </div>
  );
}
