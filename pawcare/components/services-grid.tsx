import Link from "next/link"
import { Scissors, Stethoscope, Home, GraduationCap } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

const services = [
  {
    title: "Pet Grooming",
    description: "Professional bathing, haircuts, and styling for all breeds. We make your pet look and feel their best.",
    icon: Scissors,
    color: "bg-blue-500/10 text-blue-500",
    id: "grooming",
  },
  {
    title: "Vet Consultation",
    description: "Expert health checkups, vaccinations, and medical advice from our licensed veterinarians.",
    icon: Stethoscope,
    color: "bg-red-500/10 text-red-500",
    id: "vet",
  },
  {
    title: "Daycare & Boarding",
    description: "Safe and fun environment for your pets while you're away. 24/7 supervision and playtime.",
    icon: Home,
    color: "bg-orange-500/10 text-orange-500",
    id: "boarding",
  },
  {
    title: "Pet Training",
    description: "Basic obedience and behavior training classes led by certified professional trainers.",
    icon: GraduationCap,
    color: "bg-green-500/10 text-green-500",
    id: "training",
  },
]

export function ServicesGrid() {
  return (
    <section className="py-24 bg-secondary/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Our Premium Services</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            We offer a wide range of services tailored to meet the unique needs of every pet.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service) => (
            <Card key={service.title} className="border-none shadow-lg hover-lift rounded-3xl overflow-hidden bg-card">
              <CardHeader>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${service.color}`}>
                  <service.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">{service.title}</CardTitle>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  {service.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link 
                  href={`/services#${service.id}`}
                  className="text-sm font-semibold text-primary hover:underline flex items-center"
                >
                  Learn more &rarr;
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
