import { createFileRoute } from "@tanstack/react-router";
import SmartHome from "../pages/SmartHome";

export const Route = createFileRoute("/smart-home")({ component: SmartHome });
