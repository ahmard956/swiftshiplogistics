import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin-shell";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Portal — SwiftShip" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: () => <AdminShell />,
});
