"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Loader2, Calendar as CalendarIcon, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"

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
  const [pets, setPets] = React.useState<any[]>([])
  const [petsLoading, setPetsLoading] = React.useState(true)
  const supabase = createClient()

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      service: 'Grooming',
      notes: "",
    },
  })

  React.useEffect(() => {
    const fetchPets = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('pets').select('*').eq('user_id', user.id)
        setPets(data || [])
      }
      setPetsLoading(false)
    }
    fetchPets()
  }, [])

  const onSubmit = async (values: BookingFormValues) => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { error } = await supabase
        .from("bookings")
        .insert([{ 
          ...values, 
          user_id: user.id,
          status: 'pending'
        }])

      if (error) throw error

      toast.success("Booking submitted successfully! Waiting for confirmation.")
      router.push("/dashboard/bookings")
    } catch (error: any) {
      toast.error(error.message || "Failed to submit booking")
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

  if (pets.length === 0) {
    return (
      <Card className="border-none shadow-lg rounded-3xl p-8 text-center bg-card">
        <h2 className="text-xl font-bold mb-4">No pets found</h2>
        <p className="text-muted-foreground mb-6">You need to add a pet to your profile before you can book a service.</p>
        <Button onClick={() => router.push("/dashboard/pets")} className="rounded-xl">
          Add a Pet
        </Button>
      </Card>
    )
  }

  return (
    <Card className="border-none shadow-2xl rounded-[2rem] overflow-hidden bg-card">
      <CardContent className="p-8 md:p-12">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="pet_id">Select Pet</Label>
              <Select onValueChange={(val: any) => val && form.setValue("pet_id", val)}>
                <SelectTrigger className="rounded-xl h-12">
                  <SelectValue placeholder="Choose a pet" />
                </SelectTrigger>
                <SelectContent>
                  {pets.map((pet) => (
                    <SelectItem key={pet.id} value={pet.id}>
                      {pet.pet_name} ({pet.pet_type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.pet_id && (
                <p className="text-xs text-red-500">{form.formState.errors.pet_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="service">Select Service</Label>
              <Select onValueChange={(val: any) => val && form.setValue("service", val)} defaultValue="Grooming">
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

          <Button type="submit" className="w-full rounded-2xl h-14 text-lg font-bold shadow-primary-lg hover-lift" disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <CheckCircle2 className="mr-2 h-5 w-5" />
            )}
            Confirm Booking
          </Button>
          <p className="text-center text-xs text-muted-foreground mt-4">
            By clicking confirm, you agree to our terms of service and pet care policies.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
