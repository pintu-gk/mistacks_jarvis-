import { createFileRoute } from "@tanstack/react-router";
import SecurityCenter from "../pages/SecurityCenter";

export const Route = createFileRoute("/security")({ component: SecurityCenter });
