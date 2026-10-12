import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Search, Store } from "lucide-react";

export function CallToActionSection() {
  const navigate = useNavigate();
  return <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
    <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-emerald-600 px-6 py-10 text-white shadow-xl sm:px-10 sm:py-12">
      <div className="mx-auto max-w-3xl text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-indigo-100">One marketplace, many possibilities</p>
        <h2 className="text-3xl font-bold leading-tight sm:text-4xl">What can you discover on Zemelix today?</h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-indigo-50 sm:text-lg">Explore products, find a service provider, or bring your own business to a growing marketplace.</p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Button size="lg" onClick={() => navigate("/collections")} className="bg-white text-indigo-700 hover:bg-indigo-50"><Search className="mr-2 h-4 w-4"/>Explore listings<ArrowRight className="ml-2 h-4 w-4"/></Button>
          <Button size="lg" variant="outline" onClick={() => navigate("/vendor/upgrade")} className="border-white/70 bg-transparent text-white hover:bg-white/10"><Store className="mr-2 h-4 w-4"/>Become a vendor</Button>
        </div>
      </div>
    </div>
  </section>;
}
