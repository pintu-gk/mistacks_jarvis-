import { createFileRoute } from "@tanstack/react-router";
import AppsTools from "../pages/AppsTools";

export const Route = createFileRoute("/apps")({ component: AppsTools });
