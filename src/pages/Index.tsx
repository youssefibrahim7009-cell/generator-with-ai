import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clapperboard, Sparkles, Loader2, Plus, Trash2, Film } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import VideoPreview from "@/components/VideoPreview";

interface Scene {
  title: string;
  description: string;
}

interface GeneratedScene {
  title: string;
  description: string;
  imageUrl: string | null;
  error?: string;
}

const Index = () => {
  const { toast } = useToast();
  const [scenes, setScenes] = useState<Scene[]>([
    { title: "المشهد 1", description: "" },
  ]);
  const [style, setStyle] = useState("cinematic");
  const [duration, setDuration] = useState("5");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedScenes, setGeneratedScenes] = useState<GeneratedScene[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const addScene = () => {
    setScenes([...scenes, { title: `المشهد ${scenes.length + 1}`, description: "" }]);
  };

  const removeScene = (index: number) => {
    if (scenes.length <= 1) return;
    setScenes(scenes.filter((_, i) => i !== index));
  };

  const updateScene = (index: number, field: keyof Scene, value: string) => {
    const updated = [...scenes];
    updated[index] = { ...updated[index], [field]: value };
    setScenes(updated);
  };

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
        body: { scenes: validScenes, style },
      });

      if (error) throw error;

      if (data?.scenes) {
        setGeneratedScenes(data.scenes);
        setShowPreview(true);
        toast({ title: "تم!", description: `تم توليد ${data.scenes.length} مشهد بنجاح` });
      }
    } catch (err: any) {
      console.error(err);
      toast({ title: "خطأ", description: err.message || "فشل في توليد المشاهد", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Ambient background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-accent/5 blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-border/50 backdrop-blur-sm">
          <div className="container mx-auto px-6 py-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 glow-primary">
              <Clapperboard className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-gradient">AI Video Studio</h1>
              <p className="text-xs text-muted-foreground">أنشئ فيديوهات مذهلة بالذكاء الاصطناعي</p>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Panel - Controls */}
            <div className="space-y-6">
              {/* Options */}
              <div className="bg-gradient-card rounded-xl border border-border/50 p-6 space-y-4">
                <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                  <Film className="w-5 h-5 text-primary" />
                  إعدادات الفيديو
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">الأسلوب</label>
                    <Select value={style} onValueChange={setStyle}>
                      <SelectTrigger className="bg-secondary border-border/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="realistic">واقعي</SelectItem>
                        <SelectItem value="cinematic">سينمائي</SelectItem>
                        <SelectItem value="cartoon">كرتوني / Pixar</SelectItem>
                        <SelectItem value="anime">أنيمي</SelectItem>
                        <SelectItem value="motion_graphics">موشن جرافيك</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">مدة كل مشهد (ثواني)</label>
                    <Select value={duration} onValueChange={setDuration}>
                      <SelectTrigger className="bg-secondary border-border/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 ثواني</SelectItem>
                        <SelectItem value="5">5 ثواني</SelectItem>
                        <SelectItem value="8">8 ثواني</SelectItem>
                        <SelectItem value="10">10 ثواني</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Scenes */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-semibold">المشاهد</h2>
                  <Button variant="outline" size="sm" onClick={addScene} className="border-primary/30 text-primary hover:bg-primary/10">
                    <Plus className="w-4 h-4 mr-1" />
                    إضافة مشهد
                  </Button>
                </div>

                <div className="space-y-3">
                  {scenes.map((scene, index) => (
                    <div key={index} className="bg-gradient-card rounded-xl border border-border/50 p-4 space-y-3 group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-display font-bold text-primary">
                            {index + 1}
                          </span>
                          <input
                            type="text"
                            value={scene.title}
                            onChange={(e) => updateScene(index, "title", e.target.value)}
                            className="bg-transparent border-none text-sm font-medium focus:outline-none focus:ring-0"
                            placeholder="عنوان المشهد"
                          />
                        </div>
                        {scenes.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeScene(index)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10 h-7 w-7"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                      <Textarea
                        value={scene.description}
                        onChange={(e) => updateScene(index, "description", e.target.value)}
                        placeholder="صِف المشهد بالتفصيل... مثال: شخص يمشي في شارع مزدحم تحت المطر، إضاءة نيون، زاوية كاميرا منخفضة"
                        className="bg-secondary/50 border-border/30 min-h-[80px] text-sm resize-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full h-12 font-display font-semibold text-base glow-primary bg-primary text-primary-foreground hover:bg-primary/90"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    جاري التوليد...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    توليد الفيديو بالذكاء الاصطناعي
                  </>
                )}
              </Button>
            </div>

            {/* Right Panel - Preview */}
            <div className="lg:sticky lg:top-8 lg:self-start">
              {showPreview && generatedScenes.length > 0 ? (
                <VideoPreview scenes={generatedScenes} sceneDuration={parseInt(duration)} />
              ) : (
                <div className="bg-gradient-card rounded-xl border border-border/50 aspect-video flex flex-col items-center justify-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-secondary/50 flex items-center justify-center animate-float">
                    <Clapperboard className="w-10 h-10 text-muted-foreground/50" />
                  </div>
                  <div className="text-center">
                    <p className="text-muted-foreground font-display">معاينة الفيديو</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">أضف مشاهد واضغط توليد لرؤية النتيجة</p>
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
