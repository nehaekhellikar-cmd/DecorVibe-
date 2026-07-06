import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { useAuth } from "@/lib/auth-context";

const links = [
  { to: "/", label: "Home" },
  { to: "/studio", label: "AI Studio" },
  { to: "/advisor", label: "AI Advisor" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 glass">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 font-serif text-xl tracking-tight">
          <Sparkles className="h-5 w-5 text-accent" />
          <span>DecorVibe</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          {user ? (
            <>
              <Button asChild variant="ghost" size="sm"><Link to="/dashboard">Dashboard</Link></Button>
              <Button onClick={() => signOut()} size="sm" variant="outline">Sign out</Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm"><Link to="/auth">Sign in</Link></Button>
              <Button asChild size="sm"><Link to="/auth">Get started</Link></Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border md:hidden">
          <div className="space-y-1 px-4 py-3">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="block rounded-md px-3 py-2 text-sm hover:bg-muted">
                {l.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setOpen(false)} className="block rounded-md px-3 py-2 text-sm hover:bg-muted">Dashboard</Link>
                <button onClick={() => { setOpen(false); signOut(); }} className="block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-muted">Sign out</button>
              </>
            ) : (
              <Link to="/auth" onClick={() => setOpen(false)} className="block rounded-md px-3 py-2 text-sm hover:bg-muted">Sign in</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
