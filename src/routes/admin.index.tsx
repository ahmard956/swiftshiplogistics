import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Package, Truck, CheckCircle2, DollarSign } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { STATUS_LABELS, statusBadgeClass } from "@/lib/shipment-utils";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Dashboard — SwiftShip Admin" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: AdminDashboard,
});

type Stats = { active: number; inTransit: number; deliveredToday: number; revenue: number };
type Recent = { tracking_number: string; status: string; to_address: string; price: number; updated_at: string };

function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<Recent[]>([]);
  const statusMap = useRef<Map<string, string>>(new Map());

  const computeAndSet = (data: Array<{ id?: string; status: string; price: number | null; updated_at: string; tracking_number: string; to_address: string }>) => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const s: Stats = {
      active: data.filter((d) => d.status !== "delivered" && d.status !== "returned_to_sender").length,
      inTransit: data.filter((d) =>
        ["in_transit", "arrived_hub", "departed_hub", "customs", "arrived_destination", "out_for_delivery", "delivery_attempted"].includes(d.status)
      ).length,
      deliveredToday: data.filter((d) => d.status === "delivered" && new Date(d.updated_at) >= today).length,
      revenue: data.reduce((sum, d) => sum + Number(d.price || 0), 0),
    };
    setStats(s);
    setRecent(data.slice(0, 6) as Recent[]);
  };

  const load = async () => {
    const { data } = await supabase
      .from("shipments")
      .select("id,status,price,updated_at,tracking_number,to_address")
      .order("updated_at", { ascending: false });
    if (!data) return;
    statusMap.current = new Map(data.map((d) => [d.id as string, d.status]));
    computeAndSet(data);
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel("admin-dashboard-shipments")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "shipments" },
        (payload) => {
          const next = payload.new as { id: string; status: string; tracking_number: string };
          const prev = statusMap.current.get(next.id);
          if (prev && prev !== next.status) {
            toast.success(`${next.tracking_number} → ${STATUS_LABELS[next.status] ?? next.status}`, {
              description: "Shipment status updated",
            });
          }
          statusMap.current.set(next.id, next.status);
          load();
        },
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "shipments" },
        (payload) => {
          const next = payload.new as { id: string; status: string; tracking_number: string };
          statusMap.current.set(next.id, next.status);
          toast(`New shipment ${next.tracking_number} created`);
          load();
        },
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
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
