"use client"

import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import { PetForm } from "@/components/pet-form"
import { MedicalHistoryModal } from "@/components/medical-history-modal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PawPrint, Trash2, Edit2, Loader2, Activity } from "lucide-react"
import { toast } from "sonner"

export default function PetsPage() {
  const [pets, setPets] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const supabase = createClient()

  const fetchPets = async () => {
    try {
      setLoading(true)
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      if (!user) {
        setPets([])
        return
      }

      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPets(data || [])
    } catch (error: any) {
      toast.error(error.message || "Failed to load pets. Please refresh.")
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchPets()
  }, [])

  const deletePet = async (id: string) => {
    if (!confirm("Are you sure you want to remove this pet profile? This will also delete all their medical records and bookings.")) return
    
    try {
      const { error } = await supabase.from('pets').delete().eq('id', id)
      if (error) throw error
      toast.success("Pet removed")
      fetchPets()
    } catch (error: any) {
      toast.error(error.message || "Failed to delete pet")
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Pets</h1>
          <p className="text-muted-foreground mt-1">Manage your pet profiles and medical notes.</p>
        </div>
        <PetForm onSuccess={fetchPets} />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : pets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pets.map((pet) => (
            <Card key={pet.id} className="border-none shadow-lg rounded-3xl overflow-hidden flex flex-col">
              <CardHeader className="bg-primary/5 pb-4">
                <div className="flex items-center justify-between">
                  <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center shadow-sm text-primary">
                    <PawPrint className="h-6 w-6" />
                  </div>
                  <div className="flex space-x-1">
                    <PetForm 
                      initialData={pet} 
                      onSuccess={fetchPets}
                      trigger={
                        <Button variant="ghost" size="icon" className="hover:bg-white text-muted-foreground">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      }
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => deletePet(pet.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="mt-4 text-xl">{pet.name}</CardTitle>
                <p className="text-sm font-medium text-primary flex items-center gap-1">
                  {pet.species} {pet.breed ? `• ${pet.breed}` : ''}
                </p>
              </CardHeader>
              <CardContent className="pt-4 flex-1 flex flex-col">
                <div className="space-y-3 flex-1">
                  {pet.date_of_birth && (
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-sm text-muted-foreground font-medium">Born</span>
                      <span className="text-sm font-semibold">{new Date(pet.date_of_birth).toLocaleDateString()}</span>
                    </div>
                  )}
                  {pet.weight_kg && (
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-sm text-muted-foreground font-medium">Weight</span>
                      <span className="text-sm font-semibold">{pet.weight_kg} kg</span>
                    </div>
                  )}
                  {pet.notes && (
                    <div className="pt-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Notes</p>
                      <p className="text-sm italic text-foreground/80 line-clamp-2">{pet.notes}</p>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 pt-4 border-t">
                  <MedicalHistoryModal 
                    pet={pet} 
                    trigger={
                      <Button variant="outline" className="w-full rounded-xl flex items-center justify-center">
                        <Activity className="w-4 h-4 mr-2 text-primary" />
                        Medical History
                      </Button>
                    }
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-card rounded-[3rem] border border-dashed border-primary/20">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <PawPrint className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold">No pets added yet</h2>
          <p className="text-muted-foreground mt-2 max-w-xs mx-auto">
            Add your first pet to start tracking their medical history and booking services.
          </p>
          <div className="mt-6">
            <PetForm onSuccess={fetchPets} />
          </div>
        </div>
      )}
    </div>
  )
}
