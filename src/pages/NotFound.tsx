import { Button } from "@/components/ui/button";
import { usePageMeta } from "@/lib/seo";
import { Link } from "react-router";

export default function NotFound() {
  usePageMeta({
    title: "Page not found — Noor ul Libas",
    description: "The page you were looking for could not be found.",
  });

  return (
    <div className="container-editorial flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-4 text-5xl leading-tight">This page has moved on</h1>
      <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">
        The page you were looking for is not here. The collection, however, is only a
        click away.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Button asChild className="h-11 rounded-sm px-6 text-[10px] uppercase tracking-[0.18em]">
          <Link to="/shop">Shop the collection</Link>
        </Button>
        <Button asChild variant="outline" className="h-11 rounded-sm px-6 text-[10px] uppercase tracking-[0.18em]">
          <Link to="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
}
