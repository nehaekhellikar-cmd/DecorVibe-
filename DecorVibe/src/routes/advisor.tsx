import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Upload, Sparkles, Loader2, Palette, Lightbulb, Sofa, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { analyzeRoom, type AdvisorResult } from "@/lib/advisor.functions";

export const Route = createFileRoute("/advisor")({
  component: Advisor,
  head: () => ({
    meta: [
      { title: "AI Design Advisor — DecorVibe" },
      { name: "description", content: "Upload a room photo or video and get instant AI advice on wall colors, decor and styling." },
    ],
  }),
});

const ROOMS = ["Living room", "Bedroom", "Kitchen", "Bathroom", "Office", "Dining room", "Hallway", "Nursery"];

function Advisor() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const advise = useServerFn(analyzeRoom);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState(false);
  const [busy, setBusy] = useState<"idle" | "uploading" | "analyzing">("idle");
  const [room, setRoom] = useState("Living room");
  const [vibe, setVibe] = useState("");
  const [result, setResult] = useState<AdvisorResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  const onFile = useCallback((f: File | null) => {
    if (!f) return;
    const isImg = f.type.startsWith("image/");
    const isVid = f.type.startsWith("video/");
    if (!isImg && !isVid) return toast.error("Please upload an image or video.");
    if (f.size > 25 * 1024 * 1024) return toast.error("Max file size is 25 MB.");
    setFile(f);
    setIsVideo(isVid);
    setPreview(URL.createObjectURL(f));
    setResult(null);
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onFile(e.dataTransfer.files?.[0] ?? null);
  };

  // Capture a frame from the uploaded video as a JPEG blob
  const grabVideoFrame = async (): Promise<Blob> => {
    const v = videoRef.current;
    if (!v) throw new Error("Video not ready");
    if (v.readyState < 2) {
      await new Promise<void>((res) => {
        const h = () => { v.removeEventListener("loadeddata", h); res(); };
        v.addEventListener("loadeddata", h);
      });
    }
    try { v.currentTime = Math.min(1, (v.duration || 1) / 2); } catch {}
    await new Promise((r) => setTimeout(r, 250));
    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth || 1280;
    canvas.height = v.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unsupported");
    ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Frame capture failed"))), "image/jpeg", 0.9);
    });
  };

  const run = async () => {
    if (!file || !user) return toast.error("Pick a photo or video first.");
    try {
      setBusy("uploading");
      let uploadBody: Blob = file;
      let ext = file.name.split(".").pop() || "jpg";
      let contentType = file.type;
      if (isVideo) {
        uploadBody = await grabVideoFrame();
        ext = "jpg";
        contentType = "image/jpeg";
      }
      const path = `${user.id}/advisor/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from("rooms").upload(path, uploadBody, { contentType });
      if (error) throw new Error(error.message);
      const { data } = supabase.storage.from("rooms").getPublicUrl(path);

      setBusy("analyzing");
      const res = await advise({ data: { imageUrl: data.publicUrl, roomType: room, vibe } });
      setResult(res);
      toast.success("Your design advice is ready ✨");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setBusy("idle");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs backdrop-blur">
          <Sparkles className="h-3.5 w-3.5 text-accent" /> AI Design Advisor
        </div>
        <h1 className="mt-4 font-serif text-4xl sm:text-5xl">Best colors & wall decor, picked by AI.</h1>
        <p className="mt-3 text-muted-foreground">
          Drop in a photo or short video of your room. Our AI reads the light, palette and architecture, then recommends the most beautiful wall colors and decor choices for your space.
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.3fr]">
        {/* Upload + controls */}
        <div className="glass space-y-5 rounded-2xl p-6">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className="cursor-pointer rounded-xl border-2 border-dashed border-border bg-background/50 p-6 text-center transition hover:border-accent"
          >
            {preview ? (
              isVideo ? (
                <video
                  ref={videoRef}
                  src={preview}
                  muted
                  playsInline
                  className="mx-auto max-h-56 rounded-lg"
                  controls
                />
              ) : (
                <img src={preview} alt="Preview" className="mx-auto max-h-56 rounded-lg object-contain" />
              )
            ) : (
              <div className="space-y-2">
                <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="text-sm">Drop a room photo or short video here, or click to browse</p>
                <p className="text-xs text-muted-foreground">JPG / PNG / MP4 · up to 25 MB</p>
              </div>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/*,video/*"
              hidden
              onChange={(e) => onFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <div>
            <Label>Room type</Label>
            <Select value={room} onValueChange={setRoom}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>{ROOMS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="vibe">Desired vibe (optional)</Label>
            <Input
              id="vibe"
              value={vibe}
              onChange={(e) => setVibe(e.target.value)}
              placeholder="e.g. warm Scandinavian with brass accents"
              maxLength={200}
            />
          </div>

          <Button onClick={run} disabled={!file || busy !== "idle"} size="lg" className="w-full rounded-full">
            {busy === "uploading" ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading…</>) :
              busy === "analyzing" ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Reading the room…</>) :
              (<><Sparkles className="mr-2 h-4 w-4" /> Get AI design advice</>)}
          </Button>
        </div>

        {/* Result */}
        <div className="rounded-2xl border border-border bg-card p-6">
          {result ? (
            <div className="space-y-8">
              <div>
                <p className="text-xs uppercase tracking-widest text-accent">Style direction</p>
                <h2 className="mt-1 font-serif text-3xl">{result.styleSuggestion}</h2>
                <p className="mt-3 text-muted-foreground">{result.summary}</p>
              </div>

              <Section icon={<Palette className="h-4 w-4" />} title="Recommended wall colors">
                <div className="grid gap-3 sm:grid-cols-2">
                  {result.wallColors.map((c) => (
                    <div key={c.hex + c.name} className="flex items-start gap-3 rounded-xl border border-border bg-background/40 p-3">
                      <div
                        className="h-12 w-12 flex-none rounded-lg border border-border shadow-inner"
                        style={{ backgroundColor: c.hex }}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate font-serif text-base">{c.name}</p>
                          <code className="text-[10px] text-muted-foreground">{c.hex}</code>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{c.why}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>

              <Section icon={<Sparkles className="h-4 w-4" />} title="Accent palette">
                <div className="flex flex-wrap gap-2">
                  {result.accentColors.map((c) => (
                    <span
                      key={c.hex + c.name}
                      className="inline-flex items-center gap-2 rounded-full border border-border bg-background/40 px-3 py-1 text-xs"
                    >
                      <span className="h-3 w-3 rounded-full border border-border" style={{ backgroundColor: c.hex }} />
                      {c.name}
                      <code className="text-[10px] text-muted-foreground">{c.hex}</code>
                    </span>
                  ))}
                </div>
              </Section>

              <div className="grid gap-6 md:grid-cols-2">
                <Section icon={<Layers className="h-4 w-4" />} title="Wall decor ideas">
                  <Bullets items={result.wallDecorIdeas} />
                </Section>
                <Section icon={<Sofa className="h-4 w-4" />} title="Furniture ideas">
                  <Bullets items={result.furnitureIdeas} />
                </Section>
                <Section icon={<Lightbulb className="h-4 w-4" />} title="Lighting">
                  <Bullets items={result.lightingIdeas} />
                </Section>
                <Section icon={<Palette className="h-4 w-4" />} title="Materials & textures">
                  <Bullets items={result.materials} />
                </Section>
              </div>
            </div>
          ) : busy !== "idle" ? (
            <div className="flex aspect-[4/3] flex-col items-center justify-center gap-4 rounded-xl bg-gradient-luxury">
              <div className="h-2 w-48 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-1/3 animate-shimmer rounded-full bg-gradient-to-r from-transparent via-accent to-transparent" />
              </div>
              <p className="font-serif text-xl">
                {busy === "uploading" ? "Uploading your room…" : "Studying the light & palette…"}
              </p>
              <p className="text-xs text-muted-foreground">This usually takes 8–20 seconds.</p>
            </div>
          ) : (
            <div className="flex aspect-[4/3] flex-col items-center justify-center gap-3 rounded-xl bg-gradient-luxury text-center">
              <Palette className="h-10 w-10 text-accent" />
              <p className="font-serif text-2xl">Your tailored design brief will appear here</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Wall colors with hex codes, accent palette, decor, lighting and materials — chosen for your exact room.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2 text-sm font-medium">
        <span className="text-accent">{icon}</span> {title}
      </div>
      {children}
    </div>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 text-sm text-muted-foreground">
      {items.map((it, i) => (
        <li key={i} className="flex gap-2">
          <span className="mt-1.5 h-1 w-1 flex-none rounded-full bg-accent" />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}
