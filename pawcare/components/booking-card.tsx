"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Scissors, Stethoscope, Home, GraduationCap, Calendar, User, PawPrint, CheckCircle2, XCircle, FileImage } from "lucide-react"
import { Booking } from "@/lib/types"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { sendBookingConfirmation } from "@/app/actions/email"

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

const paymentStatusColors: Record<string, string> = {
  pending: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  verification_pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  paid: "bg-green-500/10 text-green-500 border-green-500/20",
  failed: "bg-red-500/10 text-red-500 border-red-500/20",
  rejected: "bg-red-500/10 text-red-500 border-red-500/20",
}

const paymentStatusLabels: Record<string, string> = {
  pending: "Pending Payment",
  verification_pending: "Under Verification",
  paid: "Paid",
  failed: "Failed",
  rejected: "Rejected",
}

interface BookingCardProps {
  booking: Booking
  isAdmin?: boolean
  onAction?: (id: string, status: Booking['status']) => void
  onPaymentAction?: () => void
}

export function BookingCard({ booking, isAdmin, onAction, onPaymentAction }: BookingCardProps) {
  const Icon = serviceIcons[booking.service as keyof typeof serviceIcons] || Calendar
  const [showScreenshot, setShowScreenshot] = useState(false)
  const [showRejectReason, setShowRejectReason] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [processing, setProcessing] = useState(false)
  const supabase = createClient()

  const handleVerifyPayment = async (status: 'paid' | 'rejected') => {
    if (status === 'rejected' && !rejectReason.trim()) {
      toast.error("Please provide a rejection reason")
      return
    }

    setProcessing(true)
    try {
      const updateData: Record<string, unknown> = {
        payment_status: status,
      }

      if (status === 'paid') {
        const { data: { user } } = await supabase.auth.getUser()
        updateData.verified_by = user?.id
        updateData.verified_at = new Date().toISOString()
      } else {
        updateData.rejection_reason = rejectReason
      }

      const { error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', booking.id)

      if (error) throw error

      toast.success(`Payment ${status} successfully`)
      
      // Trigger confirmation email if paid
      if (status === 'paid' && booking.user?.email) {
        const emailResult = await sendBookingConfirmation({
          email: booking.user.email,
          name: booking.user.name || "Customer",
          service: booking.service,
          date: booking.booking_date,
          amount: booking.payment_amount || 0,
          petName: booking.pet?.name || "your pet",
          bookingId: booking.id,
        })
        
        if (!emailResult.success) {
          console.warn("Failed to send email:", emailResult.error)
          toast.info("Payment verified, but confirmation email couldn't be sent.")
        }
      }

      setShowRejectReason(false)
      if (onPaymentAction) onPaymentAction()
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to update payment status")
    } finally {
      setProcessing(false)
    }
  }

  return (
    <>
      <Card className="border-none shadow-md rounded-2xl overflow-hidden bg-card transition-all hover:shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                  <h3 className="font-bold text-lg">{booking.service}</h3>
                  <Badge variant="outline" className={cn("capitalize px-2 py-0", statusColors[booking.status])}>
                    Booking: {booking.status}
                  </Badge>
                  <Badge variant="outline" className={cn("px-2 py-0", paymentStatusColors[booking.payment_status || 'pending'])}>
                    Payment: {paymentStatusLabels[booking.payment_status || 'pending']}
                  </Badge>
                </div>
                
                <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="mr-1 h-3.5 w-3.5" />
                    {format(new Date(booking.booking_date), 'PPP')}
                  </div>
                  <div className="flex items-center">
                    <PawPrint className="mr-1 h-3.5 w-3.5" />
                    {booking.pet?.name || 'Unknown Pet'}
                  </div>
                  {isAdmin && (
                    <div className="flex items-center text-primary font-medium">
                      <User className="mr-1 h-3.5 w-3.5" />
                      {booking.user?.name || 'Unknown User'}
                    </div>
                  )}
                  {booking.payment_status === 'paid' && (
                    <div className="flex items-center text-green-600 font-medium">
                      <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                      ₹{booking.payment_amount} 
                      {booking.transaction_id ? ` (TXN: ${booking.transaction_id})` : ''}
                    </div>
                  )}
                  {booking.utr_number && (
                    <div className="flex items-center text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md text-xs font-mono">
                      UTR: {booking.utr_number}
                    </div>
                  )}
                  {booking.screenshot_url && (
                    <button 
                      onClick={() => setShowScreenshot(true)}
                      className="flex items-center text-blue-500 hover:text-blue-600 text-xs font-medium"
                    >
                      <FileImage className="mr-1 h-3.5 w-3.5" />
                      View Proof
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Payment Verification Actions (Admin Only) */}
              {isAdmin && booking.payment_status === 'verification_pending' && (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleVerifyPayment('paid')}
                    disabled={processing}
                    className="px-3 py-1.5 text-xs font-bold bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                  </button>
                  <button
                    onClick={() => setShowRejectReason(true)}
                    disabled={processing}
                    className="px-3 py-1.5 text-xs font-bold bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center"
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                  </button>
                </div>
              )}

              {/* Normal Booking Actions (Admin Only) */}
              {isAdmin && booking.status === 'pending' && (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => onAction?.(booking.id, 'confirmed')}
                    className="px-3 py-1.5 text-xs font-bold bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Accept Booking
                  </button>
                </div>
              )}
            </div>
          </div>
          {booking.rejection_reason && (
            <div className="mt-4 p-3 bg-red-500/10 rounded-xl text-xs text-red-600 font-medium border border-red-500/20">
               Rejected: {booking.rejection_reason}
            </div>
          )}
          {booking.notes && (
            <div className="mt-4 p-3 bg-muted/50 rounded-xl text-xs text-muted-foreground italic border">
              Note: {booking.notes}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Screenshot Modal */}
      <Dialog open={showScreenshot} onOpenChange={setShowScreenshot}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Payment Proof</DialogTitle>
            <DialogDescription>Screenshot uploaded by the customer</DialogDescription>
          </DialogHeader>
          <div className="flex justify-center p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={booking.screenshot_url} 
              alt="Payment Screenshot" 
              className="max-h-[60vh] object-contain rounded-lg shadow-sm border"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Rejection Modal */}
      <Dialog open={showRejectReason} onOpenChange={setShowRejectReason}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Payment</DialogTitle>
            <DialogDescription>Please provide a reason for rejecting this payment proof.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input 
              placeholder="e.g. UTR number does not match screenshot"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <Button 
              variant="destructive" 
              onClick={() => handleVerifyPayment('rejected')}
              disabled={processing || !rejectReason.trim()}
              className="w-full"
            >
              Confirm Rejection
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
