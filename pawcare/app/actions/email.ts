"use server"

import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendConfirmationProps {
  email: string
  name: string
  service: string
  date: string
  amount: number
  petName: string
  bookingId: string
}

export async function sendBookingConfirmation({
  email,
  name,
  service,
  date,
  amount,
  petName,
  bookingId,
}: SendConfirmationProps) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not set. Skipping confirmation email.")
    return { success: false, error: "No API key" }
  }

  const businessName = process.env.NEXT_PUBLIC_BUSINESS_NAME || "PawCare"

  try {
    const { data, error } = await resend.emails.send({
      from: `${businessName} Bookings <hello@updates.pawcare.com>`, // Replace domain in production
      to: [email],
      subject: `Booking Confirmed: ${service} for ${petName}`,
      html: `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto;">
          <h2>Payment Verified & Booking Confirmed! 🎉</h2>
          <p>Hi ${name},</p>
          <p>We have successfully received your payment of ₹${amount}. Your booking for <strong>${petName}</strong> is now fully confirmed.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Booking Details</h3>
            <p><strong>Booking ID:</strong> ${bookingId}</p>
            <p><strong>Service:</strong> ${service}</p>
            <p><strong>Date & Time:</strong> ${new Date(date).toLocaleString()}</p>
            <p><strong>Pet:</strong> ${petName}</p>
          </div>
          
          <p>We look forward to seeing you and ${petName}!</p>
          <p>Best regards,<br>${businessName} Team</p>
        </div>
      `,
    })

    if (error) {
      console.error("Resend error:", error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Email send exception:", error)
    return { success: false, error }
  }
}
