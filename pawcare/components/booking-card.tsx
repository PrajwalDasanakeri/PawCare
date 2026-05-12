import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Scissors, Stethoscope, Home, GraduationCap, Calendar, User, PawPrint } from "lucide-react"
import { Booking } from "@/lib/types"
import { cn } from "@/lib/utils"

const serviceIcons = {
  'Grooming': Scissors,
  'Vet Consultation': Stethoscope,
  'Boarding': Home,
  'Training': GraduationCap,
}

const statusColors = {
  pending: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  confirmed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  completed: "bg-green-500/10 text-green-500 border-green-500/20",
  rejected: "bg-red-500/10 text-red-500 border-red-500/20",
}

interface BookingCardProps {
  booking: Booking
  isAdmin?: boolean
  onAction?: (id: string, status: Booking['status']) => void
}

export function BookingCard({ booking, isAdmin, onAction }: BookingCardProps) {
  const Icon = serviceIcons[booking.service as keyof typeof serviceIcons] || Calendar

  return (
    <Card className="border-none shadow-md rounded-2xl overflow-hidden bg-card transition-all hover:shadow-lg">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-lg">{booking.service}</h3>
                <Badge variant="outline" className={cn("capitalize px-2 py-0", statusColors[booking.status])}>
                  {booking.status}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Calendar className="mr-1 h-3.5 w-3.5" />
                  {format(new Date(booking.booking_date), 'PPP')}
                </div>
                <div className="flex items-center">
                  <PawPrint className="mr-1 h-3.5 w-3.5" />
                  {booking.pet?.pet_name || 'Unknown Pet'}
                </div>
                {isAdmin && (
                  <div className="flex items-center text-primary font-medium">
                    <User className="mr-1 h-3.5 w-3.5" />
                    {booking.user?.name || 'Unknown User'}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isAdmin && booking.status === 'pending' && (
              <>
                <button
                  onClick={() => onAction?.(booking.id, 'confirmed')}
                  className="px-3 py-1.5 text-xs font-bold bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Accept
                </button>
                <button
                  onClick={() => onAction?.(booking.id, 'rejected')}
                  className="px-3 py-1.5 text-xs font-bold bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Reject
                </button>
              </>
            )}
            {isAdmin && booking.status === 'confirmed' && (
              <button
                onClick={() => onAction?.(booking.id, 'completed')}
                className="px-3 py-1.5 text-xs font-bold bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Complete
              </button>
            )}
            {!isAdmin && booking.status === 'pending' && (
              <p className="text-xs text-muted-foreground italic">Waiting for confirmation...</p>
            )}
          </div>
        </div>
        {booking.notes && (
          <div className="mt-4 p-3 bg-muted/50 rounded-xl text-xs text-muted-foreground italic">
            Note: {booking.notes}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
