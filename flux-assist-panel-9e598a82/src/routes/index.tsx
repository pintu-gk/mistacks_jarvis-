import { createFileRoute } from "@tanstack/react-router";
import Dashboard from "@/pages/Dashboard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "JARVIS — Dashboard" },
      { name: "description", content: "Your futuristic AI assistant command center." },
    ],
  }),
  component: Dashboard,
});
