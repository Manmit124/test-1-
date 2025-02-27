"use client"
import axiosInstance from "@/utils/axiosInstance";

export async function checkOnboarding(): Promise<boolean> {
  try {
    const response = await axiosInstance.get("/users/me/onboarding-status");
    return response.data.has_onboarded === true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function getUserData(): Promise<any> {
  const response = await axiosInstance.get("/users/me");
  return response.data;
}

export async function fetchBlogs(orgId: string): Promise<any[]> {
  const response = await axiosInstance.get(`/organizations/${orgId}/blogs`);
  return response.data;
}

export async function generateTitle(orgId: string): Promise<any> {
  const response = await axiosInstance.get(`/organizations/${orgId}/title`);
  return response.data;
}

export async function fetchBlogDomain(orgId: string): Promise<any> {
  const response = await axiosInstance.get(
    `/organizations/${orgId}/blog-domain`
  );
  return response.data;
}


export async function generateAndDeployBlog(
  formData: FormData
): Promise<{ success: boolean; blogDomain?: string }> {
  const organizationId = formData.get("organizationId") as string;
  const blogTitle = formData.get("title") as string;
  const blogDomain = formData.get("blogDomain") as string || "/";

  console.log(`Starting generateAndDeployBlog: orgId=${organizationId}, title=${blogTitle}`);

  try {
    // Generate blog
    console.log("Fetching blog generation API");
    const generateResponse = await axiosInstance.get(`/blogs/${organizationId}`, {
      params: { blog_title: blogTitle },
    });
    if (!generateResponse.data.task_id) {
      throw new Error("Invalid response: task_id missing in generate API");
    }
    const genTaskId = generateResponse.data.task_id;
    console.log(`Generate data: ${JSON.stringify(generateResponse.data)}`);

    // Wait initial period before starting to poll for generation (30 seconds)
    console.log("Waiting 30 seconds before checking generation status");
    await new Promise((resolve) => setTimeout(resolve, 30000));

    // Poll for generation status
    console.log("Starting polling for blog generation status");
    let genStatus = "PENDING";
    while (genStatus !== "SUCCESS" && genStatus !== "FAILED") {
      const statusResponse = await axiosInstance.get(`/task-status/${genTaskId}`);
      genStatus = statusResponse.data.status;
      console.log(`Generation status: ${genStatus}`);

      if (genStatus === "FAILED")
        throw new Error("Blog generation failed");

      if (genStatus !== "SUCCESS") {
        console.log(`Waiting 2 seconds before next generation poll`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    // Deploy blogs
    console.log("Fetching blog deployment API");
    const deployResponse = await axiosInstance.get(`/deploy/${organizationId}`);
    const deployTaskId = deployResponse.data.task_id;
    console.log(`Deploy data: ${JSON.stringify(deployResponse.data)}`);

    // Wait initial period before starting to poll for deployment (105 seconds)
    console.log("Waiting 105 seconds before checking deployment status");
    await new Promise((resolve) => setTimeout(resolve, 105000));

    // Poll for deployment status
    console.log("Starting polling for blog deployment status");
    let deployStatus = "PENDING";
    while (deployStatus !== "SUCCESS" && deployStatus !== "FAILED") {
      const statusResponse = await axiosInstance.get(`/task-status/${deployTaskId}`);
      deployStatus = statusResponse.data.status;
      console.log(`Deployment status: ${deployStatus}`);

      if (deployStatus === "FAILED")
        throw new Error("Blog deployment failed");

      if (deployStatus !== "SUCCESS") {
        console.log(`Waiting 3 seconds before next deployment poll`);
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }
    console.log("Blog generated and deployed successfully!");
    return { success: true, blogDomain }; // Return to client
  } catch (error: any) {
    console.error("Error in generateAndDeployBlog:", error.message || error);
    throw error; // Propagate to client-side handling
  }
}

export async function createOrganization(formData: FormData): Promise<void> {
  const response = await axiosInstance.post("/organizations", formData);
  console.log("Organization created:", response.data);
}
