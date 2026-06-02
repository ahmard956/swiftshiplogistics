import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Package, LayoutDashboard, Truck, PlusCircle, LogOut, Menu, X, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/shipments", label: "Shipments", icon: Truck },
  { to: "/admin/tracking", label: "Tracking", icon: MapPin },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/new", label: "New Shipment", icon: PlusCircle },
];

export function AdminShell() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/auth" });
    } else if (!isAdmin) {
      toast.error("Admin access required");
      navigate({ to: "/" });
    }
  }, [loading, user, isAdmin, navigate]);

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/" });
  };

  if (loading || !user || !isAdmin) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform md:relative md:translate-x-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 px-5 flex items-center justify-between border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-2 font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-gradient text-primary-foreground"><Package className="h-4 w-4" /></span>
            SwiftShip
          </Link>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(false)}><X className="h-4 w-4" /></Button>
        </div>

        <nav className="px-3 py-4 space-y-1">
          {nav.map((n) => {
            const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                  active ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent"
                )}
              >
                <n.icon className="h-4 w-4" /> {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 inset-x-0 border-t border-sidebar-border p-3">
          <div className="px-2 py-2 text-xs">
            <div className="text-muted-foreground">Signed in as</div>
            <div className="font-medium truncate">{user.email}</div>
            <div className="mt-1 text-[10px]">{isAdmin ? "Admin" : "Viewer (request admin role)"}</div>
          </div>
          <Button variant="ghost" className="w-full justify-start" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" /> Sign out
          </Button>
        </div>
      </aside>

      {mobileOpen && <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-background/80 backdrop-blur sticky top-0 z-20 flex items-center px-4 gap-3">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(true)}><Menu className="h-5 w-5" /></Button>
          <h1 className="font-semibold">Admin</h1>
          {!isAdmin && (
            <span className="ml-auto text-xs px-2 py-1 rounded-full bg-warning/15 text-warning-foreground border border-warning/30">
              You don't have admin role — read-only
            </span>
          )}
        </header>
        <div className="flex-1 p-4 md:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
