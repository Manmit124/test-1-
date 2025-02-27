"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axiosInstance from "@/utils/axiosInstance";



const OnboardingForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const response = await axiosInstance.post("/organizations", formData);
      console.log("Organization created:", response.data);
      toast.success("Organization created successfully");
      router.refresh()
      router.replace("/");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      toast.error("Error in onboarding", { description: err.message });
      console.error("Error creating organization:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6" encType="multipart/form-data">
      {error && <p className="text-red-500">{error}</p>}

      <div className="space-y-2">
        <Label htmlFor="name">Organization Name</Label>
        <Input
          id="name"
          name="name"
          required
          placeholder="Enter your organization name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="domain">Domain</Label>
        <Input
          id="domain"
          name="domain"
          required
          placeholder="example.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="logo">Logo</Label>
        <Input
          type="file"
          accept="image/*"
          id="logo"
          name="logo"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tagline">Tagline</Label>
        <Input
          id="tagline"
          name="tagline"
          required
          placeholder="Your organization's tagline"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="about">About Company</Label>
        <Textarea
          id="about"
          name="about"
          required
          minLength={500}
          placeholder="Tell us about your organization (minimum 500 characters)"
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="authors">Authors</Label>
        <Input
          id="authors"
          name="authors"
          required
          placeholder="John Doe, Jane Smith"
        />
        <p className="text-sm text-muted-foreground">Separate multiple authors with commas</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="industry">Industry</Label>
        <Input
          id="industry"
          name="industry"
          required
          placeholder="Your industry"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="bg_color">Background Color</Label>
          <Input
            type="color"
            id="bg_color"
            name="bg_color"
            defaultValue="#FFFFFF"
            className="w-12 h-12 p-1 rounded-md"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="theme_color">Theme Color</Label>
          <Input
            type="color"
            id="theme_color"
            name="theme_color"
            defaultValue="#000000"
            className="w-12 h-12 p-1 rounded-md"
          />
        </div>
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Submitting..." : "Submit"}
      </Button>
    </form>
  );
};

export default OnboardingForm;