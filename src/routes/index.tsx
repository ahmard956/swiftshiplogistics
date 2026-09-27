import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Truck, Globe, Building2, Search, ShieldCheck, MapPin, Package,
  ArrowRight, Clock, CheckCircle2, Plane, ScanLine,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { PublicLayout } from "@/components/public-layout";
import distributionCenter from "@/assets/swiftship-distribution-center.jpg";
import lastMile from "@/assets/swiftship-last-mile.jpg";
import airCargo from "@/assets/swiftship-air-cargo.jpg";
import sortingCenter from "@/assets/swiftship-sorting.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SwiftShip Logistics — Track, Ship & Deliver" },
      { name: "description", content: "America's modern courier. Track packages in real-time, ship to 220+ countries, and get instant quotes." },
      { property: "og:title", content: "SwiftShip Logistics — Track, Ship & Deliver" },
      { property: "og:description", content: "America's modern courier. Track packages in real-time, ship to 220+ countries, and get instant quotes." },
      { property: "og:url", content: "https://swiftshiplogisticss.lovable.app/" },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "SwiftShip Logistics — Track, Ship & Deliver" },
      { name: "twitter:description", content: "America's modern courier. Track packages in real-time, ship to 220+ countries, and get instant quotes." },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://swiftshiplogisticss.lovable.app/" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "SwiftShip Logistics",
        url: "https://swiftshiplogisticss.lovable.app",
        potentialAction: {
          "@type": "SearchAction",
          target: "https://swiftshiplogisticss.lovable.app/tracking?n={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      }),
    }],
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
      <section className="relative min-h-[620px] overflow-hidden bg-foreground text-hero-foreground md:min-h-[720px]">
        <img src={distributionCenter} alt="SwiftShip team processing parcels at a distribution center" width={1536} height={1024} className="absolute inset-0 h-full w-full object-cover object-center" fetchPriority="high" />
        <div className="absolute inset-0 bg-hero-overlay" />
        <div className="container relative mx-auto flex min-h-[620px] items-end px-5 pb-28 pt-24 md:min-h-[720px] md:items-center md:pb-36 md:pt-28">
          <div className="max-w-3xl">
            <div className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-hero-muted">
              <span className="h-px w-10 bg-primary" /> Global delivery network
            </div>
            <h1 className="max-w-2xl text-4xl font-semibold leading-[1.08] md:text-6xl lg:text-7xl">Ship anywhere.<br />With confidence.</h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-hero-muted md:text-lg">Reliable domestic and international logistics, backed by precise tracking and people who take ownership of every delivery.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/quote"><Button size="lg" className="h-12 px-6">Get an instant quote <ArrowRight /></Button></Link>
              <Link to="/services"><Button size="lg" variant="outline" className="h-12 border-hero-foreground/40 bg-hero-foreground/5 px-6 text-hero-foreground hover:bg-hero-foreground/15 hover:text-hero-foreground">Explore services</Button></Link>
            </div>
          </div>
        </div>
      </section>

      <div className="container relative z-10 mx-auto -mt-20 px-4">
        <Card className="mx-auto max-w-5xl border-border bg-card p-5 shadow-elegant md:p-7">
          <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <label htmlFor="home-tracking" className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-foreground"><Search className="h-4 w-4 text-primary" /> Track your shipment</label>
              <p className="mt-1 text-sm text-muted-foreground">Enter a SwiftShip tracking number for the latest live status.</p>
              <form onSubmit={onTrack} className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Input id="home-tracking" value={tracking} onChange={(e) => setTracking(e.target.value.toUpperCase())} placeholder="SS123456789US" className="h-12 flex-1 font-mono" />
                <Button type="submit" size="lg" className="h-12 px-7">Track package <ArrowRight /></Button>
              </form>
            </div>
            <div className="hidden border-l border-border pl-7 md:block">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Network coverage</p>
              <p className="mt-1 font-display text-2xl font-semibold">220+ countries</p>
            </div>
          </div>
        </Card>
      </div>

      <section className="container mx-auto px-4 pb-16 pt-12">
        <div className="flex flex-col items-center justify-between gap-5 border-b border-border pb-9 md:flex-row">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Connected across the delivery ecosystem</p>
          <div className="flex flex-wrap items-center justify-center gap-x-9 gap-y-3 text-base font-semibold text-muted-foreground">{partners.map((p) => <span key={p}>{p}</span>)}</div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-border bg-secondary/50">
        <div className="container mx-auto grid grid-cols-2 gap-px md:grid-cols-4 bg-border">
          {stats.map((s) => (
            <div key={s.label} className="bg-background px-4 py-8 text-center md:py-10">
              <div className="font-display text-3xl font-semibold text-foreground md:text-4xl">{s.value}</div>
              <div className="mt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>


      <section className="container mx-auto px-4 py-20 md:py-28">
        <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
          <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Our network at work</p><h2 className="mt-3 text-3xl font-semibold leading-tight md:text-5xl">One accountable network, from pickup to arrival.</h2></div>
          <p className="max-w-xl text-base leading-relaxed text-muted-foreground lg:ml-auto">Every handoff is scanned, monitored and supported by an operations team that keeps your shipment moving.</p>
        </div>

        <div className="mt-10 grid auto-rows-[220px] gap-4 md:grid-cols-2 md:auto-rows-[260px] lg:grid-cols-4">
          <article className="group relative overflow-hidden md:row-span-2 lg:col-span-2">
            <img src={lastMile} alt="Courier delivering parcels to a city business" width={1024} height={1024} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
            <div className="absolute inset-0 bg-image-overlay" /><div className="absolute inset-x-0 bottom-0 p-6 text-hero-foreground md:p-8"><Truck className="mb-3 h-6 w-6 text-primary"/><h3 className="text-2xl font-semibold">Domestic Express</h3><p className="mt-2 max-w-sm text-sm text-hero-muted">Overnight and two-day delivery across every U.S. ZIP code.</p></div>
          </article>
          <article className="group relative overflow-hidden lg:col-span-2">
            <img src={airCargo} alt="Cargo aircraft being loaded at an airport terminal" width={1024} height={1024} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
            <div className="absolute inset-0 bg-image-overlay" /><div className="absolute inset-x-0 bottom-0 p-6 text-hero-foreground"><Plane className="mb-3 h-6 w-6 text-primary"/><h3 className="text-xl font-semibold">International Shipping</h3><p className="mt-1 text-sm text-hero-muted">Door-to-door service across 220+ countries.</p></div>
          </article>
          <article className="group relative overflow-hidden lg:col-span-2">
            <img src={sortingCenter} alt="Automated parcel sorting center" width={1024} height={1024} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
            <div className="absolute inset-0 bg-image-overlay" /><div className="absolute inset-x-0 bottom-0 p-6 text-hero-foreground"><ScanLine className="mb-3 h-6 w-6 text-primary"/><h3 className="text-xl font-semibold">Business Solutions</h3><p className="mt-1 text-sm text-hero-muted">Scalable logistics with dedicated operational support.</p></div>
          </article>
        </div>
        <div className="mt-8 flex justify-center"><Link to="/services"><Button variant="outline" size="lg">Explore all services <ArrowRight /></Button></Link></div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-secondary/60 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold md:text-4xl">How SwiftShip works</h2>
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
                <div className="flex h-12 w-12 items-center justify-center bg-primary text-primary-foreground">
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
        <Card className="relative overflow-hidden border-0 bg-foreground p-8 text-hero-foreground shadow-elegant md:p-14">
          <div className="relative grid gap-6 md:grid-cols-2 md:items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-medium text-hero-muted">
                <ShieldCheck className="h-3 w-3" /> Insured · On-time guaranteed
              </div>
              <h2 className="mt-4 text-3xl font-semibold md:text-4xl">Ready to ship something?</h2>
              <p className="mt-3 text-hero-muted">Get an instant quote — no signup required.</p>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <Link to="/quote"><Button size="lg" variant="secondary" className="font-semibold">Get a Quote <ArrowRight className="ml-1 h-4 w-4" /></Button></Link>
               <Link to="/tracking"><Button size="lg" variant="ghost" className="text-hero-foreground hover:bg-hero-foreground/10 hover:text-hero-foreground"><Clock className="mr-1 h-4 w-4" />Track Package</Button></Link>
            </div>
          </div>
        </Card>
      </section>
    </PublicLayout>
  );
}
