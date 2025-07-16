import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Apple,
  LayoutDashboard,
  ChefHat,
  Dumbbell,
  TrendingUp,
  Target,
  Calendar,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Heart,
  BarChart3,
  Camera,
  Ruler,
  Trophy,
  Zap,
  CreditCard,
  User,
  History,
  BookOpen,
  Activity,
  FileText,
  Award
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const Sidebar = ({ collapsed, onToggle }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { toast } = useToast();
  const { subscription } = useSubscription();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast({
        title: t('dashboard.logout_error'),
        description: t('dashboard.logout_error_desc'),
        variant: "destructive",
      });
    } else {
      toast({
        title: t('dashboard.logout_success'),
        description: t('dashboard.logout_success_desc'),
      });
      navigate('/');
    }
  };

  const currentPlan = subscription?.plan || 'Nutri';

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      category: 'main',
      description: 'Visão geral dos seus dados'
    },
    {
      id: 'nutrition',
      label: 'Nutrição',
      icon: ChefHat,
      path: '/create-meal',
      category: 'nutrition',
      description: 'Gerencie suas refeições',
      submenu: [
        { 
          id: 'create-meal', 
          label: 'Criar Refeição', 
          icon: ChefHat,
          path: '/create-meal', 
          plan: 'Nutri',
          description: 'Registre uma nova refeição'
        },
        { 
          id: 'weekly-menu', 
          label: 'Cardápio Semanal', 
          icon: Calendar,
          path: '/weekly-menu', 
          plan: 'Nutri',
          description: 'Planeje suas refeições da semana'
        },
        { 
          id: 'meal-history', 
          label: 'Histórico de Refeições', 
          icon: History,
          path: '/meal-history', 
          plan: 'Nutri',
          description: 'Veja suas refeições anteriores'
        }
      ]
    },
    {
      id: 'exercises',
      label: 'Exercícios',
      icon: Dumbbell,
      path: '/exercise-library',
      category: 'fitness',
      description: 'Seus treinos e exercícios',
      submenu: [
        { 
          id: 'exercise-library', 
          label: 'Biblioteca de Exercícios', 
          icon: BookOpen,
          path: '/exercise-library', 
          plan: 'Energia',
          description: 'Explore exercícios disponíveis'
        },
        { 
          id: 'workout-plans', 
          label: 'Planos de Treino', 
          icon: FileText,
          path: '/create-workout-plan', 
          plan: 'Energia',
          description: 'Crie e gerencie seus treinos'
        },
        { 
          id: 'workout-history', 
          label: 'Histórico de Treinos', 
          icon: History,
          path: '/workout-history', 
          plan: 'Energia',
          description: 'Veja seus treinos anteriores'
        }
      ]
    },
    {
      id: 'progress',
      label: 'Progresso',
      icon: TrendingUp,
      path: '/detailed-reports',
      category: 'tracking',
      description: 'Acompanhe sua evolução',
      submenu: [
        { 
          id: 'detailed-reports', 
          label: 'Relatórios Detalhados', 
          icon: BarChart3,
          path: '/detailed-reports', 
          plan: 'Performance',
          description: 'Análises completas do seu progresso'
        },
        { 
          id: 'body-measurements', 
          label: 'Medidas Corporais', 
          icon: Ruler,
          path: '/body-measurements', 
          plan: 'Performance',
          description: 'Registre suas medidas corporais'
        },
        { 
          id: 'progress-photos', 
          label: 'Fotos de Progresso', 
          icon: Camera,
          path: '/progress-photos', 
          plan: 'Performance',
          description: 'Compare sua evolução visual'
        },
        { 
          id: 'achievements', 
          label: 'Conquistas', 
          icon: Award,
          path: '/achievements', 
          plan: 'Nutri',
          description: 'Suas conquistas e medalhas'
        }
      ]
    },
    {
      id: 'goals',
      label: 'Metas',
      icon: Target,
      path: '/goals',
      category: 'planning',
      description: 'Defina e acompanhe objetivos'
    },
    {
      id: 'calendar',
      label: 'Calendário',
      icon: Calendar,
      path: '/calendar',
      category: 'planning',
      description: 'Visualize suas atividades'
    }
  ];

  const bottomMenuItems = [
    {
      id: 'subscription',
      label: 'Assinatura',
      icon: CreditCard,
      path: '/subscription',
      category: 'account',
      description: 'Gerencie sua assinatura'
    },
    {
      id: 'profile',
      label: 'Perfil',
      icon: User,
      path: '/profile',
      category: 'account',
      description: 'Suas informações pessoais'
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: Settings,
      path: '/settings',
      category: 'account',
      description: 'Ajustes do aplicativo'
    }
  ];

  const [expandedMenus, setExpandedMenus] = useState<string[]>(['nutrition', 'exercises', 'progress']);

  const toggleSubmenu = (menuId: string) => {
    if (collapsed) return;
    setExpandedMenus(prev => 
      prev.includes(menuId) 
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  const isActive = (path: string) => location.pathname === path;

  const hasAccess = (requiredPlan: string) => {
    if (requiredPlan === 'Nutri') return true;
    if (!subscription?.subscribed) return false;
    
    const planHierarchy = ['Nutri', 'Energia', 'Performance'];
    const currentIndex = planHierarchy.indexOf(currentPlan);
    const requiredIndex = planHierarchy.indexOf(requiredPlan);
    
    return currentIndex >= requiredIndex;
  };

  const handleMenuClick = (item: any) => {
    if (item.plan && !hasAccess(item.plan)) {
      toast({
        title: t('dashboard.premium_feature'),
        description: t('dashboard.premium_description', { plan: item.plan }),
        variant: "destructive",
      });
      return;
    }
    navigate(item.path);
  };

  return (
    <TooltipProvider>
      <div className={`hidden lg:flex flex-col bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-r border-health-200/50 dark:border-slate-700/50 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} h-screen sticky top-0 z-50`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-health-200/50 dark:border-slate-700/50">
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 health-gradient rounded-lg flex items-center justify-center shadow-sm">
                <Apple className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-primary-dark text-lg">Dieta Fácil</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="health-gradient text-white border-0 text-xs px-2 py-0.5">
                    {currentPlan}
                  </Badge>
                  {subscription?.subscribed && (
                    <Badge variant="outline" className="border-health-200 text-health-700 text-xs px-2 py-0.5">
                      <Heart className="w-2 h-2 mr-1" />
                      Ativo
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-8 h-8 health-gradient rounded-lg flex items-center justify-center shadow-sm mx-auto">
                  <Apple className="w-5 h-5 text-white" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="font-semibold">Dieta Fácil</p>
                <p className="text-xs text-gray-500">Plano {currentPlan}</p>
              </TooltipContent>
            </Tooltip>
          )}
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="h-8 w-8 p-0 hover:bg-health-50 dark:hover:bg-slate-800 transition-colors"
              >
                {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{collapsed ? 'Expandir sidebar' : 'Recolher sidebar'}</p>
            </TooltipContent>
          </Tooltip>
        </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {menuItems.map((item) => (
            <div key={item.id}>
              {collapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={isActive(item.path) ? "secondary" : "ghost"}
                      className={`w-full justify-center h-10 px-2 ${
                        isActive(item.path) 
                          ? 'bg-health-50 dark:bg-health-900/20 text-health-700 dark:text-health-400 border-r-2 border-health-500' 
                          : 'hover:bg-health-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300'
                      }`}
                      onClick={() => {
                        if (item.submenu) {
                          // No modo colapsado, navegar para o primeiro item do submenu
                          const firstAccessibleItem = item.submenu.find(subItem => hasAccess(subItem.plan));
                          if (firstAccessibleItem) {
                            navigate(firstAccessibleItem.path);
                          }
                        } else {
                          navigate(item.path);
                        }
                      }}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <div className="space-y-1">
                      <p className="font-semibold">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.description}</p>
                      {item.submenu && (
                        <div className="mt-2 space-y-1">
                          {item.submenu.map((subItem) => (
                            <div key={subItem.id} className="flex items-center gap-2 text-xs">
                              <subItem.icon className="w-3 h-3" />
                              <span className={!hasAccess(subItem.plan) ? 'text-gray-400' : ''}>{subItem.label}</span>
                              {!hasAccess(subItem.plan) && <Zap className="w-3 h-3 text-yellow-500" />}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Button
                  variant={isActive(item.path) ? "secondary" : "ghost"}
                  className={`w-full justify-start h-10 px-3 ${
                    isActive(item.path) 
                      ? 'bg-health-50 dark:bg-health-900/20 text-health-700 dark:text-health-400 border-r-2 border-health-500' 
                      : 'hover:bg-health-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300'
                  }`}
                  onClick={() => {
                    if (item.submenu) {
                      toggleSubmenu(item.id);
                    } else {
                      navigate(item.path);
                    }
                  }}
                >
                  <item.icon className="w-4 h-4 mr-3 flex-shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.submenu && (
                    <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${expandedMenus.includes(item.id) ? 'rotate-90' : ''}`} />
                  )}
                </Button>
              )}

              {/* Submenu - Only show when expanded */}
              {item.submenu && !collapsed && expandedMenus.includes(item.id) && (
                <div className="ml-4 mt-1 space-y-1 border-l border-health-200/30 dark:border-slate-700/30 pl-3">
                  {item.submenu.map((subItem) => (
                    <Button
                      key={subItem.id}
                      variant={isActive(subItem.path) ? "secondary" : "ghost"}
                      className={`w-full justify-start h-8 px-3 text-sm transition-all duration-200 ${
                        isActive(subItem.path)
                          ? 'bg-health-100 dark:bg-health-900/30 text-health-700 dark:text-health-400 shadow-sm'
                          : 'hover:bg-health-50 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-400'
                      } ${!hasAccess(subItem.plan) ? 'opacity-60' : ''}`}
                      onClick={() => handleMenuClick(subItem)}
                    >
                      <subItem.icon className="w-3 h-3 mr-2 flex-shrink-0" />
                      <span className="flex-1 text-left">{subItem.label}</span>
                      {!hasAccess(subItem.plan) && (
                        <Zap className="w-3 h-3 text-yellow-500 animate-pulse" />
                      )}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-health-200/50 dark:border-slate-700/50 p-3 space-y-1">
        {bottomMenuItems.map((item) => (
          collapsed ? (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <Button
                  variant={isActive(item.path) ? "secondary" : "ghost"}
                  className={`w-full justify-center h-10 px-2 ${
                    isActive(item.path)
                      ? 'bg-health-50 dark:bg-health-900/20 text-health-700 dark:text-health-400'
                      : 'hover:bg-health-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300'
                  }`}
                  onClick={() => navigate(item.path)}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <div className="space-y-1">
                  <p className="font-semibold">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.description}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button
              key={item.id}
              variant={isActive(item.path) ? "secondary" : "ghost"}
              className={`w-full justify-start h-10 px-3 transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-health-50 dark:bg-health-900/20 text-health-700 dark:text-health-400'
                  : 'hover:bg-health-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300'
              }`}
              onClick={() => navigate(item.path)}
            >
              <item.icon className="w-4 h-4 mr-3 flex-shrink-0" />
              <span className="flex-1 text-left">{item.label}</span>
            </Button>
          )
        ))}

        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-center h-10 px-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-all duration-200"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <div className="space-y-1">
                <p className="font-semibold">Sair</p>
                <p className="text-xs text-gray-500">Fazer logout da conta</p>
              </div>
            </TooltipContent>
          </Tooltip>
        ) : (
          <Button
            variant="ghost"
            className="w-full justify-start h-10 px-3 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-all duration-200"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-3 flex-shrink-0" />
            <span className="flex-1 text-left">Sair</span>
          </Button>
        )}
      </div>
      </div>
    </TooltipProvider>
  );
};

export default Sidebar;