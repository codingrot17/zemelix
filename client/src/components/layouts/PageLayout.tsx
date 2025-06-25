import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Outlet } from "react-router-dom"; 
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { ArrowUp, MessageCircle } from 'lucide-react';

interface PageLayoutProps {
  children: ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  // Back to Top visibility
  const [showTop, setShowTop] = useState(false);
  // Chat modal state
  const [chatOpen, setChatOpen] = useState(false);

  // Show "Back to Top" after scrolling down
  useEffect(() => {
    const onScroll = () => {
      setShowTop(window.scrollY > 200);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Smooth scroll to top
  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Simple Chat Modal (stub)
  const ChatModal = () => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg w-full max-w-xs sm:max-w-md p-4 relative mx-2">
      <button
        className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
        onClick={() => setChatOpen(false)}
        aria-label="Close chat"
      >
        ×
      </button>
      <div className="flex items-center gap-2 mb-3">
        <MessageCircle className="w-6 h-6 text-indigo-600" />
        <span className="font-semibold text-lg text-gray-900 dark:text-gray-100">
          Chat with Us
        </span>
      </div>
      <div className="text-gray-700 dark:text-gray-300 mb-4">
        Hi! How can we help you today?
      </div>
      {/* Replace below with your real chat widget or contact form */}
      <input
        type="text"
        placeholder="Type your message..."
        className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none mb-2"
      />
      <button
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded"
        onClick={() => alert('Message sent! (stub)')}
      >
        Send
      </button>
    </div>
  </div>
);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />

      {/* Back to Top Button */}
      {showTop && (
        <button
          onClick={handleBackToTop}
          aria-label="Back to top"
          className="fixed bottom-24 right-5 z-50 bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* Chat with Us Floating Button */}
      <button
        onClick={() => setChatOpen(true)}
        aria-label="Chat with us"
        className="fixed bottom-5 right-5 z-50 bg-white dark:bg-indigo-700 text-indigo-600 dark:text-white p-3 rounded-full shadow-lg border border-indigo-100 dark:border-indigo-800 hover:bg-indigo-600 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Chat Modal */}
      {chatOpen && <ChatModal />}
    </div>
  );
};

export default PageLayout;
