import { createContext, useContext, useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Toaster } from "sonner";

type Ctx = { open: boolean; setOpen: (v: boolean) => void };
const SidebarCtx = createContext<Ctx>({ open: false, setOpen: () => {} });
export const useSidebarState = () => useContext(SidebarCtx);

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <SidebarCtx.Provider value={{ open, setOpen }}>
      <div className="flex h-screen overflow-hidden text-foreground">
        <Sidebar />
        {open && (
          <button
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          />
        )}
        <div className="flex min-w-0 flex-1 flex-col">
          <Header />
          <main className="scrollbar-thin flex-1 overflow-y-auto">{children}</main>
        </div>
        <Toaster
          position="bottom-right"
          theme="dark"
          toastOptions={{
            style: {
              background: "oklch(0.16 0.025 265 / 0.9)",
              border: "1px solid oklch(0.88 0.18 210 / 0.3)",
              color: "white",
              backdropFilter: "blur(20px)",
            },
          }}
        />
      </div>
    </SidebarCtx.Provider>
  );
}
