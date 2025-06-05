
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

// The main recommendation logic
export function getRecommendations(
  answers: QuizAnswers | null,
  items: RecommendationItem[]
): RecommendationItem[] {
  if (!answers) return [];
  const { purpose, category } = answers;

  if (purpose === "Buy Products") {
    return items.filter(
      (item) =>
        item.type === "product" &&
        (category === "Other" || item.category === category)
    );
  }
  if (purpose === "Find a Service") {
    return items.filter(
      (item) =>
        item.type === "service" &&
        (category === "Other" || item.category === category)
    );
  }
  if (purpose === "Sell or Offer a Service") {
    // Instead of a product/service, return a tip card
    return [
      {
        id: "onboard",
        title: "Become a Top Seller",
        description:
          "Complete your profile and start listing your services today!",
        imageUrl: "/images/placeholder.svg",
      },
    ];
  }
  return [];
}
