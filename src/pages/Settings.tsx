import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, User, Activity, Target, Save, Apple } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
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
          title: "Erro ao carregar perfil",
          description: "Não foi possível carregar seus dados.",
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
  }, [navigate, toast]);

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
          title: "Erro ao salvar",
          description: error.message,
        });
      } else {
        toast({
          title: "Configurações salvas!",
          description: "Suas informações foram atualizadas com sucesso.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: "Ocorreu um erro. Tente novamente.",
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
        title: "Erro ao sair",
        description: error.message,
      });
    } else {
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
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
                Voltar ao Dashboard
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 health-gradient rounded-lg flex items-center justify-center">
                <Apple className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Dieta Fácil</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Configurações</h1>
          <p className="text-gray-600">Atualize suas informações pessoais e preferências</p>
        </div>

        <div className="grid gap-6">
          {/* Informações Pessoais */}
          <Card className="glass-effect shadow-health">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-health-500" />
                Informações Pessoais
              </CardTitle>
              <CardDescription>
                Suas informações básicas para cálculo nutricional
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age">Idade</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Ex: 30"
                    value={formData.age}
                    onChange={(e) => handleInputChange("age", e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Sexo</Label>
                  <RadioGroup
                    value={formData.gender}
                    onValueChange={(value) => handleInputChange("gender", value)}
                    className="mt-2 flex gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id="male" />
                      <Label htmlFor="male">Masculino</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="female" />
                      <Label htmlFor="female">Feminino</Label>
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
                Medidas Corporais
              </CardTitle>
              <CardDescription>
                Suas medidas atuais para cálculo de necessidades nutricionais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="height">Altura (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="Ex: 170"
                    value={formData.height}
                    onChange={(e) => handleInputChange("height", e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="weight">Peso atual (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    placeholder="Ex: 70.5"
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
                Objetivos e Atividade
              </CardTitle>
              <CardDescription>
                Seus objetivos e nível de atividade física
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Objetivo principal</Label>
                <RadioGroup
                  value={formData.goal}
                  onValueChange={(value) => handleInputChange("goal", value)}
                  className="mt-3 space-y-3"
                >
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-health-50 transition-colors">
                    <RadioGroupItem value="lose_weight" id="lose_weight" />
                    <div className="flex-1">
                      <Label htmlFor="lose_weight" className="font-medium">Emagrecer</Label>
                      <p className="text-sm text-gray-600">Reduzir peso e gordura corporal</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-health-50 transition-colors">
                    <RadioGroupItem value="maintain_weight" id="maintain_weight" />
                    <div className="flex-1">
                      <Label htmlFor="maintain_weight" className="font-medium">Manter peso</Label>
                      <p className="text-sm text-gray-600">Manter peso atual com alimentação equilibrada</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-health-50 transition-colors">
                    <RadioGroupItem value="gain_muscle" id="gain_muscle" />
                    <div className="flex-1">
                      <Label htmlFor="gain_muscle" className="font-medium">Ganhar massa muscular</Label>
                      <p className="text-sm text-gray-600">Aumentar massa muscular e peso</p>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="activity_level">Nível de atividade física</Label>
                  <Select value={formData.activity_level} onValueChange={(value) => handleInputChange("activity_level", value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Selecione seu nível de atividade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedentary">Sedentário (pouco ou nenhum exercício)</SelectItem>
                      <SelectItem value="lightly_active">Levemente ativo (1-3 dias por semana)</SelectItem>
                      <SelectItem value="moderately_active">Moderadamente ativo (3-5 dias por semana)</SelectItem>
                      <SelectItem value="very_active">Muito ativo (6-7 dias por semana)</SelectItem>
                      <SelectItem value="extremely_active">Extremamente ativo (2x por dia ou trabalho físico)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="target_weight">Peso desejado (kg)</Label>
                  <Input
                    id="target_weight"
                    type="number"
                    step="0.1"
                    placeholder="Ex: 65.0"
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
              <CardTitle>Conta</CardTitle>
              <CardDescription>
                Gerenciar sua conta e configurações
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
                  {saving ? "Salvando..." : "Salvar Alterações"}
                </Button>
                
                <Separator orientation="vertical" className="hidden sm:block" />
                
                <Button
                  variant="destructive"
                  onClick={handleLogout}
                  className="flex-1"
                >
                  Sair da Conta
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