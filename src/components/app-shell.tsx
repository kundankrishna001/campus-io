import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, Brain, Briefcase, Compass, FileText, GraduationCap, LayoutDashboard, Mic, MoreHorizontal, Rocket, Trophy, UserCircle, type LucideIcon } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";

type NavItem = { to: string; label: string; icon: LucideIcon };

const PRIMARY: NavItem[] = [
  { to: "/dashboard", label: "Home", icon: LayoutDashboard },
  { to: "/learn", label: "Learn", icon: BookOpen },
  { to: "/quiz", label: "Quiz", icon: Brain },
  { to: "/hackathons", label: "Hacks", icon: Rocket },
];

const MORE: NavItem[] = [
  { to: "/internships", label: "Internships", icon: Briefcase },
  { to: "/resume", label: "Resume Builder", icon: FileText },
  { to: "/interview", label: "Mock HR Interview", icon: Mic },
  { to: "/guidance", label: "AI Career Guide", icon: Compass },
  { to: "/achievements", label: "Achievements", icon: Trophy },
  { to: "/profile", label: "Profile", icon: UserCircle },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [openMore, setOpenMore] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 print:hidden">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-primary shadow-glow">
              <GraduationCap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight">Campus IO</span>
          </Link>
          <nav className="hidden gap-1 md:flex items-center">
            {[...PRIMARY, ...MORE].map((n) => {
              const active = pathname.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    active ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {n.label}
                </Link>
              );
            })}
            <div className="ml-2 border-l border-border/60 pl-2">
              <ThemeToggle />
            </div>
          </nav>
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <Link
              to="/profile"
              className="rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
            >
              Me
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-24 pt-6 md:pb-10">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-background/95 backdrop-blur md:hidden print:hidden">
        <ul className="mx-auto grid max-w-md grid-cols-5">
          {PRIMARY.map((n) => {
            const Icon = n.icon;
            const active = pathname.startsWith(n.to);
            return (
              <li key={n.to}>
                <Link
                  to={n.to}
                  className={cn(
                    "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                    active ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {n.label}
                </Link>
              </li>
            );
          })}
          <li>
            <Sheet open={openMore} onOpenChange={setOpenMore}>
              <SheetTrigger asChild>
                <button className={cn("flex w-full flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors", openMore ? "text-primary" : "text-muted-foreground")}>
                  <MoreHorizontal className="h-5 w-5" />
                  More
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="rounded-t-3xl">
                <SheetHeader><SheetTitle>More</SheetTitle></SheetHeader>
                <div className="mt-4 grid grid-cols-3 gap-3 pb-6">
                  {MORE.map((n) => {
                    const Icon = n.icon;
                    return (
                      <Link
                        key={n.to}
                        to={n.to}
                        onClick={() => setOpenMore(false)}
                        className="flex flex-col items-center gap-2 rounded-2xl border border-border/60 bg-card p-3 text-center text-xs font-medium shadow-card transition hover:border-primary/40 hover:shadow-glow"
                      >
                        <div className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                        {n.label}
                      </Link>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>
          </li>
        </ul>
      </nav>
    </div>
  );
}
