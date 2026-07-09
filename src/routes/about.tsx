import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, Users, Globe2, Award } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PublicLayout } from "@/components/public-layout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About SwiftShip Logistics" },
      { name: "description", content: "SwiftShip is a modern American courier reimagining package delivery for the digital age." },
      { property: "og:title", content: "About SwiftShip Logistics" },
      { property: "og:description", content: "SwiftShip is a modern American courier reimagining package delivery for the digital age." },
      { property: "og:url", content: "https://swiftshiplogisticss.lovable.app/about" },
      { name: "twitter:title", content: "About SwiftShip Logistics" },
      { name: "twitter:description", content: "SwiftShip is a modern American courier reimagining package delivery for the digital age." },
    ],
    links: [{ rel: "canonical", href: "https://swiftshiplogisticss.lovable.app/about" }],
  }),
  component: About,
});

const values = [
  { icon: ShieldCheck, title: "Reliability", desc: "99.7% on-time delivery, backed by a guarantee." },
  { icon: Users, title: "People-first", desc: "Real humans answer the phone, 24/7." },
  { icon: Globe2, title: "Global reach", desc: "From small-town USA to 220+ countries worldwide." },
  { icon: Award, title: "Award-winning", desc: "Voted #1 modern courier 2024 by Logistics Today." },
];

function About() {
  return (
    <PublicLayout>
      <section className="bg-hero-gradient text-primary-foreground">
        <div className="container mx-auto px-4 py-16 md:py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold">Modern shipping for a connected world</h1>
          <p className="mt-4 text-lg text-white/85 max-w-2xl mx-auto">
            We're SwiftShip — a U.S.-based courier blending decades of logistics expertise with today's technology.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-10 md:grid-cols-2 items-center max-w-5xl mx-auto">
          <div>
            <h2 className="text-3xl font-bold">Our story</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Founded in 2018 in Atlanta, GA, SwiftShip set out to build a courier service the modern internet deserved: transparent pricing, real-time tracking, and a customer experience that doesn't feel like a chore.
            </p>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              Today, we operate 42 sorting facilities, partner with airlines in 60+ countries, and deliver more than 12 million packages a year — from one-person Etsy shops to Fortune 500 supply chains.
            </p>
          </div>
          <Card className="p-8 bg-secondary/40">
            <div className="grid grid-cols-2 gap-6">
              <Stat v="42" l="Sorting facilities" />
              <Stat v="3,400+" l="Team members" />
              <Stat v="12M+" l="Packages / year" />
              <Stat v="220+" l="Countries served" />
            </div>
          </Card>
        </div>

        <div className="mt-20 grid gap-6 md:grid-cols-4">
          {values.map((v) => (
            <Card key={v.title} className="p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-gradient text-primary-foreground"><v.icon className="h-5 w-5" /></div>
              <h3 className="mt-4 font-semibold">{v.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{v.desc}</p>
            </Card>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}

function Stat({ v, l }: { v: string; l: string }) {
  return (
    <div>
      <div className="text-3xl font-extrabold text-primary">{v}</div>
      <div className="text-sm text-muted-foreground">{l}</div>
    </div>
  );
}
