import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import { useState } from "react";

export interface SceneData {
  title: string;
  description: string;
  characters: string;
  cameraAngle: string;
  lighting: string;
  mood: string;
  props: string;
  colorGrading: string;
}

interface SceneEditorProps {
  scenes: SceneData[];
  setScenes: (scenes: SceneData[]) => void;
}

const defaultScene = (): SceneData => ({
  title: "",
  description: "",
  characters: "",
  cameraAngle: "wide",
  lighting: "cinematic",
  mood: "",
  props: "",
  colorGrading: "teal_orange",
});

const SceneEditor = ({ scenes, setScenes }: SceneEditorProps) => {
  const [expandedScene, setExpandedScene] = useState<number | null>(0);

  const addScene = () => {
    const newScene = defaultScene();
    newScene.title = `المشهد ${scenes.length + 1}`;
    setScenes([...scenes, newScene]);
    setExpandedScene(scenes.length);
  };

  const removeScene = (index: number) => {
    if (scenes.length <= 1) return;
    setScenes(scenes.filter((_, i) => i !== index));
    if (expandedScene === index) setExpandedScene(null);
  };

  const updateScene = (index: number, field: keyof SceneData, value: string) => {
    const updated = [...scenes];
    updated[index] = { ...updated[index], [field]: value };
    setScenes(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">المشاهد</h2>
        <Button variant="outline" size="sm" onClick={addScene} className="border-primary/30 text-primary hover:bg-primary/10">
          <Plus className="w-4 h-4 mr-1" />
          إضافة مشهد
        </Button>
      </div>

      <div className="space-y-2">
        {scenes.map((scene, index) => (
          <div
            key={index}
            className={`bg-gradient-card rounded-xl border transition-all ${
              expandedScene === index ? "border-primary/30" : "border-border/50"
            }`}
          >
            {/* Scene Header */}
            <div
              className="flex items-center gap-2 p-3 cursor-pointer hover:bg-secondary/20 rounded-t-xl"
              onClick={() => setExpandedScene(expandedScene === index ? null : index)}
            >
              <GripVertical className="w-4 h-4 text-muted-foreground/40" />
              <span className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-display font-bold text-primary shrink-0">
                {index + 1}
              </span>
              <input
                type="text"
                value={scene.title}
                onChange={(e) => { e.stopPropagation(); updateScene(index, "title", e.target.value); }}
                onClick={(e) => e.stopPropagation()}
                className="bg-transparent border-none text-sm font-medium focus:outline-none flex-1 min-w-0"
                placeholder="عنوان المشهد"
              />
              <div className="flex items-center gap-1">
                {scene.description && (
                  <span className="w-2 h-2 rounded-full bg-primary" title="يحتوي وصف" />
                )}
                {scenes.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => { e.stopPropagation(); removeScene(index); }}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 w-7"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
                {expandedScene === index ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </div>

            {/* Expanded Scene Details */}
            {expandedScene === index && (
              <div className="px-4 pb-4 space-y-3 border-t border-border/30 pt-3">
                {/* Main description */}
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground font-display">وصف المشهد *</label>
                  <Textarea
                    value={scene.description}
                    onChange={(e) => updateScene(index, "description", e.target.value)}
                    placeholder="صِف المشهد بالتفصيل... الموقع، الحدث، الحركة، الخلفية..."
                    className="bg-secondary/50 border-border/30 min-h-[80px] text-sm resize-none"
                  />
                </div>

                {/* Characters */}
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground font-display">الشخصيات وتعبيراتها</label>
                  <Textarea
                    value={scene.characters}
                    onChange={(e) => updateScene(index, "characters", e.target.value)}
                    placeholder="صف الشخصيات: مظهرهم، ملابسهم، تعابير وجوههم، حركاتهم..."
                    className="bg-secondary/50 border-border/30 min-h-[50px] text-sm resize-none"
                  />
                </div>

                {/* Props */}
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground font-display">العناصر والدعائم (Props)</label>
                  <Textarea
                    value={scene.props}
                    onChange={(e) => updateScene(index, "props", e.target.value)}
                    placeholder="الأشياء المهمة في المشهد: أثاث، سيارات، أجهزة، طعام..."
                    className="bg-secondary/50 border-border/30 min-h-[40px] text-sm resize-none"
                  />
                </div>

                {/* Mood */}
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground font-display">المزاج والجو العام</label>
                  <input
                    type="text"
                    value={scene.mood}
                    onChange={(e) => updateScene(index, "mood", e.target.value)}
                    placeholder="مثال: غامض ومثير، سعيد ومشرق، حزين وهادئ..."
                    className="w-full bg-secondary/50 border border-border/30 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>

                {/* Camera, Lighting, Color row */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground font-display">الكاميرا</label>
                    <Select value={scene.cameraAngle} onValueChange={(v) => updateScene(index, "cameraAngle", v)}>
                      <SelectTrigger className="bg-secondary/50 border-border/30 text-xs h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wide">واسعة</SelectItem>
                        <SelectItem value="close_up">قريبة</SelectItem>
                        <SelectItem value="tracking">تتبع</SelectItem>
                        <SelectItem value="aerial">جوية</SelectItem>
                        <SelectItem value="low_angle">منخفضة</SelectItem>
                        <SelectItem value="dutch">مائلة</SelectItem>
                        <SelectItem value="over_shoulder">من فوق الكتف</SelectItem>
                        <SelectItem value="pov">منظور أول</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground font-display">الإضاءة</label>
                    <Select value={scene.lighting} onValueChange={(v) => updateScene(index, "lighting", v)}>
                      <SelectTrigger className="bg-secondary/50 border-border/30 text-xs h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="natural">طبيعية</SelectItem>
                        <SelectItem value="dramatic">درامية</SelectItem>
                        <SelectItem value="neon">نيون</SelectItem>
                        <SelectItem value="soft">ناعمة</SelectItem>
                        <SelectItem value="cinematic">سينمائية</SelectItem>
                        <SelectItem value="moody">غامضة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground font-display">الألوان</label>
                    <Select value={scene.colorGrading} onValueChange={(v) => updateScene(index, "colorGrading", v)}>
                      <SelectTrigger className="bg-secondary/50 border-border/30 text-xs h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="warm">دافئة</SelectItem>
                        <SelectItem value="cool">باردة</SelectItem>
                        <SelectItem value="teal_orange">تيل وبرتقالي</SelectItem>
                        <SelectItem value="desaturated">باهتة</SelectItem>
                        <SelectItem value="vibrant">نابضة</SelectItem>
                        <SelectItem value="noir">نوار</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SceneEditor;
export { defaultScene };
