export const STATUS_FLOW = ["label_created", "picked_up", "in_transit", "out_for_delivery", "delivered"] as const;

export const ALL_STATUSES = [
  "label_created",
  "picked_up",
  "arrived_origin",
  "departed_origin",
  "in_transit",
  "arrived_hub",
  "departed_hub",
  "customs",
  "arrived_destination",
  "out_for_delivery",
  "delivery_attempted",
  "delivered",
  "exception",
  "delayed",
  "returned_to_sender",
] as const;

export type ShipmentStatus = (typeof ALL_STATUSES)[number];

export const STATUS_LABELS: Record<string, string> = {
  label_created: "Label Created",
  picked_up: "Picked Up",
  arrived_origin: "Arrived at Origin Facility",
  departed_origin: "Departed Origin Facility",
  in_transit: "In Transit",
  arrived_hub: "Arrived at Transit Hub",
  departed_hub: "Departed Transit Hub",
  customs: "Customs Clearance",
  arrived_destination: "Arrived at Destination Facility",
  out_for_delivery: "Out for Delivery",
  delivery_attempted: "Delivery Attempted",
  delivered: "Delivered",
  exception: "Exception",
  delayed: "Delayed",
  returned_to_sender: "Returned to Sender",
};

export const SERVICE_LABELS: Record<string, string> = {
  domestic_express: "Domestic Express",
  international: "International Shipping",
  business: "Business Solutions",
};

export function getTimelineStage(status: string): number {
  switch (status) {
    case "label_created":
      return 1;
    case "picked_up":
    case "arrived_origin":
    case "departed_origin":
      return 2;
    case "in_transit":
    case "arrived_hub":
    case "departed_hub":
    case "customs":
    case "exception":
    case "delayed":
    case "returned_to_sender":
      return 3;
    case "out_for_delivery":
    case "arrived_destination":
    case "delivery_attempted":
      return 4;
    case "delivered":
      return 5;
    default:
      return 1;
  }
}

export function statusBadgeClass(status: string) {
  switch (status) {
    case "delivered":
      return "bg-success/15 text-success border-success/30";
    case "out_for_delivery":
    case "arrived_destination":
    case "delivery_attempted":
      return "bg-warning/15 text-warning-foreground border-warning/30";
    case "in_transit":
    case "arrived_hub":
    case "departed_hub":
    case "customs":
    case "picked_up":
    case "arrived_origin":
    case "departed_origin":
      return "bg-primary/10 text-primary border-primary/30";
    case "exception":
    case "delayed":
    case "returned_to_sender":
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
