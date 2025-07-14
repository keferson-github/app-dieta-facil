import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Trash2, Dumbbell, Target, Clock, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type Exercise = Tables<"exercises">;

interface WorkoutExercise {
  exercise: Exercise;
  sets: number;
  reps: number;
  weight?: number;
  duration?: number;
  rest: number;
}

const CreateWorkoutPlan = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  
  const [planName, setPlanName] = useState("");
  const [planDescription, setPlanDescription] = useState("");
  const [planGoal, setPlanGoal] = useState("");
  const [planDuration, setPlanDuration] = useState(4);
  const [planDifficulty, setPlanDifficulty] = useState(1);
  const [selectedExercises, setSelectedExercises] = useState<WorkoutExercise[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const loadExercises = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setExercises(data || []);
    } catch (error) {
      console.error('Erro ao carregar exercícios:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os exercícios.",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    loadExercises();
  }, [loadExercises]);

  const addExercise = (exercise: Exercise) => {
    const existingIndex = selectedExercises.findIndex(item => item.exercise.id === exercise.id);
    
    if (existingIndex >= 0) {
      toast({
        title: "Exercício já adicionado",
        description: "Este exercício já está na sua ficha de treino.",
        variant: "destructive",
      });
      return;
    }

    setSelectedExercises([...selectedExercises, { 
      exercise, 
      sets: 3, 
      reps: 12, 
      rest: 60 
    }]);
    setSearchTerm("");
  };

  const updateExercise = (index: number, field: keyof WorkoutExercise, value: number) => {
    const updated = [...selectedExercises];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedExercises(updated);
  };

  const removeExercise = (index: number) => {
    setSelectedExercises(selectedExercises.filter((_, i) => i !== index));
  };

  const saveWorkoutPlan = async () => {
    if (!planName.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira um nome para o plano de treino.",
        variant: "destructive",
      });
      return;
    }

    if (selectedExercises.length === 0) {
      toast({
        title: "Erro",
        description: "Por favor, adicione pelo menos um exercício.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Criar o plano de treino
      const { data: workoutPlan, error: planError } = await supabase
        .from('workout_plans')
        .insert({
          user_id: user.id,
          name: planName.trim(),
          description: planDescription.trim() || null,
          duration_weeks: planDuration,
          difficulty_level: planDifficulty.toString(),
          goal: planGoal || null,
        })
        .select()
        .single();

      if (planError) throw planError;

      // Criar uma sessão de treino padrão
      const { data: workoutSession, error: sessionError } = await supabase
        .from('workout_sessions')
        .insert({
          workout_plan_id: workoutPlan.id,
          name: 'Treino Principal',
          description: 'Sessão principal do plano de treino',
          session_order: 1,
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Adicionar exercícios à sessão
      const workoutExercises = selectedExercises.map((item, index) => ({
        session_id: workoutSession.id,
        exercise_id: item.exercise.id,
        sets: item.sets,
        reps: item.reps,
        weight_kg: item.weight || null,
        duration_seconds: item.duration || null,
        rest_seconds: item.rest,
        order_index: index + 1,
      }));

      const { error: exercisesError } = await supabase
        .from('workout_exercises')
        .insert(workoutExercises);

      if (exercisesError) throw exercisesError;

      toast({
        title: "Sucesso!",
        description: "Plano de treino criado com sucesso!",
      });

      // Limpar formulário
      setPlanName("");
      setPlanDescription("");
      setPlanGoal("");
      setPlanDuration(4);
      setPlanDifficulty(1);
      setSelectedExercises([]);

      navigate('/dashboard');
    } catch (error) {
      console.error('Erro ao salvar plano:', error);
      
      let errorMessage = "Não foi possível salvar o plano de treino. Tente novamente.";
      
      if (error instanceof Error) {
        if (error.message.includes('relation') && error.message.includes('does not exist')) {
          errorMessage = "As tabelas de treino ainda não foram criadas no banco de dados. Entre em contato com o suporte.";
        } else if (error.message.includes('Usuário não autenticado')) {
          errorMessage = "Você precisa estar logado para criar um plano de treino.";
        }
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredExercises = exercises.filter(exercise =>
    exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exercise.muscle_group.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDifficultyText = (level: number) => {
    const levels = ['', 'Iniciante', 'Básico', 'Intermediário', 'Avançado', 'Expert'];
    return levels[level] || 'Desconhecido';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-health-50 via-white to-health-100">
      <div className="container mx-auto px-4 py-6 lg:py-8 max-w-5xl">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-health p-6 mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  Criar Ficha de Treino
                </h1>
                <p className="text-gray-600">
                  Monte seu plano de treino personalizado com exercícios específicos
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulário Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações do Plano */}
            <Card className="glass-effect shadow-health">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-health-500" />
                  Informações do Plano
                </CardTitle>
                <CardDescription>
                  Defina os detalhes básicos do seu plano de treino
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="planName">Nome do Plano</Label>
                    <Input
                      id="planName"
                      placeholder="Ex: Treino para Iniciantes"
                      value={planName}
                      onChange={(e) => setPlanName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="planGoal">Objetivo</Label>
                    <Select value={planGoal} onValueChange={setPlanGoal}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o objetivo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="strength">Força</SelectItem>
                        <SelectItem value="endurance">Resistência</SelectItem>
                        <SelectItem value="weight_loss">Perda de Peso</SelectItem>
                        <SelectItem value="muscle_gain">Ganho de Massa</SelectItem>
                        <SelectItem value="general_fitness">Condicionamento Geral</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="planDuration">Duração (semanas)</Label>
                    <Input
                      id="planDuration"
                      type="number"
                      min="1"
                      max="52"
                      value={planDuration}
                      onChange={(e) => setPlanDuration(parseInt(e.target.value) || 4)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="planDifficulty">Nível de Dificuldade</Label>
                    <Select value={planDifficulty.toString()} onValueChange={(value) => setPlanDifficulty(parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 - Iniciante</SelectItem>
                        <SelectItem value="2">2 - Básico</SelectItem>
                        <SelectItem value="3">3 - Intermediário</SelectItem>
                        <SelectItem value="4">4 - Avançado</SelectItem>
                        <SelectItem value="5">5 - Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="planDescription">Descrição</Label>
                  <Textarea
                    id="planDescription"
                    placeholder="Descreva o plano de treino..."
                    value={planDescription}
                    onChange={(e) => setPlanDescription(e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Adicionar Exercícios */}
            <Card className="glass-effect shadow-health">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-health-500" />
                  Exercícios
                </CardTitle>
                <CardDescription>
                  Adicione e configure os exercícios do seu plano
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="searchExercise">Buscar Exercício</Label>
                  <Input
                    id="searchExercise"
                    placeholder="Digite o nome do exercício ou grupo muscular..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {searchTerm && (
                  <div className="max-h-48 overflow-y-auto border rounded-lg">
                    {filteredExercises.slice(0, 10).map((exercise) => (
                      <div
                        key={exercise.id}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                        onClick={() => addExercise(exercise)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{exercise.name}</p>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="secondary">{exercise.muscle_group}</Badge>
                              <Badge variant="outline">{getDifficultyText(Number(exercise.difficulty_level) || 1)}</Badge>
                            </div>
                          </div>
                          <Plus className="w-4 h-4 text-health-500" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Exercícios Selecionados */}
                <div className="space-y-3">
                  <h4 className="font-medium">Exercícios do Plano:</h4>
                  {selectedExercises.length === 0 ? (
                    <p className="text-gray-500 text-sm">Nenhum exercício adicionado ainda</p>
                  ) : (
                    selectedExercises.map((item, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-medium">{item.exercise.name}</p>
                            <Badge variant="secondary" className="text-xs">{item.exercise.muscle_group}</Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeExercise(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div>
                            <Label className="text-xs">Séries</Label>
                            <Input
                              type="number"
                              min="1"
                              value={item.sets}
                              onChange={(e) => updateExercise(index, 'sets', parseInt(e.target.value) || 1)}
                              className="h-8"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Repetições</Label>
                            <Input
                              type="number"
                              min="1"
                              value={item.reps}
                              onChange={(e) => updateExercise(index, 'reps', parseInt(e.target.value) || 1)}
                              className="h-8"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Peso (kg)</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.5"
                              value={item.weight || ''}
                              onChange={(e) => updateExercise(index, 'weight', parseFloat(e.target.value) || 0)}
                              className="h-8"
                              placeholder="Opcional"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Descanso (s)</Label>
                            <Input
                              type="number"
                              min="0"
                              value={item.rest}
                              onChange={(e) => updateExercise(index, 'rest', parseInt(e.target.value) || 60)}
                              className="h-8"
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Resumo do Plano */}
          <div className="space-y-6">
            <Card className="glass-effect shadow-health sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-health-500" />
                  Resumo do Plano
                </CardTitle>
                <CardDescription>
                  Informações do seu plano de treino
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total de Exercícios:</span>
                    <span className="font-medium">{selectedExercises.length}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Duração:</span>
                    <span className="font-medium">{planDuration} semanas</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Dificuldade:</span>
                    <span className="font-medium">{getDifficultyText(planDifficulty)}</span>
                  </div>

                  {selectedExercises.length > 0 && (
                    <div className="pt-3 border-t">
                      <p className="text-sm text-gray-600 mb-2">Grupos Musculares:</p>
                      <div className="flex flex-wrap gap-1">
                        {Array.from(new Set(selectedExercises.map(item => item.exercise.muscle_group))).map(group => (
                          <Badge key={group} variant="outline" className="text-xs">
                            {group}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  onClick={saveWorkoutPlan}
                  disabled={loading || !planName.trim() || selectedExercises.length === 0}
                  className="w-full health-gradient shadow-health hover:shadow-lg transition-all"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Salvando...
                    </div>
                  ) : (
                    <>
                      <Dumbbell className="w-4 h-4 mr-2" />
                      Salvar Plano de Treino
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateWorkoutPlan;
