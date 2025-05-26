import React, { useState, InputHTMLAttributes } from "react";
import { FieldError } from "react-hook-form";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: FieldError;
  showPasswordToggle?: boolean;
  id: string; // make id required for label association
}

const Input: React.FC<InputProps> = ({ label, error, showPasswordToggle, type = "text", id, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);

  // Determine input type, toggle password visibility if enabled
  const inputType = showPasswordToggle ? (showPassword ? "text" : "password") : type;

  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={inputType}
          {...props}
          className={`block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
            error ? "border-red-500" : "border-gray-300"
          }`}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label={showPassword ? "Hide password" : "Show password"}
            tabIndex={-1} // so it doesn't interfere with tab order
          >
            {showPassword ? (
              // Eye off icon
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.06.18-2.08.51-3.03m2.4-2.4a9.96 9.96 0 0111.66 11.66m-1.41-1.41a3 3 0 11-4.24-4.24" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
              </svg>
            ) : (
              // Eye icon
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        )}
      </div>
      {error && <p className="text-red-600 text-sm mt-1">{error.message}</p>}
    </div>
  );
};

export default Input;
