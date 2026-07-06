import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({ meta: [
    { title: "Sign in — DecorVibe" },
    { name: "description", content: "Sign in or create your DecorVibe account." },
  ]}),
});

const SignIn = z.object({ email: z.string().email(), password: z.string().min(6) });
const SignUp = SignIn.extend({ fullName: z.string().trim().min(1).max(80) });

function AuthPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (user) navigate({ to: "/dashboard" }); }, [user, navigate]);

  const onSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = SignIn.safeParse(Object.fromEntries(fd));
    if (!parsed.success) return toast.error("Please enter a valid email and password.");
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setBusy(false);
    if (error) {
      if (error.message.toLowerCase().includes("invalid")) {
        return toast.error("Email or password is incorrect. New here? Create an account on the Sign up tab.");
      }
      return toast.error(error.message);
    }
    toast.success("Welcome back!");
    navigate({ to: "/dashboard" });
  };

  const onSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = SignUp.safeParse(Object.fromEntries(fd));
    if (!parsed.success) return toast.error("Please complete all fields (password 6+ chars).");
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: parsed.data.fullName },
      },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Account created — you're in!");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md items-center px-4 py-16">
      <div className="w-full">
        <h1 className="text-center font-serif text-4xl">Welcome to DecorVibe</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">Sign in or create your free account.</p>
        <Tabs defaultValue="signin" className="mt-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign in</TabsTrigger>
            <TabsTrigger value="signup">Sign up</TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            <form onSubmit={onSignIn} className="glass mt-4 space-y-4 rounded-2xl p-6">
              <div><Label htmlFor="email-i">Email</Label><Input id="email-i" name="email" type="email" required /></div>
              <div><Label htmlFor="pw-i">Password</Label><Input id="pw-i" name="password" type="password" required minLength={6} /></div>
              <Button type="submit" disabled={busy} className="w-full rounded-full">{busy ? "Signing in…" : "Sign in"}</Button>
            </form>
          </TabsContent>
          <TabsContent value="signup">
            <form onSubmit={onSignUp} className="glass mt-4 space-y-4 rounded-2xl p-6">
              <div><Label htmlFor="name-u">Full name</Label><Input id="name-u" name="fullName" required maxLength={80} /></div>
              <div><Label htmlFor="email-u">Email</Label><Input id="email-u" name="email" type="email" required /></div>
              <div><Label htmlFor="pw-u">Password</Label><Input id="pw-u" name="password" type="password" required minLength={6} /></div>
              <Button type="submit" disabled={busy} className="w-full rounded-full">{busy ? "Creating…" : "Create account"}</Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
