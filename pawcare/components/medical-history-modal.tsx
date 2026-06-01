"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Loader2, Plus, Calendar, Activity, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { format } from "date-fns"

const recordSchema = z.object({
  title: z.string().min(1, "Title is required"),
  record_date: z.string().min(1, "Date is required"),
  description: z.string().optional(),
  vet_name: z.string().optional(),
})

type RecordFormValues = z.infer<typeof recordSchema>

interface MedicalRecordType {
  id: string
  record_date: string
  title: string
  description?: string | null
  vet_name?: string | null
  attachments?: string[] | null
}

interface MedicalHistoryModalProps {
  pet: { id: string; name: string }
  trigger: React.ReactNode
}

export function MedicalHistoryModal({ pet, trigger }: MedicalHistoryModalProps) {
  const [open, setOpen] = React.useState(false)
  const [records, setRecords] = React.useState<MedicalRecordType[]>([])
  const [loading, setLoading] = React.useState(true)
  const [isAdding, setIsAdding] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const supabase = createClient()

  const form = useForm<RecordFormValues>({
    resolver: zodResolver(recordSchema),
    defaultValues: {
      title: "",
      record_date: new Date().toISOString().split('T')[0],
      description: "",
      vet_name: "",
    },
  })

  const fetchRecords = React.useCallback(async () => {
    if (!open) return
    setLoading(true)
    const { data, error } = await supabase
      .from("medical_records")
      .select("*")
      .eq("pet_id", pet.id)
      .order("record_date", { ascending: false })

    if (error) {
      toast.error("Failed to load medical records")
    } else {
      setRecords(data || [])
    }
    setLoading(false)
  }, [open, pet.id, supabase])

  React.useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void fetchRecords()
    }
  }, [open, fetchRecords])

  React.useEffect(() => {
    if (!open) {
      const timeout = setTimeout(() => {
        setIsAdding(false)
        form.reset()
      }, 300)
      return () => clearTimeout(timeout)
    }
  }, [open, form])

  const onSubmit = async (values: RecordFormValues) => {
    setSubmitting(true)
    try {
      const { error } = await supabase.from("medical_records").insert([
        {
          ...values,
          pet_id: pet.id,
        },
      ])
      if (error) throw error

      toast.success("Medical record added successfully!")
      setIsAdding(false)
      form.reset()
      fetchRecords()
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to add record")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent className="sm:max-w-[600px] rounded-3xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-2xl">{pet.name}&apos;s Medical History</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 bg-secondary/5">
          {isAdding ? (
            <div className="bg-card p-6 rounded-2xl shadow-sm border mb-6">
              <h3 className="font-bold text-lg mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-primary" />
                Add New Record
              </h3>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Record Title *</Label>
                  <Input id="title" {...form.register("title")} placeholder="Annual Vaccination" className="rounded-xl" />
                  {form.formState.errors.title && <p className="text-xs text-red-500">{form.formState.errors.title.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="record_date">Date *</Label>
                    <Input id="record_date" type="date" {...form.register("record_date")} className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vet_name">Vet/Clinic Name</Label>
                    <Input id="vet_name" {...form.register("vet_name")} placeholder="Dr. Smith" className="rounded-xl" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Details / Notes</Label>
                  <Textarea id="description" {...form.register("description")} placeholder="Administered rabies vaccine..." className="rounded-xl min-h-[80px]" />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" className="rounded-xl flex-1" onClick={() => setIsAdding(false)}>Cancel</Button>
                  <Button type="submit" className="rounded-xl flex-1" disabled={submitting}>
                    {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Save Record
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <div className="mb-6 flex justify-end">
              <Button onClick={() => setIsAdding(true)} className="rounded-xl shadow-md">
                <Plus className="w-4 h-4 mr-2" /> Add Record
              </Button>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : records.length === 0 && !isAdding ? (
            <div className="text-center py-12 text-muted-foreground bg-card rounded-2xl border border-dashed">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No medical records found for this pet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {records.map((record) => (
                <div key={record.id} className="bg-card p-5 rounded-2xl shadow-sm border border-primary/10 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary/40 rounded-l-2xl"></div>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-lg">{record.title}</h4>
                    <span className="text-xs font-medium bg-secondary text-secondary-foreground px-2 py-1 rounded-md flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {format(new Date(record.record_date), "MMM d, yyyy")}
                    </span>
                  </div>
                  {record.vet_name && (
                    <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                      <Activity className="w-3 h-3 mr-1" /> {record.vet_name}
                    </p>
                  )}
                  {record.description && (
                    <p className="text-sm text-foreground/80 whitespace-pre-wrap mt-2 bg-muted/30 p-3 rounded-xl">
                      {record.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
