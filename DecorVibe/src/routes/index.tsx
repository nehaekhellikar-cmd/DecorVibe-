import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Wand2, Image as ImageIcon, Palette, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero-room.jpg";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "DecorVibe — AI Interior Design Studio" },
      { name: "description", content: "Redesign any room with AI in seconds. Modern, minimalist, luxury, scandinavian and more." },
    ],
  }),
});

const styles = ["Modern", "Minimalist", "Luxury", "Scandinavian", "Bohemian", "Traditional", "Gaming Room"];

function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-luxury" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-28">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-accent" /> Powered by Lovable AI
            </div>
            <h1 className="mt-6 font-serif text-5xl leading-[1.05] sm:text-6xl lg:text-7xl">
              Redesign any room with <span className="text-gradient-gold">AI elegance</span>.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              Snap a photo of your space, pick a style, and DecorVibe will reimagine it in seconds — luxury, minimalist, scandinavian, or whatever inspires you.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full">
                <Link to="/studio">Start designing <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full">
                <Link to="/advisor">Try the AI Advisor</Link>
              </Button>
            </div>
            <div className="mt-10 flex flex-wrap gap-2">
              {styles.map((s) => (
                <span key={s} className="rounded-full border border-border bg-card/50 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="relative animate-fade-up [animation-delay:120ms]">
            <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-accent/30 via-transparent to-accent/20 blur-2xl" />
            <img
              src={heroImg}
              alt="Luxury AI-redesigned living room"
              width={1536}
              height={1024}
              className="relative rounded-3xl shadow-luxury"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="font-serif text-4xl sm:text-5xl">Design that feels effortless.</h2>
          <p className="mt-4 text-muted-foreground">A studio-grade AI workflow, refined for everyone.</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { icon: Wand2, title: "AI Redesign", body: "Re-imagine your room in seconds with state-of-the-art generative models." },
            { icon: Palette, title: "Style Library", body: "From minimalist to luxury — 7 curated styles plus custom color themes." },
            { icon: ImageIcon, title: "Before / After", body: "An elegant slider so you can compare the transformation in real time." },
            { icon: Zap, title: "Instant Results", body: "Most designs render in under 20 seconds, ready to download." },
            { icon: Shield, title: "Private by Default", body: "Your uploads and designs are scoped to your account only." },
            { icon: Sparkles, title: "Save & Iterate", body: "Build a library of versions and revisit your favorites anytime." },
          ].map((f, i) => (
            <div key={i} className="hover-lift glass rounded-2xl p-6">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-accent/15 text-accent">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-serif text-xl">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gradient-luxury">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <h2 className="font-serif text-4xl sm:text-5xl">Three steps to a new room.</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              ["01", "Upload", "Drop in a photo of any room — living room, bedroom, kitchen, office, even a gaming setup."],
              ["02", "Curate", "Choose a style, color theme and furniture cues to guide the AI."],
              ["03", "Transform", "Get a redesigned room photo, compare side-by-side and save your favorites."],
            ].map(([n, t, b]) => (
              <div key={n} className="glass rounded-2xl p-8">
                <div className="font-serif text-5xl text-accent">{n}</div>
                <h3 className="mt-4 font-serif text-2xl">{t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <h2 className="font-serif text-4xl sm:text-5xl">Loved by design lovers.</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            ["“Replaced three Pinterest moodboards in a single afternoon.”", "Maya R.", "Interior stylist"],
            ["“I redesigned our nursery in 5 styles before lunch. Magic.”", "Daniel & Sara", "New parents"],
            ["“The before/after slider sold our entire team on it.”", "Lina K.", "Real-estate agent"],
          ].map(([q, a, r]) => (
            <figure key={a} className="hover-lift glass rounded-2xl p-6">
              <blockquote className="font-serif text-xl leading-snug">{q}</blockquote>
              <figcaption className="mt-4 text-sm text-muted-foreground"><span className="text-foreground">{a}</span> · {r}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-primary p-10 text-primary-foreground shadow-luxury sm:p-16">
          <h2 className="max-w-2xl font-serif text-4xl sm:text-5xl">Your dream room is one upload away.</h2>
          <p className="mt-4 max-w-xl opacity-80">Free to start. No credit card needed.</p>
          <Button asChild size="lg" variant="secondary" className="mt-8 rounded-full">
            <Link to="/studio">Open the AI Studio <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
