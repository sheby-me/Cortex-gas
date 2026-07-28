import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Search, Sparkles, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { signOut as fbSignOut } from "firebase/auth";
import { auth } from "@/integrations/firebase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

const STUDENT_HOME = "/dashboard";

// Routes that students are not allowed to visit
const STUDENT_BLOCKED = ["/teacher"];

function AppLayout() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const { user, role, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }
    if (!role) return; // wait for role
    if (role === "admin") {
      navigate({ to: "/admin" });
      return;
    }
    if (
      role === "student" &&
      STUDENT_BLOCKED.some((p) => pathname === p || pathname.startsWith(p + "/"))
    ) {
      navigate({ to: STUDENT_HOME });
    }
  }, [user, role, loading, pathname, navigate]);

  async function signOut() {
    await fbSignOut(auth);
    navigate({ to: "/auth" });
  }
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex flex-1 flex-col min-w-0">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur md:px-6">
            <SidebarTrigger className="shrink-0" />
            <div className="relative hidden max-w-md flex-1 md:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search tutors, topics, groups…"
                className="h-10 rounded-md border-border bg-secondary pl-9 focus-visible:bg-background"
              />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <ThemeToggle />
              <Button asChild size="sm" variant="ghost" className="rounded-md">
                <Link to="/notifications">
                  <Bell className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="sm" className="rounded-md">
                <Link to="/ai">
                  <Sparkles className="mr-1.5 h-4 w-4" />
                  Ask AI
                </Link>
              </Button>
              <Button
                onClick={signOut}
                size="sm"
                variant="ghost"
                className="rounded-md"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </header>
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
