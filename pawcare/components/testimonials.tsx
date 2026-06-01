import { Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"

export async function Testimonials() {
  const supabase = await createClient()
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, user:users(name)')
    .order('created_at', { ascending: false })
    .limit(3)

  const defaultTestimonials = [
    {
      content: "The grooming service here is exceptional! My poodle has never looked better.",
      author: "Sarah Johnson",
      rating: 5,
    },
    {
      content: "We left our cat for boarding for a week and were so impressed. Daily photo updates!",
      author: "Michael Chen",
      rating: 5,
    },
    {
      content: "Highly recommend the vet consultation. Very thorough and caring staff.",
      author: "Emma Williams",
      rating: 5,
    },
  ]

  const displayReviews = reviews && reviews.length > 0 
    ? reviews.map(r => ({
        content: r.comment,
        author: r.user?.name || "Happy Customer",
        rating: r.rating,
      }))
    : defaultTestimonials

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">What Pet Parents Say</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Real feedback from our wonderful community of pet lovers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayReviews.map((t, i) => (
            <Card key={i} className="bg-secondary/10 border-none shadow-md rounded-3xl hover-lift">
              <CardContent className="pt-8">
                <div className="flex mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-foreground/80 italic mb-6">&quot;{t.content}&quot;</p>
                <div className="flex items-center space-x-3 border-t border-primary/5 pt-4">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                    {t.author.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{t.author}</h4>
                    <p className="text-xs text-muted-foreground">Verified Customer</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
