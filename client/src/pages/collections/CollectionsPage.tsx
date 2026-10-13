import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ProductCard from "@/components/shared/ProductCard";
import { listProducts } from "@/services/product.service";
import type { Product } from "@/types/product";
import { listCollections, getCollectionErrorMessage } from "@/services/collection.service";
import type { Collection } from "@/types/collection";
import { Search, X, Loader2, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { categoryDatabase } from "@/data/businessCategories";
import { categoryLabel, listingMatchesCategory } from "@/services/category.service";

const PAGE_SIZE = 50;
type SortOrder = "newest" | "price-asc" | "price-desc" | "title";
type VendorFilter = "all" | "product-seller" | "service" | "digital-creator" | "wholesaler" | "other";

const vendorOptions: { value: VendorFilter; label: string }[] = [
  { value: "all", label: "All vendor types" },
  { value: "product-seller", label: "Product sellers" },
  { value: "service", label: "Service providers" },
  { value: "digital-creator", label: "Digital creators" },
  { value: "wholesaler", label: "Wholesalers" },
  { value: "other", label: "Other vendors" },
];

function normaliseType(type: string | undefined): VendorFilter {
  if (type === "service-provider" || type === "service") return "service";
  if (type === "product-seller" || type === "digital-creator" || type === "wholesaler" || type === "other") return type;
  return "all";
}

export function CollectionsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [collectionLoading, setCollectionLoading] = useState(true);
  const [collectionError, setCollectionError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [reload, setReload] = useState(0);
  const [search, setSearch] = useState(() => searchParams.get("search") ?? searchParams.get("q") ?? "");
  const [category, setCategory] = useState(() => searchParams.get("category") ?? "");
  const [vendorType, setVendorType] = useState<VendorFilter>(() => normaliseType(searchParams.get("type") ?? undefined));
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState<SortOrder>("newest");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setProducts([]);
    setOffset(0);
    listProducts({ limit: PAGE_SIZE, offset: 0, activeOnly: true })
      .then(rows => {
        if (cancelled) return;
        setProducts(rows);
        setOffset(rows.length);
        setHasMore(rows.length === PAGE_SIZE);
      })
      .catch(err => {
        if (!cancelled) {
          console.error("Collections listings:", err);
          setError("We couldn't load marketplace listings. Check your connection and try again.");
          setProducts([]);
          setHasMore(false);
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [reload]);

  useEffect(() => {
    let cancelled = false;
    setCollectionLoading(true);
    setCollectionError(null);
    listCollections()
      .then(rows => { if (!cancelled) setCollections(rows); })
      .catch(err => {
        if (!cancelled) {
          console.warn("Editorial collections unavailable; showing data-backed category collections.", err);
          setCollectionError(getCollectionErrorMessage(err));
          setCollections([]);
        }
      })
      .finally(() => { if (!cancelled) setCollectionLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    setSearch(searchParams.get("search") ?? searchParams.get("q") ?? "");
    setCategory(searchParams.get("category") ?? "");
    setVendorType(normaliseType(searchParams.get("type") ?? undefined));
  }, [searchParams]);

  function updateUrl(nextSearch: string, nextCategory: string, nextType: VendorFilter) {
    const params = new URLSearchParams(searchParams);
    if (nextSearch.trim()) params.set("search", nextSearch.trim()); else { params.delete("search"); params.delete("q"); }
    if (nextCategory) params.set("category", nextCategory); else params.delete("category");
    if (nextType !== "all") params.set("type", nextType); else params.delete("type");
    params.set("view", "products");
    setSearchParams(params, { replace: true });
  }

  async function loadMore() {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    setError(null);
    try {
      const rows = await listProducts({ limit: PAGE_SIZE, offset, activeOnly: true });
      setProducts(current => {
        const ids = new Set(current.map(item => item.id));
        return [...current, ...rows.filter(item => !ids.has(item.id))];
      });
      setOffset(value => value + rows.length);
      setHasMore(rows.length === PAGE_SIZE);
    } catch (err) {
      console.error("Load more listings:", err);
      setError("Couldn't load more listings. Please try again.");
    } finally {
      setLoadingMore(false);
    }
  }

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    const result = products.filter(product => {
      const type = normaliseType(product.vendorType);
      const price = Number(product.price) || 0;
      return (!category || listingMatchesCategory(product, category)) &&
        (vendorType === "all" || type === vendorType) &&
        (!minPrice || price >= Number(minPrice)) &&
        (!maxPrice || price <= Number(maxPrice)) &&
        (!query || [product.title, product.shortDescription, product.category, product.sellerName, ...(product.tags ?? [])].some(value => value?.toLocaleLowerCase().includes(query)));
    });
    return result.sort((a, b) => {
      if (sort === "price-asc") return (Number(a.price) || 0) - (Number(b.price) || 0);
      if (sort === "price-desc") return (Number(b.price) || 0) - (Number(a.price) || 0);
      if (sort === "title") return a.title.localeCompare(b.title);
      return 0; // Appwrite already returns each page newest-first.
    });
  }, [products, search, category, vendorType, minPrice, maxPrice, sort]);

  const categoryTiles = useMemo(() => {
    const allCategories = Array.from(new Map(categoryDatabase.flatMap(group => group.categories).map(item => [item.id, item])).values());
    const query = search.trim().toLowerCase();
    return allCategories.map(item => ({
      ...item,
      count: products.filter(product => listingMatchesCategory(product, item.id)).length,
    })).filter(item => (!query || item.name.toLowerCase().includes(query) || item.description.toLowerCase().includes(query) || item.keywords.some(word => word.toLowerCase().includes(query))) && item.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [products, search]);

  function clearFilters() {
    setSearch("");
    setCategory("");
    setVendorType("all");
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
    setSearchParams({}, { replace: true });
  }

  const hasFilters = Boolean(search || category || vendorType !== "all" || minPrice || maxPrice);

  return (
    <main className="mx-auto min-h-[60vh] max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Discover Zemelix</p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">Collections & marketplace</h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-600 dark:text-gray-300 sm:text-base">Explore real categories and browse products and services from marketplace vendors.</p>
      </header>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input aria-label="Search products, services, and categories" type="search" value={search} onChange={event => { const value = event.target.value; setSearch(value); updateUrl(value, category, vendorType); }} placeholder="Search products, services, and categories…" className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-10 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
          {search && <button type="button" aria-label="Clear search" onClick={() => { setSearch(""); updateUrl("", category, vendorType); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><X className="h-4 w-4" /></button>}
        </div>
        <Button type="button" variant="outline" onClick={() => setShowFilters(value => !value)} className="w-full sm:w-auto">
          <SlidersHorizontal className="mr-2 h-4 w-4" />{showFilters ? "Hide filters" : "Filters"}{hasFilters ? " •" : ""}
        </Button>
      </div>

      {showFilters && <section aria-label="Marketplace filters" className="mb-6 grid grid-cols-1 gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900 sm:grid-cols-2 lg:grid-cols-5">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Category
          <select value={category} onChange={event => { const value = event.target.value; setCategory(value); updateUrl(search, value, vendorType); }} className="mt-1 block w-full rounded-lg border border-gray-300 bg-white p-2.5 dark:border-gray-600 dark:bg-gray-800">
            <option value="">All categories</option>
            {categoryDatabase.map(group => <optgroup key={group.type} label={group.label}>{group.categories.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</optgroup>)}
          </select>
        </label>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Vendor type
          <select value={vendorType} onChange={event => { const value = event.target.value as VendorFilter; setVendorType(value); updateUrl(search, category, value); }} className="mt-1 block w-full rounded-lg border border-gray-300 bg-white p-2.5 dark:border-gray-600 dark:bg-gray-800">
            {vendorOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Minimum price (₦)
          <input type="number" min="0" inputMode="numeric" value={minPrice} onChange={event => setMinPrice(event.target.value)} placeholder="No minimum" className="mt-1 block w-full rounded-lg border border-gray-300 bg-white p-2.5 dark:border-gray-600 dark:bg-gray-800" />
        </label>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Maximum price (₦)
          <input type="number" min="0" inputMode="numeric" value={maxPrice} onChange={event => setMaxPrice(event.target.value)} placeholder="No maximum" className="mt-1 block w-full rounded-lg border border-gray-300 bg-white p-2.5 dark:border-gray-600 dark:bg-gray-800" />
        </label>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Sort by
          <select value={sort} onChange={event => setSort(event.target.value as SortOrder)} className="mt-1 block w-full rounded-lg border border-gray-300 bg-white p-2.5 dark:border-gray-600 dark:bg-gray-800">
            <option value="newest">Newest</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option><option value="title">Name: A–Z</option>
          </select>
        </label>
        <div className="flex items-end"><Button type="button" variant="outline" onClick={clearFilters} className="w-full">Clear filters</Button></div>
      </section>}

      {loading ? <div role="status" className="flex items-center justify-center py-16 text-gray-500"><Loader2 className="mr-3 h-6 w-6 animate-spin" />Loading marketplace…</div> :
        error ? <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"><p>{error}</p><Button type="button" variant="outline" className="mt-3" onClick={() => setReload(value => value + 1)}>Retry</Button></div> :
        <>
          <section aria-label="Browse categories" className="mb-5">
            <div className="mb-2 flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Browse by category</h2>
              {category && <button type="button" onClick={() => { setCategory(""); updateUrl(search, "", vendorType); }} className="text-xs font-medium text-indigo-600 hover:underline">Show all</button>}
            </div>
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0" role="group" aria-label="Category filters">
              <button type="button" aria-pressed={!category} onClick={() => { setCategory(""); updateUrl(search, "", vendorType); }} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${!category ? "border-indigo-600 bg-indigo-600 text-white" : "border-gray-300 bg-white text-gray-700 hover:border-indigo-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"}`}>All listings</button>
              {categoryTiles.map(item => <button key={item.id} type="button" aria-pressed={category === item.id} onClick={() => { setCategory(item.id); updateUrl(search, item.id, vendorType); }} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${category === item.id ? "border-indigo-600 bg-indigo-600 text-white" : "border-gray-300 bg-white text-gray-700 hover:border-indigo-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"}`}>{item.name}<span className={`ml-2 text-xs ${category === item.id ? "text-indigo-100" : "text-gray-500"}`}>{item.count}</span></button>)}
            </div>
          </section>

          <section>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">{category ? categoryLabel(category) : "Marketplace listings"}</h2><p className="mt-1 text-sm text-gray-500">{filteredProducts.length} matching {filteredProducts.length === 1 ? "listing" : "listings"}</p></div><div className="flex items-center gap-2 text-xs text-gray-500"><ArrowUpDown className="h-4 w-4" />{sort === "newest" ? "Newest first" : sort === "price-asc" ? "Lowest price first" : sort === "price-desc" ? "Highest price first" : "Name A–Z"}</div></div>
            {filteredProducts.length === 0 ? <div className="py-14 text-center"><div className="mb-3 text-4xl" aria-hidden="true">🔎</div><h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">No matching listings</h3><p className="mx-auto mt-2 max-w-md text-sm text-gray-500">Try changing your search or removing one or more filters.</p><Button type="button" variant="outline" className="mt-4" onClick={clearFilters}>Clear filters</Button></div> :
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{filteredProducts.map(product => <ProductCard key={product.id} product={product} />)}</div>}
            {hasMore && <div className="mt-7 flex justify-center"><Button type="button" variant="outline" onClick={loadMore} disabled={loadingMore}>{loadingMore && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{loadingMore ? "Loading more…" : "Load more listings"}</Button></div>}
          </section>
        </>
      }

      {!collectionLoading && collections.length > 0 && <section className="mt-10 border-t border-gray-200 pt-8 dark:border-gray-700">
        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Curated collections</h2>
        {collectionError && <p className="mb-3 text-sm text-amber-700 dark:text-amber-300">Showing available marketplace categories because curated collections could not be loaded.</p>}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{collections.map(collection => (
          <button key={collection.id} type="button" onClick={() => navigate(`/collections/${collection.slug}`)} className="rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:border-indigo-400 hover:shadow-md dark:border-gray-700 dark:bg-gray-900">
            <h3 className="font-semibold text-gray-900 dark:text-white">{collection.title}</h3><p className="mt-2 line-clamp-2 text-sm text-gray-500">{collection.description}</p><span className="mt-3 inline-block text-sm font-semibold text-indigo-600">Explore collection →</span>
          </button>
        ))}</div>
      </section>}
    </main>
  );
}
