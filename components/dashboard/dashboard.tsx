"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Sparkles, PenLine } from "lucide-react"
import KnowledgeGraphWrapper from "./KnowledgeGraphWrapper"
import { fetchBlogs, generateAndDeployBlog } from "@/utils/queries/queries"

interface Blog {
  id: string
  title: string
  author: string
  [key: string]: any
}

interface InitialData {
  userDetails: any
  blogs: Blog[]
  title: string
  blogDomain: string
}

export default function Dashboard({ initialData }: { initialData: InitialData }) {
  const { userDetails, blogs: initialBlogs, title, blogDomain } = initialData
  const organizationId = userDetails.organization_id
  const [blogs, setBlogs] = useState<Blog[]>(initialBlogs)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData(e.currentTarget)
      const result = await generateAndDeployBlog(formData)
      if (result.success) {
        const organizationId = formData.get("organizationId") as string
        const updatedBlogs = await fetchBlogs(organizationId)
        setBlogs(updatedBlogs)
        toast.success("Blog generated and deployed successfully")
      }
    } catch (error: any) {
      toast.error("Error while generating blog", error.message)
      setError("Failed to generate blog: " + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-background py-6">
        <div className="absolute inset-0 bg-grid-black/[0.02] -z-10" />
        <div className="container mx-auto px-4">

          {/* Knowledge Graph */}
          {blogs.length > 0 && (
            <motion.div
              className="w-full max-w-4xl mx-auto mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <KnowledgeGraphWrapper blogs={blogs} />
            </motion.div>
          )}

          {/* Blog Generation Form */}
          <motion.div
            className="max-w-2xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="backdrop-blur-sm bg-card/95">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PenLine className="w-5 h-5" />
                  Create New Blog
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input type="hidden" name="organizationId" value={organizationId} />
                  <input type="hidden" name="blogDomain" value={blogDomain} />
                  <textarea
                    name="title"
                    defaultValue={title}
                    placeholder="Enter blog title"
                    className="w-full min-h-[100px] p-3 rounded-lg border bg-background/50 focus:ring-2 focus:ring-ring transition-shadow resize-y"
                  />
                  {error && <p className="text-destructive text-sm">{error}</p>}
                  <Button type="submit" disabled={isLoading} className="w-full">
                    <Sparkles className="w-4 h-4 mr-2" />
                    {isLoading ? "Generating..." : "Generate Blog"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Blog List */}
          {blogs.length > 0 && (
            <motion.div
              className="max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">Published Blogs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {blogs.map((blog, index) => (
                      <motion.div
                        key={blog.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Card className="h-full hover:shadow-lg transition-shadow">
                          <CardContent className="p-4">
                            <h3 className="text-lg font-semibold mb-2 line-clamp-2">{blog.title}</h3>
                            <p className="text-muted-foreground text-sm">by {blog.author}</p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

