"use client"

import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import { StatsCard } from "@/components/stats-card"
import { Calendar, Users, PawPrint, Clock, Loader2, Filter } from "lucide-react"
import { BookingCard } from "@/components/booking-card"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AdminDashboard() {
  const [bookings, setBookings] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [stats, setStats] = React.useState({
    total: 0,
    pending: 0,
    verificationPending: 0,
    customers: 0,
    pets: 0
  })
  const supabase = createClient()

  const fetchData = async () => {
    setLoading(true)
    try {
      const [
        { data: allBookings },
        { count: customerCount },
        { count: petCount }
      ] = await Promise.all([
        supabase.from('bookings').select('*, pet:pets(*), user:users!bookings_user_id_fkey(*)').order('created_at', { ascending: false }),
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('pets').select('*', { count: 'exact', head: true })
      ])

      const bookingsData = allBookings || []
      setBookings(bookingsData)
      setStats({
        total: bookingsData.length,
        pending: bookingsData.filter(b => b.status === 'pending').length,
        verificationPending: bookingsData.filter(b => b.payment_status === 'verification_pending').length,
        customers: customerCount || 0,
        pets: petCount || 0
      })
    } catch (error) {
      toast.error("Failed to fetch admin data")
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchData()
  }, [])

  const updateBookingStatus = async (id: string, status: any) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', id)
      
      if (error) throw error
      
      toast.success(`Booking ${status} successfully`)
      fetchData()
    } catch (error: any) {
      toast.error(error.message || "Update failed")
    }
  }

  const filterBookings = (status?: string, paymentStatus?: string) => {
    let filtered = bookings
    if (status) filtered = filtered.filter(b => b.status === status)
    if (paymentStatus) filtered = filtered.filter(b => b.payment_status === paymentStatus)
    return filtered
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Overview</h1>
          <p className="text-muted-foreground mt-1">Manage all business operations and bookings.</p>
        </div>
        <button 
          onClick={fetchData} 
          className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          title="Refresh Data"
        >
          <Clock className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Bookings" 
          value={stats.total} 
          icon={Calendar} 
        />
        <StatsCard 
          title="Verify Payments" 
          value={stats.verificationPending} 
          icon={Clock} 
          color="text-orange-500"
        />
        <StatsCard 
          title="Pending Requests" 
          value={stats.pending} 
          icon={Calendar} 
          color="text-blue-500"
        />
        <StatsCard 
          title="Total Customers" 
          value={stats.customers} 
          icon={Users} 
          color="text-blue-500"
        />
        <StatsCard 
          title="Total Pets" 
          value={stats.pets} 
          icon={PawPrint} 
          color="text-green-500"
        />
      </div>

      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-bold">Manage Bookings</h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="bg-muted/50 p-1 rounded-2xl mb-8 flex-wrap h-auto">
              <TabsTrigger value="verify" className="rounded-xl px-6 py-2">Verify Payments ({stats.verificationPending})</TabsTrigger>
              <TabsTrigger value="pending" className="rounded-xl px-6 py-2">Pending ({stats.pending})</TabsTrigger>
              <TabsTrigger value="confirmed" className="rounded-xl px-6 py-2">Confirmed</TabsTrigger>
              <TabsTrigger value="all" className="rounded-xl px-6 py-2">All Bookings</TabsTrigger>
            </TabsList>

            <TabsContent value="verify" className="space-y-4">
              {filterBookings(undefined, 'verification_pending').length > 0 ? (
                filterBookings(undefined, 'verification_pending').map((booking) => (
                  <BookingCard 
                    key={booking.id} 
                    booking={booking} 
                    isAdmin 
                    onAction={updateBookingStatus}
                    onPaymentAction={fetchData}
                  />
                ))
              ) : (
                <div className="text-center py-12 bg-card rounded-3xl border border-dashed">
                  <p className="text-muted-foreground">No payments pending verification.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="pending" className="space-y-4">
              {filterBookings('pending').length > 0 ? (
                filterBookings('pending').map((booking) => (
                  <BookingCard 
                    key={booking.id} 
                    booking={booking} 
                    isAdmin 
                    onAction={updateBookingStatus} 
                  />
                ))
              ) : (
                <div className="text-center py-12 bg-card rounded-3xl border border-dashed">
                  <p className="text-muted-foreground">No pending requests at the moment.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="confirmed" className="space-y-4">
              {filterBookings('confirmed').length > 0 ? (
                filterBookings('confirmed').map((booking) => (
                  <BookingCard 
                    key={booking.id} 
                    booking={booking} 
                    isAdmin 
                    onAction={updateBookingStatus} 
                  />
                ))
              ) : (
                <div className="text-center py-12 bg-card rounded-3xl border border-dashed">
                  <p className="text-muted-foreground">No confirmed bookings to show.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="all" className="space-y-4">
              {bookings.map((booking) => (
                <BookingCard 
                  key={booking.id} 
                  booking={booking} 
                  isAdmin 
                  onAction={updateBookingStatus} 
                />
              ))}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}
