import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, ImageIcon, Heart } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Dashboard — DecorVibe" }] }),
});

type Design = {
  id: string; original_url: string; generated_url: string; style: string; room_type: string; created_at: string;
};

function Dashboard() {
  const { user } = useAuth();
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("designs").select("*").order("created_at", { ascending: false }).limit(6);
      setDesigns(data ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back</p>
          <h1 className="font-serif text-4xl">{user?.user_metadata?.full_name || user?.email?.split("@")[0]}</h1>
        </div>
        <Button asChild className="rounded-full"><Link to="/studio">Open AI Studio <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <Card icon={Sparkles} label="Designs created" value={designs.length} />
        <Card icon={ImageIcon} label="Latest style" value={designs[0]?.style ?? "—"} />
        <Card icon={Heart} label="Saved" value={designs.length} />
      </div>

      <div className="mt-12 flex items-center justify-between">
        <h2 className="font-serif text-2xl">Recent designs</h2>
        <Link to="/saved" className="text-sm text-muted-foreground hover:text-foreground">View all →</Link>
      </div>

      {loading ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[0,1,2].map(i => <div key={i} className="h-60 animate-pulse rounded-2xl bg-muted" />)}
        </div>
      ) : designs.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="text-muted-foreground">No designs yet. Let's make your first one.</p>
          <Button asChild className="mt-4 rounded-full"><Link to="/studio">Start designing</Link></Button>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {designs.map((d) => (
            <div key={d.id} className="hover-lift overflow-hidden rounded-2xl border border-border bg-card">
              <img src={d.generated_url} alt={d.style} className="aspect-[4/3] w-full object-cover" loading="lazy" />
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <p className="font-serif text-lg">{d.style}</p>
                  <span className="text-xs text-muted-foreground">{new Date(d.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-muted-foreground capitalize">{d.room_type}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Card({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center gap-3 text-muted-foreground"><Icon className="h-4 w-4 text-accent" /> <span className="text-xs uppercase tracking-wide">{label}</span></div>
      <div className="mt-3 font-serif text-3xl">{value}</div>
    </div>
  );
}
