import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Book, 
  Plus, 
  TrendingUp, 
  MoreHorizontal,
  Target,
  Calendar,
  Camera,
  Settings,
  CreditCard,
  LogOut,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MobileNavigationProps {
  className?: string;
}

const MobileNavigation = ({ className }: MobileNavigationProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast({
        title: t('notifications.dashboard.error'),
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

  const moreOptions = [
    {
      label: t('dashboard.goal'),
      icon: Target,
      action: () => navigate('/goals'),
    },
    {
      label: t('dashboard.planning'),
      icon: Calendar,
      action: () => navigate('/planning'),
    },
    {
      label: t('dashboard.progress.progress_photos'),
      icon: Camera,
      action: () => navigate('/progress-photos'),
    },
    {
      label: t('dashboard.settings'),
      icon: Settings,
      action: () => navigate('/settings'),
    },
    {
      label: t('dashboard.subscription'),
      icon: CreditCard,
      action: () => navigate('/subscription'),
    },
    {
      label: "Sair",
      icon: LogOut,
      action: handleLogout,
      variant: "destructive" as const,
    },
  ];

  const navItems = [
    {
      label: t('dashboard.dashboard'),
      icon: Home,
      path: "/dashboard",
      action: () => navigate('/dashboard'),
    },
    {
      label: t('dashboard.diary'),
      icon: Book,
      path: "/diary",
      action: () => navigate('/diary'),
    },
    {
      label: "",
      icon: Plus,
      path: "/add",
      action: () => navigate('/create-meal'),
      isCenter: true,
    },
    {
      label: t('dashboard.progress.title'),
      icon: TrendingUp,
      path: "/progress",
      action: () => navigate('/detailed-reports'),
    },
    {
      label: t('dashboard.more'),
      icon: MoreHorizontal,
      path: "/more",
      action: () => setIsMoreOpen(true),
    },
  ];

  return (
    <>
      {/* Mobile Navigation - Fixed Bottom */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-health-200/50 dark:border-slate-700/50 shadow-lg md:hidden",
        className
      )}>
        <div className="flex items-center justify-around px-2 py-2 safe-area-bottom">
          {navItems.map((item, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              onClick={item.action}
              className={cn(
                "flex flex-col items-center gap-1 h-16 w-16 p-1 rounded-xl transition-all duration-200",
                item.isCenter 
                  ? "health-gradient text-white shadow-health -mt-4 h-14 w-14 rounded-full hover:scale-105"
                  : isActive(item.path) 
                    ? "text-health-600 bg-health-50 dark:bg-health-900/20" 
                    : "text-slate-600 dark:text-slate-400 hover:text-health-600 hover:bg-health-50/50"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5",
                item.isCenter && "w-6 h-6"
              )} />
              {!item.isCenter && (
                <span className="text-xs font-medium leading-none">
                  {item.label}
                </span>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* More Options Sheet */}
      <Sheet open={isMoreOpen} onOpenChange={setIsMoreOpen}>
        <SheetContent 
          side="bottom" 
          className="h-auto max-h-[80vh] rounded-t-3xl border-0 p-0"
        >
          <SheetHeader className="p-6 pb-4">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl font-bold text-primary-dark">
                Mais Opções
              </SheetTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMoreOpen(false)}
                className="h-8 w-8 p-0 rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </SheetHeader>
          
          <div className="px-6 pb-6 space-y-2">
            {moreOptions.map((option, index) => (
              <Button
                key={index}
                variant={option.variant === "destructive" ? "destructive" : "ghost"}
                className={cn(
                  "w-full justify-start h-12 text-left",
                  option.variant !== "destructive" && "hover:bg-health-50 dark:hover:bg-health-900/20"
                )}
                onClick={() => {
                  option.action();
                  setIsMoreOpen(false);
                }}
              >
                <option.icon className="w-5 h-5 mr-3" />
                {option.label}
              </Button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default MobileNavigation;
