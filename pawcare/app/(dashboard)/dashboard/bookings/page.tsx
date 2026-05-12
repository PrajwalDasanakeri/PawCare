"use client"

import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import { BookingCard } from "@/components/booking-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Loader2, Plus } from "lucide-react"

export default function BookingsPage() {
  const [bookings, setBookings] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const supabase = createClient()

  const fetchBookings = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from('bookings')
        .select('*, pet:pets(*)')
        .eq('user_id', user.id)
        .order('booking_date', { ascending: false })
      setBookings(data || [])
    }
    setLoading(false)
  }

  React.useEffect(() => {
    fetchBookings()
  }, [])

  const filterBookings = (status?: string) => {
    if (!status) return bookings
    return bookings.filter(b => b.status === status)
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Bookings</h1>
          <p className="text-muted-foreground mt-1">Track and manage your appointments.</p>
        </div>
        <Link href="/book">
          <Button className="rounded-xl h-11 px-6 shadow-primary-lg">
            <Plus className="mr-2 h-4 w-4" />
            Book New Service
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="bg-muted/50 p-1 rounded-2xl mb-8">
            <TabsTrigger value="all" className="rounded-xl px-6">All</TabsTrigger>
            <TabsTrigger value="pending" className="rounded-xl px-6">Pending</TabsTrigger>
            <TabsTrigger value="confirmed" className="rounded-xl px-6">Confirmed</TabsTrigger>
            <TabsTrigger value="completed" className="rounded-xl px-6">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {bookings.length > 0 ? (
              bookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            ) : (
              <EmptyState />
            )}
          </TabsContent>
          
          <TabsContent value="pending" className="space-y-4">
            {filterBookings('pending').length > 0 ? (
              filterBookings('pending').map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            ) : (
              <EmptyState status="pending" />
            )}
          </TabsContent>

          <TabsContent value="confirmed" className="space-y-4">
            {filterBookings('confirmed').length > 0 ? (
              filterBookings('confirmed').map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            ) : (
              <EmptyState status="confirmed" />
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {filterBookings('completed').length > 0 ? (
              filterBookings('completed').map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            ) : (
              <EmptyState status="completed" />
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

function EmptyState({ status }: { status?: string }) {
  return (
    <div className="text-center py-20 bg-card rounded-[3rem] border border-dashed border-primary/20">
      <h2 className="text-xl font-bold">No {status ? `${status} ` : ""}bookings found</h2>
      <p className="text-muted-foreground mt-2 max-w-xs mx-auto">
        {status 
          ? `You don't have any ${status} appointments at the moment.` 
          : "You haven't made any bookings yet."}
      </p>
      {!status && (
        <div className="mt-6">
          <Link href="/book">
            <Button variant="outline" className="rounded-xl">Book Now</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
