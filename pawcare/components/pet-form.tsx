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
  pet_name: z.string().min(1, "Name is required"),
  pet_type: z.string().min(1, "Type is required (Dog, Cat, etc.)"),
  age: z.number().min(0, "Age must be positive"),
  notes: z.string().optional(),
})

type PetFormValues = z.infer<typeof petSchema>

interface PetFormProps {
  onSuccess?: () => void
  initialData?: any
}

export function PetForm({ onSuccess, initialData }: PetFormProps) {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const supabase = createClient()

  const form = useForm<PetFormValues>({
    resolver: zodResolver(petSchema),
    defaultValues: initialData || {
      pet_name: "",
      pet_type: "",
      age: 0,
      notes: "",
    },
  })

  const onSubmit = async (values: PetFormValues) => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      if (initialData) {
        const { error } = await supabase
          .from("pets")
          .update(values)
          .eq("id", initialData.id)
        if (error) throw error
        toast.success("Pet updated successfully!")
      } else {
        const { error } = await supabase
          .from("pets")
          .insert([{ ...values, user_id: user.id }])
        if (error) throw error
        toast.success("Pet added successfully!")
      }

      setOpen(false)
      form.reset()
      onSuccess?.()
    } catch (error: any) {
      toast.error(error.message || "Failed to save pet")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="rounded-xl font-semibold shadow-md">
          {initialData ? "Edit Pet" : "Add New Pet"}
        </Button>} />
      <DialogContent className="sm:max-w-[425px] rounded-3xl">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Pet Profile" : "Add a New Pet"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="pet_name">Pet Name</Label>
            <Input id="pet_name" {...form.register("pet_name")} placeholder="Buddy" className="rounded-xl" />
            {form.formState.errors.pet_name && (
              <p className="text-xs text-red-500">{form.formState.errors.pet_name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="pet_type">Pet Type</Label>
            <Input id="pet_type" {...form.register("pet_type")} placeholder="Dog (Golden Retriever)" className="rounded-xl" />
            {form.formState.errors.pet_type && (
              <p className="text-xs text-red-500">{form.formState.errors.pet_type.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="age">Age (Years)</Label>
            <Input id="age" type="number" {...form.register("age", { valueAsNumber: true })} className="rounded-xl" />
            {form.formState.errors.age && (
              <p className="text-xs text-red-500">{form.formState.errors.age.message}</p>
            )}
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
