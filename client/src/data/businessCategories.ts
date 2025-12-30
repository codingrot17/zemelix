// client/src/data/businessCategories.ts
/**
 * Comprehensive business categories organized by vendor type
 * Based on NAICS (North American Industry Classification System)
 * and global marketplace standards
 */

export interface BusinessCategory {
    id: string;
    name: string;
    description: string;
    keywords: string[];
}

export interface CategoryGroup {
    type: string;
    label: string;
    categories: BusinessCategory[];
}

// Product Seller Categories
const productCategories: BusinessCategory[] = [
    // Fashion & Apparel
    {
        id: "fashion-clothing",
        name: "Clothing & Apparel",
        description: "Ready-to-wear fashion items",
        keywords: ["clothes", "fashion", "apparel"]
    },
    {
        id: "fashion-shoes",
        name: "Footwear & Shoes",
        description: "Shoes, boots, sneakers",
        keywords: ["shoes", "footwear", "sneakers"]
    },
    {
        id: "fashion-accessories",
        name: "Fashion Accessories",
        description: "Bags, belts, scarves, jewelry",
        keywords: ["accessories", "jewelry", "bags"]
    },
    {
        id: "fashion-kids",
        name: "Kids Fashion",
        description: "Children's clothing and accessories",
        keywords: ["kids", "children", "baby"]
    },
    {
        id: "fashion-sports",
        name: "Sportswear & Activewear",
        description: "Athletic clothing and gear",
        keywords: ["sports", "gym", "athletic"]
    },

    // Electronics & Gadgets
    {
        id: "electronics-phones",
        name: "Mobile Phones & Tablets",
        description: "Smartphones, tablets, accessories",
        keywords: ["phone", "mobile", "tablet"]
    },
    {
        id: "electronics-computers",
        name: "Computers & Laptops",
        description: "PCs, laptops, peripherals",
        keywords: ["computer", "laptop", "pc"]
    },
    {
        id: "electronics-audio",
        name: "Audio & Headphones",
        description: "Speakers, headphones, earbuds",
        keywords: ["audio", "headphones", "speakers"]
    },
    {
        id: "electronics-cameras",
        name: "Cameras & Photography",
        description: "Cameras, lenses, accessories",
        keywords: ["camera", "photography", "photo"]
    },
    {
        id: "electronics-gaming",
        name: "Gaming Consoles & Accessories",
        description: "Gaming hardware and accessories",
        keywords: ["gaming", "console", "playstation"]
    },
    {
        id: "electronics-smart",
        name: "Smart Home Devices",
        description: "IoT devices, smart speakers",
        keywords: ["smart", "iot", "automation"]
    },

    // Home & Living
    {
        id: "home-furniture",
        name: "Furniture",
        description: "Indoor and outdoor furniture",
        keywords: ["furniture", "chair", "table"]
    },
    {
        id: "home-decor",
        name: "Home Decor",
        description: "Decorative items, wall art",
        keywords: ["decor", "decoration", "art"]
    },
    {
        id: "home-kitchen",
        name: "Kitchen & Dining",
        description: "Cookware, utensils, appliances",
        keywords: ["kitchen", "cookware", "dining"]
    },
    {
        id: "home-bedding",
        name: "Bedding & Linens",
        description: "Sheets, pillows, comforters",
        keywords: ["bedding", "sheets", "linen"]
    },
    {
        id: "home-lighting",
        name: "Lighting & Lamps",
        description: "Indoor and outdoor lighting",
        keywords: ["lighting", "lamp", "bulb"]
    },
    {
        id: "home-storage",
        name: "Storage & Organization",
        description: "Storage solutions, organizers",
        keywords: ["storage", "organize", "container"]
    },

    // Beauty & Personal Care
    {
        id: "beauty-skincare",
        name: "Skincare Products",
        description: "Creams, serums, moisturizers",
        keywords: ["skincare", "cream", "serum"]
    },
    {
        id: "beauty-makeup",
        name: "Makeup & Cosmetics",
        description: "Makeup products and tools",
        keywords: ["makeup", "cosmetics", "lipstick"]
    },
    {
        id: "beauty-hair",
        name: "Hair Care Products",
        description: "Shampoo, conditioner, styling",
        keywords: ["hair", "shampoo", "conditioner"]
    },
    {
        id: "beauty-fragrance",
        name: "Fragrances & Perfumes",
        description: "Perfumes, colognes, body sprays",
        keywords: ["perfume", "fragrance", "scent"]
    },
    {
        id: "beauty-tools",
        name: "Beauty Tools & Accessories",
        description: "Brushes, mirrors, organizers",
        keywords: ["beauty", "tools", "brushes"]
    },

    // Health & Wellness
    {
        id: "health-supplements",
        name: "Supplements & Vitamins",
        description: "Health supplements and vitamins",
        keywords: ["supplement", "vitamin", "health"]
    },
    {
        id: "health-fitness",
        name: "Fitness Equipment",
        description: "Exercise equipment and gear",
        keywords: ["fitness", "exercise", "gym"]
    },
    {
        id: "health-medical",
        name: "Medical Supplies",
        description: "First aid, medical devices",
        keywords: ["medical", "health", "firstaid"]
    },

    // Food & Beverages
    {
        id: "food-packaged",
        name: "Packaged Foods",
        description: "Snacks, canned goods, dry foods",
        keywords: ["food", "snacks", "packaged"]
    },
    {
        id: "food-beverages",
        name: "Beverages",
        description: "Drinks, juices, soft drinks",
        keywords: ["beverage", "drink", "juice"]
    },
    {
        id: "food-organic",
        name: "Organic & Natural Foods",
        description: "Organic and health foods",
        keywords: ["organic", "natural", "healthy"]
    },

    // Sports & Outdoors
    {
        id: "sports-equipment",
        name: "Sports Equipment",
        description: "Sports gear and equipment",
        keywords: ["sports", "equipment", "gear"]
    },
    {
        id: "sports-outdoor",
        name: "Outdoor & Camping",
        description: "Camping, hiking gear",
        keywords: ["outdoor", "camping", "hiking"]
    },

    // Toys & Games
    {
        id: "toys-kids",
        name: "Kids Toys",
        description: "Toys for children",
        keywords: ["toys", "kids", "play"]
    },
    {
        id: "toys-educational",
        name: "Educational Toys",
        description: "Learning and educational toys",
        keywords: ["educational", "learning", "stem"]
    },
    {
        id: "toys-games",
        name: "Board Games & Puzzles",
        description: "Games and puzzles",
        keywords: ["game", "puzzle", "board"]
    },

    // Books & Media
    {
        id: "books-fiction",
        name: "Books & Magazines",
        description: "Physical books and magazines",
        keywords: ["book", "magazine", "reading"]
    },
    {
        id: "books-educational",
        name: "Educational Materials",
        description: "Textbooks, workbooks",
        keywords: ["education", "textbook", "learning"]
    },

    // Automotive
    {
        id: "auto-parts",
        name: "Auto Parts & Accessories",
        description: "Car parts and accessories",
        keywords: ["auto", "car", "parts"]
    },

    // Pet Supplies
    {
        id: "pet-supplies",
        name: "Pet Food & Supplies",
        description: "Pet care products",
        keywords: ["pet", "dog", "cat"]
    },

    // Office & Stationery
    {
        id: "office-supplies",
        name: "Office Supplies",
        description: "Stationery, office equipment",
        keywords: ["office", "stationery", "supplies"]
    },

    // Arts & Crafts
    {
        id: "arts-supplies",
        name: "Art Supplies",
        description: "Painting, drawing materials",
        keywords: ["art", "craft", "supplies"]
    },
    {
        id: "arts-handmade",
        name: "Handmade Crafts",
        description: "Handcrafted items",
        keywords: ["handmade", "craft", "diy"]
    },

    // Other
    {
        id: "products-other",
        name: "Other Products",
        description: "Other retail products",
        keywords: ["other", "miscellaneous"]
    }
];

