import { FormEvent, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/useProducts";

const categories = [
  { name: "Hairdressing", icon: "💇🏽‍♀️", color: "from-pink-500 to-rose-600" },
  { name: "Web Development", icon: "💻", color: "from-blue-500 to-indigo-600" },
  { name: "Home & Living", icon: "🏡", color: "from-emerald-500 to-teal-600" },
  { name: "See All", icon: "🔎", color: "from-slate-500 to-slate-700" },
];

export default function HeroSection() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [promoIndex, setPromoIndex] = useState(0);
  const [discovery, setDiscovery] = useState<string | null>(null);
  const { products, loading } = useProducts({ limit: 30, activeOnly: true });

  const recentListings = useMemo(() => products.slice(0, 3), [products]);
  const promos = [
    { title: "Find something made for you", detail: "Explore products and services from the Zemelix marketplace.", action: () => navigate("/collections") },
    { title: "Have a skill or product to share?", detail: "Set up your seller or service-provider profile.", action: () => navigate("/vendor/upgrade") },
    { title: "Need help getting started?", detail: "Get quick answers or talk to the Zemelix support team.", action: () => window.dispatchEvent(new CustomEvent("zemelix:open-support")) },
  ];

  function search(event: FormEvent) {
    event.preventDefault();
    const q = query.trim();
    navigate(q ? `/collections?view=products&q=${encodeURIComponent(q)}` : "/collections");
  }
  function chooseCategory(name: string) {
    navigate(name === "See All" ? "/collections" : `/collections?view=products&q=${encodeURIComponent(name)}`);
  }
  function spinToDiscover() {
    if (!products.length) { navigate("/collections"); return; }
    const pick = products[Math.floor(Math.random() * products.length)];
    setDiscovery(pick.title);
  }

  return <section className="relative mx-auto flex max-w-7xl flex-col items-center gap-8 bg-background px-4 py-8 transition-colors sm:px-6 sm:py-12 md:flex-row md:gap-12">
    <div className="w-full flex-1">
      <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300"><Sparkles className="h-4 w-4"/> Products, services and local talent</p>
      <h1 className="mb-4 text-3xl font-bold leading-tight text-primary sm:text-4xl md:text-5xl">Discover great finds. Connect with great people.</h1>
      <p className="mb-6 max-w-xl text-base text-muted-foreground sm:text-lg">Explore products and book services from independent sellers, creators and professionals—all in one marketplace.</p>
      <form onSubmit={search} className="mb-5 flex w-full flex-col gap-2 sm:flex-row">
        <label className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"/><input aria-label="Search products and services" value={query} onChange={e=>setQuery(e.target.value)} placeholder="What are you looking for?" className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"/></label>
        <Button type="submit" size="lg" className="rounded-xl"><Search className="mr-2 h-4 w-4"/>Search</Button>
      </form>
      <div className="mb-6 grid grid-cols-2 gap-2 sm:gap-3">{categories.map(cat=><Button key={cat.name} type="button" variant="outline" onClick={()=>chooseCategory(cat.name)} className={`h-auto justify-start rounded-full border-0 bg-gradient-to-r ${cat.color} px-3 py-3 text-left text-sm font-medium text-white shadow-sm transition-transform hover:scale-[1.02] hover:text-white`}><span className="mr-2 text-lg">{cat.icon}</span>{cat.name}</Button>)}</div>
      <div className="flex flex-col gap-3 sm:flex-row"><Button size="lg" onClick={()=>navigate("/collections")} className="rounded-xl">Explore marketplace <ArrowRight className="ml-2 h-4 w-4"/></Button><Button size="lg" variant="outline" onClick={()=>navigate("/vendor/upgrade")} className="rounded-xl">Start selling or offering a service</Button></div>
    </div>
    <div className="w-full flex-1 space-y-4">
      <button type="button" onClick={()=>{promos[(promoIndex+1)%promos.length].action();setPromoIndex((promoIndex+1)%promos.length)}} className="w-full rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-emerald-50 p-5 text-left shadow-sm transition hover:shadow-md dark:border-indigo-900 dark:from-indigo-950/50 dark:to-emerald-950/40">
        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-300">Explore Zemelix</span><h2 className="mt-2 text-xl font-bold text-gray-900 dark:text-white">{promos[promoIndex].title}</h2><p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{promos[promoIndex].detail}</p><span className="mt-3 inline-flex items-center text-sm font-semibold text-indigo-700 dark:text-indigo-300">Take a look <ArrowRight className="ml-1 h-4 w-4"/></span><span className="mt-2 block text-[11px] text-gray-400">Tap to cycle through marketplace shortcuts</span>
      </button>
      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3"><div><h2 className="font-bold">Fresh from the marketplace</h2><p className="text-xs text-muted-foreground">Recent active listings, not simulated activity</p></div><Button variant="ghost" size="sm" onClick={()=>navigate("/collections")}>View all</Button></div>
        {loading?<p className="py-5 text-sm text-muted-foreground">Loading live listings…</p>:recentListings.length? <div className="mt-3 space-y-3">{recentListings.map(p=><button key={p.id} onClick={()=>navigate(`/product/${p.id}`)} className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-muted"><img src={p.imageUrl||"/images/placeholder.svg"} alt="" className="h-12 w-12 rounded-lg object-cover"/><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{p.title}</span><span className="block truncate text-xs text-muted-foreground">{p.category} · {p.vendorType==="service"?"Service":"Product"}</span></span><ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground"/></button>)}</div>:<p className="py-5 text-sm text-muted-foreground">New listings will appear here as sellers publish them.</p>}
      </div>
      <div className="rounded-2xl border bg-card p-5 shadow-sm"><div className="flex items-center gap-3"><span className="rounded-full bg-amber-100 p-3 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">🎁</span><div className="flex-1"><h2 className="font-bold">Spin to discover</h2><p className="text-xs text-muted-foreground">Find a random live listing to explore.</p></div><Button variant="outline" onClick={spinToDiscover} disabled={loading||!products.length}>Spin</Button></div>{discovery&&<div className="mt-3 rounded-lg bg-muted p-3 text-sm">Your pick: <strong>{discovery}</strong><Button variant="link" className="ml-1 h-auto p-0" onClick={()=>{const p=products.find(item=>item.title===discovery);if(p)navigate(`/product/${p.id}`)}}>View listing</Button></div>}</div>
    </div>
  </section>;
}
