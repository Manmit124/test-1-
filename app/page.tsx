"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Dashboard from "@/components/dashboard/dashboard";
import { toast } from "sonner";
import { checkOnboarding, fetchBlogDomain, fetchBlogs, generateTitle, getUserData } from "@/utils/queries/queries";

export default function Page() {
  const router = useRouter();
  const [initialData, setInitialData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const token = localStorage.getItem("supabase_token");
        console.log("toke is",token)

        const onboardingStatus = await checkOnboarding();
        if (!onboardingStatus) {
          router.push("/onboarding");
          return;
        }

        const userDetails = await getUserData();
        if (!userDetails) {
          router.push("/sign-in");
          return;
        }

        const [initialBlogs, initialTitle, initialBlogDomain] = await Promise.all([
          fetchBlogs(userDetails.organization_id).catch((err) => {
            throw new Error(`fetchBlogs failed: ${err.message}`);
          }),
          generateTitle(userDetails.organization_id).catch((err) => {
            throw new Error(`generateTitle failed: ${err.message}`);
          }),
          fetchBlogDomain(userDetails.organization_id).catch((err) => {
            throw new Error(`fetchBlogDomain failed: ${err.message}`);
          }),
        ]);

        console.log(
          `Initial Values:\n` +
          `initialBlogs: ${JSON.stringify(initialBlogs, null, 2)}\n` +
          `initialTitle: ${initialTitle}\n` +
          `initialBlogDomain: ${initialBlogDomain}`
        );
        setInitialData({
          userDetails,
          blogs: initialBlogs,
          title: initialTitle || "", // Adjust based on backend response
          blogDomain: initialBlogDomain.blog_domain || "", // Adjust based on backend response
        });
      } catch (error: any) {
        console.error("Error initializing data:", error);
        toast.error("Error initializing data", { description: error.message });
        setError("Failed to load dashboard data. Please try again later.");
        if (error.message.includes("token")) router.push("/sign-in");
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error: {error}</div>;
  }
  if (!initialData) {
    return null;
  }

  return <Dashboard initialData={initialData} />;
}