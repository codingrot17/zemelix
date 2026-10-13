import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { QuizAnswers } from "@/utils/recommendations";

type DiscoveryQuizProps = {
  onResult: (answers: QuizAnswers) => void;
  onSkip?: () => void;
};

const questions = [
  {
    q: "What are you looking for today?",
    options: ["Buy Products", "Find a Service", "Sell or Offer a Service"],
    key: "purpose",
  },
  {
    q: "Which category interests you most?",
    options: ["Hairdressing", "Web Development", "Home & Living", "Other"],
    key: "category",
  },
];

export default function DiscoveryQuiz({ onResult, onSkip }: DiscoveryQuizProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});

  function handleAnswer(option: string) {
    const key = questions[step].key as keyof QuizAnswers;
    const newAnswers = { ...answers, [key]: option } as QuizAnswers;
    setAnswers(newAnswers);
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      onResult(newAnswers);
    }
  }

  if (step >= questions.length) return null;

  const progressValue = ((step + 1) / questions.length) * 100;

  return (
    <div className="my-5 flex w-full max-w-md flex-col items-center rounded-lg border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <Progress value={progressValue} className="mb-4 w-full" />
      <div className="mb-2 text-sm text-gray-500 dark:text-gray-400">Step {step + 1} of {questions.length}</div>
      <h3 className="mb-4 text-center text-lg font-bold text-primary">{questions[step].q}</h3>
      <div className="flex w-full flex-col gap-2">
        {questions[step].options.map(option => (
          <Button key={option} type="button" variant="outline" onClick={() => handleAnswer(option)} className="w-full justify-start">
            {option}
          </Button>
        ))}
      </div>
      {onSkip && <Button type="button" variant="link" onClick={onSkip} className="mt-2 text-muted-foreground">Skip for now</Button>}
    </div>
  );
}
