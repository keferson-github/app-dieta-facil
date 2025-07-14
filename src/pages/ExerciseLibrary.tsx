import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Search, Dumbbell, Play, Clock, Target, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type Exercise = Tables<"exercises">;

const ExerciseLibrary = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [loading, setLoading] = useState(true);

  const loadExercises = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setExercises(data || []);
      setFilteredExercises(data || []);
    } catch (error) {
      console.error('Erro ao carregar exercícios:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os exercícios.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadExercises();
  }, [loadExercises]);

  useEffect(() => {
    let filtered = exercises;

    // Filtrar por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(exercise =>
        exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.instructions?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.muscle_group.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por grupo muscular
    if (selectedMuscleGroup !== "all") {
      filtered = filtered.filter(exercise => exercise.muscle_group === selectedMuscleGroup);
    }

    // Filtrar por dificuldade
    if (selectedDifficulty !== "all") {
      filtered = filtered.filter(exercise => Number(exercise.difficulty_level) === parseInt(selectedDifficulty));
    }

    // Filtrar por tipo
    if (selectedType !== "all") {
      filtered = filtered.filter(exercise => exercise.category === selectedType);
    }

    setFilteredExercises(filtered);
  }, [exercises, searchTerm, selectedMuscleGroup, selectedDifficulty, selectedType]);

  const getDifficultyText = (level: number) => {
    const levels = ['', 'Iniciante', 'Básico', 'Intermediário', 'Avançado', 'Expert'];
    return levels[level] || 'Desconhecido';
  };

  const getDifficultyColor = (level: number) => {
    const colors = ['', 'green', 'blue', 'yellow', 'orange', 'red'];
    return colors[level] || 'gray';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'strength': return <Dumbbell className="w-4 h-4" />;
      case 'cardio': return <Zap className="w-4 h-4" />;
      case 'flexibility': return <Target className="w-4 h-4" />;
      case 'compound': return <Play className="w-4 h-4" />;
      default: return <Dumbbell className="w-4 h-4" />;
    }
  };

  const getTypeText = (type: string) => {
    const types: Record<string, string> = {
      'strength': 'Força',
      'cardio': 'Cardio',
      'flexibility': 'Flexibilidade',
      'compound': 'Composto'
    };
    return types[type] || type;
  };

  const uniqueMuscleGroups = Array.from(new Set(exercises.map(ex => ex.muscle_group)));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-health-50 via-white to-health-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-health-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-health-600">Carregando exercícios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-health-50 via-white to-health-100">
      <div className="container mx-auto px-4 py-6 lg:py-8 max-w-6xl">
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
                  Biblioteca de Exercícios
                </h1>
                <p className="text-gray-600">
                  Explore nossa coleção completa de exercícios para casa e academia
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <Card className="glass-effect shadow-health mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-health-500" />
              Filtros de Busca
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Buscar Exercício</label>
                <Input
                  placeholder="Nome do exercício..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Grupo Muscular</label>
                <Select value={selectedMuscleGroup} onValueChange={setSelectedMuscleGroup}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {uniqueMuscleGroups.map(group => (
                      <SelectItem key={group} value={group}>{group}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Dificuldade</label>
                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="1">Iniciante</SelectItem>
                    <SelectItem value="2">Básico</SelectItem>
                    <SelectItem value="3">Intermediário</SelectItem>
                    <SelectItem value="4">Avançado</SelectItem>
                    <SelectItem value="5">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="strength">Força</SelectItem>
                    <SelectItem value="cardio">Cardio</SelectItem>
                    <SelectItem value="flexibility">Flexibilidade</SelectItem>
                    <SelectItem value="compound">Composto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resultados */}
        <div className="mb-6">
          <p className="text-gray-600">
            Mostrando {filteredExercises.length} de {exercises.length} exercícios
          </p>
        </div>

        {/* Lista de Exercícios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExercises.map((exercise) => (
            <Card key={exercise.id} className="glass-effect shadow-health hover:shadow-lg transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                      {exercise.name}
                    </CardTitle>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {exercise.muscle_group}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`text-xs border-${getDifficultyColor(Number(exercise.difficulty_level) || 1)}-500 text-${getDifficultyColor(Number(exercise.difficulty_level) || 1)}-700`}
                      >
                        {getDifficultyText(Number(exercise.difficulty_level) || 1)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-health-500">
                    {getTypeIcon(exercise.category || 'strength')}
                    <span className="text-xs text-gray-500">
                      {getTypeText(exercise.category || 'strength')}
                    </span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {exercise.instructions && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {exercise.instructions}
                  </p>
                )}
                
                {exercise.equipment_needed && (
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Equipamento: {exercise.equipment_needed}
                    </span>
                  </div>
                )}

                {exercise.instructions && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Como fazer:</h4>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {exercise.instructions}
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      toast({
                        title: "Exercício selecionado",
                        description: `${exercise.name} - Recurso em desenvolvimento`,
                      });
                    }}
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Ver Detalhes
                  </Button>
                  <Button 
                    size="sm" 
                    className="health-gradient"
                    onClick={() => {
                      toast({
                        title: "Adicionado ao treino",
                        description: `${exercise.name} - Recurso em desenvolvimento`,
                      });
                    }}
                  >
                    <Dumbbell className="w-4 h-4 mr-1" />
                    Usar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredExercises.length === 0 && (
          <Card className="glass-effect shadow-health">
            <CardContent className="text-center py-8">
              <Dumbbell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum exercício encontrado
              </h3>
              <p className="text-gray-600">
                Tente ajustar os filtros de busca para encontrar exercícios
              </p>
            </CardContent>
          </Card>
        )}

        {/* Botão Criar Plano */}
        <div className="fixed bottom-6 right-6">
          <Button
            onClick={() => navigate('/create-workout-plan')}
            size="lg"
            className="health-gradient shadow-lg hover:shadow-xl transition-all rounded-full"
          >
            <Dumbbell className="w-5 h-5 mr-2" />
            Criar Plano de Treino
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExerciseLibrary;
