import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { PublicLayout } from "@/components/public-layout";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact SwiftShip" },
      { name: "description", content: "Get in touch with SwiftShip Logistics. 24/7 support by phone, email, or message." },
    ],
  }),
  component: Contact,
});

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  message: z.string().trim().min(5).max(1000),
});

function Contact() {
  const [submitting, setSubmitting] = useState(false);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({ name: fd.get("name"), email: fd.get("email"), message: fd.get("message") });
    if (!parsed.success) {
      toast.error("Please check your inputs and try again.");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success("Message sent! We'll get back to you within 24 hours.");
      (e.target as HTMLFormElement).reset();
    }, 600);
  };

  return (
    <PublicLayout>
      <section className="bg-hero-gradient text-primary-foreground">
        <div className="container mx-auto px-4 py-12 md:py-16 text-center">
          <h1 className="text-3xl md:text-4xl font-bold">Talk to us</h1>
          <p className="mt-2 text-white/85">We're here 24/7 — call, email, or send a message.</p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12 grid gap-8 lg:grid-cols-3 max-w-6xl">
        <div className="lg:col-span-1 space-y-4">
          <InfoCard icon={Phone} title="Call us" lines={["1-800-SWIFTSHIP", "(1-800-794-3877)"]} />
          <InfoCard icon={Mail} title="Email" lines={["support@swiftship.com", "business@swiftship.com"]} />
          <InfoCard icon={MapPin} title="Headquarters" lines={["1500 Peachtree St NE", "Atlanta, GA 30309"]} />
          <InfoCard icon={Clock} title="Hours" lines={["24/7 customer support", "Mon–Fri pickup 8a–8p"]} />
        </div>

        <Card className="lg:col-span-2 p-6 md:p-8">
          <h2 className="text-xl font-semibold">Send us a message</h2>
          <form onSubmit={submit} className="mt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="name">Name</Label><Input id="name" name="name" required maxLength={100} /></div>
              <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" required maxLength={255} /></div>
            </div>
            <div className="space-y-2"><Label htmlFor="message">Message</Label><Textarea id="message" name="message" rows={5} required maxLength={1000} /></div>
            <Button type="submit" size="lg" disabled={submitting}>{submitting ? "Sending…" : "Send message"}</Button>
          </form>
        </Card>
      </section>
    </PublicLayout>
  );
}

function InfoCard({ icon: Icon, title, lines }: { icon: React.ElementType; title: string; lines: string[] }) {
  return (
    <Card className="p-5 flex gap-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-gradient text-primary-foreground shrink-0">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="font-semibold">{title}</div>
        {lines.map((l) => <div key={l} className="text-sm text-muted-foreground">{l}</div>)}
      </div>
    </Card>
  );
}
