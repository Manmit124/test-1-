"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import OnboardingForm from "@/components/onboardingform";
import { checkOnboarding, getUserData } from "@/utils/queries/queries";

export default function Page() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        setError(null);
        

        const onboardingStatus = await checkOnboarding();
        if (onboardingStatus) {
          router.push("/");
        }
      } catch (error: any) {
        setError("Failed to load onboarding page: " + error.message);
        if (error.message.includes("token")) router.push("/sign-in");
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [router]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Set Up Your Organization</CardTitle>
          <CardDescription>
            Fill in the details below to create your organization profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OnboardingForm />
        </CardContent>
      </Card>
    </div>
  );
}