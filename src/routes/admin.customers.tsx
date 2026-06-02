import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { STATUS_LABELS, statusBadgeClass } from "@/lib/shipment-utils";
import { format } from "date-fns";

export const Route = createFileRoute("/admin/customers")({ component: Customers });

type Ship = { tracking_number: string; status: string; price: number; customer_email: string | null; to_address: string; updated_at: string };

type Customer = {
  email: string;
  shipments: number;
  totalSpent: number;
  lastActivity: string;
  rows: Ship[];
};

function Customers() {
  const [rows, setRows] = useState<Ship[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [openEmail, setOpenEmail] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("shipments")
        .select("tracking_number,status,price,customer_email,to_address,updated_at")
        .not("customer_email", "is", null)
        .order("updated_at", { ascending: false });
      setRows((data as unknown as Ship[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const customers = useMemo<Customer[]>(() => {
    const map = new Map<string, Customer>();
    for (const r of rows) {
      const email = (r.customer_email ?? "").toLowerCase();
      if (!email) continue;
      const c = map.get(email) ?? { email, shipments: 0, totalSpent: 0, lastActivity: r.updated_at, rows: [] };
      c.shipments += 1;
      c.totalSpent += Number(r.price ?? 0);
      if (new Date(r.updated_at) > new Date(c.lastActivity)) c.lastActivity = r.updated_at;
      c.rows.push(r);
      map.set(email, c);
    }
    return Array.from(map.values()).sort((a, b) => +new Date(b.lastActivity) - +new Date(a.lastActivity));
  }, [rows]);

  const filtered = customers.filter((c) => !q || c.email.includes(q.toLowerCase()));

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Customers</h2>
        <p className="text-sm text-muted-foreground">{customers.length} customers · derived from shipment records</p>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by email…" className="pl-9" />
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left p-3">Email</th>
                <th className="text-right p-3">Shipments</th>
                <th className="text-right p-3">Total spent</th>
                <th className="text-left p-3 hidden md:table-cell">Last activity</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">Loading…</td></tr>}
              {!loading && filtered.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">No customers yet.</td></tr>}
              {filtered.map((c) => (
                <>
                  <tr key={c.email} className="border-t border-border hover:bg-muted/30 cursor-pointer"
                      onClick={() => setOpenEmail(openEmail === c.email ? null : c.email)}>
                    <td className="p-3 font-medium">{c.email}</td>
                    <td className="p-3 text-right">{c.shipments}</td>
                    <td className="p-3 text-right font-medium">${c.totalSpent.toFixed(2)}</td>
                    <td className="p-3 hidden md:table-cell text-muted-foreground">{format(new Date(c.lastActivity), "MMM d, p")}</td>
                  </tr>
                  {openEmail === c.email && (
                    <tr key={c.email + "-detail"} className="bg-muted/20">
                      <td colSpan={4} className="p-4">
                        <div className="space-y-2">
                          {c.rows.map((r) => (
                            <div key={r.tracking_number} className="flex items-center justify-between gap-3 text-xs">
                              <span className="font-mono font-semibold">{r.tracking_number}</span>
                              <span className="text-muted-foreground truncate flex-1">→ {r.to_address}</span>
                              <span className={`px-2 py-0.5 rounded-full border ${statusBadgeClass(r.status)}`}>{STATUS_LABELS[r.status] ?? r.status}</span>
                              <span className="font-medium">${Number(r.price).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
