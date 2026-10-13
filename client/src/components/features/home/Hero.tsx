import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/useProducts";

const categories = [
  { name: "Hairdressing", category: "beauty-hair-service", icon: "💇‍♀️", color: "from-pink-400 to-pink-600" },
  { name: "Web Development", category: "tech-web", icon: "💻", color: "from-blue-400 to-blue-600" },
  { name: "Home & Living", category: "home-living", icon: "🏠", color: "from-emerald-400 to-emerald-600" },
  { name: "See All", category: "", icon: "🔎", color: "from-gray-400 to-gray-600" },
];

const promotions = [
  { title: "Discover something new", desc: "Explore products and services from marketplace listings.", color: "bg-gradient-to-r from-green-100 to-green-300 text-green-900 dark:from-green-900 dark:to-green-700 dark:text-green-100", to: "/collections?view=products" },
  { title: "Looking for a service?", desc: "Browse service providers and send a booking request.", color: "bg-gradient-to-r from-blue-100 to-blue-300 text-blue-900 dark:from-blue-900 dark:to-blue-700 dark:text-blue-100", to: "/collections?view=products&type=service" },
  { title: "Have something to offer?", desc: "Set up your vendor profile and publish your first listing.", color: "bg-gradient-to-r from-yellow-100 to-yellow-300 text-yellow-900 dark:from-yellow-900 dark:to-yellow-700 dark:text-yellow-100", to: "/vendor/upgrade" },
];

const discoveryCategories = [
  { label: "Home & Living", id: "home-living" },
  { label: "Beauty & Personal Care", id: "beauty-skincare" },
  { label: "Digital Products", id: "digital-software" },
  { label: "Fashion", id: "fashion-clothing" },
];

function SpinToDiscover({ onPick }: { onPick: (category: string) => void }) {
  const [spun, setSpun] = useState(false);
  const [result, setResult] = useState("");
  const [spinning, setSpinning] = useState(false);

  function spin() {
    if (spinning) return;
    setSpinning(true);
    window.setTimeout(() => {
      const picked = discoveryCategories[Math.floor(Math.random() * discoveryCategories.length)];
      setResult(picked.label);
      setSpun(true);
      setSpinning(false);
      onPick(picked.id);
    }, 650);
  }

  return (
    <div className="mt-4 flex w-full flex-col items-center rounded-xl border border-muted bg-card px-5 py-4 shadow-sm">
      <span className="mb-2 font-bold text-primary">🎉 Spin to Discover</span>
      {!spun ? (
        <Button type="button" onClick={spin} disabled={spinning} className="bg-indigo-600 text-white hover:bg-indigo-700">
          {spinning ? "Spinning…" : "Spin Now"}
        </Button>
      ) : (
        <div className="text-center">
          <p className="font-semibold text-indigo-700 dark:text-indigo-300">Your pick: {result}</p>
          <Button type="button" variant="link" onClick={() => { setSpun(false); setResult(""); }}>Spin again</Button>
        </div>
      )}
      <span className="mt-1 text-center text-xs text-muted-foreground">A fun way to find a category. No discount or cash prize is implied.</span>
    </div>
  );
}

export default function HeroSection() {
  const navigate = useNavigate();
  const [promoIdx, setPromoIdx] = useState(0);
  const [search, setSearch] = useState("");
  const { products, loading, error } = useProducts({ limit: 50, activeOnly: true });

  useEffect(() => {
    const timer = window.setInterval(() => setPromoIdx(index => (index + 1) % promotions.length), 7000);
    return () => window.clearInterval(timer);
  }, []);

  function searchListings(event: FormEvent) {
    event.preventDefault();
    const query = search.trim();
    navigate(query ? `/collections?search=${encodeURIComponent(query)}&view=products` : "/collections?view=products");
  }

  function browseCategory(category: string) {
    navigate(category ? `/collections?category=${encodeURIComponent(category)}&view=products` : "/collections?view=products");
  }

  const latestListing = products[0];
  const activePromo = promotions[promoIdx];

  return (
    <section className="relative mx-auto flex max-w-7xl flex-col items-center gap-6 bg-background px-4 py-8 transition-colors sm:px-6 sm:py-12 md:flex-row md:gap-10">
      <div className="flex w-full flex-1 flex-col items-start">
        <p className="mb-3 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">Your local and digital marketplace</p>
        <h1 className="mb-3 text-3xl font-bold leading-tight text-primary sm:text-4xl md:text-5xl">Find products. Book services. Grow your business.</h1>
        <p className="mb-5 max-w-xl text-base text-muted-foreground sm:text-lg">Discover useful products and connect with service providers—or set up your own vendor profile on Zemelix.</p>
        <div className="mb-4 grid w-full grid-cols-2 gap-2 sm:gap-3">
          {categories.map(category => (
            <Button key={category.name} type="button" variant="outline" onClick={() => browseCategory(category.category)} className={`min-w-0 rounded-full border-0 bg-gradient-to-r px-3 py-2 text-sm font-medium text-white shadow transition-transform hover:scale-[1.02] sm:text-base ${category.color}`}>
              <span className="mr-2">{category.icon}</span>{category.name}
            </Button>
          ))}
        </div>
        <form onSubmit={searchListings} className="mb-5 flex w-full flex-col gap-2 sm:flex-row">
          <input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search products or services…" aria-label="Search products or services" className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:border-gray-700 dark:bg-gray-900" />
          <Button type="submit" className="w-full bg-indigo-600 text-white hover:bg-indigo-700 sm:w-auto">Search</Button>
        </form>
        <div className="mb-4 flex flex-wrap gap-2 text-xs text-muted-foreground sm:gap-4 sm:text-sm"><span>✓ Browse real listings</span><span>✓ Contact sellers directly</span><span>✓ Request service bookings</span></div>
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:gap-3">
          <Button size="lg" onClick={() => navigate("/collections?view=products")} className="w-full bg-indigo-600 text-white hover:bg-indigo-700 sm:w-auto">Explore marketplace</Button>
          <Button size="lg" variant="outline" onClick={() => navigate("/vendor/upgrade")} className="w-full sm:w-auto">Become a vendor</Button>
        </div>
        <SpinToDiscover onPick={browseCategory} />
      </div>
      <div className="flex w-full flex-1 flex-col items-center gap-4 md:pl-6">
        <button type="button" onClick={() => navigate(activePromo.to)} className={`w-full rounded-2xl border border-muted px-5 py-5 text-center shadow-sm transition hover:shadow-md ${activePromo.color}`}>
          <span className="block text-lg font-bold sm:text-xl">{activePromo.title}</span>
          <span className="mt-1 block text-sm font-normal">{activePromo.desc}</span>
          <span className="mt-3 block text-xs opacity-70">Tap to explore · {promoIdx + 1}/{promotions.length}</span>
        </button>
        <div className="w-full rounded-2xl border border-muted bg-card p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="font-semibold">Marketplace activity</h2>
            <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">{loading ? "Loading" : "Latest listing"}</span>
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
            <p role="status" className="text-sm text-muted-foreground">Marketplace listings are temporarily unavailable.</p>
          ) : (
            <p className="text-sm text-muted-foreground">{loading ? "Loading recent listings…" : "New listings will appear here as vendors publish them."}</p>
          )}
          <Button type="button" variant="link" className="mt-2 px-0" onClick={() => navigate("/collections?view=products")}>Browse all listings →</Button>
        </div>
      </div>
    </section>
  );
}
