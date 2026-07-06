import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const INPUT = z.object({
  imageUrl: z.string().url(),
  roomType: z.string().min(1).max(60).optional().default("room"),
  vibe: z.string().max(200).optional().default(""),
});

export type AdvisorResult = {
  summary: string;
  styleSuggestion: string;
  wallColors: { name: string; hex: string; why: string }[];
  accentColors: { name: string; hex: string }[];
  wallDecorIdeas: string[];
  furnitureIdeas: string[];
  lightingIdeas: string[];
  materials: string[];
};

export const analyzeRoom = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => INPUT.parse(d))
  .handler(async ({ data }): Promise<AdvisorResult> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI service unavailable");

    const imgRes = await fetch(data.imageUrl);
    if (!imgRes.ok) throw new Error("Could not read uploaded image");
    const ct = imgRes.headers.get("content-type") || "image/jpeg";
    const buf = new Uint8Array(await imgRes.arrayBuffer());
    let bin = "";
    for (let i = 0; i < buf.length; i++) bin += String.fromCharCode(buf[i]);
    const dataUrl = `data:${ct};base64,${btoa(bin)}`;

    const sys = `You are an award-winning interior designer. Analyze the user's room photo and respond with concrete, premium, tasteful recommendations. Be specific with colors (use real hex codes), wall decor, lighting and materials. Never invent furniture brand names. Keep tone elegant and editorial.`;

    const userPrompt = `Room type: ${data.roomType}. ${data.vibe ? `Desired vibe: ${data.vibe}.` : ""} Analyze the architecture, lighting and existing palette, then propose the best color & decor scheme for the walls and the overall space.`;

    const tool = {
      type: "function",
      function: {
        name: "design_advice",
        description: "Return structured interior design advice.",
        parameters: {
          type: "object",
          properties: {
            summary: { type: "string", description: "Two-sentence read of the room." },
            styleSuggestion: { type: "string", description: "One ideal style direction." },
            wallColors: {
              type: "array",
              minItems: 3,
              maxItems: 5,
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  hex: { type: "string", description: "Hex like #A1B2C3" },
                  why: { type: "string" },
                },
                required: ["name", "hex", "why"],
                additionalProperties: false,
              },
            },
            accentColors: {
              type: "array",
              minItems: 2,
              maxItems: 4,
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  hex: { type: "string" },
                },
                required: ["name", "hex"],
                additionalProperties: false,
              },
            },
            wallDecorIdeas: { type: "array", minItems: 3, maxItems: 6, items: { type: "string" } },
            furnitureIdeas: { type: "array", minItems: 3, maxItems: 6, items: { type: "string" } },
            lightingIdeas: { type: "array", minItems: 2, maxItems: 5, items: { type: "string" } },
            materials: { type: "array", minItems: 3, maxItems: 6, items: { type: "string" } },
          },
          required: [
            "summary",
            "styleSuggestion",
            "wallColors",
            "accentColors",
            "wallDecorIdeas",
            "furnitureIdeas",
            "lightingIdeas",
            "materials",
          ],
          additionalProperties: false,
        },
      },
    } as const;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: sys },
          {
            role: "user",
            content: [
              { type: "text", text: userPrompt },
              { type: "image_url", image_url: { url: dataUrl } },
            ],
          },
        ],
        tools: [tool],
        tool_choice: { type: "function", function: { name: "design_advice" } },
      }),
    });

    if (!aiRes.ok) {
      const txt = await aiRes.text();
      if (aiRes.status === 429) throw new Error("Rate limit reached. Please wait a moment and try again.");
      if (aiRes.status === 402) throw new Error("AI credits exhausted. Please add credits in your workspace.");
      throw new Error(`AI analysis failed: ${txt.slice(0, 200)}`);
    }

    const aiData = await aiRes.json();
    const call = aiData?.choices?.[0]?.message?.tool_calls?.[0];
    const argsRaw = call?.function?.arguments;
    if (!argsRaw) throw new Error("No advice returned from AI");
    let parsed: AdvisorResult;
    try {
      parsed = typeof argsRaw === "string" ? JSON.parse(argsRaw) : argsRaw;
    } catch {
      throw new Error("Could not parse AI response");
    }
    return parsed;
  });
