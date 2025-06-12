require('./nedb-polyfill');
const { collectionsDB } = require('./db/database');

const seedCollections = [
  {
    id: 1,
    title: "Top Electronics",
    description: "Latest gadgets and must-have devices.",
    longDescription: "Explore the latest in electronics, from smart devices to audio gear. Curated by Jane Doe.",
    imageUrl: "/images/placeholder.svg",
    slug: "electronics",
    badge: "Featured",
    tags: ["Tech", "Devices", "Gadgets"],
    curator: { name: "Jane Doe", avatar: "/images/placeholder.svg", rating: 4.9 },
    itemCount: 32,
    priceFrom: "From $99",
    exampleService: {
      title: "Device Setup & Support",
      description: "Get your gadgets up and running with our expert setup service.",
      price: "From $39"
    },
    type: "goods"
  },
  {
    id: 2,
    title: "Web Design Services",
    description: "Professional website design tailored for your business.",
    longDescription: "Our top-rated web designers craft beautiful, responsive sites for any industry. Let your brand shine online!",
    imageUrl: "/images/placeholder.svg",
    slug: "web-design",
    badge: "Popular",
    tags: ["Services", "Web", "Design"],
    curator: { name: "CodeSmith", avatar: "/images/placeholder.svg", rating: 5.0 },
    itemCount: 12,
    priceFrom: "From $250",
    exampleService: {
      title: "Business Website Package",
      description: "Complete design, development, and launch for small businesses.",
      price: "$500"
    },
    type: "booking"
  },
  {
    id: 3,
    title: "Home & Garden",
    description: "Everything for a cozy, beautiful home.",
    longDescription: "From decor to gardening tools, find everything to make your home and garden flourish.",
    imageUrl: "/images/placeholder.svg",
    slug: "home-garden",
    tags: ["Home", "Garden", "Decor"],
    curator: { name: "RetroGuy", avatar: "/images/placeholder.svg" },
    itemCount: 14,
    priceFrom: "From $15",
    exampleService: {
      title: "Garden Planning Consultation",
      description: "Personalized advice for your home garden.",
      price: "$80"
    },
    type: "goods"
  }
];

// Insert seed data
seedCollections.forEach(collection => {
  collectionsDB.insert(collection, (err, newDoc) => {
    if (err) {
      console.error('Error inserting collection:', err);
    } else {
      console.log('Inserted collection:', newDoc.title);
    }
  });
});

console.log('Seeding completed!');
