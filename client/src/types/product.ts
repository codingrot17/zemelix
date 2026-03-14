// Matches actual Appwrite products collection schema
export type VendorType = "seller" | "service";

export type ProductStatus = "active" | "archived" | "draft";

export type ProductBadge = "Hot" | "Trending" | "Featured" | "New";

export interface Product {
    id: string;
    title: string;
    shortDescription: string;
    longDescription?: string;
    imageUrl: string;
    price: number;
    stock: number;
    rating: number;
    category: string;
    tags?: string[];
    badge?: ProductBadge;
    featured?: boolean;
    status?: ProductStatus;
    vendorType: VendorType;
    // Seller contact — direct C2S fields
    sellerName: string;
    sellerAvatar?: string;
    sellerWhatsapp?: string; // WhatsApp number for direct contact
}

export interface Vendor {
    id: string;
    name: string;
    avatar?: string;
    whatsapp?: string;
    rating?: number;
}
