import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import AuthLayout from "@/components/layouts/AuthLayout";
import SocialLoginButtons from "@/components/shared/SocialLoginButtons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Link } from "react-router-dom"; // or next/link if using Next.js

// Login schema
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  rememberMe: z.boolean().optional(),
});

// Magic link schema
const magicLinkSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

export default function LoginPage() {
  const [useMagicLink, setUseMagicLink] = useState(false);

  // Login form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  // Magic link form
  const magicLinkForm = useForm<z.infer<typeof magicLinkSchema>>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: { email: "" },
  });

  function onLoginSubmit(values: z.infer<typeof loginSchema>) {
    console.log("Login attempt:", values);
    alert("Login functionality is not implemented in this demo. Check console for input values.");
  }

  function onMagicLinkSubmit(values: z.infer<typeof magicLinkSchema>) {
    console.log("Magic link requested for:", values.email);
    alert("Magic link sent! (Demo only, check console.)");
  }

  return (
    <AuthLayout title={useMagicLink ? "Sign in with Magic Link" : "Welcome Back"}>
      <SocialLoginButtons />

      {!useMagicLink ? (
        <>
          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
              <FormField
                control={loginForm.control}
                name="email"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel htmlFor="email">Email</FormLabel>
                    <FormControl>
                      <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        {...field}
                        className="rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-50 dark:border-gray-600"
                      />
                    </FormControl>
                    {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
                  </FormItem>
                )}
              />

              <FormField
                control={loginForm.control}
                name="password"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <div className="flex items-center">
                      <FormLabel htmlFor="password">Password</FormLabel>
                      <a
                        href="#"
                        className="ml-auto inline-block text-sm underline text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                      >
                        Forgot your password?
                      </a>
                    </div>
                    <FormControl>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        className="rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-50 dark:border-gray-600"
                      />
                    </FormControl>
                    {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
                  </FormItem>
                )}
              />

              <FormField
                control={loginForm.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-blue-500 data-[state=checked]:text-white dark:data-[state=checked]:bg-blue-600"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel htmlFor="rememberMe" className="cursor-pointer select-none">
                        Remember me
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full hover:opacity-70 transition-opacity duration-200">
                Sign In
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="underline text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              Sign up
            </Link>
          </div>

          <div className="mt-4 text-center">
            <button
              className="text-sm text-blue-600 dark:text-blue-400 underline hover:text-blue-700 dark:hover:text-blue-300"
              onClick={() => setUseMagicLink(true)}
            >
              Use magic link instead
            </button>
          </div>
        </>
      ) : (
        <>
          <Form {...magicLinkForm}>
            <form onSubmit={magicLinkForm.handleSubmit(onMagicLinkSubmit)} className="space-y-6">
              <FormField
                control={magicLinkForm.control}
                name="email"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel htmlFor="magic-email">Email</FormLabel>
                    <FormControl>
                      <Input
                        id="magic-email"
                        type="email"
                        placeholder="m@example.com"
                        {...field}
                        className="rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-50 dark:border-gray-600"
                      />
                    </FormControl>
                    {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full hover:opacity-70 transition-opacity duration-200">
                Send Magic Link
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            <button
              className="underline text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              onClick={() => setUseMagicLink(false)}
            >
              Back to password login
            </button>
          </div>
        </>
      )}
    </AuthLayout>
  );
}
