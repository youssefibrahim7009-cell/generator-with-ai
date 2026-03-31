import { useState, useEffect, useCallback } from "react";
import { Play, Pause, SkipForward, SkipBack, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GeneratedScene {
  title: string;
  description: string;
  imageUrl: string | null;
  error?: string;
}

interface VideoPreviewProps {
  scenes: GeneratedScene[];
  sceneDuration: number;
}

const VideoPreview = ({ scenes, sceneDuration }: VideoPreviewProps) => {
  const [currentScene, setCurrentScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const validScenes = scenes.filter((s) => s.imageUrl);

  const nextScene = useCallback(() => {
    setCurrentScene((prev) => (prev + 1) % validScenes.length);
    setProgress(0);
  }, [validScenes.length]);

  const prevScene = useCallback(() => {
    setCurrentScene((prev) => (prev - 1 + validScenes.length) % validScenes.length);
    setProgress(0);
  }, [validScenes.length]);

  useEffect(() => {
    if (!isPlaying || validScenes.length === 0) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextScene();
          return 0;
        }
        return prev + 100 / (sceneDuration * 20);
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying, sceneDuration, nextScene, validScenes.length]);

  if (validScenes.length === 0) {
    return (
      <div className="bg-gradient-card rounded-xl border border-border/50 aspect-video flex items-center justify-center">
        <p className="text-muted-foreground">لم يتم توليد أي مشاهد بنجاح</p>
      </div>
    );
  }

  const scene = validScenes[currentScene];

  return (
    <div className="space-y-3">
      <div className="relative rounded-xl overflow-hidden border border-border/50 aspect-video bg-card group">
        {/* Scene Image */}
        <img
          src={scene.imageUrl!}
          alt={scene.title}
          className="w-full h-full object-cover transition-opacity duration-700"
        />

        {/* Scene overlay info */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="font-display text-sm font-semibold">{scene.title}</p>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{scene.description}</p>
        </div>

        {/* Scene counter */}
        <div className="absolute top-3 right-3 bg-background/70 backdrop-blur-sm rounded-lg px-2.5 py-1 text-xs font-display font-medium">
          {currentScene + 1} / {validScenes.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex gap-1">
        {validScenes.map((_, i) => (
          <div
            key={i}
            className="flex-1 h-1 rounded-full bg-secondary overflow-hidden cursor-pointer"
            onClick={() => {
              setCurrentScene(i);
              setProgress(0);
            }}
          >
            <div
              className="h-full bg-primary rounded-full transition-all duration-100"
              style={{
                width: i < currentScene ? "100%" : i === currentScene ? `${progress}%` : "0%",
              }}
            />
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2">
        <Button variant="ghost" size="icon" onClick={prevScene} className="h-9 w-9 text-muted-foreground hover:text-foreground">
          <SkipBack className="w-4 h-4" />
        </Button>
        <Button
          onClick={() => setIsPlaying(!isPlaying)}
          size="icon"
          className="h-10 w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 glow-primary"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={nextScene} className="h-9 w-9 text-muted-foreground hover:text-foreground">
          <SkipForward className="w-4 h-4" />
        </Button>
      </div>

      {/* Scene thumbnails */}
      <div className="grid grid-cols-4 gap-2">
        {validScenes.map((s, i) => (
          <button
            key={i}
            onClick={() => {
              setCurrentScene(i);
              setProgress(0);
            }}
            className={`rounded-lg overflow-hidden border-2 transition-all aspect-video ${
              i === currentScene ? "border-primary glow-primary" : "border-border/30 opacity-60 hover:opacity-100"
            }`}
          >
            <img src={s.imageUrl!} alt={s.title} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default VideoPreview;
