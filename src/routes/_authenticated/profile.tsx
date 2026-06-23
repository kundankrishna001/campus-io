import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — Campus IO" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ["profile-full"],
    queryFn: async () => {
      const [{ data: profile }, { data: skills }, { data: u }] = await Promise.all([
        supabase.from("profiles").select("*").maybeSingle(),
        supabase.from("user_skills").select("*"),
        supabase.auth.getUser(),
      ]);
      return { profile, skills: skills ?? [], email: u.user?.email };
    },
  });

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-card">
        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-gradient-primary shadow-glow">
            <UserIcon className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold">{data?.profile?.full_name ?? "Student"}</h1>
            <p className="text-sm text-muted-foreground">{data?.email}</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Field label="College" value={data?.profile?.college ?? "—"} />
          <Field label="Branch" value={data?.profile?.branch ?? "—"} />
          <Field label="Semester" value={data?.profile?.semester ?? "—"} />
          <Field label="CGPA" value={data?.profile?.cgpa ?? "—"} />
        </div>
        <Button variant="secondary" className="mt-4" onClick={() => navigate({ to: "/onboarding" })}>Edit profile</Button>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-card">
        <h2 className="font-display font-semibold">Skills</h2>
        {data?.skills.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {data.skills.map((s) => (
              <Badge key={s.id} variant="secondary" className="gap-1">
                {s.skill} <span className="text-[10px] text-muted-foreground">· {s.proficiency}</span>
              </Badge>
            ))}
          </div>
        ) : <p className="mt-2 text-sm text-muted-foreground">No skills yet.</p>}
      </div>

      <Button variant="ghost" className="w-full text-destructive hover:text-destructive" onClick={signOut}>
        <LogOut className="mr-2 h-4 w-4" /> Sign out
      </Button>
    </div>
  );
}

function Field({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}
