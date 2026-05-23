import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Truck, Globe, Building2, Search, ShieldCheck, Zap, MapPin, Package,
  ArrowRight, Clock, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { PublicLayout } from "@/components/public-layout";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SwiftShip Logistics — Track, Ship & Deliver" },
      { name: "description", content: "America's modern courier. Track packages in real-time, ship to 220+ countries, and get instant quotes." },
    ],
  }),
  component: Home,
});

const partners = ["FedEx", "UPS", "USPS", "DHL", "Amazon"];

const services = [
  { icon: Truck, title: "Domestic Express", desc: "Overnight & 2-day delivery to every ZIP code in the USA.", href: "/services" },
  { icon: Globe, title: "International", desc: "Reach 220+ countries with door-to-door tracking & customs clearance.", href: "/services" },
  { icon: Building2, title: "Business Solutions", desc: "Volume pricing, API integration, dedicated account management.", href: "/services" },
];

const stats = [
  { value: "12M+", label: "Packages delivered" },
  { value: "220+", label: "Countries served" },
  { value: "99.7%", label: "On-time delivery" },
  { value: "24/7", label: "Customer support" },
];

function Home() {
  const navigate = useNavigate();
  const [tracking, setTracking] = useState("");

  const onTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (tracking.trim()) navigate({ to: "/tracking", search: { n: tracking.trim() } });
    else navigate({ to: "/tracking" });
  };

  return (
    <PublicLayout>
      {/* HERO */}
      <section className="relative overflow-hidden bg-hero-gradient text-primary-foreground">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-white/30 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-white/20 blur-3xl" />
        </div>

        <div className="container relative mx-auto px-4 py-20 md:py-28">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                <Zap className="h-3 w-3" /> Real-time tracking · 220+ countries
              </div>
              <h1 className="mt-5 text-4xl font-extrabold leading-tight md:text-6xl">
                Ship anything,<br />anywhere, faster.
              </h1>
              <p className="mt-5 max-w-lg text-lg text-white/85">
                America's modern courier network. Track your package, get instant quotes, and reach 220+ countries — all from one place.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link to="/quote"><Button size="lg" variant="secondary" className="font-semibold">Get Instant Quote <ArrowRight className="ml-1 h-4 w-4" /></Button></Link>
                <Link to="/services"><Button size="lg" variant="ghost" className="text-white hover:bg-white/10 hover:text-white">Our Services</Button></Link>
              </div>
            </div>

            {/* Track widget */}
            <Card className="p-6 md:p-8 shadow-elegant bg-card/95 backdrop-blur text-card-foreground">
              <div className="flex items-center gap-2 text-primary font-semibold">
                <Search className="h-4 w-4" /> Track Your Package
              </div>
              <p className="mt-1 text-sm text-muted-foreground">Enter your SwiftShip tracking number to see live status.</p>
              <form onSubmit={onTrack} className="mt-4 flex flex-col sm:flex-row gap-2">
                <Input
                  value={tracking}
                  onChange={(e) => setTracking(e.target.value.toUpperCase())}
                  placeholder="e.g. SS123456789US"
                  className="h-12 font-mono text-base"
                />
                <Button type="submit" size="lg" className="h-12 px-6">Track</Button>
              </form>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span>Try:</span>
                {["SS123456789US", "SS987654321US", "SS555444333US"].map((t) => (
                  <button key={t} type="button" onClick={() => setTracking(t)} className="font-mono text-primary hover:underline">
                    {t}
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* trust bar */}
          <div className="mt-16 border-t border-white/20 pt-6">
            <p className="text-center text-xs uppercase tracking-widest text-white/70">Trusted alongside</p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-lg font-bold text-white/80">
              {partners.map((p) => <span key={p}>{p}</span>)}
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-b border-border bg-secondary/40">
        <div className="container mx-auto grid grid-cols-2 gap-6 px-4 py-10 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl md:text-4xl font-extrabold text-primary">{s.value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold">Shipping solutions, built for everything</h2>
          <p className="mt-3 text-muted-foreground">From a single envelope to enterprise logistics — we've got the network and the technology.</p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {services.map((s) => (
            <Card key={s.title} className="group p-7 transition hover:shadow-elegant hover:-translate-y-1 duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-gradient text-primary-foreground shadow-soft">
                <s.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              <Link to={s.href} className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                Learn more <ArrowRight className="h-4 w-4" />
              </Link>
            </Card>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-secondary/40 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold">How SwiftShip works</h2>
            <p className="mt-3 text-muted-foreground">A simpler way to send packages, built for the modern world.</p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-4">
            {[
              { icon: Package, title: "Book", desc: "Get a quote and book your shipment in seconds." },
              { icon: MapPin, title: "Pickup", desc: "We pick up from your door at a time that works." },
              { icon: Truck, title: "Transit", desc: "Track every step with real-time updates." },
              { icon: CheckCircle2, title: "Delivered", desc: "Signed, scanned, and confirmed at the destination." },
            ].map((step, i) => (
              <div key={step.title} className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-soft">
                  <step.icon className="h-6 w-6" />
                </div>
                <div className="mt-4 text-xs font-bold uppercase text-primary">Step {i + 1}</div>
                <div className="mt-1 text-lg font-semibold">{step.title}</div>
                <p className="mt-1 text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20">
        <Card className="relative overflow-hidden bg-hero-gradient p-10 md:p-16 text-primary-foreground shadow-elegant">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="relative grid gap-6 md:grid-cols-2 md:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
                <ShieldCheck className="h-3 w-3" /> Insured · On-time guaranteed
              </div>
              <h2 className="mt-4 text-3xl md:text-4xl font-bold">Ready to ship something?</h2>
              <p className="mt-3 text-white/85">Get an instant quote — no signup required.</p>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <Link to="/quote"><Button size="lg" variant="secondary" className="font-semibold">Get a Quote <ArrowRight className="ml-1 h-4 w-4" /></Button></Link>
              <Link to="/tracking"><Button size="lg" variant="ghost" className="text-white hover:bg-white/10 hover:text-white"><Clock className="mr-1 h-4 w-4" />Track Package</Button></Link>
            </div>
          </div>
        </Card>
      </section>
    </PublicLayout>
  );
}
