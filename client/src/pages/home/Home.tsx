import { useState } from "react";
import BragBar from "@/components/features/home/BragBar";
import HeroSection from "@/components/features/home/Hero";
import DiscoveryQuiz from "@/components/features/home/DiscoveryQuiz";
import { OnboardingProgress } from "@/components/features/home/OnboardingProgress";
import { CuratedCollectionsCarousel } from "@/components/features/home/CuratedCollectionsSection";
import { FeaturedListingsCarousel } from "@/components/features/home/FeaturedListingsSection";
import { TestimonialsSection } from "@/components/features/home/TestimonialsSection";
import { RecommendationPanel } from "@/components/features/home/RecommendationPanel";
import { getRecommendations, type QuizAnswers, type RecommendationItem } from "@/utils/recommendations";
import { CallToActionSection } from "@/components/features/home/CallToActionSection";
import { FAQSection } from "@/components/features/home/FAQSection";
import { useProducts } from "@/hooks/useProducts";
import { useAuth } from "@/contexts/AuthContext";

const HomePage = () => {
  const [quizDone, setQuizDone] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswers | null>(null);
  const { user } = useAuth();
  const { products } = useProducts({ limit: 50, activeOnly: true });

  const liveItems: RecommendationItem[] = products.map(product => ({
    id: product.id,
    title: product.title,
    description: product.shortDescription || product.longDescription || "",
    price: new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(product.price),
    imageUrl: product.imageUrl || "/images/placeholder.svg",
    type: product.vendorType === "service" ? "service" : "product",
    category: product.category,
  }));

  function handleQuizComplete(answers: QuizAnswers) {
    setQuizDone(true);
    setQuizAnswers(answers);
  }

  const recommendations = getRecommendations(quizAnswers, liveItems);

  return <div className="min-h-screen overflow-hidden bg-background dark:bg-background">
    <BragBar />
    <HeroSection />

    <section className="mx-auto max-w-2xl px-4 py-6">
      <h2 className="mb-2 text-center text-xl font-bold text-primary dark:text-primary-light sm:text-2xl">Find your next favourite</h2>
      <p className="mb-4 text-center text-muted-foreground">Answer two quick questions to discover matching products and services from current listings.</p>
      {!quizDone ? <DiscoveryQuiz onResult={handleQuizComplete} /> : <div className="flex justify-center"><button type="button" className="text-sm font-medium text-indigo-600 underline dark:text-indigo-300" onClick={() => { setQuizDone(false); setQuizAnswers(null); }}>Start quiz again</button></div>}
    </section>

    {quizDone && <RecommendationPanel recommendations={recommendations} />}
    {(!user || user.role !== "seller") && user?.role !== "admin" && <div className="mx-auto max-w-7xl px-4 sm:px-6"><OnboardingProgress /></div>}

    <CuratedCollectionsCarousel />
    <FeaturedListingsCarousel />
    <TestimonialsSection />
    <FAQSection />
    <CallToActionSection />
  </div>;
};

export default HomePage;
