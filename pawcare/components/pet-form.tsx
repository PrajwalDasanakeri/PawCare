"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

const petSchema = z.object({
  name: z.string().min(1, "Name is required"),
  species: z.string().min(1, "Species is required (Dog, Cat, etc.)"),
  breed: z.string().optional(),
  date_of_birth: z.string().optional(),
  weight_kg: z.number().min(0, "Weight must be positive").optional().or(z.nan()),
  notes: z.string().optional(),
})

type PetFormValues = z.infer<typeof petSchema>

interface PetFormProps {
  onSuccess?: () => void
  initialData?: Record<string, unknown> | null
  trigger?: React.ReactNode
}

export function PetForm({ onSuccess, initialData, trigger }: PetFormProps) {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const supabase = createClient()

  const form = useForm<PetFormValues>({
    resolver: zodResolver(petSchema),
    defaultValues: initialData ? {
      name: (initialData.name as string) || "",
      species: (initialData.species as string) || "",
      breed: (initialData.breed as string) || "",
      date_of_birth: (initialData.date_of_birth as string) || "",
      weight_kg: (initialData.weight_kg as number) || undefined,
      notes: (initialData.notes as string) || "",
    } : {
      name: "",
      species: "",
      breed: "",
      date_of_birth: "",
      weight_kg: undefined,
      notes: "",
    },
  })

  const onSubmit = async (values: PetFormValues) => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const payload = {
        ...values,
        date_of_birth: values.date_of_birth ? values.date_of_birth : null,
        weight_kg: values.weight_kg === undefined || values.weight_kg === null || Number.isNaN(Number(values.weight_kg)) ? null : values.weight_kg,
      }

      if (initialData) {
        const { error } = await supabase
          .from("pets")
          .update(payload)
          .eq("id", initialData.id)
        if (error) throw error
        toast.success("Pet updated successfully!")
      } else {
        const { error } = await supabase
          .from("pets")
          .insert([{ ...payload, owner_id: user.id }])
        if (error) throw error
        toast.success("Pet added successfully!")
      }

      setOpen(false)
      form.reset()
      onSuccess?.()
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to save pet")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        trigger ? (trigger as React.ReactElement) : (
          <Button className="rounded-xl font-semibold shadow-md">
            {initialData ? "Edit Pet" : "Add New Pet"}
          </Button>
        )
      } />
      <DialogContent className="sm:max-w-[425px] rounded-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Pet Profile" : "Add a New Pet"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Pet Name *</Label>
            <Input id="name" {...form.register("name")} placeholder="Buddy" className="rounded-xl" />
            {form.formState.errors.name && (
              <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="species">Species *</Label>
              <Input id="species" {...form.register("species")} placeholder="Dog, Cat..." className="rounded-xl" />
              {form.formState.errors.species && (
                <p className="text-xs text-red-500">{form.formState.errors.species.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="breed">Breed</Label>
              <Input id="breed" {...form.register("breed")} placeholder="Golden Retriever" className="rounded-xl" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <Input id="date_of_birth" type="date" {...form.register("date_of_birth")} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight_kg">Weight (kg)</Label>
              <Input id="weight_kg" type="number" step="0.1" {...form.register("weight_kg", { valueAsNumber: true })} className="rounded-xl" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Medical Notes / Preferences</Label>
            <Textarea id="notes" {...form.register("notes")} placeholder="Allergic to chicken, loves belly rubs..." className="rounded-xl min-h-[100px]" />
          </div>
          <Button type="submit" className="w-full rounded-xl h-11" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? "Save Changes" : "Add Pet"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
