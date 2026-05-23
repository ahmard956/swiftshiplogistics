import { createFileRoute, Link } from "@tanstack/react-router";
import { Truck, Globe, Building2, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PublicLayout } from "@/components/public-layout";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Shipping Services — SwiftShip" },
      { name: "description", content: "Domestic Express, International Shipping to 220+ countries, and Business Solutions from SwiftShip Logistics." },
    ],
  }),
  component: ServicesPage,
});

const services = [
  {
    icon: Truck,
    title: "Domestic Express",
    tagline: "Overnight & 2-day USA delivery",
    features: ["Next-day delivery to 95% of ZIP codes", "Real-time GPS tracking", "Signature confirmation", "Free pickup at your door", "Up to $100 insurance included"],
  },
  {
    icon: Globe,
    title: "International Shipping",
    tagline: "Door-to-door to 220+ countries",
    features: ["Customs documentation handled for you", "Delivery in as little as 2 business days", "Multilingual customer support", "Real-time global tracking", "Duty & tax calculator built-in"],
  },
  {
    icon: Building2,
    title: "Business Solutions",
    tagline: "Scale your logistics",
    features: ["Volume discounts up to 40%", "Dedicated account manager", "API & webhook integration", "Bulk label printing", "Custom SLAs & reporting"],
  },
];

function ServicesPage() {
  return (
    <PublicLayout>
      <section className="bg-hero-gradient text-primary-foreground">
        <div className="container mx-auto px-4 py-16 md:py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold">Shipping built for every need</h1>
          <p className="mt-4 text-lg text-white/85 max-w-2xl mx-auto">
            From overnight envelopes to enterprise freight — choose the service that fits.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-8 md:grid-cols-3">
          {services.map((s) => (
            <Card key={s.title} className="p-7 flex flex-col">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-gradient text-primary-foreground shadow-soft">
                <s.icon className="h-7 w-7" />
              </div>
              <h2 className="mt-5 text-2xl font-bold">{s.title}</h2>
              <p className="mt-1 text-sm text-primary font-medium">{s.tagline}</p>
              <ul className="mt-5 space-y-2 flex-1">
                {s.features.map((f) => (
                  <li key={f} className="flex gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" /> {f}
                  </li>
                ))}
              </ul>
              <Link to="/quote" className="mt-6">
                <Button className="w-full">Get a Quote <ArrowRight className="ml-1 h-4 w-4" /></Button>
              </Link>
            </Card>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
