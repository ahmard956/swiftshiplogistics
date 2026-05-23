import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Package, Truck, CheckCircle2, DollarSign } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { STATUS_LABELS, statusBadgeClass } from "@/lib/shipment-utils";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

type Stats = { active: number; inTransit: number; deliveredToday: number; revenue: number };
type Recent = { tracking_number: string; status: string; to_address: string; price: number; updated_at: string };

function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<Recent[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("shipments").select("status,price,updated_at,tracking_number,to_address").order("updated_at", { ascending: false });
      if (!data) return;
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const s: Stats = {
        active: data.filter((d) => d.status !== "delivered").length,
        inTransit: data.filter((d) => d.status === "in_transit" || d.status === "out_for_delivery").length,
        deliveredToday: data.filter((d) => d.status === "delivered" && new Date(d.updated_at) >= today).length,
        revenue: data.reduce((sum, d) => sum + Number(d.price || 0), 0),
      };
      setStats(s);
      setRecent(data.slice(0, 6) as Recent[]);
    })();
  }, []);

  const cards = [
    { label: "Active Shipments", value: stats?.active, icon: Package, color: "text-primary" },
    { label: "In Transit", value: stats?.inTransit, icon: Truck, color: "text-primary" },
    { label: "Delivered Today", value: stats?.deliveredToday, icon: CheckCircle2, color: "text-success" },
    { label: "Total Revenue", value: stats ? `$${stats.revenue.toFixed(2)}` : undefined, icon: DollarSign, color: "text-primary" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-sm text-muted-foreground">Overview of your shipping operations.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="p-5">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">{c.label}</div>
              <c.icon className={`h-4 w-4 ${c.color}`} />
            </div>
            <div className="mt-2 text-3xl font-bold">{c.value === undefined ? <Skeleton className="h-8 w-20" /> : c.value}</div>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <h3 className="font-semibold">Recent activity</h3>
        <div className="mt-4 divide-y divide-border">
          {recent.length === 0 && <Skeleton className="h-16 w-full" />}
          {recent.map((r) => (
            <div key={r.tracking_number} className="flex items-center justify-between py-3 gap-4">
              <div className="min-w-0">
                <div className="font-mono text-sm font-semibold">{r.tracking_number}</div>
                <div className="text-xs text-muted-foreground truncate">→ {r.to_address}</div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`px-2 py-0.5 rounded-full border text-xs ${statusBadgeClass(r.status)}`}>
                  {STATUS_LABELS[r.status] ?? r.status}
                </span>
                <span className="text-xs text-muted-foreground hidden sm:inline">{formatDistanceToNow(new Date(r.updated_at), { addSuffix: true })}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
