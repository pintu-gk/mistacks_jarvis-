import { createFileRoute } from "@tanstack/react-router";
import RoutineAlarm from "../pages/RoutineAlarm";

export const Route = createFileRoute("/routine")({ component: RoutineAlarm });
