import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Film, Camera, Sun, Palette, Zap } from "lucide-react";

interface VideoSettingsProps {
  style: string;
  setStyle: (v: string) => void;
  duration: string;
  setDuration: (v: string) => void;
  resolution: string;
  setResolution: (v: string) => void;
  quality: string;
  setQuality: (v: string) => void;
}

const VideoSettings = ({
  style, setStyle, duration, setDuration, resolution, setResolution, quality, setQuality,
}: VideoSettingsProps) => {
  return (
    <div className="bg-gradient-card rounded-xl border border-border/50 p-5 space-y-4">
      <h2 className="font-display text-lg font-semibold flex items-center gap-2">
        <Film className="w-5 h-5 text-primary" />
        إعدادات الإنتاج
      </h2>

      <Tabs defaultValue="style" className="w-full">
        <TabsList className="w-full bg-secondary/50 grid grid-cols-4 h-9">
          <TabsTrigger value="style" className="text-xs font-display gap-1 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <Palette className="w-3 h-3" /> الأسلوب
          </TabsTrigger>
          <TabsTrigger value="camera" className="text-xs font-display gap-1 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <Camera className="w-3 h-3" /> الكاميرا
          </TabsTrigger>
          <TabsTrigger value="lighting" className="text-xs font-display gap-1 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <Sun className="w-3 h-3" /> الجودة
          </TabsTrigger>
          <TabsTrigger value="timing" className="text-xs font-display gap-1 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <Zap className="w-3 h-3" /> التوقيت
          </TabsTrigger>
        </TabsList>

        <TabsContent value="style" className="mt-3 space-y-3">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">أسلوب الفيديو</label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger className="bg-secondary border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hyper_realistic">واقعي فائق الدقة (Hyper-Realistic)</SelectItem>
                <SelectItem value="cinematic">سينمائي (Cinematic)</SelectItem>
                <SelectItem value="realistic">واقعي (Realistic)</SelectItem>
                <SelectItem value="cartoon">كرتوني / Pixar</SelectItem>
                <SelectItem value="anime">أنيمي (Anime)</SelectItem>
                <SelectItem value="motion_graphics">موشن جرافيك</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: "hyper_realistic", label: "واقعي فائق", icon: "🎬" },
              { value: "cinematic", label: "سينمائي", icon: "🎥" },
              { value: "anime", label: "أنيمي", icon: "🎨" },
            ].map((s) => (
              <button
                key={s.value}
                onClick={() => setStyle(s.value)}
                className={`p-3 rounded-lg border text-center transition-all text-xs font-display ${
                  style === s.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/30 bg-secondary/30 text-muted-foreground hover:border-border"
                }`}
              >
                <div className="text-lg mb-1">{s.icon}</div>
                {s.label}
              </button>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="camera" className="mt-3 space-y-3">
          <p className="text-xs text-muted-foreground">يمكنك تحديد زاوية الكاميرا لكل مشهد بشكل مستقل في محرر المشاهد أدناه</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: "📐", label: "زاوية واسعة", desc: "إطلالة شاملة" },
              { icon: "🔍", label: "لقطة قريبة", desc: "تفاصيل دقيقة" },
              { icon: "🎯", label: "تتبع", desc: "حركة ديناميكية" },
              { icon: "🦅", label: "جوية", desc: "منظور علوي" },
            ].map((c) => (
              <div key={c.label} className="p-2.5 rounded-lg bg-secondary/30 border border-border/20 text-center">
                <div className="text-base mb-0.5">{c.icon}</div>
                <p className="text-xs font-display font-medium">{c.label}</p>
                <p className="text-[10px] text-muted-foreground">{c.desc}</p>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="lighting" className="mt-3 space-y-3">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">الدقة</label>
            <Select value={resolution} onValueChange={setResolution}>
              <SelectTrigger className="bg-secondary border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1080p">1080p Full HD</SelectItem>
                <SelectItem value="4k">4K Ultra HD</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">جودة التوليد</label>
            <Select value={quality} onValueChange={setQuality}>
              <SelectTrigger className="bg-secondary border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">قياسي (أسرع)</SelectItem>
                <SelectItem value="premium">فائق الجودة (أبطأ)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TabsContent>

        <TabsContent value="timing" className="mt-3 space-y-3">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">مدة كل مشهد</label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger className="bg-secondary border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 ثواني — سريع</SelectItem>
                <SelectItem value="5">5 ثواني — متوسط</SelectItem>
                <SelectItem value="8">8 ثواني — سينمائي</SelectItem>
                <SelectItem value="10">10 ثواني — درامي</SelectItem>
                <SelectItem value="15">15 ثانية — بطيء</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VideoSettings;
