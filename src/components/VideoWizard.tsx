import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  ChevronRight,
  ChevronLeft,
  Film,
  Palette,
  MapPin,
  Mic,
  Clock,
  Globe,
  FileText,
  Sparkles,
  Check,
} from "lucide-react";

interface WizardSelections {
  videoType: string;
  style: string;
  scene: string;
  customScene: string;
  voice: string;
  duration: string;
  language: string;
  script: string;
  referenceImage: string;
  referenceImageUrl: string;
}

interface VideoWizardProps {
  onComplete: (selections: WizardSelections) => void;
}

const STEPS = [
  { key: "videoType", label: "نوع الفيديو", icon: Film },
  { key: "style", label: "الأسلوب", icon: Palette },
  { key: "scene", label: "المشهد", icon: MapPin },
  { key: "voice", label: "الصوت", icon: Mic },
  { key: "duration", label: "المدة", icon: Clock },
  { key: "image", label: "صورة مرجعية", icon: FileText },
  { key: "language", label: "اللغة", icon: Globe },
  { key: "script", label: "السكريبت", icon: FileText },
] as const;

const VIDEO_TYPES = [
  { value: "talking_fruit", label: "فاكهة متكلمة", emoji: "🍎", desc: "3D Pixar Style" },
  { value: "human_presenter", label: "مقدم بشري", emoji: "🧑‍💼", desc: "Human Presenter" },
  { value: "advertisement", label: "إعلان تجاري", emoji: "📢", desc: "Advertisement" },
  { value: "story", label: "قصة / مشهد", emoji: "🎬", desc: "Story / Scene" },
  { value: "educational", label: "تعليمي", emoji: "📚", desc: "Educational" },
];

const STYLES = [
  { value: "funny", label: "كوميدي", emoji: "😂" },
  { value: "cinematic", label: "سينمائي", emoji: "🎥" },
  { value: "viral", label: "ترند / فايرال", emoji: "🔥" },
  { value: "dramatic", label: "درامي", emoji: "🎭" },
];

const SCENES = [
  { value: "kitchen", label: "مطبخ", emoji: "🍳" },
  { value: "street", label: "شارع", emoji: "🏙️" },
  { value: "studio", label: "استوديو", emoji: "🎙️" },
  { value: "room", label: "غرفة", emoji: "🛋️" },
  { value: "custom", label: "مخصص", emoji: "✏️" },
];

const VOICES = [
  { value: "male", label: "ذكر", emoji: "🗣️" },
  { value: "female", label: "أنثى", emoji: "👩" },
  { value: "energetic", label: "حماسي", emoji: "⚡" },
  { value: "calm", label: "هادئ", emoji: "🧘" },
];

const DURATIONS = [
  { value: "10", label: "10 ثواني", emoji: "⏱️" },
  { value: "20", label: "20 ثانية", emoji: "⏲️" },
  { value: "30", label: "30 ثانية (MAX)", emoji: "🕐" },
];

