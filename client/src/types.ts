export interface Collection {
  id: number | string;
  title: string;
  description: string;
  imageUrl: string;
  slug: string;
  badge?: "Featured" | "Popular" | "New";
}
