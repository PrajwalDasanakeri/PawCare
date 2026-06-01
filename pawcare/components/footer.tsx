import Link from "next/link"
import { PawPrint, Mail, Phone, MapPin } from "lucide-react"

const BUSINESS_INFO = {
  address: "Royal Pets Paradise, Old Income Tax Office Rd, near 7 Beans Cafe, Vidya Nagar, Hubballi, Karnataka 580021",
  phone: "+91 8310405234",
  email: "contact@pawcare.in",
  socials: [
    { name: "Instagram", href: "#" },
    { name: "Facebook", href: "#" },
    { name: "WhatsApp", href: `https://wa.me/918310405234` },
  ]
}

export function Footer() {
  return (
    <footer className="bg-secondary/30 border-t">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2">
              <PawPrint className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-primary">PawCare</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Providing premium care for your furry friends. Hubballi&apos;s trusted destination for grooming, vet consultations, and boarding.
            </p>
            <div className="mt-6 flex space-x-4">
              {BUSINESS_INFO.socials.map((social) => (
                <Link 
                  key={social.name} 
                  href={social.href} 
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  {social.name}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Services</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/services" className="text-sm text-muted-foreground hover:text-primary">Pet Grooming</Link></li>
              <li><Link href="/services" className="text-sm text-muted-foreground hover:text-primary">Vet Consultation</Link></li>
              <li><Link href="/services" className="text-sm text-muted-foreground hover:text-primary">Daycare & Boarding</Link></li>
              <li><Link href="/services" className="text-sm text-muted-foreground hover:text-primary">Pet Training</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Quick Links</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/book" className="text-sm text-muted-foreground hover:text-primary">Book Now</Link></li>
              <li><Link href="/dashboard" className="text-sm text-muted-foreground hover:text-primary">My Dashboard</Link></li>
              <li><Link href="/services" className="text-sm text-muted-foreground hover:text-primary">All Services</Link></li>
              <li><Link href="/login" className="text-sm text-muted-foreground hover:text-primary">Login / Signup</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Contact Us</h3>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground leading-relaxed">
                  {BUSINESS_INFO.address}
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-primary shrink-0" />
                <a 
                  href={`tel:${BUSINESS_INFO.phone.replace(/\s/g, '')}`} 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {BUSINESS_INFO.phone}
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <a 
                  href={`mailto:${BUSINESS_INFO.email}`} 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {BUSINESS_INFO.email}
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} PawCare Hubballi. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
