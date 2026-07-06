import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  component: About,
  head: () => ({ meta: [
    { title: "About — DecorVibe" },
    { name: "description", content: "DecorVibe is an AI interior design studio that turns photos of any room into beautifully restyled spaces." },
  ]}),
});

function About() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
      <h1 className="font-serif text-5xl">About DecorVibe.</h1>
      <p className="mt-6 text-lg text-muted-foreground">
        DecorVibe is an AI-native interior design studio. We believe great design should be accessible to everyone — not gated behind expensive consultants or weeks of mood-boarding.
      </p>
      <div className="mt-12 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="font-serif text-2xl">Our mission</h2>
          <p className="mt-3 text-muted-foreground">Give every person on the planet the ability to visualize their dream space in seconds — and the confidence to actually build it.</p>
        </div>
        <div>
          <h2 className="font-serif text-2xl">How it works</h2>
          <p className="mt-3 text-muted-foreground">We combine multimodal AI image models with carefully tuned interior-design prompts so the generated room respects your existing architecture while transforming the look.</p>
        </div>
        <div>
          <h2 className="font-serif text-2xl">Built for hackathons & homes</h2>
          <p className="mt-3 text-muted-foreground">DecorVibe was crafted as a polished, full-stack showcase combining real AI generation, auth, storage and a luxury UI.</p>
        </div>
        <div>
          <h2 className="font-serif text-2xl">Privacy</h2>
          <p className="mt-3 text-muted-foreground">Your uploads and designs are private to your account. We never share or train on them.</p>
        </div>
      </div>
    </div>
  );
}
