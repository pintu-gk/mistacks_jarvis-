import { createFileRoute } from "@tanstack/react-router";
import StudyPlanner from "../pages/StudyPlanner";

export const Route = createFileRoute("/study-planner")({
  component: StudyPlanner,
});
