import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/pricing")({
  component: Pricing,
  head: () => ({ meta: [
    { title: "Pricing — DecorVibe" },
    { name: "description", content: "Simple, transparent pricing for AI-powered interior redesigns." },
  ]}),
});

const plans = [
  {
    name: "Starter", price: "Free", tagline: "Try it out, no card required.",
    features: ["5 AI redesigns / month", "All 7 styles", "Before/after slider", "Download in HD"],
    cta: "Start free", highlight: false,
  },
  {
    name: "Studio", price: "$19", suffix: "/mo", tagline: "For homeowners actively designing.",
    features: ["100 AI redesigns / month", "Custom color themes", "Save unlimited designs", "Priority generation"],
    cta: "Choose Studio", highlight: true,
  },
  {
    name: "Atelier", price: "$49", suffix: "/mo", tagline: "For pros, agents and stylists.",
    features: ["Unlimited redesigns", "Client gallery sharing", "4K downloads", "Early-access features"],
    cta: "Go Atelier", highlight: false,
  },
];

function Pricing() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="font-serif text-5xl">Pricing as elegant as the designs.</h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">Start free, upgrade when you fall in love.</p>
      </div>
      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {plans.map((p) => (
          <div
            key={p.name}
            className={`hover-lift relative rounded-2xl border p-8 ${
              p.highlight ? "border-accent bg-card shadow-luxury" : "border-border bg-card/60"
            }`}
          >
            {p.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                Most popular
              </div>
            )}
            <h3 className="font-serif text-2xl">{p.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{p.tagline}</p>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="font-serif text-5xl">{p.price}</span>
              {p.suffix && <span className="text-muted-foreground">{p.suffix}</span>}
            </div>
            <ul className="mt-6 space-y-3 text-sm">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-accent" /> <span>{f}</span>
                </li>
              ))}
            </ul>
            <Button asChild className="mt-8 w-full rounded-full" variant={p.highlight ? "default" : "outline"}>
              <Link to="/auth">{p.cta}</Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
