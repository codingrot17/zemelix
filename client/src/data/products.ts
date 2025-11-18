import type { Product } from "@/types";

export const products: Product[] = [
    {
        id: "p1",
        title: "Wireless Studio Headphones",
        vendorType: "seller",
        vendorName: "AudioFlow",
        vendorAvatar: "https://i.pravatar.cc/150?img=15",
        rating: 4.8,
        price: 89.99,
        shortDescription: "Deep bass, noise-cancelling, and 40h battery life.",
        stock: 32,
        category: "Electronics",
        imageUrl:
            "https://images.unsplash.com/photo-1511379938547-c1f69419868d",
        tags: ["Headphones", "Audio", "Gadget"],
        badge: "Hot"
    },
    {
        id: "p2",
        title: "Urban Portrait Photography",
        vendorType: "service",
        vendorName: "LensPro Studio",
        vendorAvatar: "https://i.pravatar.cc/150?img=28",
        rating: 4.9,
        price: 120,
        shortDescription:
            "On-location portrait sessions for brands and influencers.",
        stock: 5,
        category: "Photography",
        imageUrl:
            "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce",
        tags: ["Service", "Photography", "Booking"],
        badge: "Trending"
    },
    {
        id: "p3",
        title: "Minimalist Wooden Desk Lamp",
        vendorType: "seller",
        vendorName: "CraftHaus",
        vendorAvatar: "https://i.pravatar.cc/150?img=17",
        rating: 4.6,
        price: 49.99,
        shortDescription: "Handcrafted bamboo lamp with soft LED light.",
        stock: 15,
        category: "Home & Decor",
        imageUrl:
            "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
        tags: ["Wood", "Lamp", "Eco"],
        badge: "New"
    },
    {
        id: "p4",
        title: "Full-Stack App Development",
        vendorType: "service",
        vendorName: "DevCrafters",
        vendorAvatar: "https://i.pravatar.cc/150?img=32",
        rating: 4.7,
        price: 899,
        shortDescription: "Custom web and mobile solutions with clean UX.",
        stock: 3,
        category: "Tech Services",
        imageUrl:
            "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
        tags: ["Coding", "Freelance", "Tech"],
        badge: "Featured"
    },
    {
        id: "p5",
        title: "Organic Skincare Essentials Set",
        vendorType: "seller",
        vendorName: "Glow Haven",
        vendorAvatar: "https://i.pravatar.cc/150?img=21",
        rating: 4.5,
        price: 35.5,
        shortDescription:
            "Gentle and effective skincare crafted from natural oils.",
        stock: 20,
        category: "Beauty",
        imageUrl:
            "https://images.unsplash.com/photo-1596464716121-8b94b0e5a4e1",
        tags: ["Organic", "Beauty", "Wellness"],
        badge: "Hot"
    }
];
