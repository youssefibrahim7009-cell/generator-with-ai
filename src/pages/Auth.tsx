import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Clapperboard, Mail, Lock, Loader2 } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          toast({
            title: "خطأ في تسجيل الدخول",
            description: error.message.includes("Invalid login") ? "كلمة المرور أو البريد غير صحيح" : error.message,
            variant: "destructive",
          });
          return;
        }
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) {
          toast({ title: "خطأ في التسجيل", description: error.message, variant: "destructive" });
          return;
        }
        toast({ title: "تم التسجيل!", description: "تحقق من بريدك الإلكتروني لتأكيد الحساب" });
        return;
      }
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });
    if (error) toast({ title: "خطأ", description: error.message, variant: "destructive" });
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto glow-primary">
            <Clapperboard className="w-7 h-7 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold text-gradient">AI Video Studio</h1>
          <p className="text-sm text-muted-foreground">{isLogin ? "تسجيل الدخول" : "إنشاء حساب جديد"}</p>
        </div>

        <div className="bg-gradient-card rounded-2xl border border-border/50 p-6 space-y-4">
          <Button variant="outline" className="w-full border-border/50" onClick={handleGoogleLogin}>
            متابعة مع Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border/50" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">أو</span></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs">البريد الإلكتروني</Label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="pr-10" placeholder="you@example.com" dir="ltr" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs">كلمة المرور</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="pr-10" placeholder="••••••••" dir="ltr" minLength={6} />
              </div>
            </div>
            <Button type="submit" className="w-full font-display font-semibold" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : isLogin ? "دخول" : "تسجيل"}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            {isLogin ? "ليس لديك حساب؟" : "لديك حساب؟"}{" "}
            <button onClick={() => setIsLogin(!isLogin)} className="text-primary hover:underline font-medium">
              {isLogin ? "سجل الآن" : "سجل دخول"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
