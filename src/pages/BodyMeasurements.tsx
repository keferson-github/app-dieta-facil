import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown,
  Plus,
  Save,
  Calendar,
  Target,
  Ruler,
  BarChart3
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface BodyMeasurement {
  id: string;
  chest_cm?: number;
  waist_cm?: number;
  hips_cm?: number;
  arms_cm?: number;
  thighs_cm?: number;
  neck_cm?: number;
  measured_at: string;
}

interface MeasurementFormData {
  chest_cm: string;
  waist_cm: string;
  hips_cm: string;
  arms_cm: string;
  thighs_cm: string;
  neck_cm: string;
}

const BodyMeasurements = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState<MeasurementFormData>({
    chest_cm: '',
    waist_cm: '',
    hips_cm: '',
    arms_cm: '',
    thighs_cm: '',
    neck_cm: ''
  });
  const { subscription } = useSubscription();

  const checkAccess = useCallback(() => {
    if (!subscription?.subscribed || subscription?.plan !== 'Performance') {
      toast({
        title: "Acesso Restrito",
        description: "Este recurso é exclusivo do Plano Performance.",
        variant: "destructive",
      });
      navigate('/dashboard');
      return false;
    }
    return true;
  }, [subscription, toast, navigate]);

  const fetchMeasurements = useCallback(async () => {
    if (!checkAccess()) return;

    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('body_measurements')
        .select('*')
        .eq('user_id', session.user.id)
        .order('measured_at', { ascending: false });

      if (error) throw error;
      setMeasurements(data || []);
    } catch (error) {
      console.error('Erro ao carregar medidas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as medidas corporais.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [checkAccess, toast]);

  useEffect(() => {
    fetchMeasurements();
  }, [fetchMeasurements]);

  const handleSaveMeasurement = async () => {
    try {
      setSaving(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const measurementData = {
        user_id: session.user.id,
        chest_cm: formData.chest_cm ? parseFloat(formData.chest_cm) : null,
        waist_cm: formData.waist_cm ? parseFloat(formData.waist_cm) : null,
        hips_cm: formData.hips_cm ? parseFloat(formData.hips_cm) : null,
        arms_cm: formData.arms_cm ? parseFloat(formData.arms_cm) : null,
        thighs_cm: formData.thighs_cm ? parseFloat(formData.thighs_cm) : null,
        neck_cm: formData.neck_cm ? parseFloat(formData.neck_cm) : null,
        measured_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('body_measurements')
        .insert([measurementData]);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Medidas corporais salvas com sucesso.",
      });

      setFormData({
        chest_cm: '',
        waist_cm: '',
        hips_cm: '',
        arms_cm: '',
        thighs_cm: '',
        neck_cm: ''
      });
      setShowAddDialog(false);
      fetchMeasurements();
    } catch (error) {
      console.error('Erro ao salvar medidas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as medidas corporais.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getChange = (current: number | undefined, previous: number | undefined) => {
    if (!current || !previous) return null;
    return current - previous;
  };

  const getTrendIcon = (change: number | null) => {
    if (!change) return null;
    if (change > 0) return <TrendingUp className="w-4 h-4 text-red-500" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-green-500" />;
    return <div className="w-4 h-4" />;
  };

  const measurementLabels = {
    chest_cm: 'Peito',
    waist_cm: 'Cintura',
    hips_cm: 'Quadril',
    arms_cm: 'Braços',
    thighs_cm: 'Coxas',
    neck_cm: 'Pescoço'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-health-50 via-white to-health-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 health-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Ruler className="w-8 h-8 text-white" />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-health-500 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Carregando medidas...</p>
        </div>
      </div>
    );
  }

  const latestMeasurement = measurements[0];
  const previousMeasurement = measurements[1];

  return (
    <div className="min-h-screen bg-gradient-to-br from-health-50 via-white to-health-100">
      <div className="container mx-auto px-4 py-6 lg:py-8 max-w-7xl">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-health p-6 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate('/dashboard')}
                variant="ghost"
                size="sm"
                className="mb-2 lg:mb-0"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Ruler className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  📏 Medidas Corporais
                </h1>
                <p className="text-gray-600 mt-1">
                  Acompanhe suas medidas e progresso físico
                </p>
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 mt-2">
                  Plano Performance
                </Badge>
              </div>
            </div>
            
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="health-gradient shadow-health">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Medição
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Adicionar Nova Medição</DialogTitle>
                  <DialogDescription>
                    Registre suas medidas corporais atuais para acompanhar o progresso.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {Object.entries(measurementLabels).map(([key, label]) => (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={key}>{label} (cm)</Label>
                      <Input
                        id={key}
                        type="number"
                        step="0.1"
                        placeholder="0.0"
                        value={formData[key as keyof MeasurementFormData]}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          [key]: e.target.value
                        }))}
                      />
                    </div>
                  ))}
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleSaveMeasurement}
                      disabled={saving}
                      className="flex-1 health-gradient"
                    >
                      {saving ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Salvar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowAddDialog(false)}
                      disabled={saving}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {measurements.length === 0 ? (
          <Card className="glass-effect shadow-health max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <Ruler className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma medida registrada</h3>
              <p className="text-gray-600 mb-6">
                Comece registrando suas primeiras medidas corporais para acompanhar seu progresso.
              </p>
              <Button 
                onClick={() => setShowAddDialog(true)}
                className="health-gradient"
              >
                <Plus className="w-4 h-4 mr-2" />
                Primeira Medição
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Resumo Atual */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(measurementLabels).map(([key, label]) => {
                const current = latestMeasurement?.[key as keyof BodyMeasurement] as number;
                const previous = previousMeasurement?.[key as keyof BodyMeasurement] as number;
                const change = getChange(current, previous);
                
                return (
                  <Card key={key} className="glass-effect hover:shadow-health transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">{label}</CardTitle>
                      {getTrendIcon(change)}
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {current ? `${current.toFixed(1)} cm` : '-'}
                      </div>
                      {change !== null && (
                        <p className={`text-xs mt-1 ${change > 0 ? 'text-red-500' : change < 0 ? 'text-green-500' : 'text-gray-500'}`}>
                          {change > 0 ? '+' : ''}{change.toFixed(1)} cm desde a última medição
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Gráfico de Evolução */}
            <Card className="glass-effect shadow-health">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-health-500" />
                  Evolução das Medidas
                </CardTitle>
                <CardDescription>
                  Progresso das suas medidas corporais ao longo do tempo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(measurementLabels).map(([key, label]) => {
                    const values = measurements.map(m => m[key as keyof BodyMeasurement] as number).filter(Boolean);
                    if (values.length < 2) return null;
                    
                    const min = Math.min(...values);
                    const max = Math.max(...values);
                    const range = max - min;
                    
                    return (
                      <div key={key} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{label}</span>
                          <span className="text-gray-500">
                            {min.toFixed(1)} - {max.toFixed(1)} cm
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 relative overflow-hidden">
                          <div className="absolute inset-0 flex">
                            {measurements.slice(0, 10).reverse().map((m, index) => {
                              const value = m[key as keyof BodyMeasurement] as number;
                              if (!value) return null;
                              
                              const position = range > 0 ? ((value - min) / range) * 100 : 50;
                              const opacity = 1 - (index * 0.1);
                              
                              return (
                                <div
                                  key={m.id}
                                  className="absolute w-2 h-full bg-health-500 rounded-full"
                                  style={{
                                    left: `${position}%`,
                                    opacity: Math.max(opacity, 0.3),
                                    transform: 'translateX(-50%)'
                                  }}
                                />
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Histórico */}
            <Card className="glass-effect shadow-health">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-health-500" />
                  Histórico de Medições
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {measurements.map((measurement, index) => (
                    <div key={measurement.id} className="border-l-4 border-health-200 pl-4 py-2">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">
                          Medição #{measurements.length - index}
                        </h4>
                        <span className="text-sm text-gray-500">
                          {new Date(measurement.measured_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                        {Object.entries(measurementLabels).map(([key, label]) => {
                          const value = measurement[key as keyof BodyMeasurement] as number;
                          if (!value) return null;
                          
                          return (
                            <div key={key} className="flex justify-between">
                              <span className="text-gray-600">{label}:</span>
                              <span className="font-medium">{value.toFixed(1)}cm</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Dicas e Orientações */}
            <Card className="glass-effect shadow-health">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-health-500" />
                  Dicas para Medições Precisas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-green-600 mb-2">✅ Faça assim:</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Meça sempre no mesmo horário</li>
                      <li>• Use fita métrica firme, mas não apertada</li>
                      <li>• Mantenha postura ereta e relaxada</li>
                      <li>• Tire fotos para referência</li>
                      <li>• Meça 1-2 vezes por semana</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-600 mb-2">❌ Evite:</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Medições após refeições grandes</li>
                      <li>• Fita métrica muito frouxa ou apertada</li>
                      <li>• Locais diferentes a cada medição</li>
                      <li>• Medições diárias (variações normais)</li>
                      <li>• Comparar com outras pessoas</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default BodyMeasurements;
