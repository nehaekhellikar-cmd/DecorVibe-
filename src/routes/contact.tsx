import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Mail, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";

export const Route = createFileRoute("/contact")({
  component: Contact,
  head: () => ({ meta: [
    { title: "Contact — DecorVibe" },
    { name: "description", content: "Get in touch with the DecorVibe team." },
  ]}),
});

const Schema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(160),
  message: z.string().trim().min(5).max(1000),
});

function Contact() {
  const [busy, setBusy] = useState(false);
  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
      <div>
        <h1 className="font-serif text-5xl">Let's talk design.</h1>
        <p className="mt-4 text-muted-foreground">Questions, partnerships, press — drop a note. We reply within 1 business day.</p>
        <div className="mt-8 space-y-3 text-sm">
          <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-accent" /> hello@decorvibe.app</div>
          <div className="flex items-center gap-3"><MessageSquare className="h-4 w-4 text-accent" /> Live chat (Mon–Fri)</div>
        </div>
      </div>
      <form
        className="glass space-y-4 rounded-2xl p-8"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const parsed = Schema.safeParse(Object.fromEntries(fd));
          if (!parsed.success) {
            toast.error(parsed.error.issues[0]?.message ?? "Please check your inputs");
            return;
          }
          setBusy(true);
          setTimeout(() => {
            setBusy(false);
            (e.target as HTMLFormElement).reset();
            toast.success("Message sent — talk soon!");
          }, 700);
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input name="name" placeholder="Your name" required maxLength={80} />
          <Input name="email" type="email" placeholder="you@email.com" required maxLength={160} />
        </div>
        <Textarea name="message" placeholder="How can we help?" required rows={6} maxLength={1000} />
        <Button type="submit" disabled={busy} className="w-full rounded-full">{busy ? "Sending…" : "Send message"}</Button>
      </form>
    </div>
  );
}
