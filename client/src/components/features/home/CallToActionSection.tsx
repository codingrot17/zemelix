import { Link } from "react-router-dom";
import { ArrowRight, Store } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CallToActionSection() {
  return <section className="bg-primary px-4 py-14 text-center text-white dark:bg-secondary sm:py-16"><div className="mx-auto max-w-3xl"><div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15"><Store className="h-6 w-6"/></div><h2 className="mb-3 text-3xl font-bold dark:text-primary">Your next great find starts here.</h2><p className="mx-auto mb-6 max-w-2xl text-base text-white/85 dark:text-primary/80 sm:text-lg">Explore independent sellers, discover useful services and connect with people who can help bring your ideas to life.</p><div className="flex flex-col justify-center gap-3 sm:flex-row"><Button asChild size="lg" className="bg-white text-primary hover:bg-gray-100 dark:bg-primary dark:text-secondary"><Link to="/collections">Explore the marketplace <ArrowRight className="ml-2 h-4 w-4"/></Link></Button><Button asChild size="lg" variant="outline" className="border-white/50 bg-transparent text-white hover:bg-white/10 dark:border-primary/40 dark:text-primary"><Link to="/vendor/upgrade">Become a seller or provider</Link></Button></div></div></section>;
}
