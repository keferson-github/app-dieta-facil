import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  Plus, 
  Edit, 
  Trash2,
  CheckCircle,
  Clock,
  Calendar,
  TrendingUp,
  Flag,
  Star,
  Zap,
  Apple,
  Dumbbell,
  Scale,
  Trophy
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Layout from "@/components/Layout";

interface Goal {
  id: string;
  title: string;
  description: string;
  category: 'weight' | 'nutrition' | 'fitness' | 'health';
  target_value: number;
  current_value: number;
  unit: string;
  target_date: string;
  status: 'active' | 'completed' | 'paused';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
}

const Goals = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    category: "weight" as Goal['category'],
    target_value: 0,
    current_value: 0,
    unit: "kg",
    target_date: "",
    priority: "medium" as Goal['priority']
  });

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error('Erro ao carregar metas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as metas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('user_goals')
        .insert([{
          ...newGoal,
          user_id: session.user.id,
          status: 'active'
        }]);

      if (error) throw error;

      toast({
        title: "Meta criada!",
        description: "Sua nova meta foi criada com sucesso",
      });

      setShowCreateDialog(false);
      setNewGoal({
        title: "",
        description: "",
        category: "weight",
        target_value: 0,
        current_value: 0,
        unit: "kg",
        target_date: "",
        priority: "medium"
      });
      loadGoals();
    } catch (error) {
      console.error('Erro ao criar meta:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a meta",
        variant: "destructive",
      });
    }
  };

  const handleUpdateProgress = async (goalId: string, newValue: number) => {
    try {
      const { error } = await supabase
        .from('user_goals')
        .update({ 
          current_value: newValue,
          status: newValue >= goals.find(g => g.id === goalId)?.target_value ? 'completed' : 'active'
        })
        .eq('id', goalId);

      if (error) throw error;

      toast({
        title: "Progresso atualizado!",
        description: "O progresso da sua meta foi atualizado",
      });

      loadGoals();
    } catch (error) {
      console.error('Erro ao atualizar progresso:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o progresso",
        variant: "destructive",
      });
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      const { error } = await supabase
        .from('user_goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;

      toast({
        title: "Meta excluída",
        description: "A meta foi excluída com sucesso",
      });

      loadGoals();
    } catch (error) {
      console.error('Erro ao excluir meta:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a meta",
        variant: "destructive",
      });
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      weight: Scale,
      nutrition: Apple,
      fitness: Dumbbell,
      health: Target
    };
    return icons[category as keyof typeof icons] || Target;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      weight: "text-purple-500 bg-purple-100",
      nutrition: "text-green-500 bg-green-100",
      fitness: "text-blue-500 bg-blue-100",
      health: "text-red-500 bg-red-100"
    };
    return colors[category as keyof typeof colors] || "text-gray-500 bg-gray-100";
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: "bg-gray-100 text-gray-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-red-100 text-red-800"
    };
    return colors[priority as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getPriorityLabel = (priority: string) => {
    const labels = {
      low: "Baixa",
      medium: "Média",
      high: "Alta"
    };
    return labels[priority as keyof typeof labels] || priority;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      paused: "bg-gray-100 text-gray-800"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      active: "Ativa",
      completed: "Concluída",
      paused: "Pausada"
    };
    return labels[status as keyof typeof labels] || status;
  };

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');

  if (loading) {
    return (
      <Layout title="Metas" description="Carregando suas metas...">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 health-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Target className="w-8 h-8 text-white" />
            </div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-health-500 mx-auto mb-4"></div>
            <p className="text-lg font-medium text-secondary-dark">Carregando metas...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout 
      title="🎯 Metas" 
      description="Defina e acompanhe seus objetivos de saúde"
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Actions */}
        <div className="flex justify-end">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="health-gradient shadow-health">
                <Plus className="w-4 h-4 mr-2" />
                Nova Meta
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Criar Nova Meta</DialogTitle>
                <DialogDescription>
                  Defina uma nova meta para acompanhar seu progresso
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Título da Meta</Label>
                  <Input
                    id="title"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                    placeholder="Ex: Perder 5kg"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={newGoal.description}
                    onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                    placeholder="Descreva sua meta em detalhes..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Categoria</Label>
                    <Select value={newGoal.category} onValueChange={(value: Goal['category']) => setNewGoal({...newGoal, category: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weight">Peso</SelectItem>
                        <SelectItem value="nutrition">Nutrição</SelectItem>
                        <SelectItem value="fitness">Fitness</SelectItem>
                        <SelectItem value="health">Saúde</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="priority">Prioridade</Label>
                    <Select value={newGoal.priority} onValueChange={(value: Goal['priority']) => setNewGoal({...newGoal, priority: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="current_value">Valor Atual</Label>
                    <Input
                      id="current_value"
                      type="number"
                      value={newGoal.current_value}
                      onChange={(e) => setNewGoal({...newGoal, current_value: Number(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="target_value">Meta</Label>
                    <Input
                      id="target_value"
                      type="number"
                      value={newGoal.target_value}
                      onChange={(e) => setNewGoal({...newGoal, target_value: Number(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="unit">Unidade</Label>
                    <Input
                      id="unit"
                      value={newGoal.unit}
                      onChange={(e) => setNewGoal({...newGoal, unit: e.target.value})}
                      placeholder="kg, dias, etc"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="target_date">Data Limite</Label>
                  <Input
                    id="target_date"
                    type="date"
                    value={newGoal.target_date}
                    onChange={(e) => setNewGoal({...newGoal, target_date: e.target.value})}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button onClick={handleCreateGoal} className="health-gradient flex-1">
                    Criar Meta
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-effect">
            <CardContent className="p-6 text-center">
              <Flag className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{activeGoals.length}</div>
              <div className="text-sm text-gray-600">Metas Ativas</div>
            </CardContent>
          </Card>
          <Card className="glass-effect">
            <CardContent className="p-6 text-center">
              <Trophy className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{completedGoals.length}</div>
              <div className="text-sm text-gray-600">Metas Concluídas</div>
            </CardContent>
          </Card>
          <Card className="glass-effect">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">
                {goals.length > 0 ? Math.round((completedGoals.length / goals.length) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-600">Taxa de Sucesso</div>
            </CardContent>
          </Card>
        </div>

        {/* Active Goals */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-primary-dark mb-4 flex items-center gap-2">
            <Flag className="w-5 h-5 text-blue-500" />
            Metas Ativas
            <Badge className="bg-blue-100 text-blue-800">{activeGoals.length}</Badge>
          </h2>

          {activeGoals.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Nenhuma meta ativa</h3>
                <p className="text-gray-500 mb-6">Crie sua primeira meta para começar a acompanhar seu progresso</p>
                <Button 
                  onClick={() => setShowCreateDialog(true)}
                  className="health-gradient shadow-health"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeira Meta
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {activeGoals.map((goal) => {
                const IconComponent = getCategoryIcon(goal.category);
                const progressPercentage = (goal.current_value / goal.target_value) * 100;
                const daysLeft = Math.ceil((new Date(goal.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                
                return (
                  <Card key={goal.id} className="hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getCategoryColor(goal.category)}`}>
                            <IconComponent className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-primary-dark">{goal.title}</h3>
                            <p className="text-sm text-gray-600 mb-2">{goal.description}</p>
                            <div className="flex items-center gap-2">
                              <Badge className={getPriorityColor(goal.priority)}>
                                {getPriorityLabel(goal.priority)}
                              </Badge>
                              <Badge className={getStatusColor(goal.status)}>
                                {getStatusLabel(goal.status)}
                              </Badge>
                              {daysLeft > 0 && (
                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                  <Calendar className="w-4 h-4" />
                                  {daysLeft} dias restantes
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteGoal(goal.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Progresso</span>
                          <span className="font-semibold">
                            {goal.current_value} / {goal.target_value} {goal.unit}
                          </span>
                        </div>
                        <Progress value={Math.min(progressPercentage, 100)} className="h-3" />
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">{Math.round(progressPercentage)}% concluído</span>
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              placeholder="Novo valor"
                              className="w-24 h-8"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  const newValue = Number((e.target as HTMLInputElement).value);
                                  if (newValue >= 0) {
                                    handleUpdateProgress(goal.id, newValue);
                                    (e.target as HTMLInputElement).value = '';
                                  }
                                }
                              }}
                            />
                            <Button size="sm" variant="outline">
                              <TrendingUp className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-primary-dark mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-green-500" />
              Metas Concluídas
              <Badge className="bg-green-100 text-green-800">{completedGoals.length}</Badge>
            </h2>

            <div className="grid gap-4">
              {completedGoals.map((goal) => {
                const IconComponent = getCategoryIcon(goal.category);
                
                return (
                  <Card key={goal.id} className="border-green-200 bg-green-50/50">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getCategoryColor(goal.category)}`}>
                            <IconComponent className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-primary-dark">{goal.title}</h3>
                            <p className="text-sm text-gray-600">{goal.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className="bg-green-100 text-green-800">Concluída</Badge>
                              <span className="text-sm text-gray-500">
                                {goal.current_value} {goal.unit} alcançados
                              </span>
                            </div>
                          </div>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Goals;