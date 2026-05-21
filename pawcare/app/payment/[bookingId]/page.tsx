"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { QRCodeCanvas } from "qrcode.react"
import { toast } from "sonner"
import { Loader2, CheckCircle, ShieldCheck, IndianRupee, QrCode, Upload, FileImage, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const SERVICE_PRICES: Record<string, number> = {
  'Grooming': 499,
  'Vet Consultation': 799,
  'Boarding': 999,
  'Training': 699,
}

export default function PaymentPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params?.bookingId as string
  const supabase = createClient()
  
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(false)
  const [utrNumber, setUtrNumber] = useState("")
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    const fetchBooking = async () => {
      console.log("Payment Page Params:", params)
      console.log("Extracted bookingId:", bookingId)

      if (!bookingId) {
        console.log("No bookingId available yet.")
        return
      }
      
      console.log("Fetching booking with ID:", bookingId)
      const { data, error } = await supabase
        .from('bookings')
        .select('*, pet:pets(*), user:users!bookings_user_id_fkey(*)')
        .eq('id', bookingId)
        .single()

      console.log("Supabase fetch result:", { data, error })

      if (error || !data) {
        console.error("Fetch Error:", error)
        toast.error(`Booking not found: ${error?.message || 'Missing data'}`)
        router.push("/dashboard/bookings")
        return
      }

      setBooking(data)
      setLoading(false)
    }

    fetchBooking()
  }, [bookingId, router])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    if (!selectedFile.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    setFile(selectedFile)
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!utrNumber.trim()) {
      toast.error("Please enter the UTR / Transaction ID")
      return
    }

    setVerifying(true)
    try {
      let screenshotUrl = booking.screenshot_url

      if (file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${bookingId}-${Date.now()}.${fileExt}`
        
        const { error: uploadError, data } = await supabase.storage
          .from('payment_proofs')
          .upload(fileName, file)

        if (uploadError) throw uploadError

        const { data: publicUrlData } = supabase.storage
          .from('payment_proofs')
          .getPublicUrl(fileName)
          
        screenshotUrl = publicUrlData.publicUrl
      }

      const amount = SERVICE_PRICES[booking.service] || 500
      
      const { error } = await supabase
        .from('bookings')
        .update({
          payment_status: 'verification_pending',
          payment_method: 'UPI',
          payment_amount: amount,
          utr_number: utrNumber,
          screenshot_url: screenshotUrl
        })
        .eq('id', bookingId)

      if (error) throw error

      toast.success("Payment proof submitted successfully! Waiting for admin verification.")
      router.push("/dashboard/bookings")
    } catch (error: any) {
      toast.error(error.message || "Failed to submit payment proof")
      setVerifying(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  const amount = SERVICE_PRICES[booking.service] || 500
  const upiId = process.env.NEXT_PUBLIC_UPI_ID || 'pawcare@testbusiness'
  const businessName = process.env.NEXT_PUBLIC_BUSINESS_NAME || 'PawCare'
  const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(businessName)}&am=${amount}&cu=INR`

  const isVerificationPending = booking.payment_status === 'verification_pending'
  const isPaid = booking.payment_status === 'paid'
  const isRejected = booking.payment_status === 'rejected'

  if (isPaid || isVerificationPending) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center space-y-6">
        <div className="flex justify-center mb-6">
          {isPaid ? (
            <CheckCircle className="h-24 w-24 text-green-500" />
          ) : (
            <Loader2 className="h-24 w-24 text-blue-500 animate-spin" />
          )}
        </div>
        <h1 className="text-3xl font-bold">
          {isPaid ? "Payment Verified!" : "Verification Pending"}
        </h1>
        <p className="text-muted-foreground text-lg">
          {isPaid 
            ? "Your payment has been successfully verified by our team."
            : "Your payment proof has been submitted. Our team will verify it shortly."}
        </p>
        <Button onClick={() => router.push('/dashboard/bookings')} className="rounded-xl mt-8">
          Return to Dashboard
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 md:px-6">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Complete Your Payment</h1>
        <p className="text-muted-foreground text-lg">Secure and fast checkout via UPI</p>
      </div>

      {isRejected && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-600 p-6 rounded-2xl mb-8 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 mt-0.5 shrink-0" />
          <div>
            <h3 className="font-bold text-lg mb-1">Payment Verification Rejected</h3>
            <p className="mb-2">Your previous payment submission was rejected by our team.</p>
            {booking.rejection_reason && (
              <p className="text-sm font-medium bg-red-500/10 p-3 rounded-xl">Reason: {booking.rejection_reason}</p>
            )}
            <p className="text-sm mt-3 font-semibold">Please check your details and submit the proof again.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Booking Summary & QR Code */}
        <div className="space-y-8">
          <Card className="border-none shadow-xl rounded-3xl bg-card overflow-hidden">
            <CardHeader className="bg-muted/30 border-b pb-6">
              <CardTitle className="text-xl">Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Service</span>
                <span className="font-semibold text-lg">{booking.service}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Date</span>
                <span className="font-semibold">{new Date(booking.booking_date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-xl font-bold">Total Amount</span>
                <span className="text-2xl font-black text-primary flex items-center">
                  <IndianRupee className="w-5 h-5 mr-1" />
                  {amount}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl rounded-3xl bg-card">
            <CardHeader className="text-center pb-2">
              <CardTitle className="flex items-center justify-center gap-2 text-xl">
                <QrCode className="w-5 h-5" />
                Scan to Pay
              </CardTitle>
              <CardDescription>Open GPay, PhonePe, or Paytm</CardDescription>
            </CardHeader>
            <CardContent className="p-6 flex flex-col items-center">
              <div className="bg-white p-4 rounded-2xl shadow-inner border mb-4 inline-block">
                <QRCodeCanvas 
                  value={upiLink} 
                  size={180}
                  bgColor={"#ffffff"}
                  fgColor={"#000000"}
                  level={"H"}
                  includeMargin={false}
                />
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Or pay to UPI ID</p>
                <Badge variant="secondary" className="text-sm px-4 py-1 font-mono">
                  {upiId}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Proof Submission Form */}
        <Card className="border-none shadow-xl rounded-3xl bg-card h-fit sticky top-6">
          <CardHeader className="bg-primary/5 border-b pb-6">
            <CardTitle className="text-xl">Submit Payment Proof</CardTitle>
            <CardDescription>Enter details after completing payment</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handlePaymentSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="utr">UTR / Transaction ID <span className="text-red-500">*</span></Label>
                <Input 
                  id="utr" 
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  placeholder="e.g. 312345678901" 
                  className="rounded-xl h-12"
                  required
                />
                <p className="text-xs text-muted-foreground">The 12-digit reference number from your UPI app.</p>
              </div>

              <div className="space-y-2">
                <Label>Screenshot (Optional but recommended)</Label>
                <div className="border-2 border-dashed rounded-xl p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer relative">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {file ? (
                    <div className="flex flex-col items-center">
                      <FileImage className="h-8 w-8 text-primary mb-2" />
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm font-medium text-muted-foreground">Click or drag image to upload</p>
                      <p className="text-xs text-muted-foreground mt-1">Max size: 5MB</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-green-500/10 text-green-600 p-4 rounded-xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 mt-0.5 shrink-0" />
                <div className="text-sm font-medium">
                  Your payment is secure. We manually verify all payments to ensure safety.
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={verifying}
                className="w-full h-14 rounded-2xl text-lg font-bold shadow-primary-lg hover-lift"
              >
                {verifying ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Submitting Proof...
                  </>
                ) : (
                  <>
                    Submit Verification
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
