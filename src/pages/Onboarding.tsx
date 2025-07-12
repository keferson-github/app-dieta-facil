
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Apple, ArrowRight, ArrowLeft, Target, User, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    age: "",
    gender: "",
    height: "",
    weight: "",
    goal: "",
    activity_level: "",
    target_weight: ""
  });

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }

      setUser(session.user);

      // Check if user already has a profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (profile) {
        navigate('/dashboard');
      }
    };

    getUser();
  }, [navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.age && formData.gender;
      case 2:
        return formData.height && formData.weight;
      case 3:
        return formData.goal;
      case 4:
        return formData.activity_level && formData.target_weight;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceed()) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      } else {
        handleComplete();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .insert({
          user_id: user.id,
          age: parseInt(formData.age),
          gender: formData.gender,
          height: parseFloat(formData.height),
          weight: parseFloat(formData.weight),
          goal: formData.goal,
          activity_level: formData.activity_level,
          target_weight: parseFloat(formData.target_weight)
        });

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao salvar perfil",
          description: error.message,
        });
      } else {
        toast({
          title: "Perfil criado com sucesso!",
          description: "Agora você pode acessar todas as funcionalidades do Dieta Fácil",
        });
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: "Ocorreu um erro. Tente novamente.",
      });
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <User className="w-16 h-16 mx-auto mb-4 text-health-500" />
              <h2 className="text-2xl font-bold mb-2">Vamos conhecer você!</h2>
              <p className="text-gray-600">Conte-nos um pouco sobre você para criarmos o plano perfeito</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="age">Qual sua idade?</Label>
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
                <Label>Qual seu sexo?</Label>
                <RadioGroup
                  value={formData.gender}
                  onValueChange={(value) => handleInputChange("gender", value)}
                  className="mt-2"
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
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Activity className="w-16 h-16 mx-auto mb-4 text-health-500" />
              <h2 className="text-2xl font-bold mb-2">Suas medidas</h2>
              <p className="text-gray-600">Precisamos saber suas medidas atuais para calcular suas necessidades</p>
            </div>

            <div className="space-y-4">
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
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Target className="w-16 h-16 mx-auto mb-4 text-health-500" />
              <h2 className="text-2xl font-bold mb-2">Qual seu objetivo?</h2>
              <p className="text-gray-600">Isso vai determinar como estruturamos seu plano alimentar</p>
            </div>

            <div>
              <RadioGroup
                value={formData.goal}
                onValueChange={(value) => handleInputChange("goal", value)}
                className="space-y-4"
              >
                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-health-50 transition-colors">
                  <RadioGroupItem value="lose_weight" id="lose_weight" />
                  <div className="flex-1">
                    <Label htmlFor="lose_weight" className="font-medium">Emagrecer</Label>
                    <p className="text-sm text-gray-600">Reduzir peso e gordura corporal</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-health-50 transition-colors">
                  <RadioGroupItem value="maintain_weight" id="maintain_weight" />
                  <div className="flex-1">
                    <Label htmlFor="maintain_weight" className="font-medium">Manter peso</Label>
                    <p className="text-sm text-gray-600">Manter peso atual com alimentação equilibrada</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-health-50 transition-colors">
                  <RadioGroupItem value="gain_muscle" id="gain_muscle" />
                  <div className="flex-1">
                    <Label htmlFor="gain_muscle" className="font-medium">Ganhar massa muscular</Label>
                    <p className="text-sm text-gray-600">Aumentar massa muscular e peso</p>
                  </div>
                </div>
              </RadioGroup>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Apple className="w-16 h-16 mx-auto mb-4 text-health-500" />
              <h2 className="text-2xl font-bold mb-2">Últimos detalhes</h2>
              <p className="text-gray-600">Finalize suas informações para criarmos seu plano personalizado</p>
            </div>

            <div className="space-y-4">
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
          </div>
        );

      default:
        return null;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-health-50 via-white to-health-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-health-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-health-50 via-white to-health-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-12 h-12 health-gradient rounded-xl flex items-center justify-center">
              <Apple className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold text-gray-900">Dieta Fácil</span>
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Passo {currentStep} de {totalSteps}</span>
              <span>{Math.round(progress)}% completo</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Form Card */}
        <Card className="glass-effect shadow-health">
          <CardContent className="p-8">
            {renderStep()}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>

              <Button
                className="health-gradient shadow-health"
                onClick={handleNext}
                disabled={!canProceed()}
              >
                {currentStep === totalSteps ? "Finalizar" : "Próximo"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