// Service Provider Categories
const serviceCategories: BusinessCategory[] = [
    // Professional Services
    {
        id: "service-legal",
        name: "Legal Services",
        description: "Lawyers, legal consultation",
        keywords: ["legal", "lawyer", "attorney"]
    },
    {
        id: "service-accounting",
        name: "Accounting & Bookkeeping",
        description: "Financial services, tax prep",
        keywords: ["accounting", "bookkeeping", "tax"]
    },
    {
        id: "service-consulting",
        name: "Business Consulting",
        description: "Business advisory services",
        keywords: ["consulting", "advisory", "business"]
    },

    // Technology Services
    {
        id: "tech-web",
        name: "Web Development",
        description: "Website design and development",
        keywords: ["web", "website", "development"]
    },
    {
        id: "tech-mobile",
        name: "Mobile App Development",
        description: "iOS and Android apps",
        keywords: ["mobile", "app", "ios", "android"]
    },
    {
        id: "tech-software",
        name: "Software Development",
        description: "Custom software solutions",
        keywords: ["software", "programming", "coding"]
    },
    {
        id: "tech-it",
        name: "IT Support & Services",
        description: "Technical support, networking",
        keywords: ["it", "support", "tech"]
    },
    {
        id: "tech-data",
        name: "Data & Analytics",
        description: "Data analysis, BI services",
        keywords: ["data", "analytics", "bi"]
    },
    {
        id: "tech-cyber",
        name: "Cybersecurity",
        description: "Security services",
        keywords: ["security", "cyber", "protection"]
    },

    // Creative Services
    {
        id: "creative-graphic",
        name: "Graphic Design",
        description: "Logo, branding, graphics",
        keywords: ["graphic", "design", "logo"]
    },
    {
        id: "creative-video",
        name: "Video Production",
        description: "Video editing, production",
        keywords: ["video", "production", "editing"]
    },
    {
        id: "creative-photo",
        name: "Photography",
        description: "Event, portrait, commercial",
        keywords: ["photography", "photo", "photographer"]
    },
    {
        id: "creative-writing",
        name: "Content Writing",
        description: "Copywriting, content creation",
        keywords: ["writing", "content", "copywriting"]
    },
    {
        id: "creative-music",
        name: "Music & Audio",
        description: "Music production, voiceover",
        keywords: ["music", "audio", "production"]
    },

    // Beauty & Wellness Services
    {
        id: "beauty-hair-service",
        name: "Hair Salon Services",
        description: "Haircut, styling, coloring",
        keywords: ["hair", "salon", "stylist"]
    },
    {
        id: "beauty-makeup-service",
        name: "Makeup Artist",
        description: "Makeup services for events",
        keywords: ["makeup", "artist", "beauty"]
    },
    {
        id: "beauty-nails",
        name: "Nail Salon",
        description: "Manicure, pedicure services",
        keywords: ["nails", "manicure", "pedicure"]
    },
    {
        id: "beauty-spa",
        name: "Spa & Massage",
        description: "Massage, spa treatments",
        keywords: ["spa", "massage", "wellness"]
    },

    // Health & Fitness Services
    {
        id: "fitness-training",
        name: "Personal Training",
        description: "Fitness coaching",
        keywords: ["fitness", "training", "coach"]
    },
    {
        id: "fitness-yoga",
        name: "Yoga & Pilates",
        description: "Yoga classes and instruction",
        keywords: ["yoga", "pilates", "wellness"]
    },
    {
        id: "health-nutrition",
        name: "Nutrition & Dietitian",
        description: "Dietary consultation",
        keywords: ["nutrition", "diet", "health"]
    },

    // Home Services
    {
        id: "home-cleaning",
        name: "Cleaning Services",
        description: "Home and office cleaning",
        keywords: ["cleaning", "housekeeping", "maid"]
    },
    {
        id: "home-plumbing",
        name: "Plumbing",
        description: "Plumbing repairs and installation",
        keywords: ["plumbing", "plumber", "pipes"]
    },
    {
        id: "home-electrical",
        name: "Electrical Services",
        description: "Electrical repairs",
        keywords: ["electrical", "electrician", "wiring"]
    },
    {
        id: "home-hvac",
        name: "HVAC Services",
        description: "Heating, cooling, ventilation",
        keywords: ["hvac", "ac", "heating"]
    },
    {
        id: "home-painting",
        name: "Painting & Decorating",
        description: "Interior and exterior painting",
        keywords: ["painting", "painter", "decorator"]
    },
    {
        id: "home-carpentry",
        name: "Carpentry & Woodwork",
        description: "Wood furniture, repairs",
        keywords: ["carpentry", "carpenter", "wood"]
    },
    {
        id: "home-landscaping",
        name: "Landscaping & Gardening",
        description: "Garden design, maintenance",
        keywords: ["landscaping", "gardening", "lawn"]
    },

    // Automotive Services
    {
        id: "auto-repair",
        name: "Auto Repair & Maintenance",
        description: "Car repair services",
        keywords: ["auto", "repair", "mechanic"]
    },
    {
        id: "auto-detailing",
        name: "Car Detailing",
        description: "Car cleaning and detailing",
        keywords: ["detailing", "car wash", "cleaning"]
    },

    // Event Services
    {
        id: "event-planning",
        name: "Event Planning",
        description: "Event coordination",
        keywords: ["event", "planning", "coordinator"]
    },
    {
        id: "event-catering",
        name: "Catering Services",
        description: "Food catering for events",
        keywords: ["catering", "food", "events"]
    },
    {
        id: "event-dj",
        name: "DJ & Entertainment",
        description: "Music and entertainment",
        keywords: ["dj", "entertainment", "music"]
    },

    // Education & Training
    {
        id: "education-tutoring",
        name: "Tutoring & Teaching",
        description: "Private tutoring",
        keywords: ["tutoring", "teaching", "education"]
    },
    {
        id: "education-music",
        name: "Music Lessons",
        description: "Instrument instruction",
        keywords: ["music", "lessons", "teaching"]
    },
    {
        id: "education-language",
        name: "Language Instruction",
        description: "Language teaching",
        keywords: ["language", "teaching", "esl"]
    },

    // Transportation
    {
        id: "transport-delivery",
        name: "Delivery & Courier",
        description: "Package delivery",
        keywords: ["delivery", "courier", "shipping"]
    },
    {
        id: "transport-moving",
        name: "Moving & Relocation",
        description: "Moving services",
        keywords: ["moving", "relocation", "movers"]
    },

    // Pet Services
    {
        id: "pet-grooming",
        name: "Pet Grooming",
        description: "Pet grooming services",
        keywords: ["pet", "grooming", "dog"]
    },
    {
        id: "pet-sitting",
        name: "Pet Sitting & Walking",
        description: "Pet care services",
        keywords: ["pet", "sitting", "walking"]
    },

    // Real Estate
    {
        id: "realestate-agent",
        name: "Real Estate Services",
        description: "Property sales, rentals",
        keywords: ["realestate", "property", "agent"]
    },

    // Marketing & Advertising
    {
        id: "marketing-digital",
        name: "Digital Marketing",
        description: "SEO, social media, ads",
        keywords: ["marketing", "digital", "seo"]
    },
    {
        id: "marketing-social",
        name: "Social Media Management",
        description: "Social media services",
        keywords: ["social", "media", "management"]
    },

    // Other Services
    {
        id: "service-other",
        name: "Other Services",
        description: "Other professional services",
        keywords: ["other", "miscellaneous"]
    }
];

