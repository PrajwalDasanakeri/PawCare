import Image from "next/image"
import { Check, Scissors, Stethoscope, Home, GraduationCap, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

const detailedServices = [
  {
    id: "grooming",
    title: "Pet Grooming",
    description: "Our professional grooming services keep your pet looking sharp and feeling healthy. We use premium, hypoallergenic products tailored to your pet's coat and skin type.",
    icon: Scissors,
    features: ["Bathing & Drying", "Hair Trimming & Styling", "Nail Clipping", "Ear Cleaning", "De-shedding Treatment"],
    pricing: "Starts from ₹499 / session",
    duration: "1.5 - 3 hours",
    benefits: "Regular grooming prevents matting, skin infections, and allows for early detection of lumps or skin issues.",
    image: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "vet",
    title: "Vet Consultation",
    description: "Licensed veterinarians provide thorough health checkups and personalized care plans. From vaccinations to nutritional advice, we ensure your pet's long-term wellness.",
    icon: Stethoscope,
    features: ["General Health Checkups", "Vaccination Programs", "Nutritional Advice", "Minor Injury Treatment", "Emergency Triage"],
    pricing: "Starts from ₹599 / session",
    duration: "30 - 60 minutes",
    benefits: "Proactive veterinary care extends your pet's life and catches potential health problems before they become serious.",
    image: "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "boarding",
    title: "Daycare & Boarding",
    description: "A home away from home. Our boarding facility is climate-controlled, safe, and supervised 24/7. Your pet will enjoy playtime, socialization, and plenty of love.",
    icon: Home,
    features: ["24/7 Professional Supervision", "Structured Playtime", "Personalized Feeding", "Daily Photo/Video Updates", "Climate-Controlled Suites"],
    pricing: "Starts from ₹699 / night",
    duration: "Daily or Overnight",
    benefits: "Reduced anxiety for your pet and peace of mind for you. Socialization helps pets stay well-adjusted and happy.",
    image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "training",
    title: "Pet Training",
    description: "Build a stronger bond with your pet through positive reinforcement training. Our certified trainers help with everything from basic commands to complex behaviors.",
    icon: GraduationCap,
    features: ["Basic Obedience", "Behavioral Modification", "Puppy Socialization", "Leash Training", "Advanced Tricks"],
    pricing: "Starts from ₹899 / session",
    duration: "60 minutes",
    benefits: "Training provides mental stimulation, improves safety, and makes living with your pet much more harmonious.",
    image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=800&auto=format&fit=crop",
  },
]

export function ServiceDetails() {
  return (
    <section className="py-24 space-y-32">
      {detailedServices.map((service, index) => (
        <div 
          key={service.id} 
          id={service.id} 
          className={`container mx-auto px-4 scroll-mt-24`}
        >
          <div className={`flex flex-col lg:items-center gap-12 lg:gap-20 ${index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'}`}>
            <div className="flex-1 space-y-8">
              <div className="inline-flex items-center space-x-3 text-primary bg-primary/10 px-4 py-2 rounded-2xl">
                <service.icon className="h-6 w-6" />
                <span className="font-bold tracking-wide uppercase text-sm">{service.title}</span>
              </div>
              
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
                Premium {service.title} <br />
                <span className="text-primary">for your furry friend.</span>
              </h2>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                {service.description}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {service.features.map((feature) => (
                  <div key={feature} className="flex items-center space-x-3">
                    <div className="h-5 w-5 rounded-full bg-green-500/20 flex items-center justify-center text-green-600">
                      <Check className="h-3 w-3" />
                    </div>
                    <span className="text-sm font-medium">{feature}</span>
                  </div>
                ))}
              </div>

              <Card className="bg-secondary/10 border-none rounded-3xl">
                <CardContent className="p-6 flex flex-wrap gap-8">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">Pricing</p>
                    <p className="text-lg font-bold text-primary">{service.pricing}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">Duration</p>
                    <p className="text-lg font-bold">{service.duration}</p>
                  </div>
                </CardContent>
              </Card>

              <div className="pt-4">
                <Link href="/book">
                  <Button size="lg" className="rounded-2xl h-14 px-8 text-lg font-bold shadow-primary-lg hover-lift">
                    Book This Service
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="flex-1 relative">
              <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-background hover-lift duration-500 aspect-[4/3]">
                <Image 
                  src={service.image} 
                  alt={service.title} 
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
              {/* Decorative benefit card */}
              <div className={`absolute -bottom-10 ${index % 2 === 1 ? '-left-6' : '-right-6'} hidden xl:block w-72 bg-background p-6 rounded-3xl shadow-2xl border border-primary/5 animate-bounce-slow`}>
                <p className="text-xs font-bold text-primary uppercase mb-2">Why it matters</p>
                <p className="text-sm leading-relaxed italic text-muted-foreground">
                  "{service.benefits}"
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </section>
  )
}
