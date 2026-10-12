export interface QuizAnswers {
  purpose?: "Buy Products" | "Find a Service" | "Sell or Offer a Service";
  category?: string;
}

export interface RecommendationItem {
  id: string | number;
  title: string;
  description: string;
  price?: string;
  imageUrl: string;
  type?: "product" | "service";
  category?: string;
}

export function getRecommendations(answers: QuizAnswers | null, items: RecommendationItem[]): RecommendationItem[] {
  if (!answers) return [];
  const { purpose, category } = answers;
  if (purpose === "Sell or Offer a Service") {
    return [{
      id: "onboard",
      title: "Set up your vendor profile",
      description: "Choose your vendor type and complete the guided onboarding steps to start listing products or services.",
      imageUrl: "/images/placeholder.svg",
    }];
  }

  const type = purpose === "Find a Service" ? "service" : "product";
  const categoryQuery = category && category !== "Other" ? category.toLowerCase().trim() : "";
  const matches = items.filter(item => {
    if (item.type !== type) return false;
    if (!categoryQuery) return true;
    const searchable = `${item.category ?? ""} ${item.title} ${item.description}`.toLowerCase();
    const words = categoryQuery.split(/\s+/).filter(word => word.length > 2);
    return searchable.includes(categoryQuery) || words.some(word => searchable.includes(word));
  });
  // Prefer relevant category matches but still offer real listings of the selected type
  // when current listing categories don't exactly match the quiz labels.
  return matches.length ? matches : items.filter(item => item.type === type).slice(0, 8);
}
