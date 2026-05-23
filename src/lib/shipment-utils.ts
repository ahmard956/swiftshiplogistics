export const STATUS_FLOW = ["order_received", "in_transit", "out_for_delivery", "delivered"] as const;
export type ShipmentStatus = typeof STATUS_FLOW[number] | "customs" | "exception";

export const STATUS_LABELS: Record<string, string> = {
  order_received: "Order Received",
  in_transit: "In Transit",
  customs: "Customs Clearance",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  exception: "Exception",
};

export const SERVICE_LABELS: Record<string, string> = {
  domestic_express: "Domestic Express",
  international: "International Shipping",
  business: "Business Solutions",
};

export function statusBadgeClass(status: string) {
  switch (status) {
    case "delivered":
      return "bg-success/15 text-success border-success/30";
    case "out_for_delivery":
      return "bg-warning/15 text-warning-foreground border-warning/30";
    case "in_transit":
    case "customs":
      return "bg-primary/10 text-primary border-primary/30";
    case "exception":
      return "bg-destructive/15 text-destructive border-destructive/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

export function generateTrackingNumber() {
  const n = Math.floor(100000000 + Math.random() * 900000000);
  return `SS${n}US`;
}

export function calculateQuote(weight: number, isInternational: boolean) {
  const base = isInternational ? 24 : 8;
  const perLb = isInternational ? 6.5 : 2.4;
  const fuel = isInternational ? 8 : 3;
  return Math.max(8, base + weight * perLb + fuel);
}
