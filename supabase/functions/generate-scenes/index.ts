import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SceneInput {
  title: string;
  description: string;
  characters?: string;
  cameraAngle?: string;
  lighting?: string;
  mood?: string;
  props?: string;
  colorGrading?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { scenes, style, resolution, quality } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const stylePrompts: Record<string, string> = {
      realistic: "hyper-realistic, ultra detailed photography, 8K resolution, photorealistic rendering, ray tracing, subsurface scattering, accurate materials and textures",
      cartoon: "vibrant 3D animated style like Pixar or DreamWorks, subsurface scattering on skin, volumetric lighting, stylized but detailed, charming and polished",
      cinematic: "cinematic film still, anamorphic lens flare, shallow depth of field, dramatic volumetric lighting, film grain, professional color grading, IMAX quality, blockbuster movie production",
      anime: "premium anime illustration, Studio Ghibli meets Makoto Shinkai quality, intricate detail, vibrant sakura colors, atmospheric perspective, beautiful sky rendering",
      motion_graphics: "sleek modern motion graphics, clean geometric design with depth, glassmorphism effects, professional corporate style, precise typography integration, gradient meshes",
      hyper_realistic: "photorealistic CGI, Unreal Engine 5 quality, nanite-level detail, lumen global illumination, photogrammetry textures, indistinguishable from real photography",
    };

    const cameraPrompts: Record<string, string> = {
      wide: "wide establishing shot, expansive view, environmental context",
      close_up: "intimate close-up shot, detailed facial features, shallow depth of field",
      tracking: "dynamic tracking shot, smooth camera movement following subject",
      aerial: "aerial drone shot, bird's eye perspective, sweeping landscape view",
      low_angle: "dramatic low angle shot, subject appears powerful and imposing",
      dutch: "tilted Dutch angle, creating tension and unease",
      over_shoulder: "over-the-shoulder shot, conversational framing, depth layers",
      pov: "first-person POV perspective, immersive viewpoint",
    };

    const lightingPrompts: Record<string, string> = {
      natural: "soft natural sunlight, golden hour warmth, realistic ambient occlusion",
      dramatic: "dramatic chiaroscuro lighting, deep shadows, strong directional light, Rembrandt lighting",
      neon: "vibrant neon lighting, cyberpunk atmosphere, colorful light reflections on wet surfaces",
      soft: "soft diffused studio lighting, even exposure, minimal harsh shadows, beauty lighting",
      cinematic: "cinematic three-point lighting, key light with fill and rim, volumetric god rays",
      moody: "moody low-key lighting, atmospheric haze, silhouette edges, mysterious ambiance",
    };

    const colorGradingPrompts: Record<string, string> = {
      warm: "warm color grading, amber and golden tones, sunset palette",
      cool: "cool color grading, blue and teal tones, moonlit atmosphere",
      teal_orange: "teal and orange color grading, Hollywood blockbuster look, complementary contrast",
      desaturated: "slightly desaturated, muted tones, editorial film look, restrained palette",
      vibrant: "vibrant saturated colors, punchy contrast, vivid and eye-catching",
      noir: "noir style, high contrast black and white with selective color",
    };

    const styleModifier = stylePrompts[style] || stylePrompts.cinematic;
    const resolutionHint = resolution === "4k" ? "ultra high resolution 4K detail" : "high resolution 1080p detail";

    const generatedScenes = [];

    for (const scene of scenes as SceneInput[]) {
      const parts = [
        `Create a masterfully composed wide cinematic scene (16:9 aspect ratio):`,
        scene.description,
        `Style: ${styleModifier}`,
        `${resolutionHint}`,
      ];

      if (scene.characters) parts.push(`Characters: ${scene.characters}`);
      if (scene.cameraAngle && cameraPrompts[scene.cameraAngle]) parts.push(cameraPrompts[scene.cameraAngle]);
      if (scene.lighting && lightingPrompts[scene.lighting]) parts.push(lightingPrompts[scene.lighting]);
      if (scene.mood) parts.push(`Mood and atmosphere: ${scene.mood}`);
      if (scene.props) parts.push(`Important props and elements: ${scene.props}`);
      if (scene.colorGrading && colorGradingPrompts[scene.colorGrading]) parts.push(colorGradingPrompts[scene.colorGrading]);

      parts.push("The image must be extremely detailed, professionally composed, with no text, no watermarks, no artifacts. Studio-quality production value.");

      const prompt = parts.join(". ");

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: quality === "premium" ? "google/gemini-3-pro-image-preview" : "google/gemini-2.5-flash-image",
          messages: [{ role: "user", content: prompt }],
          modalities: ["image", "text"],
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "تم تجاوز حد الطلبات. يرجى المحاولة لاحقاً." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: "الرصيد غير كافٍ. يرجى إضافة رصيد." }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const errorText = await response.text();
        console.error("AI error:", response.status, errorText);
        generatedScenes.push({
          title: scene.title, description: scene.description, imageUrl: null, error: "فشل في توليد الصورة",
        });
        continue;
      }

      const data = await response.json();
      const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url || null;

      generatedScenes.push({ title: scene.title, description: scene.description, imageUrl });
    }

    return new Response(JSON.stringify({ scenes: generatedScenes }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-scenes error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
