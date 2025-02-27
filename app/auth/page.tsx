"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FormMessage, Message } from "@/components/form-message";
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_SEOFARM_API_URL || "http://localhost:8000";

// Helper to set authentication
const setAuthentication = (token: string, userId: string) => {
  // Store token in localStorage for API calls
  localStorage.setItem("supabase_token", token);
  localStorage.setItem("user_id", userId);

  // Set cookie for authentication status (for middleware)
  Cookies.set("isAuthenticated", "true", {
    expires: 7, // 7 days
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax"
  });
};
const isAuthenticated = () => {
  const token = localStorage.getItem("supabase_token");
  const cookieAuth = Cookies.get("isAuthenticated");
  return !!token || cookieAuth === "true"; // Authenticated if either token or cookie exists
};
// Helper to clear authentication
const clearAuthentication = () => {
  localStorage.removeItem("supabase_token");
  localStorage.removeItem("user_id");
  Cookies.remove("isAuthenticated");
};

export default function SignIn() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated, if so redirect to home
    if (isAuthenticated()) {
      router.push("/");
    }
  }, [router]);

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const formData = new FormData(e.currentTarget);
      const email = formData.get("email")?.toString();
      const password = formData.get("password")?.toString();

      if (!email || !password) {
        setMessage({ error: "Email and password are required" });
        setIsLoading(false);
        return;
      }

      const endpoint = isSignUp ? "/users/sign-up" : "/users/sign-in";
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to ${isSignUp ? "sign up" : "sign in"}`);
      }

      const data = await response.json();
      if (isSignUp) {
        setMessage({ success: data.message });
        setTimeout(() => {
          setIsSignUp(false); // Switch to sign-in form
        }, 2000);
      } else {
        // Set authentication tokens and cookies
        setAuthentication(data.token, data.user_id);

        setMessage({ success: data.message });
        router.push("/"); // Redirect to dashboard
      }
    } catch (error: any) {
      setMessage({ error: error.message || "Something went wrong" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full px-4 -mt-20">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-2 text-center px-6 pt-6">
          <CardTitle className="text-3xl font-bold tracking-tight">
            {isSignUp ? "Sign Up" : "Sign In"}
          </CardTitle>
          <CardDescription>
            {isSignUp ? "Create an account to use SEO Farm" : "Sign in to continue to SEO Farm"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-6 pb-6">
          <form onSubmit={handleAuth} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                required
                className="focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Processing..." : (isSignUp ? "Sign Up" : "Sign In")}
            </Button>
            <FormMessage message={message} />
          </form>
          <div className="text-center">
            <button
              type="button"
              className="text-sm text-primary hover:underline"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}