import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/study")({
  component: RedirectToPlanner,
});

function RedirectToPlanner() {
  return <Navigate to="/study-planner" replace />;
}
