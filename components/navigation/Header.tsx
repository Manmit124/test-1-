"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight, Settings } from "lucide-react";
import SeoFramLogo from "../icon";
import { checkOnboarding, fetchBlogDomain, fetchBlogs, getUserData } from "@/utils/queries/queries";

interface Blog {
  id: string;
  title: string;
  author: string;
  [key: string]: any;
}

export default function Header() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [blogDomain, setBlogDomain] = useState<string | null>(null);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | undefined>(false);
  const [blogs, setBlogs] = useState<Blog[]>([]);

  useEffect(() => {
    async function fetchUserData() {
      try {
        // Check if token exists; if not, user isn’t authenticated
        const token = localStorage.getItem("supabase_token");
        if (!token) {
          return;
        }

        // Fetch user data
        const userData = await getUserData();
        if (!userData) {
          router.push("/sign-in");
          return;
        }
        setUserId(userData.id);

        // Check onboarding status
        const onboardingStatus : boolean | undefined = await checkOnboarding();
        setOnboardingCompleted(onboardingStatus);

        if (!onboardingStatus || !userData.organization_id) {
          return;
        }

        // Fetch blog domain and blogs
        const [domain, blogData] = await Promise.all([
          fetchBlogDomain(userData.organization_id),
          fetchBlogs(userData.organization_id),
        ]);

        if (domain?.blog_domain) {
          setBlogDomain(`https://${domain.blog_domain}`);
        }
        setBlogs(blogData || []);
      } catch (error:any) {
        console.error("Error fetching user data:", error);

      }
    }

    fetchUserData();
  }, [router]);

  return (
    <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
      <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
        <div className="flex items-center gap-5">
          <Link
            href="/"
            className="font-semibold text-lg hover:text-primary transition-colors"
          >
            <div className="flex flex-row items-center">
              <SeoFramLogo className="w-8 h-10" />
              SEO Farm
            </div>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          {userId && (
            <>
              {blogDomain && blogs.length > 0 && (
                <a
                  href={blogDomain}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded-md transition-colors cursor-pointer"
                >
                  <ArrowUpRight
                    size={16}
                    className="text-gray-600 group-hover:text-primary transition-colors"
                  />
                  My Blog
                </a>
              )}
              {onboardingCompleted && (
                <Link
                  href="/settings"
                  className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded-md transition-colors cursor-pointer"
                >
                  <Settings
                    size={16}
                    className="text-gray-600 group-hover:text-primary transition-colors"
                  />
                  Settings
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}