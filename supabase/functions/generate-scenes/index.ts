import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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
    const LUMA_API_KEY = Deno.env.get("LUMA_API_KEY");
    if (!LUMA_API_KEY) throw new Error("LUMA_API_KEY is not configured");

    const stylePrompts: Record<string, string> = {
      realistic: "hyper-realistic, ultra detailed photography, 8K resolution, photorealistic rendering",
      cartoon: "vibrant 3D animated style like Pixar or DreamWorks, stylized but detailed, charming and polished",
      cinematic: "cinematic film still, anamorphic lens flare, shallow depth of field, dramatic volumetric lighting, film grain, IMAX quality",
      anime: "premium anime illustration, Studio Ghibli meets Makoto Shinkai quality, vibrant colors, atmospheric perspective",
      motion_graphics: "sleek modern motion graphics, clean geometric design, glassmorphism effects, professional corporate style",
      hyper_realistic: "photorealistic CGI, Unreal Engine 5 quality, nanite-level detail, indistinguishable from real photography",
    };

    const cameraPrompts: Record<string, string> = {
      wide: "wide establishing shot, expansive view",
      close_up: "intimate close-up shot, detailed features, shallow depth of field",
      tracking: "dynamic tracking shot, smooth camera movement",
      aerial: "aerial drone shot, bird's eye perspective",
      low_angle: "dramatic low angle shot",
      dutch: "tilted Dutch angle, creating tension",
      over_shoulder: "over-the-shoulder shot",
      pov: "first-person POV perspective",
    };

    const lightingPrompts: Record<string, string> = {
      natural: "soft natural sunlight, golden hour warmth",
      dramatic: "dramatic chiaroscuro lighting, deep shadows, strong directional light",
      neon: "vibrant neon lighting, cyberpunk atmosphere",
      soft: "soft diffused studio lighting, even exposure",
      cinematic: "cinematic three-point lighting, volumetric god rays",
      moody: "moody low-key lighting, atmospheric haze",
    };

    const colorGradingPrompts: Record<string, string> = {
      warm: "warm color grading, amber and golden tones",
      cool: "cool color grading, blue and teal tones",
      teal_orange: "teal and orange color grading, Hollywood blockbuster look",
      desaturated: "slightly desaturated, muted tones, editorial film look",
      vibrant: "vibrant saturated colors, punchy contrast",
      noir: "noir style, high contrast black and white",
    };

    const styleModifier = stylePrompts[style] || stylePrompts.cinematic;

    const generatedScenes = [];

    for (const scene of scenes as SceneInput[]) {
      const parts = [
        scene.description,
        `Style: ${styleModifier}`,
      ];

      if (scene.characters) parts.push(`Characters: ${scene.characters}`);
      if (scene.cameraAngle && cameraPrompts[scene.cameraAngle]) parts.push(cameraPrompts[scene.cameraAngle]);
      if (scene.lighting && lightingPrompts[scene.lighting]) parts.push(lightingPrompts[scene.lighting]);
      if (scene.mood) parts.push(`Mood: ${scene.mood}`);
      if (scene.props) parts.push(`Props: ${scene.props}`);
      if (scene.colorGrading && colorGradingPrompts[scene.colorGrading]) parts.push(colorGradingPrompts[scene.colorGrading]);

      parts.push("Extremely detailed, professionally composed, no text, no watermarks.");

      const prompt = parts.join(". ");

      try {
        // Step 1: Create generation request
        const createResponse = await fetch("https://api.lumalabs.ai/dream-machine/v1/generations", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${LUMA_API_KEY}`,
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify({
            prompt: prompt,
            aspect_ratio: "16:9",
            model: "photon-1",
          }),
        });

        if (!createResponse.ok) {
          const errorText = await createResponse.text();
          console.error("Luma create error:", createResponse.status, errorText);
          
          if (createResponse.status === 429) {
            return new Response(JSON.stringify({ error: "تم تجاوز حد الطلبات. يرجى المحاولة لاحقاً." }), {
              status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
          if (createResponse.status === 402 || createResponse.status === 403) {
            return new Response(JSON.stringify({ error: "الرصيد غير كافٍ أو المفتاح غير صالح." }), {
              status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }

          generatedScenes.push({
            title: scene.title, description: scene.description, imageUrl: null, error: "فشل في توليد الفيديو",
          });
          continue;
        }

        const generation = await createResponse.json();
        const generationId = generation.id;
        console.log("Luma generation created:", generationId);

        // Step 2: Poll for completion
        let imageUrl: string | null = null;
        let videoUrl: string | null = null;
        const maxPolls = 60; // max ~5 minutes
        
        for (let i = 0; i < maxPolls; i++) {
          await new Promise(resolve => setTimeout(resolve, 5000)); // wait 5s

          const statusResponse = await fetch(`https://api.lumalabs.ai/dream-machine/v1/generations/${generationId}`, {
            headers: {
              "Authorization": `Bearer ${LUMA_API_KEY}`,
              "Accept": "application/json",
            },
          });

          if (!statusResponse.ok) {
            const errText = await statusResponse.text();
            console.error("Luma poll error:", statusResponse.status, errText);
            break;
          }

          const statusData = await statusResponse.json();
          console.log("Luma status:", statusData.state);

          if (statusData.state === "completed") {
            videoUrl = statusData.assets?.video || null;
            imageUrl = statusData.assets?.thumbnail || videoUrl;
            break;
          } else if (statusData.state === "failed") {
            console.error("Luma generation failed:", statusData.failure_reason);
            break;
          }
        }

        generatedScenes.push({
          title: scene.title,
          description: scene.description,
          imageUrl,
          videoUrl,
        });

      } catch (sceneError) {
        console.error("Scene generation error:", sceneError);
        generatedScenes.push({
          title: scene.title, description: scene.description, imageUrl: null, error: "فشل في توليد المشهد",
        });
      }
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
