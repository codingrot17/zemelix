import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
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

const HomePage = () => {
  const { user } = useAuth();
  const [quizDone, setQuizDone] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswers | null>(null);
  const { products } = useProducts({ limit: 50, activeOnly: true });
  const featuredItems: RecommendationItem[] = products.map(p => ({
    id: p.id,
    title: p.title,
    description: p.shortDescription || p.longDescription || "",
    price: new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(p.price),
    imageUrl: p.imageUrl || "/images/placeholder.svg",
    type: p.vendorType === "service" ? "service" : "product",
    category: p.category,
  }));
  const isVendor = user?.role === "seller" || user?.role === "vendor" || user?.profile?.vendorStatus === "active";
  const onboardingStep = typeof user?.profile?.onboardingStep === "number" ? user.profile.onboardingStep : 0;
  const recommendations = getRecommendations(quizAnswers, featuredItems);

  return <div className="min-h-screen overflow-hidden bg-background">
    <BragBar />
    <HeroSection />
    {!quizDone && <section className="mx-auto max-w-2xl px-4 py-6"><h2 className="mb-2 text-center text-xl font-bold text-primary sm:text-2xl">Find your starting point</h2><p className="mb-4 text-center text-gray-600 dark:text-gray-300">Answer two quick questions to see relevant marketplace listings.</p><DiscoveryQuiz onResult={answers=>{setQuizDone(true);setQuizAnswers(answers);}}/></section>}
    {quizDone && <div><RecommendationPanel recommendations={recommendations}/><div className="text-center"><button className="text-sm font-medium text-indigo-600 underline dark:text-indigo-300" onClick={()=>{setQuizDone(false);setQuizAnswers(null);}}>Retake the quiz</button></div></div>}
    <div className="mx-auto max-w-7xl px-4 sm:px-6"><OnboardingProgress completed={onboardingStep} isVendor={Boolean(isVendor)}/></div>
    <CuratedCollectionsCarousel />
    <FeaturedListingsCarousel />
    <TestimonialsSection />
    <FAQSection />
    <CallToActionSection />
  </div>;
};
export default HomePage;
