import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Package, MapPin, Truck, CheckCircle2, AlertCircle, Search, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PublicLayout } from "@/components/public-layout";
import { supabase } from "@/integrations/supabase/client";
import { STATUS_FLOW, STATUS_LABELS, SERVICE_LABELS, statusBadgeClass, getTimelineStage } from "@/lib/shipment-utils";
import { format } from "date-fns";

const searchSchema = z.object({ n: z.string().optional() });

export const Route = createFileRoute("/tracking")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Track Your Package — SwiftShip" },
      { name: "description", content: "Real-time package tracking. Enter your SwiftShip tracking number to see live status updates." },
    ],
  }),
  component: TrackingPage,
});

type Shipment = {
  tracking_number: string;
  status: string;
  service_type: string;
  from_city: string;
  to_city: string;
  current_location: string | null;
  estimated_delivery: string | null;
  weight: number;
  tracking_events: Array<{ status: string; location: string; timestamp: string; description: string }>;
};

function TrackingPage() {
  const { n } = Route.useSearch();
  const navigate = useNavigate();
  const [input, setInput] = useState(n ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shipment, setShipment] = useState<Shipment | null>(null);

  useEffect(() => {
    if (n) fetchShipment(n);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n]);

  async function fetchShipment(tn: string) {
    setLoading(true);
    setError(null);
    setShipment(null);
    const { data, error: e } = await supabase
      .rpc("track_shipment", { _tracking_number: tn.toUpperCase() });
    setLoading(false);
    if (e) { setError("Something went wrong. Please try again."); return; }
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) { setError(`No shipment found for "${tn.toUpperCase()}". Please check the number and try again.`); return; }
    setShipment(row as unknown as Shipment);
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    navigate({ to: "/tracking", search: { n: input.trim().toUpperCase() } });
  };

  const statusIndex = shipment ? getTimelineStage(shipment.status) : 1;

  return (
    <PublicLayout>
      <section className="bg-hero-gradient text-primary-foreground">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <h1 className="text-3xl md:text-4xl font-bold">Track your shipment</h1>
          <p className="mt-2 text-white/85">Real-time updates from pickup to delivery.</p>
          <form onSubmit={onSubmit} className="mt-6 flex flex-col sm:flex-row gap-2 max-w-2xl">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value.toUpperCase())}
              placeholder="Enter tracking number e.g. SS123456789US"
              className="h-12 font-mono bg-white/95 text-foreground border-0"
            />
            <Button type="submit" size="lg" variant="secondary" className="h-12 font-semibold">
              <Search className="mr-1 h-4 w-4" /> Track
            </Button>
          </form>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10 md:py-14">
        {loading && (
          <Card className="p-6 space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-32 w-full" />
          </Card>
        )}

        {error && (
          <Card className="p-8 text-center">
            <AlertCircle className="mx-auto h-10 w-10 text-destructive" />
            <h3 className="mt-3 text-lg font-semibold">Tracking not found</h3>
            <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          </Card>
        )}

        {!loading && !error && !shipment && !n && (
          <Card className="p-8 text-center">
            <Package className="mx-auto h-10 w-10 text-muted-foreground" />
            <h3 className="mt-3 text-lg font-semibold">Enter a tracking number to begin</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Sample numbers: <span className="font-mono text-primary">SS123456789US</span>, <span className="font-mono text-primary">SS987654321US</span>
            </p>
          </Card>
        )}

        {shipment && (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Summary */}
            <Card className="p-6 lg:col-span-1 h-fit">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs uppercase text-muted-foreground">Tracking #</div>
                  <div className="font-mono text-lg font-bold">{shipment.tracking_number}</div>
                </div>
                <span className={`px-3 py-1 rounded-full border text-xs font-semibold ${statusBadgeClass(shipment.status)}`}>
                  {STATUS_LABELS[shipment.status] ?? shipment.status}
                </span>
              </div>

              <div className="mt-6 space-y-4 text-sm">
                <Row icon={MapPin} label="From" value={shipment.from_city} />
                <Row icon={MapPin} label="To" value={shipment.to_city} />
                <Row icon={Truck} label="Current location" value={shipment.current_location ?? "—"} />
                <Row icon={Clock} label="Est. delivery" value={shipment.estimated_delivery ? format(new Date(shipment.estimated_delivery), "PPp") : "—"} />
                <Row icon={Package} label="Service" value={SERVICE_LABELS[shipment.service_type] ?? shipment.service_type} />
                <Row icon={ArrowRight} label="Weight" value={`${shipment.weight} lb`} />
              </div>
            </Card>

            {/* Timeline */}
            <Card className="p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold">Shipment progress</h3>

              {/* Progress dots */}
              <div className="mt-6 flex items-center justify-between gap-2">
                {STATUS_FLOW.map((s, i) => {
                  const reached = i <= statusIndex || shipment.status === "delivered";
                  const isCurrent = i === statusIndex && shipment.status !== "delivered";
                  return (
                    <div key={s} className="flex flex-1 items-center">
                      <div className="flex flex-col items-center text-center">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition ${reached ? "bg-primary border-primary text-primary-foreground" : "bg-background border-border text-muted-foreground"} ${isCurrent ? "ring-4 ring-primary/20 animate-truck" : ""}`}>
                          {reached ? <CheckCircle2 className="h-4 w-4" /> : <span className="text-xs font-bold">{i + 1}</span>}
                        </div>
                        <div className="mt-2 text-[10px] sm:text-xs font-medium max-w-[80px]">{STATUS_LABELS[s]}</div>
                      </div>
                      {i < STATUS_FLOW.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-1 ${i < statusIndex ? "bg-primary" : "bg-border"}`} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Event list */}
              <div className="mt-8 space-y-0">
                {[...shipment.tracking_events].reverse().map((ev, idx) => (
                  <div key={idx} className="relative flex gap-4 pb-6 last:pb-0">
                    <div className="flex flex-col items-center">
                      <div className={`h-3 w-3 rounded-full ${idx === 0 ? "bg-primary ring-4 ring-primary/20" : "bg-border"}`} />
                      {idx < shipment.tracking_events.length - 1 && <div className="flex-1 w-px bg-border my-1" />}
                    </div>
                    <div className="flex-1 -mt-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="font-semibold text-sm">{STATUS_LABELS[ev.status] ?? ev.status}</div>
                        <div className="text-xs text-muted-foreground">{format(new Date(ev.timestamp), "PPp")}</div>
                      </div>
                      <div className="text-sm text-muted-foreground">{ev.description}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1"><MapPin className="h-3 w-3" />{ev.location}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </section>
    </PublicLayout>
  );
}

function Row({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
      <div className="min-w-0">
        <div className="text-xs uppercase text-muted-foreground">{label}</div>
        <div className="font-medium break-words">{value}</div>
      </div>
    </div>
  );
}
