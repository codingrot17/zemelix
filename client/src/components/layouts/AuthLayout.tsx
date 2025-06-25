import type { ReactNode } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Link } from "react-router-dom";
import ThemeToggle from "../ui/ThemeToggle";

type AuthLayoutProps = {
  children: ReactNode;
  title?: string;
};

export default function AuthLayout({
  children,
  title = "Welcome Back",
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 dark:bg-background px-4 py-8 font-sans">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 bg-white dark:bg-card rounded-2xl shadow-xl overflow-hidden">
        {/* Left side with theme-aware background */}
        <div className="hidden md:block relative">
          <div
            className="absolute inset-0 bg-cover bg-center dark:hidden"
            style={{ backgroundImage: "url('/images/illustration-light.png')" }}
          />
          <div
            className="absolute inset-0 bg-cover bg-center hidden dark:block"
            style={{ backgroundImage: "url('/images/illustration-dark.png')" }}
          />
        </div>

        {/* Right side - Form */}
        <div className="flex items-center justify-center p-2 md:p-12">
          <Card className="w-full max-w-md border-none shadow-none bg-transparent">
            <ThemeToggle />
            <CardHeader className="text-center">
              <div className="mb-6">
                <Link to="/">
                    <img
                      src="/images/brand-light.jpg"
                      alt="Zemelix Brand Logo"
                      className="dark:hidden mx-auto h-20 w-20 object-contain rounded-full shadow-md"
                    />
                    <img
                      src="/images/brand-dark.jpg"
                      alt="Zemelix Brand Logo"
                      className="hidden dark:block mx-auto h-20 w-20 object-contain rounded-full shadow-md"
                    />
                </Link>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
                {title}
              </h2>
            </CardHeader>
            <CardContent>{children}</CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
