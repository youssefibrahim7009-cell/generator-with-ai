import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Clapperboard, Sparkles, Loader2, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import VideoPreview from "@/components/VideoPreview";
import VideoWizard from "@/components/VideoWizard";

interface GeneratedScene {
  title: string;
  description: string;
  imageUrl: string | null;
  error?: string;
}

const STYLE_MAP: Record<string, string> = {
  funny: "cartoon",
  cinematic: "cinematic",
  viral: "hyper_realistic",
  dramatic: "cinematic",
};

const SCENE_MAP: Record<string, string> = {
  kitchen: "a professional modern kitchen with warm lighting, cooking utensils, and marble countertops",
  street: "a busy urban street with buildings, cars, and city atmosphere",
  studio: "a professional recording studio or broadcast set with dramatic lighting",
  room: "a cozy well-decorated room with furniture, warm ambient lighting",
};

const VOICE_MAP: Record<string, string> = {
  male: "a confident male narrator",
  female: "a warm female narrator",
  energetic: "an energetic and enthusiastic narrator",
  calm: "a calm and soothing narrator",
};

const VIDEO_TYPE_MAP: Record<string, string> = {
  talking_fruit: "3D Pixar-style animated talking fruit character with expressive face, arms, and legs, cartoon-like proportions, subsurface scattering",
  human_presenter: "a realistic human presenter speaking to camera, professional appearance, natural gestures and expressions",
  advertisement: "a polished commercial advertisement scene with product-focused composition and dramatic lighting",
  story: "a narrative story scene with characters, environment, and dramatic composition",
  educational: "an educational presentation scene with clear visual elements, infographics, and instructional tone",
};

const Index = () => {
  const { toast } = useToast();
  const [wizardDone, setWizardDone] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedScenes, setGeneratedScenes] = useState<GeneratedScene[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [wizardData, setWizardData] = useState<any>(null);

  const handleWizardComplete = async (selections: any) => {
    setWizardData(selections);
    setWizardDone(true);
    setIsGenerating(true);
    setGeneratedScenes([]);
    setShowPreview(false);

    const style = STYLE_MAP[selections.style] || "cinematic";
    const sceneDesc = selections.scene === "custom"
      ? selections.customScene
      : SCENE_MAP[selections.scene] || selections.scene;
    const videoTypeDesc = VIDEO_TYPE_MAP[selections.videoType] || "";
    const voiceDesc = VOICE_MAP[selections.voice] || "";
    const durationSec = parseInt(selections.duration) || 10;
    const sceneCount = Math.max(1, Math.ceil(durationSec / 10));

    const scenes = [];
    const scriptParts = selections.script.split(/[.!?،。\n]+/).filter((s: string) => s.trim());

    for (let i = 0; i < sceneCount; i++) {
      const partScript = scriptParts.slice(
        Math.floor(i * scriptParts.length / sceneCount),
        Math.floor((i + 1) * scriptParts.length / sceneCount)
      ).join(". ") || selections.script;

      scenes.push({
        title: `مشهد ${i + 1}`,
        description: `${videoTypeDesc}. Scene set in ${sceneDesc}. The character is performing: "${partScript}". Language: ${selections.language}. Narrated by ${voiceDesc}. Fully animated scene with character body movement, hand gestures, facial expressions, lip sync, walking, blinking. Realistic environment with depth. Cinematic lighting and real camera movement (pan, track). NOT a static image.`,
        characters: videoTypeDesc,
        cameraAngle: i === 0 ? "wide" : i === sceneCount - 1 ? "close_up" : "tracking",
        lighting: "cinematic",
        mood: selections.style === "funny" ? "playful, comedic, bright" : selections.style === "dramatic" ? "intense, emotional, deep" : "engaging, professional",
        props: "",
        colorGrading: "teal_orange",
      });
    }

    try {
      const { data, error } = await supabase.functions.invoke("generate-scenes", {
        body: { scenes, style, resolution: "1080p", quality: "standard" },
      });

      if (error) throw error;

      if (data?.scenes) {
        setGeneratedScenes(data.scenes);
        setShowPreview(true);
        const successCount = data.scenes.filter((s: GeneratedScene) => s.imageUrl).length;
        toast({
          title: "تم الإنتاج! 🎬",
          description: `تم توليد ${successCount} مشهد بنجاح`,
        });
      }
    } catch (err: any) {
      console.error(err);
      toast({
        title: "خطأ",
        description: err.message || "فشل في توليد المشاهد",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setWizardDone(false);
    setGeneratedScenes([]);
    setShowPreview(false);
    setWizardData(null);
  };

  const sceneDuration = wizardData ? Math.floor(parseInt(wizardData.duration) / Math.max(1, generatedScenes.length)) : 5;

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-accent/5 blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-border/50 backdrop-blur-sm bg-background/50">
          <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 glow-primary">
                <Clapperboard className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-xl font-bold text-gradient">AI Video Studio</h1>
                <p className="text-xs text-muted-foreground">إنتاج فيديوهات سينمائية بالذكاء الاصطناعي</p>
              </div>
            </div>
            {wizardDone && (
              <Button variant="outline" size="sm" onClick={handleReset} className="border-border/50 text-xs">
                فيديو جديد
              </Button>
            )}
          </div>
        </header>

        <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-4xl">
          {!wizardDone ? (
            <div className="max-w-lg mx-auto">
              <div className="text-center mb-6">
                <h2 className="font-display text-2xl font-bold text-gradient mb-2">أنشئ فيديو بالذكاء الاصطناعي</h2>
                <p className="text-sm text-muted-foreground">اختر الخيارات خطوة بخطوة وسنصنع لك فيديو سينمائي احترافي</p>
              </div>
              <VideoWizard onComplete={handleWizardComplete} />
            </div>
          ) : (
            <div className="space-y-6">
              {isGenerating && (
                <div className="bg-gradient-card rounded-xl border border-primary/20 p-6 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                  <h3 className="font-display text-lg font-bold mb-1">جاري إنتاج الفيديو...</h3>
                  <p className="text-sm text-muted-foreground">يتم توليد المشاهد بالذكاء الاصطناعي، قد يستغرق الأمر دقيقة</p>
                  <div className="mt-4 h-2 bg-secondary rounded-full overflow-hidden max-w-xs mx-auto">
                    <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full animate-pulse" style={{ width: "70%" }} />
                  </div>
                </div>
              )}

              {showPreview && generatedScenes.length > 0 && (
                <VideoPreview scenes={generatedScenes} sceneDuration={sceneDuration} />
              )}

              {showPreview && (
                <div className="flex justify-center gap-3">
                  <Button variant="outline" onClick={handleReset} className="border-border/50">
                    إنشاء فيديو جديد
                  </Button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Index;
