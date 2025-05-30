import React from 'react';
import { Button } from "@/components/ui/button";


interface MarketItem {
  id: number;
  title: string;
  description: string;
  price: string;
  imageUrl: string;
}

const featuredItems: MarketItem[] = [
  {
    id: 1,
    title: 'Handmade Wooden Chair',
    description: 'Comfortable and stylish wooden chair for your living room.',
    price: '$120',
    imageUrl: '/images/chair.jpg', // place your image in public folder or adjust path
  },
  {
    id: 2,
    title: 'Web Design Service',
    description: 'Professional website design tailored for your business.',
    price: '$500',
    imageUrl: '/images/web-design.jpg',
  },
  {
    id: 3,
    title: 'Vintage Camera',
    description: 'Classic vintage camera in excellent condition.',
    price: '$250',
    imageUrl: '/images/camera.jpg',
  },
];

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white py-20 px-6 text-center">
        <h1 className="text-4xl font-extrabold mb-4 text-gray-900">
          Welcome to Your Marketplace
        </h1>
        <p className="max-w-xl mx-auto mb-8 text-gray-600 text-lg">
          Buy, sell, and offer services all in one place. Discover unique products and trusted sellers.
        </p>
        <Button className="px-8 py-3" onClick={() => alert('Navigate to products')}>
          Start Shopping
        </Button>
      </section>

      {/* Featured Items */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-semibold mb-10 text-gray-800">Featured Listings</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {featuredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-gray-600">{item.description}</p>
                <p className="mt-4 font-bold text-indigo-600">{item.price}</p>
                <Button
                  variant="secondary"
                  className="mt-4 w-full"
                  onClick={() => alert(`View details for ${item.title}`)}
                >
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
