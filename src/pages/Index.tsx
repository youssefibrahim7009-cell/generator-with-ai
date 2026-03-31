import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Clapperboard, Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import VideoPreview from "@/components/VideoPreview";
import VideoSettings from "@/components/VideoSettings";
import SceneEditor, { type SceneData, defaultScene } from "@/components/SceneEditor";

interface GeneratedScene {
  title: string;
  description: string;
  imageUrl: string | null;
  error?: string;
}

const Index = () => {
  const { toast } = useToast();
  const [scenes, setScenes] = useState<SceneData[]>([
    { ...defaultScene(), title: "المشهد 1" },
  ]);
  const [style, setStyle] = useState("cinematic");
  const [duration, setDuration] = useState("5");
  const [resolution, setResolution] = useState("1080p");
  const [quality, setQuality] = useState("standard");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedScenes, setGeneratedScenes] = useState<GeneratedScene[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [generatingIndex, setGeneratingIndex] = useState(-1);

  const handleGenerate = async () => {
    const validScenes = scenes.filter((s) => s.description.trim());
    if (validScenes.length === 0) {
      toast({ title: "خطأ", description: "يرجى إضافة وصف لمشهد واحد على الأقل", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    setGeneratedScenes([]);
    setShowPreview(false);

    try {
      const { data, error } = await supabase.functions.invoke("generate-scenes", {
        body: { scenes: validScenes, style, resolution, quality },
      });

      if (error) throw error;

      if (data?.scenes) {
        setGeneratedScenes(data.scenes);
        setShowPreview(true);
        const successCount = data.scenes.filter((s: GeneratedScene) => s.imageUrl).length;
        toast({ title: "تم الإنتاج! 🎬", description: `تم توليد ${successCount} من ${data.scenes.length} مشهد بجودة ${quality === "premium" ? "فائقة" : "قياسية"}` });
      }
    } catch (err: any) {
      console.error(err);
      const msg = err.message || "فشل في توليد المشاهد";
      toast({ title: "خطأ", description: msg, variant: "destructive" });
    } finally {
      setIsGenerating(false);
      setGeneratingIndex(-1);
    }
  };

  const totalDuration = scenes.filter((s) => s.description.trim()).length * parseInt(duration);

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-accent/5 blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-3/4 left-1/2 w-64 h-64 rounded-full bg-primary/3 blur-3xl animate-pulse-glow" style={{ animationDelay: "3s" }} />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-border/50 backdrop-blur-sm bg-background/50">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 glow-primary">
                <Clapperboard className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-xl font-bold text-gradient">AI Video Studio</h1>
                <p className="text-xs text-muted-foreground">إنتاج فيديوهات سينمائية بالذكاء الاصطناعي</p>
              </div>
            </div>
            {totalDuration > 0 && (
              <div className="text-xs font-display text-muted-foreground bg-secondary/50 rounded-lg px-3 py-1.5">
                المدة التقديرية: <span className="text-primary font-semibold">{totalDuration} ثانية</span>
                {" · "}
                {scenes.filter((s) => s.description.trim()).length} مشاهد
              </div>
            )}
          </div>
        </header>

        <main className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Panel - Controls */}
            <div className="space-y-6">
              <VideoSettings
                style={style} setStyle={setStyle}
                duration={duration} setDuration={setDuration}
                resolution={resolution} setResolution={setResolution}
                quality={quality} setQuality={setQuality}
              />

              <SceneEditor scenes={scenes} setScenes={setScenes} />

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full h-13 font-display font-semibold text-base glow-primary bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    جاري الإنتاج بجودة {quality === "premium" ? "فائقة" : "قياسية"}...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    إنتاج الفيديو بالذكاء الاصطناعي
                  </>
                )}
              </Button>

              {isGenerating && (
                <div className="bg-gradient-card rounded-xl border border-primary/20 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    </div>
                    <div>
                      <p className="text-sm font-display font-medium">جاري معالجة المشاهد...</p>
                      <p className="text-xs text-muted-foreground">قد يستغرق الأمر دقيقة لكل مشهد حسب الجودة المختارة</p>
                    </div>
                  </div>
                  <div className="mt-3 h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full animate-pulse" style={{ width: "60%" }} />
                  </div>
                </div>
              )}
            </div>

            {/* Right Panel - Preview */}
            <div className="lg:sticky lg:top-8 lg:self-start">
              {showPreview && generatedScenes.length > 0 ? (
                <VideoPreview scenes={generatedScenes} sceneDuration={parseInt(duration)} />
              ) : (
                <div className="bg-gradient-card rounded-xl border border-border/50 aspect-video flex flex-col items-center justify-center gap-4">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-2xl bg-secondary/50 flex items-center justify-center animate-float">
                      <Clapperboard className="w-12 h-12 text-muted-foreground/30" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center animate-pulse-glow">
                      <Sparkles className="w-4 h-4 text-primary/50" />
                    </div>
                  </div>
                  <div className="text-center max-w-xs">
                    <p className="text-muted-foreground font-display font-medium">معاينة الفيديو</p>
                    <p className="text-xs text-muted-foreground/60 mt-1 leading-relaxed">
                      أضف وصفاً تفصيلياً لكل مشهد مع الشخصيات والإضاءة وزوايا الكاميرا، ثم اضغط "إنتاج" لتوليد فيديو سينمائي مذهل
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
