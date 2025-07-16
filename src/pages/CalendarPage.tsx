import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Apple,
  Dumbbell,
  Target,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";

interface CalendarEvent {
  id: string;
  title: string;
  type: 'meal' | 'workout' | 'goal' | 'reminder';
  date: string;
  time?: string;
  completed: boolean;
  description?: string;
}

const CalendarPage = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCalendarEvents();
  }, [currentDate]);

  const loadCalendarEvents = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      // Load meal logs
      const { data: mealLogs } = await supabase
        .from('meal_logs')
        .select('id, meal_name, logged_at')
        .eq('user_id', session.user.id)
        .gte('logged_at', startOfMonth.toISOString())
        .lte('logged_at', endOfMonth.toISOString());

      // Load workout logs
      const { data: workoutLogs } = await supabase
        .from('workout_logs')
        .select('id, workout_name, logged_at')
        .eq('user_id', session.user.id)
        .gte('logged_at', startOfMonth.toISOString())
        .lte('logged_at', endOfMonth.toISOString());

      // Load goals with target dates
      const { data: goals } = await supabase
        .from('user_goals')
        .select('id, title, target_date, status')
        .eq('user_id', session.user.id)
        .gte('target_date', startOfMonth.toISOString().split('T')[0])
        .lte('target_date', endOfMonth.toISOString().split('T')[0]);

      const calendarEvents: CalendarEvent[] = [];

      // Add meal events
      (mealLogs || []).forEach(meal => {
        calendarEvents.push({
          id: `meal-${meal.id}`,
          title: meal.meal_name,
          type: 'meal',
          date: meal.logged_at.split('T')[0],
          time: new Date(meal.logged_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          completed: true
        });
      });

      // Add workout events
      (workoutLogs || []).forEach(workout => {
        calendarEvents.push({
          id: `workout-${workout.id}`,
          title: workout.workout_name,
          type: 'workout',
          date: workout.logged_at.split('T')[0],
          time: new Date(workout.logged_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          completed: true
        });
      });

      // Add goal events
      (goals || []).forEach(goal => {
        calendarEvents.push({
          id: `goal-${goal.id}`,
          title: goal.title,
          type: 'goal',
          date: goal.target_date,
          completed: goal.status === 'completed',
          description: `Meta: ${goal.title}`
        });
      });

      setEvents(calendarEvents);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os eventos do calendário",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getEventsForDate = (date: string) => {
    return events.filter(event => event.date === date);
  };

  const getEventIcon = (type: string) => {
    const icons = {
      meal: Apple,
      workout: Dumbbell,
      goal: Target,
      reminder: Clock
    };
    return icons[type as keyof typeof icons] || Clock;
  };

  const getEventColor = (type: string) => {
    const colors = {
      meal: "text-green-500 bg-green-100",
      workout: "text-blue-500 bg-blue-100",
      goal: "text-purple-500 bg-purple-100",
      reminder: "text-orange-500 bg-orange-100"
    };
    return colors[type as keyof typeof colors] || "text-gray-500 bg-gray-100";
  };

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfMonth = getFirstDayOfMonth(currentDate);
  const today = new Date().toISOString().split('T')[0];
  const selectedDateStr = selectedDate.toISOString().split('T')[0];
  const selectedEvents = getEventsForDate(selectedDateStr);

  if (loading) {
    return (
      <Layout title="Calendário" description="Carregando seus eventos...">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 health-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-health-500 mx-auto mb-4"></div>
            <p className="text-lg font-medium text-secondary-dark">Carregando calendário...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout 
      title="📅 Calendário" 
      description="Acompanhe suas atividades e metas"
    >
      <div className="max-w-7xl mx-auto">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card className="glass-effect">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {dayNames.map(day => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                  {/* Empty cells for days before month starts */}
                  {Array.from({ length: firstDayOfMonth }, (_, i) => (
                    <div key={`empty-${i}`} className="p-2 h-24"></div>
                  ))}

                  {/* Days of the month */}
                  {Array.from({ length: daysInMonth }, (_, i) => {
                    const day = i + 1;
                    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const dayEvents = getEventsForDate(dateStr);
                    const isToday = dateStr === today;
                    const isSelected = dateStr === selectedDateStr;

                    return (
                      <div
                        key={day}
                        className={`p-2 h-24 border rounded-lg cursor-pointer transition-all hover:bg-health-50 ${
                          isToday ? 'bg-health-100 border-health-300' : 'border-gray-200'
                        } ${
                          isSelected ? 'ring-2 ring-health-500' : ''
                        }`}
                        onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                      >
                        <div className={`text-sm font-medium mb-1 ${isToday ? 'text-health-700' : 'text-gray-700'}`}>
                          {day}
                        </div>
                        <div className="space-y-1">
                          {dayEvents.slice(0, 2).map(event => {
                            const IconComponent = getEventIcon(event.type);
                            return (
                              <div
                                key={event.id}
                                className={`flex items-center gap-1 px-1 py-0.5 rounded text-xs ${getEventColor(event.type)}`}
                              >
                                <IconComponent className="w-3 h-3" />
                                <span className="truncate">{event.title}</span>
                              </div>
                            );
                          })}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-gray-500 px-1">
                              +{dayEvents.length - 2} mais
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Events Panel */}
          <div className="space-y-6">
            {/* Selected Date Events */}
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="text-lg">
                  {selectedDate.toLocaleDateString('pt-BR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </CardTitle>
                <CardDescription>
                  {selectedEvents.length} evento(s) neste dia
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">Nenhum evento neste dia</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedEvents.map(event => {
                      const IconComponent = getEventIcon(event.type);
                      return (
                        <div key={event.id} className="flex items-start gap-3 p-3 bg-white/50 rounded-lg">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getEventColor(event.type)}`}>
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-primary-dark">{event.title}</h4>
                              {event.completed ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-orange-500" />
                              )}
                            </div>
                            {event.time && (
                              <p className="text-sm text-gray-500">{event.time}</p>
                            )}
                            {event.description && (
                              <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="text-lg">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => navigate('/create-meal')}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Apple className="w-4 h-4 mr-2" />
                  Registrar Refeição
                </Button>
                <Button 
                  onClick={() => navigate('/create-workout-plan')}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Dumbbell className="w-4 h-4 mr-2" />
                  Registrar Treino
                </Button>
                <Button 
                  onClick={() => navigate('/goals')}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Criar Meta
                </Button>
              </CardContent>
            </Card>

            {/* Monthly Summary */}
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="text-lg">Resumo do Mês</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Refeições registradas</span>
                    <span className="font-semibold text-green-600">
                      {events.filter(e => e.type === 'meal').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Treinos realizados</span>
                    <span className="font-semibold text-blue-600">
                      {events.filter(e => e.type === 'workout').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Metas com prazo</span>
                    <span className="font-semibold text-purple-600">
                      {events.filter(e => e.type === 'goal').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CalendarPage;