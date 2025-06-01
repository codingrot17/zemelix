import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import BragBar from "@/components/features/home/BragBar";
import HeroSection from "@/components/features/home/Hero";
import DiscoveryQuiz from "@/components/features/home/DiscoveryQuiz"; 
import { OnboardingProgress } from "@/components/features/home/OnboardingProgress";
import { CuratedCollectionsCarousel } from "@/components/features/home/CuratedCollectionsSection";
import { FeaturedListingsCarousel } from "@/components/features/home/FeaturedListingsSection";

const testimonials = [
  {
    name: "Amina O.",
    videoUrl: "/videos/testimonial1.mp4",
    quote: "I found my dream developer here in minutes!",
  },
  {
    name: "Tunde S.",
    videoUrl: "/videos/testimonial2.mp4",
    quote: "Selling my crafts has never been easier.",
  },
];

// logic based on quiz answers
function getRecommendations(answers) {
  if (!answers) return [];
  // Example: recommend based on purpose and category
  if (answers.purpose === "Buy Products") {
    return featuredItems.filter(
      (item) => item.type === "product" && (answers.category === "Other" || item.category === answers.category)
    );
  }
  if (answers.purpose === "Find a Service") {
    return featuredItems.filter(
      (item) => item.type === "service" && (answers.category === "Other" || item.category === answers.category)
    );
  }
  if (answers.purpose === "Sell or Offer a Service") {
    // Recommend onboarding steps or top seller tips
    return [
      {
        id: "onboard",
        title: "Become a Top Seller",
        description: "Complete your profile and start listing your services today!",
        price: "",
        imageUrl: "/images/placeholder.svg",
      },
    ];
  }
  return [];
}

const HomePage = () => {
  const [quizDone, setQuizDone] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState(null);
  
  const [onboardingCompleted, setOnboardingCompleted] = useState(2);

  function handleNextOnboardingStep() {
    setOnboardingCompleted((prev) =>
      prev < onboardingSteps.length ? prev + 1 : prev
    );
  }

  function handleQuizComplete(answers) {
    setQuizDone(true);
    setQuizAnswers(answers);
  }

  const recommendations = getRecommendations(quizAnswers);

  return (
    <div className="min-h-screen bg-secondary dark:bg-secondary overflow-hidden">
      {/* Brag Bar */}
      <BragBar />

      {/* Hero Section */}
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
        <section className="max-w-2xl mx-auto px-4 py-6">
          <div className="bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-100 rounded-lg shadow p-6 text-center font-semibold">
            🎯 Here are some picks for you:
            <div className="mt-4 flex flex-col gap-4">
              {recommendations.length === 0 && (
                <div className="text-gray-600 dark:text-gray-300">
                  Sorry, no direct matches found. Try browsing our collections below!
                </div>
              )}
              {recommendations.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center gap-4"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1 text-left">
                    <div className="font-bold text-lg text-primary dark:text-primary-light">
                      {item.title}
                    </div>
                    <div className="text-gray-700 dark:text-gray-300">
                      {item.description}
                    </div>
                    {item.price && (
                      <div className="font-bold text-indigo-600 dark:text-indigo-300">
                        {item.price}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
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
      
      {/* Curated Collections */}
      <CuratedCollectionsCarousel />

      {/* Featured Items */}
      <FeaturedListingsCarousel />
     
      {/* Video Testimonials Carousel */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-semibold mb-6 text-primary">What Our Users Say</h2>
        <div className="flex gap-6 overflow-x-auto">
          {testimonials.map((t, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-4 min-w-[300px]">
              <video controls className="w-full h-40 rounded mb-2" poster="/images/placeholder.svg">
                <source src={t.videoUrl} type="video/mp4" />
                Sorry, your browser doesn't support embedded videos.
              </video>
              <p className="italic mb-1">"{t.quote}"</p>
              <span className="font-semibold text-sm text-gray-700 dark:text-gray-200">{t.name}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
