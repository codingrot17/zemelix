import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import AuthLayout from "@/components/layouts/AuthLayout";
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

const registerSchema = z
  .object({
    email: z.string().email({ message: "Please enter a valid email address." }),
    password: z.string().min(6, { message: "Password must be at least 6 characters." }),
    confirmPassword: z.string().min(6, { message: "Please confirm your password." }),
    acceptTerms: z.boolean().refine(val => val === true, {
      message: "You must accept the terms and conditions.",
    }),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Passwords do not match.",
      });
    }
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "", confirmPassword: "", acceptTerms: false },
  });

  function onSubmit(values: RegisterFormData) {
    console.log("Registration attempt:", values);
    alert("Registration functionality is not implemented in this demo. Check console for input values.");
  }

  return (
    <AuthLayout title="Create an Account">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
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
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel htmlFor="password">Password</FormLabel>
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
            control={form.control}
            name="confirmPassword"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
                <FormControl>
                  <Input
                    id="confirmPassword"
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
            control={form.control}
            name="acceptTerms"
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
                  <FormLabel htmlFor="acceptTerms" className="cursor-pointer select-none">
                    I accept the terms and conditions
                  </FormLabel>
                </div>
                {form.formState.errors.acceptTerms && (
                  <FormMessage>{form.formState.errors.acceptTerms.message}</FormMessage>
                )}
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full hover:opacity-70 transition-opacity duration-200">
            Sign Up
          </Button>
        </form>
      </Form>

      <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        Already have an account?{" "}
        <Link
          to="/login"
          className="underline text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
        >
          Sign in
        </Link>
      </div>
    </AuthLayout>
  );
}
