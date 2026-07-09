import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Trash2, Plus, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { ALL_STATUSES, STATUS_LABELS, statusBadgeClass } from "@/lib/shipment-utils";
import { format } from "date-fns";

export const Route = createFileRoute("/admin/tracking")({
  head: () => ({ meta: [{ title: "Tracking Events — SwiftShip Admin" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: TrackingAdmin,
});

type Event = {
  id: string;
  shipment_id: string;
  status: string;
  location: string | null;
  description: string | null;
  event_at: string;
  shipments: { tracking_number: string } | null;
};

function TrackingAdmin() {
  const [rows, setRows] = useState<Event[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("tracking_events")
      .select("id, shipment_id, status, location, description, event_at, shipments(tracking_number)")
      .order("event_at", { ascending: false })
      .limit(500);
    setRows((data as unknown as Event[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const ch = supabase.channel("te-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "tracking_events" }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const filtered = rows.filter((r) => {
    if (!q) return true;
    const s = q.toLowerCase();
    return (r.shipments?.tracking_number ?? "").toLowerCase().includes(s)
      || (r.location ?? "").toLowerCase().includes(s)
      || (r.description ?? "").toLowerCase().includes(s);
  });

  const del = async (id: string) => {
    if (!confirm("Delete this tracking event?")) return;
    const { error } = await supabase.from("tracking_events").delete().eq("id", id);
    if (error) toast.error(error.message); else toast.success("Deleted");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Tracking events</h2>
          <p className="text-sm text-muted-foreground">{rows.length} events · live updates</p>
        </div>
        <Button onClick={() => setAdding(true)}><Plus className="h-4 w-4 mr-1" /> Add update</Button>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tracking #, location, description…" className="pl-9" />
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left p-3">When</th>
                <th className="text-left p-3">Tracking #</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3 hidden md:table-cell">Location</th>
                <th className="text-left p-3 hidden lg:table-cell">Description</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Loading…</td></tr>}
              {!loading && filtered.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No events.</td></tr>}
              {filtered.map((r) => (
                <tr key={r.id} className="border-t border-border hover:bg-muted/30">
                  <td className="p-3 text-muted-foreground whitespace-nowrap">{format(new Date(r.event_at), "MMM d, p")}</td>
                  <td className="p-3 font-mono font-semibold">{r.shipments?.tracking_number ?? "—"}</td>
                  <td className="p-3"><span className={`px-2 py-0.5 rounded-full border text-xs ${statusBadgeClass(r.status)}`}>{STATUS_LABELS[r.status] ?? r.status}</span></td>
                  <td className="p-3 hidden md:table-cell text-muted-foreground">{r.location ?? "—"}</td>
                  <td className="p-3 hidden lg:table-cell text-muted-foreground truncate max-w-md">{r.description ?? "—"}</td>
                  <td className="p-3 text-right">
                    <Button variant="ghost" size="icon" onClick={() => del(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <AddDialog open={adding} onClose={() => setAdding(false)} />
    </div>
  );
}

function AddDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tn, setTn] = useState("");
  const [status, setStatus] = useState("in_transit");
  const [loc, setLoc] = useState("");
  const [desc, setDesc] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (open) { setTn(""); setStatus("in_transit"); setLoc(""); setDesc(""); } }, [open]);

  const save = async () => {
    if (!tn.trim()) return toast.error("Tracking number required");
    setSaving(true);
    const { data: ship, error: e1 } = await supabase
      .from("shipments").select("id").eq("tracking_number", tn.trim().toUpperCase()).maybeSingle();
    if (e1 || !ship) { setSaving(false); return toast.error("Shipment not found"); }
    const { error } = await supabase.from("tracking_events").insert({
      shipment_id: ship.id, status, location: loc || null,
      description: desc || `Status updated to ${STATUS_LABELS[status] ?? status}`,
    });
    if (!error) {
      await supabase.from("shipments").update({ status, current_location: loc || undefined }).eq("id", ship.id);
    }
    setSaving(false);
    if (error) toast.error(error.message); else { toast.success("Event added"); onClose(); }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Add tracking update</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label>Tracking number</Label><Input value={tn} onChange={(e) => setTn(e.target.value)} placeholder="SS123456789US" /></div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{ALL_STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Location</Label><Input value={loc} onChange={(e) => setLoc(e.target.value)} maxLength={120} /></div>
          <div className="space-y-2"><Label>Description</Label><Input value={desc} onChange={(e) => setDesc(e.target.value)} maxLength={200} /></div>
          <div className="flex justify-end gap-2"><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Add update"}</Button></div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
