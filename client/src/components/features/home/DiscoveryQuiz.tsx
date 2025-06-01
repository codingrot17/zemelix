import React, { useState } from "react";
import { Button } from "@/components/ui/button";

type QuizAnswers = {
  purpose?: string;
  category?: string;
};

type DiscoveryQuizProps = {
  onResult: (answers: QuizAnswers) => void;
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

export default function DiscoveryQuiz({ onResult }: DiscoveryQuizProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});

  function handleAnswer(option: string) {
    const key = questions[step].key as keyof QuizAnswers;
    const newAnswers = { ...answers, [key]: option };
    setAnswers(newAnswers);
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      onResult(newAnswers);
    }
  }

  if (step >= questions.length) return null;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md mx-auto my-8">
      <h3 className="text-lg font-bold mb-4 text-primary dark:text-primary-light">
        {questions[step].q}
      </h3>
      <div className="flex flex-col gap-2">
        {questions[step].options.map((option) => (
          <Button
            key={option}
            onClick={() => handleAnswer(option)}
            className="w-full"
          >
            {option}
          </Button>
        ))}
      </div>
    </div>
  );
}
