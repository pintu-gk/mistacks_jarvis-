import { createFileRoute } from "@tanstack/react-router";
import FilesNotes from "../pages/FilesNotes";

export const Route = createFileRoute("/files")({ component: FilesNotes });
