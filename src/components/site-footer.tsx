import { Link } from "@tanstack/react-router";
import { Package, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2 font-bold">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-gradient text-primary-foreground">
                <Package className="h-4 w-4" />
              </span>
              <span>SwiftShip Logistics</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              Fast, reliable shipping across the USA and 220+ countries worldwide.
            </p>
            <div className="mt-4 flex gap-3">
              {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-sm">Services</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/services" className="hover:text-primary">Domestic Express</Link></li>
              <li><Link to="/services" className="hover:text-primary">International</Link></li>
              <li><Link to="/services" className="hover:text-primary">Business Solutions</Link></li>
              <li><Link to="/quote" className="hover:text-primary">Get a Quote</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-sm">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-primary">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
              <li><Link to="/tracking" className="hover:text-primary">Track a Package</Link></li>
              <li><Link to="/admin" className="hover:text-primary">Admin Portal</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-sm">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>1-800-SWIFTSHIP</li>
              <li>support@swiftship.com</li>
              <li>24/7 Customer Service</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row justify-between gap-3 text-xs text-muted-foreground">
          <p>© 2026 SwiftShip Logistics. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-primary">Privacy</a>
            <a href="#" className="hover:text-primary">Terms</a>
            <a href="#" className="hover:text-primary">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
