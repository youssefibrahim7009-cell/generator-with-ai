import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Clapperboard, Plus, Clock, Play, Trash2 } from "lucide-react";

interface VideoRecord {
  id: string;
  title: string;
  thumbnail_url: string | null;
  settings: any;
  scenes: any[];
  created_at: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [videos, setVideos] = useState<VideoRecord[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("ai_videos");
    if (saved) setVideos(JSON.parse(saved));
  }, []);

  const handleDelete = (id: string) => {
    const updated = videos.filter((v) => v.id !== id);
    setVideos(updated);
    localStorage.setItem("ai_videos", JSON.stringify(updated));
    toast({ title: "تم الحذف", description: "تم حذف الفيديو بنجاح" });
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl animate-pulse-glow" />
      </div>

      <div className="relative z-10">
        <header className="border-b border-border/50 backdrop-blur-sm bg-background/50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 glow-primary">
                <Clapperboard className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-xl font-bold text-gradient">AI Video Studio</h1>
                <p className="text-xs text-muted-foreground">إنتاج فيديوهات بالذكاء الاصطناعي</p>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-bold">لوحة التحكم</h2>
            <Button onClick={() => navigate("/create")} className="font-display font-semibold">
              <Plus className="w-4 h-4 ml-1" /> فيديو جديد
            </Button>
          </div>

          {videos.length === 0 ? (
            <div className="bg-gradient-card rounded-2xl border border-border/50 p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Clapperboard className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-display text-lg font-bold mb-2">لا توجد فيديوهات بعد</h3>
              <p className="text-sm text-muted-foreground mb-4">أنشئ أول فيديو لك بالذكاء الاصطناعي</p>
              <Button onClick={() => navigate("/create")} className="font-display">
                <Plus className="w-4 h-4 ml-1" /> إنشاء فيديو
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.map((video) => {
                const firstScene = Array.isArray(video.scenes) ? video.scenes.find((s: any) => s.imageUrl) : null;
                const thumb = video.thumbnail_url || firstScene?.imageUrl;
                return (
                  <div key={video.id} className="bg-gradient-card rounded-xl border border-border/50 overflow-hidden group hover:border-primary/30 transition-all">
                    <div className="aspect-video bg-secondary/30 relative overflow-hidden">
                      {thumb ? (
                        <img src={thumb} alt={video.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Clapperboard className="w-10 h-10 text-muted-foreground/30" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button size="sm" variant="secondary" onClick={() => navigate(`/create?reuse=${video.id}`)}>
                          <Play className="w-3 h-3 ml-1" /> عرض
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(video.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-display font-semibold text-sm truncate">{video.title}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        {new Date(video.created_at).toLocaleDateString("ar")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
