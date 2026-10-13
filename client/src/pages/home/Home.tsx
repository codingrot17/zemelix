import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const [quizDone, setQuizDone] = useState(false);
  const [quizDismissed, setQuizDismissed] = useState(false);
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
    if (answers.purpose === "Sell or Offer a Service") {
      navigate("/vendor/upgrade");
      return;
    }
    setQuizDone(true);
    setQuizDismissed(false);
    setQuizAnswers(answers);
  }

  const recommendations = getRecommendations(quizAnswers, liveItems);

  return <div className="min-h-screen overflow-hidden bg-background dark:bg-background">
    <BragBar />
    <HeroSection />

    <section className="mx-auto max-w-2xl px-4 py-5" aria-labelledby="discovery-heading">
      <h2 id="discovery-heading" className="mb-2 text-center text-xl font-bold text-primary sm:text-2xl">Find your next favourite</h2>
      <p className="mb-3 text-center text-sm text-muted-foreground">Optional: answer two quick questions for listing suggestions. You can browse the marketplace without taking the quiz.</p>
      {quizDone ? (
        <div className="flex justify-center"><button type="button" className="text-sm font-medium text-indigo-600 underline dark:text-indigo-300" onClick={() => { setQuizDone(false); setQuizDismissed(false); setQuizAnswers(null); }}>Try different preferences</button></div>
      ) : quizDismissed ? (
        <div className="flex justify-center"><button type="button" className="text-sm font-medium text-indigo-600 underline dark:text-indigo-300" onClick={() => setQuizDismissed(false)}>Try the discovery quiz</button></div>
      ) : (
        <DiscoveryQuiz onResult={handleQuizComplete} onSkip={() => setQuizDismissed(true)} />
      )}
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
