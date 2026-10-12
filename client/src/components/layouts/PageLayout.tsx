import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import { ArrowUp, MessageCircle } from "lucide-react";
import SupportChat from "@/components/shared/SupportChat";

const PageLayout: React.FC = () => {
    const [showTop, setShowTop] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setShowTop(window.scrollY > 200);
        window.addEventListener("scroll", onScroll);
        return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("zemelix:open-support", openSupport); };
    }, []);

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow"><Outlet /></main>
            <Footer />
            {showTop && <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Back to top" className="fixed bottom-24 right-5 z-50 bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"><ArrowUp className="w-5 h-5" /></button>}
            {!chatOpen && <button onClick={() => setChatOpen(true)} aria-label="Chat with us" className="fixed bottom-5 right-5 z-50 bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-full shadow-lg border border-indigo-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"><MessageCircle className="w-6 h-6" /></button>}
            {chatOpen && <SupportChat onClose={() => setChatOpen(false)} />}
        </div>
    );
};

export default PageLayout;
