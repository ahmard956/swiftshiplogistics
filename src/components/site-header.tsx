import { Link } from "@tanstack/react-router";
import { Package, Moon, Sun, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";

const nav = [
  { to: "/", label: "Home" },
  { to: "/tracking", label: "Track" },
  { to: "/services", label: "Services" },
  { to: "/quote", label: "Get Quote" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="group flex items-center gap-2.5 font-bold text-lg">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-primary-gradient text-primary-foreground shadow-glow transition-transform group-hover:scale-105">
            <Package className="h-5 w-5" strokeWidth={2.4} />
          </span>
          <span className="text-foreground tracking-tight">SwiftShip</span>
        </Link>

        <nav className="hidden md:flex items-center gap-0.5 rounded-full border border-border/60 bg-secondary/40 p-1">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="px-3.5 py-1.5 rounded-full text-sm font-medium text-muted-foreground transition-all hover:text-foreground"
              activeProps={{ className: "text-primary-foreground bg-foreground shadow-soft" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme" className="rounded-full">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Link to="/quote" className="hidden sm:inline-flex">
            <Button size="sm" className="rounded-full font-semibold shadow-soft">Get a Quote</Button>
          </Link>
          <Button variant="ghost" size="icon" className="md:hidden rounded-full" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="container mx-auto flex flex-col px-4 py-3">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="py-2.5 text-sm font-medium text-muted-foreground hover:text-primary"
                activeProps={{ className: "text-primary" }}
                activeOptions={{ exact: n.to === "/" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
