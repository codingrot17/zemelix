export type VendorType = "seller" | "service";

export interface Product {
    id: string;
    title: string;
    vendorType: VendorType;
    vendorName: string;
    vendorAvatar: string;
    rating: number;
    price: number;
    shortDescription: string;
    stock: number;
    category: string;
    imageUrl: string;
    tags?: string[];
    featured?: boolean;
    badge?: "Hot" | "Trending" | "Featured" | "New";
    vendorBio?: string;
    longDescription?: string;
}

export interface Vendor {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    bio?: string;
}
