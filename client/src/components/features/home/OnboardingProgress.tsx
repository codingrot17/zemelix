import { useEffect, useState } from "react";
import { CheckCircle, Store, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const DRAFT_PREFIX = "vendor_wizard_draft_v2";

export function OnboardingProgress() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!user?.id) { setStep(0); return; }
    try {
      const saved = localStorage.getItem(`${DRAFT_PREFIX}:${user.id}`);
      if (!saved) { setStep(0); return; }
      const draft = JSON.parse(saved) as { step?: unknown };
      const currentStep = typeof draft.step === "number" ? draft.step : 0;
      setStep(Math.max(0, Math.min(3, currentStep)));
    } catch {
      setStep(0);
    }
  }, [user?.id]);

  // The actual onboarding wizard marks a completed vendor as role=seller.
  // HomePage also hides this component for vendors; no artificial step completion.
  const progress = Math.round((step / 4) * 100);

  return <section className="my-8 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-5 shadow-sm dark:border-indigo-900 dark:from-indigo-950/40 dark:to-gray-900 sm:p-7">
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-4">
        <div className="rounded-xl bg-indigo-100 p-3 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200"><Store className="h-6 w-6"/></div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Bring your business to Zemelix</h3>
          <p className="mt-1 max-w-xl text-sm text-gray-600 dark:text-gray-300">Set up your vendor profile, choose your business type, add your details and publish products or services when you’re ready.</p>
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400"><CheckCircle className="h-4 w-4 text-emerald-600"/>Four guided setup steps · Your draft is saved on this device</div>
          {step > 0 && <div className="mt-3 max-w-xs"><div className="mb-1 flex justify-between text-xs text-gray-500"><span>Setup progress</span><span>{progress}%</span></div><div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700"><div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500" style={{width:`${progress}%`}}/></div></div>}
        </div>
      </div>
      <Button onClick={() => navigate(user ? "/vendor/upgrade" : "/login")} className="shrink-0 bg-indigo-600 text-white hover:bg-indigo-700">{step > 0 ? "Continue setup" : "Start vendor setup"}<ArrowRight className="ml-2 h-4 w-4"/></Button>
    </div>
  </section>;
}
