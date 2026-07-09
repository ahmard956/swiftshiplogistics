import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { generateTrackingNumber, calculateQuote, SERVICE_LABELS } from "@/lib/shipment-utils";

export const Route = createFileRoute("/admin/new")({
  head: () => ({ meta: [{ title: "New Shipment — SwiftShip Admin" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: NewShipment,
});

const schema = z.object({
  from_address: z.string().trim().min(3).max(255),
  to_address: z.string().trim().min(3).max(255),
  weight: z.number().min(0.1).max(500),
  customer_email: z.string().trim().email().max(255).optional().or(z.literal("")),
  service_type: z.enum(["domestic_express", "international", "business"]),
});

function NewShipment() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      from_address: fd.get("from_address"),
      to_address: fd.get("to_address"),
      weight: parseFloat(String(fd.get("weight"))),
      customer_email: fd.get("customer_email") || "",
      service_type: fd.get("service_type"),
    });
    if (!parsed.success) return toast.error("Please fill all required fields correctly.");
    setSaving(true);
    const tn = generateTrackingNumber();
    const price = calculateQuote(parsed.data.weight, parsed.data.service_type === "international");
    const eta = new Date(); eta.setDate(eta.getDate() + (parsed.data.service_type === "international" ? 5 : 3));
    const { data: inserted, error } = await supabase.from("shipments").insert({
      tracking_number: tn,
      from_address: parsed.data.from_address,
      to_address: parsed.data.to_address,
      weight: parsed.data.weight,
      customer_email: parsed.data.customer_email || null,
      service_type: parsed.data.service_type,
      status: "label_created",
      price,
      current_location: parsed.data.from_address,
      estimated_delivery: eta.toISOString(),
      tracking_events: [],
    }).select("id").single();
    if (!error && inserted) {
      await supabase.from("tracking_events").insert({
        shipment_id: inserted.id,
        status: "label_created",
        location: parsed.data.from_address,
        description: "Shipping label created, awaiting pickup",
      });
    }
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(`Created shipment ${tn}`);
    navigate({ to: "/admin/shipments" });
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold">New shipment</h2>
      <p className="text-sm text-muted-foreground">Create a new shipment and auto-generate a tracking number.</p>
      <Card className="mt-6 p-6">
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2"><Label htmlFor="from_address">From address</Label><Input id="from_address" name="from_address" required maxLength={255} placeholder="123 Main St, New York, NY 10001" /></div>
          <div className="space-y-2"><Label htmlFor="to_address">To address</Label><Input id="to_address" name="to_address" required maxLength={255} placeholder="456 Oak Ave, Los Angeles, CA 90001" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label htmlFor="weight">Weight (lb)</Label><Input id="weight" name="weight" type="number" step="0.1" min="0.1" max="500" required /></div>
            <div className="space-y-2">
              <Label htmlFor="service_type">Service</Label>
              <Select name="service_type" defaultValue="domestic_express">
                <SelectTrigger id="service_type"><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(SERVICE_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2"><Label htmlFor="customer_email">Customer email (optional)</Label><Input id="customer_email" name="customer_email" type="email" maxLength={255} /></div>
          <Button type="submit" size="lg" disabled={saving}>{saving ? "Creating…" : "Create shipment"}</Button>
        </form>
      </Card>
    </div>
  );
}