// Digital/Virtual Product Categories
const digitalCategories: BusinessCategory[] = [
    {
        id: "digital-software",
        name: "Software & Apps",
        description: "Digital software products",
        keywords: ["software", "app", "digital"]
    },
    {
        id: "digital-courses",
        name: "Online Courses",
        description: "Educational courses",
        keywords: ["course", "education", "online"]
    },
    {
        id: "digital-ebooks",
        name: "E-books & Digital Books",
        description: "Digital books",
        keywords: ["ebook", "book", "digital"]
    },
    {
        id: "digital-templates",
        name: "Templates & Themes",
        description: "Design templates",
        keywords: ["template", "theme", "design"]
    },
    {
        id: "digital-music",
        name: "Music & Audio Files",
        description: "Digital music",
        keywords: ["music", "audio", "sound"]
    },
    {
        id: "digital-stock",
        name: "Stock Photos & Videos",
        description: "Stock media",
        keywords: ["stock", "photo", "video"]
    },
    {
        id: "digital-other",
        name: "Other Digital Products",
        description: "Other digital goods",
        keywords: ["digital", "download"]
    }
];

export const categoryDatabase: CategoryGroup[] = [
    {
        type: "product-seller",
        label: "Product Seller",
        categories: productCategories
    },
    {
        type: "service-provider",
        label: "Service Provider",
        categories: serviceCategories
    },
    {
        type: "digital-creator",
        label: "Digital Creator",
        categories: digitalCategories
    },
    {
        type: "hybrid",
        label: "Hybrid (Products + Services)",
        categories: [...productCategories, ...serviceCategories]
    }
];

