import { useState, useEffect, useCallback, useRef } from "react";
import { Play, Pause, SkipForward, SkipBack, Maximize2, Minimize2, Volume2 } from "lucide-react";
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [kenBurnsPhase, setKenBurnsPhase] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const validScenes = scenes.filter((s) => s.imageUrl);

  const nextScene = useCallback(() => {
    if (currentScene >= validScenes.length - 1) {
      setIsPlaying(false);
      setCurrentScene(0);
      setProgress(0);
      return;
    }
    setCurrentScene((prev) => prev + 1);
    setProgress(0);
    setKenBurnsPhase((prev) => prev + 1);
  }, [validScenes.length, currentScene]);

  const prevScene = useCallback(() => {
    setCurrentScene((prev) => (prev - 1 + validScenes.length) % validScenes.length);
    setProgress(0);
    setKenBurnsPhase((prev) => prev + 1);
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

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  if (validScenes.length === 0) {
    return (
      <div className="bg-gradient-card rounded-xl border border-border/50 aspect-video flex items-center justify-center">
        <p className="text-muted-foreground">لم يتم توليد أي مشاهد بنجاح</p>
      </div>
    );
  }

  const scene = validScenes[currentScene];
  const totalDuration = validScenes.length * sceneDuration;
  const currentTime = currentScene * sceneDuration + (progress / 100) * sceneDuration;

  // Ken Burns transform patterns
  const kenBurnsTransforms = [
    "scale(1.15) translate(-3%, -2%)",
    "scale(1.1) translate(2%, -1%)",
    "scale(1.2) translate(-1%, 2%)",
    "scale(1.12) translate(1%, -3%)",
  ];

  const formatTime = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div ref={containerRef} className={`space-y-3 ${isFullscreen ? "bg-background p-6 flex flex-col justify-center h-full" : ""}`}>
      {/* Video Display */}
      <div className="relative rounded-xl overflow-hidden border border-border/50 aspect-video bg-card group">
        {/* Scene Images with crossfade */}
        {validScenes.map((s, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{
              opacity: i === currentScene ? 1 : 0,
              zIndex: i === currentScene ? 1 : 0,
            }}
          >
            <img
              src={s.imageUrl!}
              alt={s.title}
              className="w-full h-full object-cover"
              style={{
                transform: i === currentScene && isPlaying
                  ? kenBurnsTransforms[(kenBurnsPhase + i) % kenBurnsTransforms.length]
                  : "scale(1)",
                transition: `transform ${sceneDuration}s ease-in-out`,
              }}
            />
          </div>
        ))}

        {/* Cinematic letterbox bars */}
        <div className="absolute inset-x-0 top-0 h-[6%] bg-gradient-to-b from-background/60 to-transparent z-10" />
        <div className="absolute inset-x-0 bottom-0 h-[6%] bg-gradient-to-t from-background/60 to-transparent z-10" />

        {/* Overlay controls on hover */}
        <div className="absolute inset-0 z-20 flex flex-col justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {/* Top bar */}
          <div className="flex items-center justify-between p-3">
            <div className="bg-background/70 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs font-display font-semibold flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              AI Studio
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-background/70 backdrop-blur-sm rounded-lg px-2.5 py-1 text-xs font-display">
                {currentScene + 1} / {validScenes.length}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="h-8 w-8 bg-background/50 backdrop-blur-sm hover:bg-background/70"
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </Button>
            </div>
          </div>

          {/* Center play button */}
          <div className="flex-1 flex items-center justify-center">
            <Button
              onClick={() => setIsPlaying(!isPlaying)}
              size="icon"
              className="h-16 w-16 rounded-full bg-primary/90 text-primary-foreground hover:bg-primary glow-primary backdrop-blur-sm"
            >
              {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
            </Button>
          </div>

          {/* Bottom info */}
          <div className="p-3">
            <div className="bg-background/70 backdrop-blur-sm rounded-lg p-3">
              <p className="font-display text-sm font-semibold">{scene.title}</p>
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{scene.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Progress */}
      <div className="space-y-1.5">
        <div className="flex gap-0.5">
          {validScenes.map((_, i) => (
            <div
              key={i}
              className="flex-1 h-1.5 rounded-full bg-secondary/60 overflow-hidden cursor-pointer hover:h-2.5 transition-all"
              onClick={() => { setCurrentScene(i); setProgress(0); }}
            >
              <div
                className="h-full rounded-full transition-all duration-100"
                style={{
                  width: i < currentScene ? "100%" : i === currentScene ? `${progress}%` : "0%",
                  background: i < currentScene
                    ? "hsl(145 80% 50%)"
                    : i === currentScene
                      ? "linear-gradient(90deg, hsl(145 80% 50%), hsl(270 70% 60%))"
                      : "transparent",
                }}
              />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground font-display">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(totalDuration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <Button variant="ghost" size="icon" onClick={prevScene} className="h-9 w-9 text-muted-foreground hover:text-foreground">
          <SkipBack className="w-4 h-4" />
        </Button>
        <Button
          onClick={() => setIsPlaying(!isPlaying)}
          size="icon"
          className="h-11 w-11 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 glow-primary"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
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
            onClick={() => { setCurrentScene(i); setProgress(0); setKenBurnsPhase((p) => p + 1); }}
            className={`relative rounded-lg overflow-hidden border-2 transition-all aspect-video ${
              i === currentScene ? "border-primary glow-primary scale-[1.02]" : "border-border/30 opacity-50 hover:opacity-80"
            }`}
          >
            <img src={s.imageUrl!} alt={s.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/70 to-transparent flex items-end p-1">
              <span className="text-[9px] font-display font-medium truncate">{s.title}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default VideoPreview;
