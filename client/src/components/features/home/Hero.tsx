import { Button } from "@/components/ui/button";
import { useState } from "react";

// Mock Data
const categories = [
  { name: "Hairdressing", icon: "💇‍♀️", color: "from-pink-400 to-pink-600" },
  { name: "Web Development", icon: "💻", color: "from-blue-400 to-blue-600" },
  { name: "Home & Living", icon: "🏠", color: "from-emerald-400 to-emerald-600" },
  { name: "See All", icon: "🔎", color: "from-gray-400 to-gray-600" },
];

const promotions = [
  { title: "20% Off First Booking!", desc: "Use code WELCOME20 at checkout.", color: "bg-gradient-to-r from-green-100 to-green-300 text-green-900 dark:from-green-900 dark:to-green-700 dark:text-green-100" },
  { title: "Top Seller: Jane Dev", desc: "5-star web developer now available.", color: "bg-gradient-to-r from-blue-100 to-blue-300 text-blue-900 dark:from-blue-900 dark:to-blue-700 dark:text-blue-100" },
  { title: "New: Same-Day Delivery", desc: "For select products in Lagos.", color: "bg-gradient-to-r from-yellow-100 to-yellow-300 text-yellow-900 dark:from-yellow-900 dark:to-yellow-700 dark:text-yellow-100" },
];

const microStats = [
  { label: "Happy Buyers", value: "12,000+" },
  { label: "Verified Services", value: "500+" },
  { label: "Avg. Rating", value: "4.9/5" },
];

const activityFeed = [
  "Someone just booked a hairdresser in Ikeja!",
  "A seller listed a new vintage camera.",
  "Web developer completed a project for ABC Corp.",
];

const userAvatars = [
  "/images/placeholder.svg", "/images/placeholder.svg", "/images/placeholder.svg", "/images/placeholder.svg"
];

function SpinToWin({ onWin }) {
  const [spun, setSpun] = useState(false);
  const prizes = [
    "10% Off Coupon",
    "Free Listing",
    "₦500 Bonus Credit",
    "Try Again!"
  ];
  const [result, setResult] = useState(null);

  function spin() {
    const prize = prizes[Math.floor(Math.random() * prizes.length)];
    setResult(prize);
    setSpun(true);
    if (prize !== "Try Again!") onWin(prize);
  }

  return (
    <div className="bg-card dark:bg-card-dark rounded-lg shadow px-6 py-4 mt-4 flex flex-col items-center border border-muted">
      <span className="font-bold text-primary dark:text-primary-light mb-2">🎉 Spin to Win!</span>
      {!spun ? (
        <Button onClick={spin} className="bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-400 dark:hover:bg-indigo-500">Spin Now</Button>
      ) : (
        <div className="mt-2 text-lg font-semibold text-indigo-700 dark:text-indigo-300">{result}</div>
      )}
      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">New users only. Good luck!</span>
    </div>
  );
}

export default function HeroSection() {
  const [promoIdx, setPromoIdx] = useState(0);
  const [wonPrize, setWonPrize] = useState(null);

  function nextPromo() {
    setPromoIdx((promoIdx + 1) % promotions.length);
  }

  return (
    <section className="relative max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-12 flex flex-col md:flex-row items-center md:gap-10 gap-6 bg-background dark:bg-background-dark transition-colors">
      {/* Left: Main content */}
      <div className="flex-1 flex flex-col items-start w-full md:w-auto">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3 text-primary dark:text leading-tight">
          The Marketplace for Everything Local & Digital
        </h1>
        <p className="mb-2 sm:mb-4 text-base sm:text-lg text-foreground dark:text-foreground-light max-w-xs sm:max-w-md">
          Buy, sell, and book trusted services—hairdressing, web development, unique goods, and more!
        </p>

        {/* Animated Category Bubbles */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-5 w-full">
          {categories.map(cat => (
            <Button
              key={cat.name}
              variant="outline"
              className={`rounded-full px-3 sm:px-4 py-2 text-sm sm:text-base font-medium shadow hover:scale-105 transition-transform flex-1 min-w-[110px] bg-gradient-to-r ${cat.color} text-white border-0`}
            >
              <span className="mr-1 sm:mr-2">{cat.icon}</span> {cat.name}
            </Button>
          ))}
        </div>

        {/* Micro-Search */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4 sm:mb-6 w-full">
          <input
            type="text"
            placeholder="Search for products or services..."
            className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-muted-dark dark:text-white w-full sm:w-64 bg-muted text-foreground"
          />
          <Button className="bg-indigo-600 text-white w-full sm:w-auto hover:bg-indigo-700 dark:bg-indigo-400 dark:hover:bg-indigo-500">Search</Button>
        </div>

        {/* Micro-Stats */}
        <div className="flex gap-3 sm:gap-6 mb-4 sm:mb-6 w-full justify-between max-w-xs">
          {microStats.map(stat => (
            <div key={stat.label} className="flex flex-col items-center flex-1">
              <span className="text-lg sm:text-2xl font-bold text-indigo-700 dark:text-indigo-300">{stat.value}</span>
              <span className="text-xs text-gray-600 dark:text-gray-300">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-3 sm:mb-4 w-full">
          <Button className="bg-indigo-600 text-white w-full sm:w-auto hover:bg-indigo-700 dark:bg-indigo-400 dark:hover:bg-indigo-500" size="lg">
            I’m a Buyer
          </Button>
          <Button className="bg-emerald-600 text-white w-full sm:w-auto hover:bg-emerald-700 dark:bg-emerald-400 dark:hover:bg-emerald-500" size="lg">
            I’m a Seller/Service Provider
          </Button>
        </div>

        {/* Spin to Win Promo */}
        {!wonPrize && <SpinToWin onWin={setWonPrize} />}
        {wonPrize && (
          <div className="mt-2 sm:mt-3 text-green-700 dark:text-green-300 font-bold">
            🎁 You won: {wonPrize}
          </div>
        )}
      </div>

      {/* Right: Promotions, Activity, Avatars */}
      <div className="flex-1 flex flex-col items-center gap-2 sm:gap-5 w-full md:w-auto">
        {/* Rotating Promotions */}
        <div
          className={`rounded-lg px-4 sm:px-6 py-3 sm:py-4 mb-2 font-semibold text-base sm:text-lg cursor-pointer w-full text-center shadow border border-muted ${promotions[promoIdx].color}`}
          onClick={nextPromo}
        >
          <span>{promotions[promoIdx].title}</span>
          <div className="text-xs sm:text-sm font-normal">{promotions[promoIdx].desc}</div>
          <span className="text-xs text-gray-400 dark:text-gray-300">Tap for next promo</span>
        </div>

        {/* Live Activity Pulse */}
        <div className="bg-card dark:bg-card-dark rounded shadow px-3 py-2 mb-2 flex items-center gap-2 animate-pulse w-full text-center justify-center border border-muted">
          <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
          <span className="text-xs sm:text-sm text-foreground dark:text-foreground-light">{activityFeed[Math.floor(Math.random() * activityFeed.length)]}</span>
        </div>

        {/* Avatar Wall */}
        <div className="flex items-center gap-1 mt-1 overflow-x-auto w-full max-w-xs scrollbar-thin">
          {userAvatars.map((avatar, idx) => (
            <img
              key={idx}
              src={avatar}
              alt="User avatar"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-white dark:border-gray-700 shadow -ml-2 first:ml-0"
              style={{ zIndex: 10 - idx }}
            />
          ))}
          <span className="ml-2 text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">Join our community!</span>
        </div>
      </div>
    </section>
  );
}
