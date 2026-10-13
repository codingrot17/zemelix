import { Badge } from "@/components/ui/badge";

const BragBar = () => (
  <nav
    aria-label="Marketplace highlights"
    className="w-full bg-muted py-3 flex justify-center items-center border-b border-muted-foreground/10"
  >
    <span className="text-xs text-muted-foreground mr-3 font-medium tracking-wide uppercase">
      Zemelix marketplace
    </span>
    <div className="flex flex-wrap justify-center gap-2 items-center">
      <Badge variant="secondary" className="px-3 py-1.5 text-sm font-semibold">
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
