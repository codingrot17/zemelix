import { CheckCircle, User, FileText, Shield, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";

const onboardingSteps = [
  {
    label: "Add profile photo",
    icon: <User className="w-4 h-4" />,
  },
  {
    label: "Describe your service",
    icon: <FileText className="w-4 h-4" />,
  },
  {
    label: "Verify identity",
    icon: <Shield className="w-4 h-4" />,
  },
  {
    label: "First listing/service",
    icon: <UploadCloud className="w-4 h-4" />,
  },
];

export function OnboardingProgress({ completed = 2, onNextStep }) {
  const percent = ((completed / onboardingSteps.length) * 100).toFixed(0);
  const nextStep = onboardingSteps[completed];

  return (
    <div className="my-8 bg-card dark:bg-gray-900 rounded-xl shadow-lg p-6 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-primary dark:text-primary-light">
          Seller Onboarding Progress
        </h3>
        <span className="text-sm font-medium text-indigo-600 dark:text-indigo-300">
          {percent}% Complete
        </span>
      </div>
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-6 overflow-hidden">
        <div
          className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-3 transition-all"
          style={{ width: `${percent}%` }}
        ></div>
      </div>
      {/* Steps */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 items-center justify-between mb-4">
        {onboardingSteps.map((step, idx) => (
          <div
            key={step.label}
            className={`flex flex-col items-center text-center flex-1 ${
              idx < completed
                ? "text-emerald-600 dark:text-emerald-400"
                : idx === completed
                ? "text-indigo-600 dark:text-indigo-300"
                : "text-gray-400 dark:text-gray-500"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 border-2 ${
                idx < completed
                  ? "bg-emerald-100 dark:bg-emerald-900 border-emerald-400"
                  : idx === completed
                  ? "bg-indigo-100 dark:bg-indigo-900 border-indigo-400"
                  : "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700"
              }`}
            >
              {idx < completed ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                step.icon
              )}
            </div>
            <span className="text-xs font-semibold">{step.label}</span>
          </div>
        ))}
      </div>
      {/* Next Step or Completion */}
      {completed < onboardingSteps.length ? (
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Next: <span className="font-semibold">{nextStep.label}</span>
          </span>
          <Button
            className="bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-400 dark:hover:bg-indigo-500 ml-0 sm:ml-4"
            onClick={onNextStep}
          >
            Complete Step
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-base mt-2">
          <CheckCircle className="w-5 h-5" />
          All steps complete! You’re ready to sell 🎉
        </div>
      )}
    </div>
  );
}
