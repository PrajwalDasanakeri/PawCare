"use client"

import { MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export function WhatsAppButton() {
  const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "15551234567"
  const message = "Hello PawCare! I would like to inquire about your services."
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-all hover:scale-110 active:scale-95 animate-bounce-slow"
      )}
      aria-label="Contact on WhatsApp"
    >
      <MessageCircle className="h-8 w-8" />
    </a>
  )
}
