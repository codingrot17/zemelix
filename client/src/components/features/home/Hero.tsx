import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/useProducts";

const categories = [
  { name: "Hairdressing", category: "beauty-hair-service", type: "service", icon: "💇‍♀️" },
  { name: "Web Development", category: "tech-web", type: "service", icon: "💻" },
  { name: "Home & Living", category: "home-living", type: "product", icon: "🏠" },
];

const promotions = [
  { title: "Find something useful", desc: "Browse real products from independent sellers.", action: "Shop products", to: "/collections?view=products", color: "bg-gradient-to-r from-green-100 to-green-300 text-green-950 dark:from-green-900 dark:to-green-700 dark:text-green-100" },
  { title: "Find the right service", desc: "Explore service providers and send a booking request.", action: "Find a service", to: "/collections?view=products&type=service", color: "bg-gradient-to-r from-blue-100 to-blue-300 text-blue-950 dark:from-blue-900 dark:to-blue-700 dark:text-blue-100" },
  { title: "Bring your business to Zemelix", desc: "Create a vendor profile and publish your first listing.", action: "Become a vendor", to: "/vendor/upgrade", color: "bg-gradient-to-r from-yellow-100 to-yellow-300 text-yellow-950 dark:from-yellow-900 dark:to-yellow-700 dark:text-yellow-100" },
];

const discoveryCategories = [
  { label: "Home & Living", id: "home-living", type: "product" },
  { label: "Beauty & Personal Care", id: "beauty-skincare", type: "product" },
  { label: "Digital Products", id: "digital-software", type: "product" },
  { label: "Web Development", id: "tech-web", type: "service" },
];

function SpinToDiscover({ onBrowse }: { onBrowse: (category: string, type: string) => void }) {
  const [result, setResult] = useState<(typeof discoveryCategories)[number] | null>(null);
  const [spinning, setSpinning] = useState(false);

  function spin() {
    if (spinning) return;
    setSpinning(true);
    window.setTimeout(() => {
      setResult(discoveryCategories[Math.floor(Math.random() * discoveryCategories.length)]);
      setSpinning(false);
    }, 500);
  }

  return (
    <div className="mt-4 w-full rounded-xl border border-muted bg-card px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-primary">🎉 Spin to discover</p>
          <p className="text-xs text-muted-foreground">Get a random category idea.</p>
        </div>
        <Button type="button" variant="outline" onClick={spin} disabled={spinning} aria-live="polite">
          {spinning ? "Picking…" : result ? "Spin again" : "Surprise me"}
        </Button>
      </div>
      {result && <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted/50 p-3">
        <p className="text-sm font-medium">Your pick: {result.label}</p>
        <Button type="button" size="sm" onClick={() => onBrowse(result.id, result.type)}>Browse this category</Button>
      </div>}
    </div>
  );
}

