import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { scenes, style } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const stylePrompts: Record<string, string> = {
      realistic: "photorealistic, ultra detailed, 8k, cinematic lighting, professional photography",
      cartoon: "colorful cartoon style, vibrant, 3D animated look like Pixar, playful lighting",
      cinematic: "cinematic film still, dramatic lighting, anamorphic lens, movie quality, depth of field",
      anime: "anime art style, detailed anime illustration, vibrant colors, Studio Ghibli quality",
      motion_graphics: "clean modern motion graphics style, flat design with depth, corporate professional, geometric shapes",
    };

    const styleModifier = stylePrompts[style] || stylePrompts.cinematic;

    const generatedScenes = [];

    for (const scene of scenes) {
      const prompt = `Create a wide cinematic scene (16:9 aspect ratio): ${scene.description}. Style: ${styleModifier}. The image should be a complete scene with all elements described, high quality, no text or watermarks.`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image",
          messages: [{ role: "user", content: prompt }],
          modalities: ["image", "text"],
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: "Credits exhausted. Please add funds." }), {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const errorText = await response.text();
        console.error("AI error:", response.status, errorText);
        generatedScenes.push({
          title: scene.title,
          description: scene.description,
          imageUrl: null,
          error: "Failed to generate image",
        });
        continue;
      }

      const data = await response.json();
      const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url || null;

      generatedScenes.push({
        title: scene.title,
        description: scene.description,
        imageUrl,
      });
    }

    return new Response(JSON.stringify({ scenes: generatedScenes }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-scenes error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
