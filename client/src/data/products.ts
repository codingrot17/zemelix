export type Product = {
    id: string;
    title: string;
    price: number;
    imageUrl: string;
    category: string;
    description?: string;
};

export const products: Product[] = [
    {
        id: "p-101",
        title: "Classic White T-Shirt",
        price: 4500,
        imageUrl: "/images/placeholder.svg",
        category: "Apparel",
        description: "Soft cotton tee with minimalist logo print."
    },
    {
        id: "p-102",
        title: "Denim Jacket",
        price: 12500,
        imageUrl: "/images/placeholder.svg",
        category: "Apparel",
        description: "Lightweight denim jacket, perfect for layering."
    },
    {
        id: "p-103",
        title: "Leather Wallet",
        price: 8500,
        imageUrl: "/images/placeholder.svg",
        category: "Accessories",
        description: "Handcrafted genuine leather wallet with card slots."
    },
    {
        id: "p-104",
        title: "Running Sneakers",
        price: 18500,
        imageUrl: "/images/placeholder.svg",
        category: "Footwear",
        description: "Comfortable sneakers with breathable mesh upper."
    },
    {
        id: "p-105",
        title: "Canvas Tote Bag",
        price: 6000,
        imageUrl: "/images/placeholder.svg",
        category: "Accessories",
        description: "Eco-friendly tote bag for everyday carry."
    }
];
