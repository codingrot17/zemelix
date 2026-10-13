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

const categoryTerms: Record<string, string[]> = {
  "hairdressing": ["hair", "hairdressing", "salon", "stylist", "beauty-hair-service"],
  "web development": ["web", "website", "development", "tech-web", "programming"],
  "home & living": ["home", "living", "furniture", "decor", "kitchen", "home-furniture", "home-decor"],
  "beauty & personal care": ["beauty", "skincare", "makeup", "hair", "personal care"],
  "digital products": ["digital", "software", "course", "ebook", "template"],
};

export function getRecommendations(answers: QuizAnswers | null, items: RecommendationItem[]): RecommendationItem[] {
  if (!answers) return [];
  const { purpose, category } = answers;

  if (purpose === "Sell or Offer a Service") {
    return [{
      id: "onboard",
      title: "Set up your vendor profile",
      description: "Choose the vendor type that fits your business and follow the guided steps to publish your first listing.",
      imageUrl: "/images/placeholder.svg",
    }];
  }

  const type = purpose === "Find a Service" ? "service" : "product";
  const available = items.filter(item => item.type === type);
  if (!available.length) return [];

  const categoryQuery = category && category !== "Other" ? category.toLowerCase().trim() : "";
  if (!categoryQuery) return available.slice(0, 8);

  const terms = categoryTerms[categoryQuery] ?? [categoryQuery];
  const matches = available.filter(item => {
    const searchable = `${item.category ?? ""} ${item.title} ${item.description}`.toLowerCase();
    return terms.some(term => searchable.includes(term));
  });

  // Never return fabricated listings: show real listings of the chosen type if
  // a category has no exact matches, and explain the fallback in the panel.
  return matches.length ? matches.slice(0, 8) : available.slice(0, 8);
}