const VideoWizard = ({ onComplete }: VideoWizardProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<WizardSelections>({
    videoType: "",
    style: "",
    scene: "",
    customScene: "",
    voice: "",
    duration: "",
    language: "",
    script: "",
    referenceImage: "none",
    referenceImageUrl: "",
  });
  const [uploading, setUploading] = useState(false);

  const setField = (key: keyof WizardSelections, value: string) => {
    setSelections((prev) => ({ ...prev, [key]: value }));
  };

  const canProceed = () => {
    const step = STEPS[currentStep].key;
    if (step === "videoType") return !!selections.videoType;
    if (step === "style") return !!selections.style;
    if (step === "scene") return !!selections.scene && (selections.scene !== "custom" || !!selections.customScene.trim());
    if (step === "voice") return !!selections.voice;
    if (step === "duration") return !!selections.duration;
    if (step === "language") return !!selections.language.trim();
    if (step === "script") return !!selections.script.trim();
    return false;
  };

  const next = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep((s) => s + 1);
    else onComplete(selections);
  };

  const prev = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const renderOptionGrid = (
    options: { value: string; label: string; emoji: string; desc?: string }[],
    field: keyof WizardSelections
  ) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {options.map((opt) => {
        const selected = selections[field] === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => setField(field, opt.value)}
            className={`relative p-4 rounded-xl border-2 text-center transition-all active:scale-95 ${
              selected
                ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                : "border-border/40 bg-secondary/30 hover:border-border hover:bg-secondary/50"
            }`}
          >
            {selected && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <Check className="w-3 h-3 text-primary-foreground" />
              </div>
            )}
            <div className="text-3xl mb-2">{opt.emoji}</div>
            <p className={`text-sm font-display font-semibold ${selected ? "text-primary" : "text-foreground"}`}>
              {opt.label}
            </p>
            {opt.desc && <p className="text-[10px] text-muted-foreground mt-0.5">{opt.desc}</p>}
          </button>
        );
      })}
    </div>
  );

  const renderStep = () => {
    const step = STEPS[currentStep].key;

    if (step === "videoType") return renderOptionGrid(VIDEO_TYPES, "videoType");
    if (step === "style") return renderOptionGrid(STYLES, "style");
    if (step === "scene")
      return (
        <div className="space-y-4">
          {renderOptionGrid(SCENES, "scene")}
          {selections.scene === "custom" && (
            <Input
              value={selections.customScene}
              onChange={(e) => setField("customScene", e.target.value)}
              placeholder="اكتب وصف المكان المخصص..."
              className="bg-secondary/50 border-border/30"
            />
          )}
        </div>
      );
    if (step === "voice") return renderOptionGrid(VOICES, "voice");
    if (step === "duration") return renderOptionGrid(DURATIONS, "duration");
    if (step === "language")
      return (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">اكتب اللغة المطلوبة للفيديو (عربي، إنجليزي، فرنسي، إسباني...)</p>
          <Input
            value={selections.language}
            onChange={(e) => setField("language", e.target.value)}
            placeholder="مثال: عربي"
            className="bg-secondary/50 border-border/30 text-lg h-12"
          />
          <div className="flex flex-wrap gap-2">
            {["عربي", "English", "Français", "Español", "Deutsch"].map((lang) => (
              <button
                key={lang}
                onClick={() => setField("language", lang)}
                className={`px-3 py-1.5 rounded-lg text-xs font-display transition-all ${
                  selections.language === lang
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
      );
    if (step === "script")
      return (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            اكتب الحوار أو السكريبت باللغة التي اخترتها ({selections.language})
          </p>
          <Textarea
            value={selections.script}
            onChange={(e) => setField("script", e.target.value)}
            placeholder="اكتب السكريبت هنا..."
            className="bg-secondary/50 border-border/30 min-h-[150px] text-sm"
          />
        </div>
      );
    return null;
  };

  const StepIcon = STEPS[currentStep].icon;

  return (
    <div className="bg-gradient-card rounded-2xl border border-border/50 overflow-hidden">
      {/* Progress Bar */}
      <div className="flex gap-1 p-3">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i <= currentStep ? "bg-primary" : "bg-secondary/50"
            }`}
          />
        ))}
      </div>

      {/* Step Header */}
      <div className="px-5 pb-2 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <StepIcon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-display">
            الخطوة {currentStep + 1} من {STEPS.length}
          </p>
          <h2 className="font-display text-lg font-bold">{STEPS[currentStep].label}</h2>
        </div>
      </div>

      {/* Step Content */}
      <div className="px-5 py-4 min-h-[250px]">{renderStep()}</div>

      {/* Navigation */}
      <div className="px-5 pb-5 flex items-center gap-3">
        {currentStep > 0 && (
          <Button variant="outline" onClick={prev} className="border-border/50">
            <ChevronRight className="w-4 h-4 ml-1" />
            السابق
          </Button>
        )}
        <Button
          onClick={next}
          disabled={!canProceed()}
          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-display font-semibold"
        >
          {currentStep === STEPS.length - 1 ? (
            <>
              <Sparkles className="w-4 h-4 ml-1" />
              إنتاج الفيديو
            </>
          ) : (
            <>
              التالي
              <ChevronLeft className="w-4 h-4 mr-1" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default VideoWizard;
