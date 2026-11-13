import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { useMutation } from "convex/react";
import { Loader2, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function NewsletterForm({
  className,
  tone = "light",
}: {
  className?: string;
  tone?: "light" | "dark";
}) {
  const subscribe = useMutation(api.messages.subscribe);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <form
      className={cn("flex flex-col gap-2 sm:flex-row", className)}
      onSubmit={async (event) => {
        event.preventDefault();
        setLoading(true);
        try {
          const result = await subscribe({ email });
          toast.success(
            result.alreadySubscribed
              ? "You are already on the list."
              : "You are on the list — thank you.",
            {
              description: result.alreadySubscribed
                ? "We will keep you posted on new collections."
                : "Look out for new collection notes from Noor ul Libas.",
            },
          );
          setEmail("");
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : "Could not subscribe.",
          );
        } finally {
          setLoading(false);
        }
      }}
    >
      <div className="relative flex-1">
        <Mail
          className={cn(
            "absolute left-3 top-1/2 size-4 -translate-y-1/2",
            tone === "dark" ? "text-ivory/50" : "text-muted-foreground",
          )}
        />
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Your email address"
          aria-label="Email address"
          className={cn(
            "h-11 w-full border pl-9 pr-3 text-sm outline-none transition-colors",
            tone === "dark"
              ? "border-ivory/25 bg-transparent text-ivory placeholder:text-ivory/45 focus:border-gold"
              : "border-input bg-card text-foreground placeholder:text-muted-foreground/70 focus:border-gold",
          )}
        />
      </div>
      <Button
        type="submit"
        disabled={loading}
        className={cn(
          "h-11 rounded-sm px-6 text-[11px] font-semibold uppercase tracking-[0.18em]",
          tone === "dark" && "bg-ivory text-espresso hover:bg-ivory/90",
        )}
      >
        {loading && <Loader2 className="size-3.5 animate-spin" />}
        Subscribe
      </Button>
    </form>
  );
}
