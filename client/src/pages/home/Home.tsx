import React, { useState } from "react";
import BragBar from "@/components/features/home/BragBar";
import HeroSection from "@/components/features/home/Hero";
import DiscoveryQuiz from "@/components/features/home/DiscoveryQuiz";
import { OnboardingProgress } from "@/components/features/home/OnboardingProgress";
import { CuratedCollectionsCarousel } from "@/components/features/home/CuratedCollectionsSection";
import { FeaturedListingsCarousel } from "@/components/features/home/FeaturedListingsSection";
import { TestimonialsSection } from "@/components/features/home/TestimonialsSection";
import { RecommendationPanel } from "@/components/features/home/RecommendationPanel";
import { getRecommendations, QuizAnswers, RecommendationItem } from "@/utils/recommendations";
import { CallToActionSection } from "@/components/features/home/CallToActionSection";
import { FAQSection } from "@/components/features/home/FAQSection";


// Dummy featuredItems for demonstration
const featuredItems: RecommendationItem[] = [
  {
    id: 1,
    title: "Handmade Wooden Chair",
    description: "Comfortable and stylish wooden chair for your living room.",
    price: "$120",
    imageUrl: "/images/placeholder.svg",
    type: "product",
    category: "Furniture",
  },
  {
    id: 2,
    title: "Web Design Service",
    description: "Professional website design tailored for your business.",
    price: "$500",
    imageUrl: "/images/placeholder.svg",
    type: "service",
    category: "Design",
  },
];

const onboardingSteps = [
  "Complete profile",
  "Add first listing",
  "Verify payment method",
  "Start selling",
];

const HomePage = () => {
  const [quizDone, setQuizDone] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswers | null>(null);
  const [onboardingCompleted, setOnboardingCompleted] = useState(2);

  function handleNextOnboardingStep() {
    setOnboardingCompleted((prev) =>
      prev < onboardingSteps.length ? prev + 1 : prev
    );
  }

  function handleQuizComplete(answers: QuizAnswers) {
    setQuizDone(true);
    setQuizAnswers(answers);
  }

  const recommendations = getRecommendations(quizAnswers, featuredItems);

  return (
    <div className="min-h-screen bg-background dark:bg-background overflow-hidden">
      <BragBar />
      <HeroSection />

      {/* Discovery Quiz */}
      {!quizDone && (
        <section className="max-w-2xl mx-auto px-4 py-6">
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-2 text-primary dark:text-primary-light">
            Not Sure Where to Start?
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-4">
            Take our quick quiz to get personalized recommendations!
          </p>
          <DiscoveryQuiz onResult={handleQuizComplete} />
        </section>
      )}

      {/* Recommendations */}
      {quizDone && (
        <RecommendationPanel recommendations={recommendations} />
      )}

      {/* Gamified Onboarding for Sellers/Providers */}
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-xl font-bold mb-2 text-primary dark:text-primary-light">
          New Seller? Get Started!
        </h2>
        <OnboardingProgress
          completed={onboardingCompleted}
          onNextStep={handleNextOnboardingStep}
        />
      </div>

      <CuratedCollectionsCarousel />
      <FeaturedListingsCarousel />
      <TestimonialsSection />
      
      <FAQSection />
      <CallToActionSection />
    </div>
  );
};

export default HomePage;
