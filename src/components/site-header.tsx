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
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-xl">
      <div className="container mx-auto flex h-[68px] items-center justify-between px-4">
        <Link to="/" className="group flex items-center gap-2.5 text-lg font-bold">
          <span className="relative flex h-9 w-9 items-center justify-center bg-primary text-primary-foreground transition-colors group-hover:bg-primary/90">
            <Package className="h-5 w-5" strokeWidth={2.4} />
          </span>
          <span className="text-foreground">SwiftShip <span className="hidden font-normal text-muted-foreground sm:inline">Logistics</span></span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="border-b-2 border-transparent py-6 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "border-primary text-foreground" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Link to="/quote" className="hidden sm:inline-flex">
             <Button size="sm" className="font-semibold">Get a Quote</Button>
          </Link>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
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
