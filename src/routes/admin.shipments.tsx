import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Search, PlusCircle, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { STATUS_LABELS, STATUS_FLOW, ALL_STATUSES, statusBadgeClass } from "@/lib/shipment-utils";
import { format } from "date-fns";

export const Route = createFileRoute("/admin/shipments")({
  head: () => ({ meta: [{ title: "Shipments — SwiftShip Admin" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: ShipmentsList,
});

type Row = {
  id: string; tracking_number: string; status: string; from_address: string; to_address: string;
  customer_email: string | null; price: number; current_location: string | null; updated_at: string;
  tracking_events: Array<{ status: string; location: string; timestamp: string; description: string }>;
};

function ShipmentsList() {
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [editing, setEditing] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("shipments").select("*").order("updated_at", { ascending: false });
    setRows((data as unknown as Row[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const ch = supabase.channel("ship-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "shipments" }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const filtered = rows.filter((r) => {
    const matches = !q || r.tracking_number.toLowerCase().includes(q.toLowerCase())
      || r.to_address.toLowerCase().includes(q.toLowerCase())
      || (r.customer_email ?? "").toLowerCase().includes(q.toLowerCase());
    const f = filter === "all" || r.status === filter;
    return matches && f;
  });

  const del = async (id: string) => {
    if (!confirm("Delete this shipment?")) return;
    const { error } = await supabase.from("shipments").delete().eq("id", id);
    if (error) toast.error(error.message); else toast.success("Deleted");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Shipments</h2>
          <p className="text-sm text-muted-foreground">{rows.length} total · live updates</p>
        </div>
        <Link to="/admin/new"><Button><PlusCircle className="h-4 w-4 mr-1" /> New shipment</Button></Link>
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tracking #, destination, email…" className="pl-9" />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full sm:w-56"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {ALL_STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left p-3">Tracking #</th>
                <th className="text-left p-3 hidden md:table-cell">Route</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3 hidden lg:table-cell">Updated</th>
                <th className="text-right p-3">Price</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Loading…</td></tr>}
              {!loading && filtered.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No shipments found.</td></tr>}
              {filtered.map((r) => (
                <tr key={r.id} className="border-t border-border hover:bg-muted/30">
                  <td className="p-3 font-mono font-semibold">{r.tracking_number}</td>
                  <td className="p-3 hidden md:table-cell text-muted-foreground">
                    <div className="truncate max-w-xs">{r.from_address}</div>
                    <div className="truncate max-w-xs">→ {r.to_address}</div>
                  </td>
                  <td className="p-3"><span className={`px-2 py-0.5 rounded-full border text-xs ${statusBadgeClass(r.status)}`}>{STATUS_LABELS[r.status] ?? r.status}</span></td>
                  <td className="p-3 hidden lg:table-cell text-muted-foreground">{format(new Date(r.updated_at), "MMM d, p")}</td>
                  <td className="p-3 text-right font-medium">${Number(r.price).toFixed(2)}</td>
                  <td className="p-3 text-right">
                    <Button variant="ghost" size="icon" onClick={() => setEditing(r)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => del(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <EditDialog row={editing} onClose={() => setEditing(null)} />
    </div>
  );
}

function EditDialog({ row, onClose }: { row: Row | null; onClose: () => void }) {
  const [status, setStatus] = useState("");
  const [loc, setLoc] = useState("");
  const [desc, setDesc] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (row) { setStatus(row.status); setLoc(row.current_location ?? ""); setDesc(""); } }, [row]);

  const save = async () => {
    if (!row) return;
    setSaving(true);
    const { error } = await supabase.from("shipments").update({
      status, current_location: loc || row.current_location,
    }).eq("id", row.id);
    if (!error) {
      await supabase.from("tracking_events").insert({
        shipment_id: row.id,
        status,
        location: loc || row.current_location || null,
        description: desc || `Status updated to ${STATUS_LABELS[status] ?? status}`,
      });
    }
    setSaving(false);
    if (error) toast.error(error.message); else { toast.success("Shipment updated"); onClose(); }
  };

  return (
    <Dialog open={!!row} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Update {row?.tracking_number}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{ALL_STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Current location</Label>
            <Input value={loc} onChange={(e) => setLoc(e.target.value)} maxLength={120} />
          </div>
          <div className="space-y-2">
            <Label>Event description (optional)</Label>
            <Input value={desc} onChange={(e) => setDesc(e.target.value)} maxLength={200} placeholder="e.g. Arrived at sorting facility" />
          </div>
          <div className="flex justify-end gap-2"><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save update"}</Button></div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
