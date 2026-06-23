import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, ExternalLink, MapPin, Trophy } from "lucide-react";
import { DEMO_HACKATHONS } from "@/lib/demo-data";

export const Route = createFileRoute("/_authenticated/hackathons")({
  head: () => ({ meta: [{ title: "Hackathons — Campus IO" }] }),
  component: HackathonsPage,
});

function HackathonsPage() {
  const { data: hacks } = useQuery({
    queryKey: ["hackathons"],
    queryFn: async () => {
      const { data } = await (supabase as any).from("hackathons").select("*").eq("is_active", true).order("registration_deadline", { ascending: true });
      return data && data.length > 0 ? data : DEMO_HACKATHONS;
    },
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold md:text-3xl">Hackathons & Contests</h1>
        <p className="text-sm text-muted-foreground">Curated for Indian CS/IT students. Register before the deadline.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {(hacks ?? []).map((h: any) => {
          const daysLeft = h.registration_deadline ? Math.ceil((new Date(h.registration_deadline).getTime() - Date.now()) / 86400000) : null;
          const urgent = daysLeft !== null && daysLeft <= 7;
          return (
            <a key={h.id} href={h.url} target="_blank" rel="noopener noreferrer" className="group rounded-2xl border border-border/60 bg-card p-5 shadow-card transition hover:border-primary/50 hover:shadow-glow">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h3 className="font-display font-bold leading-tight">{h.title}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">by {h.organizer}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${h.mode === "online" ? "bg-secondary text-primary" : h.mode === "offline" ? "bg-accent/20 text-accent" : "bg-primary/15 text-primary"}`}>
                  {h.mode}
                </span>
              </div>
              {h.description && <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{h.description}</p>}
              {h.prize && (
                <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-accent">
                  <Trophy className="h-3.5 w-3.5" /> {h.prize}
                </div>
              )}
              <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                {h.location && (
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{h.location}</span>
                )}
                {h.registration_deadline && (
                  <span className={`flex items-center gap-1 ${urgent ? "font-semibold text-destructive" : ""}`}>
                    <Calendar className="h-3 w-3" />
                    {daysLeft !== null && daysLeft >= 0 ? `${daysLeft}d left to register` : "Registration closed"}
                  </span>
                )}
              </div>
              {h.tags?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {h.tags.slice(0, 4).map((t: string) => (
                    <span key={t} className="rounded-md bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">#{t}</span>
                  ))}
                </div>
              )}
              <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-primary group-hover:underline">
                View & register <ExternalLink className="h-3 w-3" />
              </div>
            </a>
          );
        })}
        {hacks && hacks.length === 0 && (
          <p className="col-span-full py-12 text-center text-sm text-muted-foreground">No active hackathons right now.</p>
        )}
      </div>
    </div>
  );
}
