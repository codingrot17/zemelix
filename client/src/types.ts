export interface Collection {
  id: number | string;
  title: string;
  description: string;
  longDescription?: string;
  imageUrl: string;
  slug: string;
  badge?: "Featured" | "Popular" | "New";
  tags?: string[];
  curator?: {
    name: string;
    avatar: string;
    rating?: number;
  };
  itemCount?: number;      // Number of items or services
  priceFrom?: string;
  exampleService?: {
    title: string;
    description: string;
    price: string;
  };
  type: "goods" | "booking"; // <-- NEW: distinguishes physical items vs services
}
