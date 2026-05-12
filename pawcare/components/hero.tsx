import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Star, PawPrint } from "lucide-react"

export function Hero() {
  return (
    <div className="relative overflow-hidden bg-background pt-16 pb-24 lg:pt-32 lg:pb-40">
      {/* Decorative gradient background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-10%] w-[30%] h-[30%] bg-accent/20 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left flex flex-col justify-center">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 w-fit sm:mx-auto lg:mx-0">
              <Star className="h-4 w-4 fill-primary" />
              <span>Trusted by 2,000+ happy pet parents</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
              Premium Care for <span className="text-primary">Your Best Friend.</span>
            </h1>
            <p className="mt-6 text-xl text-muted-foreground leading-relaxed">
              From professional grooming to expert vet consultations, we provide everything your pet needs to thrive. Book your appointment in seconds.
            </p>
            <div className="mt-10 sm:flex sm:justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/book">
                <Button size="lg" className="h-14 px-8 text-lg font-semibold rounded-2xl shadow-primary-lg hover-lift">
                  Book Appointment
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/services">
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-semibold rounded-2xl hover-lift">
                  View Services
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex items-center space-x-4 sm:justify-center lg:justify-start text-sm text-muted-foreground">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-muted overflow-hidden">
                    <img 
                      src={`https://i.pravatar.cc/100?img=${i + 10}`} 
                      alt="User avatar" 
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <p>Join our community of pet lovers</p>
            </div>
          </div>
          <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
            <div className="relative mx-auto w-full rounded-3xl shadow-2xl overflow-hidden hover-lift duration-500">
              <img
                className="w-full object-cover aspect-[4/3]"
                src="https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=1000&auto=format&fit=crop"
                alt="Happy Golden Retriever being groomed"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
            {/* Floating stats card */}
            <div className="absolute -bottom-6 -left-6 bg-background p-4 rounded-2xl shadow-xl hidden md:block animate-bounce-slow">
              <div className="flex items-center space-x-3">
                <div className="bg-primary/10 p-2 rounded-xl">
                  <PawPrint className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold">150+ Happy Pets</p>
                  <p className="text-xs text-muted-foreground">Cared for this month</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
