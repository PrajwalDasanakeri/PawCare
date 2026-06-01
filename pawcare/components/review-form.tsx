"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Star, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(5, "Comment must be at least 5 characters"),
})

type ReviewFormValues = z.infer<typeof reviewSchema>

export function ReviewForm() {
  const [loading, setLoading] = React.useState(false)
  const [rating, setRating] = React.useState(5)
  const [hoveredRating, setHoveredRating] = React.useState(0)
  const supabase = createClient()

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 5,
      comment: "",
    },
  })

  const onSubmit = async (values: ReviewFormValues) => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("You must be logged in to leave a review")
        return
      }

      const { error } = await supabase
        .from('reviews')
        .insert([{
          user_id: user.id,
          rating: values.rating,
          comment: values.comment,
        }])

      if (error) throw error

      toast.success("Thank you for your review!")
      form.reset()
      setRating(5)
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to submit review")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-card p-6 rounded-3xl shadow-lg border border-primary/10">
      <h3 className="text-xl font-bold mb-4">Leave a Review</h3>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label>Rating</Label>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="focus:outline-none transition-transform hover:scale-110"
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => {
                  setRating(star)
                  form.setValue("rating", star)
                }}
              >
                <Star
                  className={cn(
                    "h-8 w-8 transition-colors",
                    (hoveredRating || rating) >= star
                      ? "fill-primary text-primary"
                      : "text-muted-foreground"
                  )}
                />
              </button>
            ))}
          </div>
          {form.formState.errors.rating && (
            <p className="text-xs text-red-500">{form.formState.errors.rating.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="comment">Your Experience</Label>
          <Textarea
            id="comment"
            placeholder="Tell us about your experience with our services..."
            className="rounded-xl min-h-[100px]"
            {...form.register("comment")}
          />
          {form.formState.errors.comment && (
            <p className="text-xs text-red-500">{form.formState.errors.comment.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full rounded-xl h-11" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit Review
        </Button>
      </form>
    </div>
  )
}
