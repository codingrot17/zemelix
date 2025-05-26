import React, { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        {/* Logo or Branding */}
        <div className="flex justify-center mb-6">
          {/* Replace with your logo */}
          <img src="/react.svg" alt="Zemelix Logo" className="h-12 w-auto" />
        </div>
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">
          Welcome to Zemelix
        </h1>
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
