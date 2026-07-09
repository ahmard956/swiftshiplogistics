import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Calculator, DollarSign, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PublicLayout } from "@/components/public-layout";
import { calculateQuote } from "@/lib/shipment-utils";

export const Route = createFileRoute("/quote")({
  head: () => ({
    meta: [
      { title: "Instant Shipping Quote — SwiftShip" },
      { name: "description", content: "Get an instant shipping quote in seconds. Enter origin, destination, and weight." },
      { property: "og:title", content: "Instant Shipping Quote — SwiftShip" },
      { property: "og:description", content: "Get an instant shipping quote in seconds. Enter origin, destination, and weight." },
      { property: "og:url", content: "https://swiftshiplogisticss.lovable.app/quote" },
      { name: "twitter:title", content: "Instant Shipping Quote — SwiftShip" },
      { name: "twitter:description", content: "Get an instant shipping quote in seconds. Enter origin, destination, and weight." },
    ],
    links: [{ rel: "canonical", href: "https://swiftshiplogisticss.lovable.app/quote" }],
  }),
  component: QuotePage,
});

function QuotePage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [weight, setWeight] = useState("");
  const [service, setService] = useState("domestic");
  const [quote, setQuote] = useState<{ price: number; eta: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const w = parseFloat(weight);
    if (!from.trim() || !to.trim()) return setError("Please enter both from and to.");
    if (!w || w <= 0 || w > 500) return setError("Weight must be between 0.1 and 500 lb.");
    const isInt = service === "international";
    setQuote({
      price: calculateQuote(w, isInt),
      eta: isInt ? "3–6 business days" : service === "express" ? "1 business day" : "2–3 business days",
    });
  };

  return (
    <PublicLayout>
      <section className="bg-hero-gradient text-primary-foreground">
        <div className="container mx-auto px-4 py-12 md:py-16 text-center">
          <h1 className="text-3xl md:text-4xl font-bold">Get an instant quote</h1>
          <p className="mt-2 text-white/85">No signup, no hidden fees. See your price in seconds.</p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid gap-8 lg:grid-cols-2 max-w-5xl mx-auto">
          <Card className="p-6 md:p-8">
            <div className="flex items-center gap-2 font-semibold text-primary">
              <Calculator className="h-5 w-5" /> Quote calculator
            </div>
            <form onSubmit={submit} className="mt-6 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="from">From (ZIP code or City)</Label>
                <Input id="from" value={from} onChange={(e) => setFrom(e.target.value)} placeholder="10001 or New York, NY" maxLength={120} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="to">To (ZIP, City, or Country)</Label>
                <Input id="to" value={to} onChange={(e) => setTo(e.target.value)} placeholder="90001 or London, UK" maxLength={120} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (lb)</Label>
                  <Input id="weight" type="number" step="0.1" min="0.1" max="500" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="5.0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="service">Service</Label>
                  <Select value={service} onValueChange={setService}>
                    <SelectTrigger id="service"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="domestic">Domestic (2–3 days)</SelectItem>
                      <SelectItem value="express">Express (overnight)</SelectItem>
                      <SelectItem value="international">International</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" size="lg" className="w-full">Calculate price</Button>
            </form>
          </Card>

          <Card className="p-6 md:p-8 flex flex-col">
            <div className="text-sm uppercase tracking-wider text-muted-foreground">Estimated Cost</div>
            {quote ? (
              <>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-5xl font-extrabold text-primary">${quote.price.toFixed(2)}</span>
                  <span className="text-muted-foreground">USD</span>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 text-primary" /> Delivery: {quote.eta}
                </div>
                <div className="mt-6 space-y-2 text-sm">
                  {["Real-time tracking included", "Up to $100 insurance", "Pickup at your door", "Money-back guarantee"].map((f) => (
                    <div key={f} className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> {f}</div>
                  ))}
                </div>
                <Button size="lg" className="mt-auto">Book this shipment</Button>
              </>
            ) : (
              <div className="mt-6 flex flex-col items-center justify-center text-center py-8 flex-1">
                <DollarSign className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-3 text-muted-foreground">Fill in the details to see your instant quote.</p>
              </div>
            )}
          </Card>
        </div>
      </section>
    </PublicLayout>
  );
}
