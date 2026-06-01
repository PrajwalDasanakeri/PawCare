import { BookingForm } from "@/components/booking-form";
import { PawPrint } from "lucide-react";

export default function BookPage() {
  return (
    <div className="py-16 md:py-24 bg-secondary/5 min-h-[calc(100vh-64px)]">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
              <PawPrint className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-4">Book a Service</h1>
            <p className="text-xl text-muted-foreground">
              Choose your pet and the service you need. We&apos;ll take care of the rest.
            </p>
          </div>
          
          <BookingForm />
        </div>
      </div>
    </div>
  );
}
