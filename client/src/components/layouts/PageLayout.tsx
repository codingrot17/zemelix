import type { ReactNode } from 'react';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';

interface PageLayoutProps {
  children: ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
};

export default PageLayout;
