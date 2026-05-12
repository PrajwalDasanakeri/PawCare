import { ServicesGrid } from "@/components/services-grid";
import { ServiceDetails } from "@/components/service-details";
import { Testimonials } from "@/components/testimonials";

export default function ServicesPage() {
  return (
    <div className="pt-20">
      <div className="container mx-auto px-4 text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4">Our Services</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Comprehensive care for every stage of your pet's life. We combine love with professional expertise.
        </p>
      </div>
      <ServicesGrid />
      <ServiceDetails />
      <Testimonials />
    </div>
  );
}