/**
 * Get categories for specific vendor type
 */
export function getCategoriesForType(vendorType: string): BusinessCategory[] {
    const group = categoryDatabase.find(g => g.type === vendorType);
    return group?.categories || [];
}

/**
 * Search categories by keyword
 */
export function searchCategories(
    query: string,
    vendorType?: string
): BusinessCategory[] {
    const categories = vendorType
        ? getCategoriesForType(vendorType)
        : categoryDatabase.flatMap(g => g.categories);

    const lowerQuery = query.toLowerCase();

    return categories.filter(
        cat =>
            cat.name.toLowerCase().includes(lowerQuery) ||
            cat.description.toLowerCase().includes(lowerQuery) ||
            cat.keywords.some(kw => kw.includes(lowerQuery))
    );
}

/**
 * Get vendor type options
 */
export const vendorTypeOptions = [
    {
        id: "product-seller",
        label: "Product Seller",
        description: "Sell physical or packaged goods",
        icon: "🛍️"
    },
    {
        id: "service-provider",
        label: "Service Provider",
        description: "Offer bookable professional services",
        icon: "⚡"
    },
    {
        id: "digital-creator",
        label: "Digital Creator",
        description: "Sell digital products and downloads",
        icon: "💻"
    },
    {
        id: "wholesaler",
        label: "Wholesaler",
        description: "Bulk sales to businesses (B2B)",
        icon: "📦"
    },
    {
        id: "other",
        label: "Other",
        description: "Other business types",
        icon: "🔄"
    }
];