export default function HeroSection() {
  const navigate = useNavigate();
  const [promoIdx, setPromoIdx] = useState(0);
  const [search, setSearch] = useState("");
  const { products, loading, error, refetch } = useProducts({ limit: 50, activeOnly: true });

  function searchListings(event: FormEvent) {
    event.preventDefault();
    const query = search.trim();
    navigate(query ? `/collections?search=${encodeURIComponent(query)}&view=products` : "/collections?view=products");
  }

  function browseCategory(category: string, type = "product") {
    const params = new URLSearchParams({ view: "products" });
    if (category) params.set("category", category);
    if (type === "service") params.set("type", "service");
    navigate(`/collections?${params.toString()}`);
  }

  const latestListing = products[0];
  const activePromo = promotions[promoIdx];

  return (
    <section className="relative mx-auto flex max-w-7xl flex-col items-center gap-6 bg-background px-4 py-8 transition-colors sm:px-6 sm:py-12 md:flex-row md:gap-10">
      <div className="flex w-full flex-1 flex-col items-start">
        <p className="mb-3 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">Your local and digital marketplace</p>
        <h1 className="mb-3 text-3xl font-bold leading-tight text-primary sm:text-4xl md:text-5xl">Find products. Book services. Grow your business.</h1>
        <p className="mb-5 max-w-xl text-base text-muted-foreground sm:text-lg">Discover useful products, book trusted services, or bring your own business to Zemelix.</p>

        <div className="mb-4 flex w-full flex-col gap-2 sm:flex-row">
          <Button size="lg" onClick={() => navigate("/collections?view=products")} className="w-full bg-indigo-600 text-white hover:bg-indigo-700 sm:w-auto">Shop products</Button>
          <Button size="lg" variant="outline" onClick={() => navigate("/collections?view=products&type=service")} className="w-full sm:w-auto">Find a service</Button>
        </div>

        <form onSubmit={searchListings} className="mb-3 flex w-full flex-col gap-2 sm:flex-row">
          <input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search products or services…" aria-label="Search products or services" className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:border-gray-700 dark:bg-gray-900" />
          <Button type="submit" className="w-full bg-indigo-600 text-white hover:bg-indigo-700 sm:w-auto">Search</Button>
        </form>

        <div className="mb-4 flex flex-wrap gap-2" aria-label="Popular categories">
          {categories.map(category => <Button key={category.name} type="button" variant="outline" size="sm" onClick={() => browseCategory(category.category, category.type)} className="rounded-full">
            <span aria-hidden="true">{category.icon}</span>{category.name}
          </Button>)}
          <Button type="button" variant="link" size="sm" onClick={() => navigate("/collections?view=products")}>All listings →</Button>
        </div>

        <p className="text-xs text-muted-foreground sm:text-sm">✓ Real marketplace listings · ✓ Direct seller contact · ✓ Service booking requests</p>
        <SpinToDiscover onBrowse={browseCategory} />
      </div>

      <div className="flex w-full flex-1 flex-col items-center gap-4 md:pl-6">
        <div className={`w-full rounded-2xl border border-muted px-5 py-5 shadow-sm ${activePromo.color}`}>
          <p className="text-xs font-semibold uppercase tracking-wide opacity-75">Explore Zemelix</p>
          <h2 className="mt-2 text-lg font-bold sm:text-xl">{activePromo.title}</h2>
          <p className="mt-1 text-sm">{activePromo.desc}</p>
          <Button type="button" variant="outline" className="mt-4 border-current bg-transparent" onClick={() => navigate(activePromo.to)}>{activePromo.action} →</Button>
          <div className="mt-4 flex gap-2" role="group" aria-label="Choose a marketplace highlight">
            {promotions.map((promo, index) => <button key={promo.title} type="button" aria-label={`Show highlight: ${promo.title}`} aria-pressed={promoIdx === index} onClick={() => setPromoIdx(index)} className={`h-2.5 w-2.5 rounded-full border border-current focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${promoIdx === index ? "bg-current" : "opacity-50"}`} />)}
          </div>
        </div>

        <div className="w-full rounded-2xl border border-muted bg-card p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="font-semibold">Latest listing</h2>
            <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">{loading ? "Loading" : latestListing ? "Recently added" : "Marketplace"}</span>
          </div>
          {latestListing ? (
            <button type="button" onClick={() => navigate(`/product/${latestListing.id}`)} className="flex w-full items-center gap-3 text-left">
              <img src={latestListing.imageUrl || "/images/placeholder.svg"} alt="" className="h-14 w-14 rounded-lg object-cover" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{latestListing.title}</span>
                <span className="mt-1 block text-xs text-muted-foreground">{latestListing.vendorType === "service" ? "Service listing" : "Product listing"} · View details</span>
              </span>
            </button>
          ) : error ? (
            <div role="alert" className="text-sm text-muted-foreground">
              <p>Marketplace listings are temporarily unavailable.</p>
              <Button type="button" variant="outline" size="sm" className="mt-2" onClick={refetch}>Try again</Button>
            </div>
          ) : (
            <p role={loading ? "status" : undefined} className="text-sm text-muted-foreground">{loading ? "Loading recent listings…" : "New listings will appear here as vendors publish them."}</p>
          )}
          <Button type="button" variant="link" className="mt-2 px-0" onClick={() => navigate("/collections?view=products")}>Browse all listings →</Button>
        </div>
      </div>
    </section>
  );
}
