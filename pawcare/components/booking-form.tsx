"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Loader2, CheckCircle2, CreditCard, Banknote, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { PetForm } from "@/components/pet-form"

const bookingSchema = z.object({
  pet_id: z.string().min(1, "Please select a pet"),
  service: z.enum(['Grooming', 'Vet Consultation', 'Boarding', 'Training']),
  booking_date: z.string().min(1, "Please select a date"),
  notes: z.string().optional(),
})

type BookingFormValues = z.infer<typeof bookingSchema>

export function BookingForm() {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pets, setPets] = React.useState<any[]>([])
  const [petsLoading, setPetsLoading] = React.useState(true)
  const [showPaymentModal, setShowPaymentModal] = React.useState(false)
  const [pendingBookingData, setPendingBookingData] = React.useState<BookingFormValues | null>(null)
  
  const supabase = createClient()

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      service: 'Grooming',
      notes: "",
    },
  })

  const fetchPets = React.useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase.from('pets').select('*').eq('owner_id', user.id)
      setPets(data || [])
    }
    setPetsLoading(false)
  }, [supabase])

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPets()
  }, [fetchPets])

  const onSubmit = async (values: BookingFormValues) => {
    setPendingBookingData(values)
    setShowPaymentModal(true)
  }

  const handleConfirmBooking = async (payment_method: 'online' | 'offline') => {
    if (!pendingBookingData) return;
    
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { data, error } = await supabase
        .from("bookings")
        .insert([{ 
          ...pendingBookingData, 
          user_id: user.id,
          status: 'pending',
          payment_status: 'pending',
          payment_method: payment_method
        }])
        .select()
        .single()

      if (error) throw error

      if (!data || !data.id) {
        throw new Error("Failed to retrieve booking ID after creation")
      }

      setShowPaymentModal(false)

      if (payment_method === 'offline') {
        toast.success("Booking confirmed! You can pay offline at the time of service.")
        router.push("/dashboard/bookings")
      } else {
        toast.success("Redirecting to online payment...")
        router.push(`/payment/${data.id}`)
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to submit booking")
    } finally {
      setLoading(false)
    }
  }

  if (petsLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <>
      <Card className="border-none shadow-2xl rounded-[2rem] overflow-hidden bg-card">
        <CardContent className="p-8 md:p-12">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="pet_id">Select Pet</Label>
                {pets.length > 0 ? (
                  <Select onValueChange={(val: string | null) => val && form.setValue("pet_id", val)}>
                    <SelectTrigger className="rounded-xl h-12">
                      <SelectValue placeholder="Choose a pet" />
                    </SelectTrigger>
                    <SelectContent>
                      {pets.map((pet) => (
                        <SelectItem key={pet.id} value={pet.id}>
                          {pet.name} ({pet.species})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <PetForm 
                    onSuccess={fetchPets}
                    trigger={
                      <Button variant="outline" className="w-full h-12 rounded-xl border-dashed flex justify-start text-muted-foreground hover:text-foreground">
                        <Plus className="w-4 h-4 mr-2" /> Add a Pet first
                      </Button>
                    }
                  />
                )}
                {form.formState.errors.pet_id && (
                  <p className="text-xs text-red-500">{form.formState.errors.pet_id.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="service">Select Service</Label>
                <Select onValueChange={(val: string | null) => val && form.setValue("service", val as BookingFormValues["service"])} defaultValue="Grooming">
                  <SelectTrigger className="rounded-xl h-12">
                    <SelectValue placeholder="Choose a service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Grooming">Grooming</SelectItem>
                    <SelectItem value="Vet Consultation">Vet Consultation</SelectItem>
                    <SelectItem value="Boarding">Boarding</SelectItem>
                    <SelectItem value="Training">Training</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="booking_date">Appointment Date</Label>
              <Input 
                id="booking_date" 
                type="datetime-local" 
                {...form.register("booking_date")} 
                className="rounded-xl h-12" 
              />
              {form.formState.errors.booking_date && (
                <p className="text-xs text-red-500">{form.formState.errors.booking_date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Special Notes for the staff</Label>
              <Textarea 
                id="notes" 
                {...form.register("notes")} 
                placeholder="e.g. My dog is nervous around other dogs, please keep him separate." 
                className="rounded-xl min-h-[120px]" 
              />
            </div>

            <Button type="submit" className="w-full rounded-2xl h-14 text-lg font-bold shadow-primary-lg hover-lift" disabled={loading || pets.length === 0}>
              <CheckCircle2 className="mr-2 h-5 w-5" />
              Book Now
            </Button>
            <p className="text-center text-xs text-muted-foreground mt-4">
              You will be able to select your payment method in the next step.
            </p>
          </form>
        </CardContent>
      </Card>

      <Dialog open={showPaymentModal} onOpenChange={(open) => !loading && setShowPaymentModal(open)}>
        <DialogContent className="sm:max-w-md rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
          <div className="p-6 pb-2 text-center">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold mb-2">Select Payment Method</DialogTitle>
              <DialogDescription className="text-base">
                How would you like to pay for your service?
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-6 space-y-4">
            <button
              onClick={() => handleConfirmBooking('online')}
              disabled={loading}
              className="w-full flex items-center p-4 border-2 border-primary/20 hover:border-primary rounded-xl transition-all hover:bg-primary/5 text-left group bg-card"
            >
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform shrink-0">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-foreground">Online Payment</h3>
                <p className="text-sm text-muted-foreground">Pay securely via Cards, UPI, or Net Banking.</p>
              </div>
            </button>

            <button
              onClick={() => handleConfirmBooking('offline')}
              disabled={loading}
              className="w-full flex items-center p-4 border-2 border-primary/20 hover:border-primary rounded-xl transition-all hover:bg-primary/5 text-left group bg-card"
            >
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform shrink-0">
                <Banknote className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-foreground">Offline Payment</h3>
                <p className="text-sm text-muted-foreground">Pay directly at the clinic/store.</p>
              </div>
            </button>
          </div>
          
          {loading && (
            <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex flex-col items-center justify-center z-10">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
              <p className="font-medium text-lg">Processing booking...</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
