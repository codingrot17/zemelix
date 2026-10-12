import { CheckCircle, Store, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function OnboardingProgress({ completed = 0, isVendor = false }: { completed?: number; isVendor?: boolean }) {
  if (isVendor) return null;
  const steps = ["Choose your vendor type", "Complete your business profile", "Add your first listing or service"];
  const current = Math.max(0, Math.min(steps.length, completed));
  const percent = Math.round(current / steps.length * 100);
  return <section className="my-8 rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3"><div className="rounded-xl bg-indigo-100 p-3 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"><Store className="h-5 w-5"/></div><div><h3 className="text-lg font-bold text-primary">Build your presence on Zemelix</h3><p className="mt-1 max-w-xl text-sm text-muted-foreground">Start onboarding to set up a seller storefront or service-provider profile. Your progress is saved in your account.</p></div></div>
      <Button asChild className="shrink-0"><Link to="/vendor/upgrade">Continue onboarding <ArrowRight className="ml-2 h-4 w-4"/></Link></Button>
    </div>
    <div className="mt-5"><div className="mb-2 flex items-center justify-between text-xs"><span className="font-medium text-muted-foreground">Setup progress</span><span className="font-semibold text-indigo-600 dark:text-indigo-300">{percent}%</span></div><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all" style={{width:`${percent}%`}}/></div><div className="mt-4 grid gap-3 sm:grid-cols-3">{steps.map((step,index)=><div key={step} className="flex items-center gap-2 text-xs text-muted-foreground">{index<current?<CheckCircle className="h-4 w-4 text-emerald-500"/>:<span className="flex h-4 w-4 items-center justify-center rounded-full border text-[10px]">{index+1}</span>}{step}</div>)}</div></div>
  </section>;
}
