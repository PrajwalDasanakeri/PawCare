"use client"

import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import { PetForm } from "@/components/pet-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PawPrint, Trash2, Edit2, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function PetsPage() {
  const [pets, setPets] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const supabase = createClient()

  const fetchPets = async () => {
    try {
      setLoading(true)
      console.log("Fetching pets...")
      
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      console.log("Current user:", user)
      
      if (userError) {
        console.error("User fetch error:", userError)
        throw userError
      }

      if (!user) {
        console.warn("No authenticated user found")
        setPets([])
        return
      }

      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      console.log("Pets query finished. Data:", data)
      if (error) {
        console.error("Supabase query error detected:")
        console.error("Message:", error.message)
        console.error("Details:", error.details)
        console.error("Hint:", error.hint)
        console.error("Code:", error.code)
        throw error
      }

      setPets(data || [])
    } catch (error: any) {
      console.error("Detailed error object:", error)
      toast.error(error.message || "Failed to load pets. Please refresh.")
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchPets()
  }, [])

  const deletePet = async (id: string) => {
    if (!confirm("Are you sure you want to remove this pet profile?")) return
    
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
            <Card key={pet.id} className="border-none shadow-lg rounded-3xl hover-lift overflow-hidden">
              <CardHeader className="bg-primary/5 pb-4">
                <div className="flex items-center justify-between">
                  <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center shadow-sm text-primary">
                    <PawPrint className="h-6 w-6" />
                  </div>
                  <div className="flex space-x-1">
                    <PetForm initialData={pet} onSuccess={fetchPets} />
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
                <CardTitle className="mt-4 text-xl">{pet.pet_name}</CardTitle>
                <p className="text-sm font-medium text-primary">{pet.pet_type}</p>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Age</p>
                    <p className="text-sm">{pet.age} years old</p>
                  </div>
                  {pet.notes && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Notes</p>
                      <p className="text-sm italic text-foreground/80 line-clamp-3">{pet.notes}</p>
                    </div>
                  )}
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
            Add your first pet to start booking grooming and vet services.
          </p>
          <div className="mt-6">
            <PetForm onSuccess={fetchPets} />
          </div>
        </div>
      )}
    </div>
  )
}
