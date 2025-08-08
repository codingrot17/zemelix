export interface Collection {
  id: number | string;
  title: string;
  description: string;
  longDescription?: string;
  imageUrl: string;
  slug: string;
  badge?: "Hot" | "Trending" | "Featured" | "Popular" | "New";
  tags?: string[];
  curator?: {
    name: string;
    avatar: string;
    rating?: number;
  };
  itemCount?: number;
  flashDealEnds: number | null;
  priceFrom?: string;
  exampleService?: {
    title: string;
    description: string;
    price: string;
  };
  type: "goods" | "booking";
}
