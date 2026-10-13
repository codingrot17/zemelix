import { Badge } from "@/components/ui/badge";

const BragBar = () => (
  <nav
    aria-label="Marketplace highlights"
    className="flex w-full flex-col items-center justify-center gap-3 border-b border-muted-foreground/10 bg-muted px-4 py-4 text-center sm:flex-row sm:gap-4 sm:py-3"
  >
    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground sm:mr-0">
      Zemelix marketplace
    </span>
    <div className="flex w-full flex-wrap items-center justify-center gap-2 sm:w-auto">
      <Badge variant="secondary" className="max-w-full whitespace-normal px-3 py-1.5 text-xs font-semibold sm:text-sm">
        Discover products
      </Badge>
      <Badge variant="secondary" className="px-3 py-1.5 text-sm font-semibold">
        Request services
      </Badge>
      <Badge variant="secondary" className="px-3 py-1.5 text-sm font-semibold">
        Grow your business
      </Badge>
    </div>
  </nav>
);

export default BragBar;
