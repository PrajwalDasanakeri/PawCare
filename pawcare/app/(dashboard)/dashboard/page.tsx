import { createClient } from "@/lib/supabase/server"
import { StatsCard } from "@/components/stats-card"
import { Calendar, PawPrint, CheckCircle2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BookingCard } from "@/components/booking-card"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const [
    { count: totalBookings },
    { count: pendingBookings },
    { count: completedBookings },
    { count: totalPets },
    { data: recentBookings }
  ] = await Promise.all([
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'pending'),
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'completed'),
    supabase.from('pets').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('bookings').select('*, pet:pets(*)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3)
  ])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome back!</h1>
        <p className="text-muted-foreground mt-1">Here's what's happening with your pets today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Bookings" 
          value={totalBookings || 0} 
          icon={Calendar} 
        />
        <StatsCard 
          title="Pending" 
          value={pendingBookings || 0} 
          icon={Clock} 
          color="text-orange-500"
        />
        <StatsCard 
          title="Completed" 
          value={completedBookings || 0} 
          icon={CheckCircle2} 
          color="text-green-500"
        />
        <StatsCard 
          title="My Pets" 
          value={totalPets || 0} 
          icon={PawPrint} 
          color="text-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Recent Bookings</h2>
            <Link href="/dashboard/bookings">
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          </div>
          <div className="grid gap-4">
            {recentBookings && recentBookings.length > 0 ? (
              recentBookings.map((booking: any) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            ) : (
              <div className="text-center py-12 bg-card rounded-3xl border border-dashed">
                <p className="text-muted-foreground">No recent bookings found.</p>
                <Link href="/book">
                  <Button variant="link" className="mt-2 text-primary">Book your first service</Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold">Quick Actions</h2>
          <div className="grid gap-4">
            <Link href="/book">
              <Button className="w-full h-16 rounded-2xl text-lg font-semibold shadow-md hover-lift">
                Book a Service
              </Button>
            </Link>
            <Link href="/dashboard/pets">
              <Button variant="outline" className="w-full h-16 rounded-2xl text-lg font-semibold hover-lift">
                Add New Pet
              </Button>
            </Link>
          </div>
          
          <div className="mt-8">
            <ReviewForm />
          </div>
        </div>
      </div>
    </div>
  )
}

import { ReviewForm } from "@/components/review-form"
