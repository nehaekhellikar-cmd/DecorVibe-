import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const INPUT = z.object({
  originalUrl: z.string().url(),
  roomType: z.string().min(1).max(60),
  style: z.string().min(1).max(60),
  colorTheme: z.string().max(120).optional().default(""),
  furniture: z.string().max(200).optional().default(""),
  notes: z.string().max(600).optional().default(""),
});

export const redesignRoom = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => INPUT.parse(d))
  .handler(async ({ data, context }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI service unavailable");

    const { supabase, userId } = context;

    // Fetch original image bytes (from our public bucket URL) and pass as base64 data URL
    const imgRes = await fetch(data.originalUrl);
    if (!imgRes.ok) throw new Error("Could not read uploaded image");
    const buf = new Uint8Array(await imgRes.arrayBuffer());
    let bin = "";
    for (let i = 0; i < buf.length; i++) bin += String.fromCharCode(buf[i]);
    const b64 = btoa(bin);
    const dataUrl = `data:image/jpeg;base64,${b64}`;

    const prompt = [
      `Redesign this ${data.roomType} in a ${data.style} interior design style.`,
      data.colorTheme && `Color palette: ${data.colorTheme}.`,
      data.furniture && `Furniture & elements: ${data.furniture}.`,
      data.notes && `Additional notes: ${data.notes}.`,
      `Keep the original room architecture (walls, windows, doors, ceiling, floor layout) but completely transform furniture, decor, lighting, textiles, art and color palette to match the requested style. Photorealistic interior photography, magazine quality, soft natural light, ultra detailed.`,
    ]
      .filter(Boolean)
      .join(" ");

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: dataUrl } },
            ],
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!aiRes.ok) {
      const txt = await aiRes.text();
      if (aiRes.status === 429) throw new Error("Rate limit reached. Please wait a moment and try again.");
      if (aiRes.status === 402) throw new Error("AI credits exhausted. Please add credits in your workspace.");
      throw new Error(`AI generation failed: ${txt.slice(0, 200)}`);
    }

    const aiData = await aiRes.json();
    const generated: string | undefined =
      aiData?.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!generated) throw new Error("No image returned from AI");

    // generated is data:image/...;base64,XXXX — upload to storage
    const m = generated.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!m) throw new Error("Unexpected AI image format");
    const mime = m[1];
    const ext = mime.split("/")[1] || "png";
    const raw = atob(m[2]);
    const bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);

    const path = `${userId}/generated/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("rooms")
      .upload(path, bytes, { contentType: mime, upsert: false });
    if (upErr) throw new Error(`Storage upload failed: ${upErr.message}`);

    const { data: pub } = supabase.storage.from("rooms").getPublicUrl(path);
    const generatedUrl = pub.publicUrl;

    const { data: row, error: insErr } = await supabase
      .from("designs")
      .insert({
        user_id: userId,
        room_type: data.roomType,
        style: data.style,
        color_theme: data.colorTheme || null,
        prompt,
        original_url: data.originalUrl,
        generated_url: generatedUrl,
        saved: true,
      })
      .select()
      .single();
    if (insErr) throw new Error(`Could not save design: ${insErr.message}`);

    return { id: row.id, generatedUrl, originalUrl: data.originalUrl };
  });
