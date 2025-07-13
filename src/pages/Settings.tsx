import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, User, Activity, Target, Save, Apple, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [formData, setFormData] = useState({
    age: "",
    gender: "",
    height: "",
    weight: "",
    goal: "",
    activity_level: "",
    target_weight: ""
  });

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }

      setUser(session.user);

      // Buscar dados do perfil do usuário
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (error) {
        toast({
          variant: "destructive",
          title: t('settings.messages.profile_load_error'),
          description: t('settings.messages.profile_load_error_desc'),
        });
        navigate('/dashboard');
        return;
      }

      if (profile) {
        setFormData({
          age: profile.age?.toString() || "",
          gender: profile.gender || "",
          height: profile.height?.toString() || "",
          weight: profile.weight?.toString() || "",
          goal: profile.goal || "",
          activity_level: profile.activity_level || "",
          target_weight: profile.target_weight?.toString() || ""
        });
      }

      setLoading(false);
    };

    getUser();
  }, [navigate, toast, t]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          age: parseInt(formData.age),
          gender: formData.gender,
          height: parseFloat(formData.height),
          weight: parseFloat(formData.weight),
          goal: formData.goal,
          activity_level: formData.activity_level,
          target_weight: parseFloat(formData.target_weight)
        })
        .eq('user_id', user.id);

      if (error) {
        toast({
          variant: "destructive",
          title: t('settings.messages.save_error'),
          description: error.message,
        });
      } else {
        toast({
          title: t('settings.messages.save_success'),
          description: t('settings.messages.save_success_desc'),
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: t('settings.messages.unexpected_error'),
        description: t('settings.messages.unexpected_error_desc'),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast({
        variant: "destructive",
        title: t('settings.messages.logout_error'),
        description: error.message,
      });
    } else {
      toast({
        title: t('settings.messages.logout_success'),
        description: t('settings.messages.logout_success_desc'),
      });
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-health-50 via-white to-health-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-health-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-health-50 via-white to-health-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('settings.back_to_dashboard')}
              </Button>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 health-gradient rounded-lg flex items-center justify-center">
                  <Apple className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">Dieta Fácil</span>
              </div>
              
              <div className="ml-4">
                <LanguageSwitcher fixed={false} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('settings.title')}</h1>
          <p className="text-gray-600">{t('settings.subtitle')}</p>
        </div>

        <div className="grid gap-6">
          {/* Informações Pessoais */}
          <Card className="glass-effect shadow-health">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-health-500" />
                {t('settings.personal_info.title')}
              </CardTitle>
              <CardDescription>
                {t('settings.personal_info.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age">{t('settings.personal_info.age')}</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder={t('settings.personal_info.age_placeholder')}
                    value={formData.age}
                    onChange={(e) => handleInputChange("age", e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>{t('settings.personal_info.gender')}</Label>
                  <RadioGroup
                    value={formData.gender}
                    onValueChange={(value) => handleInputChange("gender", value)}
                    className="mt-2 flex gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id="male" />
                      <Label htmlFor="male">{t('settings.personal_info.male')}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="female" />
                      <Label htmlFor="female">{t('settings.personal_info.female')}</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medidas Corporais */}
          <Card className="glass-effect shadow-health">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-health-500" />
                {t('settings.body_measurements.title')}
              </CardTitle>
              <CardDescription>
                {t('settings.body_measurements.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="height">{t('settings.body_measurements.height')}</Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder={t('settings.body_measurements.height_placeholder')}
                    value={formData.height}
                    onChange={(e) => handleInputChange("height", e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="weight">{t('settings.body_measurements.weight')}</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    placeholder={t('settings.body_measurements.weight_placeholder')}
                    value={formData.weight}
                    onChange={(e) => handleInputChange("weight", e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Objetivos e Atividade */}
          <Card className="glass-effect shadow-health">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-health-500" />
                {t('settings.goals_activity.title')}
              </CardTitle>
              <CardDescription>
                {t('settings.goals_activity.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>{t('settings.goals_activity.main_goal')}</Label>
                <RadioGroup
                  value={formData.goal}
                  onValueChange={(value) => handleInputChange("goal", value)}
                  className="mt-3 space-y-3"
                >
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-health-50 transition-colors">
                    <RadioGroupItem value="lose_weight" id="lose_weight" />
                    <div className="flex-1">
                      <Label htmlFor="lose_weight" className="font-medium">{t('settings.goals_activity.lose_weight.title')}</Label>
                      <p className="text-sm text-gray-600">{t('settings.goals_activity.lose_weight.description')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-health-50 transition-colors">
                    <RadioGroupItem value="maintain_weight" id="maintain_weight" />
                    <div className="flex-1">
                      <Label htmlFor="maintain_weight" className="font-medium">{t('settings.goals_activity.maintain_weight.title')}</Label>
                      <p className="text-sm text-gray-600">{t('settings.goals_activity.maintain_weight.description')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-health-50 transition-colors">
                    <RadioGroupItem value="gain_muscle" id="gain_muscle" />
                    <div className="flex-1">
                      <Label htmlFor="gain_muscle" className="font-medium">{t('settings.goals_activity.gain_muscle.title')}</Label>
                      <p className="text-sm text-gray-600">{t('settings.goals_activity.gain_muscle.description')}</p>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="activity_level">{t('settings.goals_activity.activity_level')}</Label>
                  <Select value={formData.activity_level} onValueChange={(value) => handleInputChange("activity_level", value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder={t('settings.goals_activity.activity_placeholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedentary">{t('settings.goals_activity.sedentary')}</SelectItem>
                      <SelectItem value="lightly_active">{t('settings.goals_activity.lightly_active')}</SelectItem>
                      <SelectItem value="moderately_active">{t('settings.goals_activity.moderately_active')}</SelectItem>
                      <SelectItem value="very_active">{t('settings.goals_activity.very_active')}</SelectItem>
                      <SelectItem value="extremely_active">{t('settings.goals_activity.extremely_active')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="target_weight">{t('settings.goals_activity.target_weight')}</Label>
                  <Input
                    id="target_weight"
                    type="number"
                    step="0.1"
                    placeholder={t('settings.goals_activity.target_weight_placeholder')}
                    value={formData.target_weight}
                    onChange={(e) => handleInputChange("target_weight", e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ações */}
          <Card className="glass-effect shadow-health">
            <CardHeader>
              <CardTitle>{t('settings.account.title')}</CardTitle>
              <CardDescription>
                {t('settings.account.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="health-gradient shadow-health flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? t('settings.account.saving') : t('settings.account.save_changes')}
                </Button>
                
                <Separator orientation="vertical" className="hidden sm:block" />
                
                <Button
                  variant="destructive"
                  onClick={handleLogout}
                  className="flex-1"
                >
                  {t('settings.account.logout')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;