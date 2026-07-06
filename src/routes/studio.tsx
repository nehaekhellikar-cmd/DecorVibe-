import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Upload, Wand2, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { BeforeAfterSlider } from "@/components/before-after-slider";
import { redesignRoom } from "@/lib/designs.functions";

export const Route = createFileRoute("/studio")({
  component: Studio,
  head: () => ({ meta: [
    { title: "AI Design Studio — DecorVibe" },
    { name: "description", content: "Upload a room, pick a style, generate a redesign with AI." },
  ]}),
});

const ROOMS = ["Living room", "Bedroom", "Kitchen", "Bathroom", "Office", "Dining room", "Gaming room", "Nursery"];
const STYLES = ["Modern", "Minimalist", "Luxury", "Scandinavian", "Bohemian", "Traditional", "Industrial", "Gaming Room"];
const THEMES = ["Warm neutrals", "Black & gold", "Soft pastels", "Earthy greens", "Moody dark", "Coastal blues", "Monochrome white"];

function Studio() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const generate = useServerFn(redesignRoom);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState<"idle" | "uploading" | "generating">("idle");
  const [room, setRoom] = useState("Living room");
  const [style, setStyle] = useState("Modern");
  const [theme, setTheme] = useState("");
  const [furniture, setFurniture] = useState("");
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  const onFile = useCallback((f: File | null) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) return toast.error("Please choose an image file.");
    if (f.size > 8 * 1024 * 1024) return toast.error("Max file size is 8 MB.");
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setOriginalUrl(null);
    setResult(null);
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onFile(e.dataTransfer.files?.[0] ?? null);
  };

  const uploadIfNeeded = async (): Promise<string> => {
    if (originalUrl) return originalUrl;
    if (!file || !user) throw new Error("Pick a photo first.");
    setBusy("uploading");
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from("rooms").upload(path, file, { contentType: file.type });
    if (error) { setBusy("idle"); throw new Error(error.message); }
    const { data } = supabase.storage.from("rooms").getPublicUrl(path);
    setOriginalUrl(data.publicUrl);
    return data.publicUrl;
  };

  const run = async () => {
    try {
      const url = await uploadIfNeeded();
      setBusy("generating");
      const res = await generate({
        data: { originalUrl: url, roomType: room, style, colorTheme: theme, furniture, notes },
      });
      setResult(res.generatedUrl);
      toast.success("Your new room is ready ✨");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setBusy("idle");
    }
  };

  const download = async () => {
    if (!result) return;
    const res = await fetch(result);
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `decorvibe-${style}-${Date.now()}.png`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <h1 className="font-serif text-4xl sm:text-5xl">AI Design Studio</h1>
        <p className="mt-3 text-muted-foreground">Upload a photo of your room, pick a style, and let the magic happen.</p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.3fr]">
        {/* Controls */}
        <div className="glass space-y-5 rounded-2xl p-6">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className="cursor-pointer rounded-xl border-2 border-dashed border-border bg-background/50 p-6 text-center transition hover:border-accent"
          >
            {preview ? (
              <img src={preview} alt="Preview" className="mx-auto max-h-56 rounded-lg object-contain" />
            ) : (
              <div className="space-y-2">
                <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="text-sm">Drop a room photo here, or click to browse</p>
                <p className="text-xs text-muted-foreground">JPG / PNG · up to 8 MB</p>
              </div>
            )}
            <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Room type</Label>
              <Select value={room} onValueChange={setRoom}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{ROOMS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Style</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{STYLES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Color theme</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {THEMES.map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setTheme(t === theme ? "" : t)}
                  className={`rounded-full border px-3 py-1 text-xs transition ${
                    t === theme ? "border-accent bg-accent text-accent-foreground" : "border-border hover:border-accent"
                  }`}
                >{t}</button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="furn">Furniture preferences</Label>
            <Input id="furn" value={furniture} onChange={(e) => setFurniture(e.target.value)} placeholder="e.g. velvet sofa, oak coffee table" maxLength={200} />
          </div>

          <div>
            <Label htmlFor="notes">Anything else?</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Mood, lighting, materials…" maxLength={600} rows={3} />
          </div>

          <Button onClick={run} disabled={!file || busy !== "idle"} size="lg" className="w-full rounded-full">
            {busy === "uploading" ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading…</>) :
             busy === "generating" ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Designing your room…</>) :
             (<><Wand2 className="mr-2 h-4 w-4" /> Generate redesign</>)}
          </Button>
        </div>

        {/* Result */}
        <div className="rounded-2xl border border-border bg-card p-6">
          {result && preview ? (
            <div>
              <BeforeAfterSlider before={preview} after={result} className="aspect-[4/3]" />
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setResult(null)}>New variation</Button>
                <Button onClick={download}><Download className="mr-2 h-4 w-4" /> Download</Button>
              </div>
            </div>
          ) : busy === "generating" ? (
            <div className="flex aspect-[4/3] flex-col items-center justify-center gap-4 rounded-xl bg-gradient-luxury">
              <div className="h-2 w-48 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-1/3 animate-shimmer rounded-full bg-gradient-to-r from-transparent via-accent to-transparent" />
              </div>
              <p className="font-serif text-xl">Curating your space…</p>
              <p className="text-xs text-muted-foreground">This usually takes 10–25 seconds.</p>
            </div>
          ) : (
            <div className="flex aspect-[4/3] flex-col items-center justify-center gap-3 rounded-xl bg-gradient-luxury text-center">
              <Wand2 className="h-10 w-10 text-accent" />
              <p className="font-serif text-2xl">Your redesign will appear here</p>
              <p className="max-w-sm text-sm text-muted-foreground">Upload a room photo, choose a style and tap Generate.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
