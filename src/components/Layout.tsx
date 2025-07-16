import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Apple, Heart } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useIsMobile } from "@/hooks/use-mobile";
import Sidebar from "@/components/Sidebar";
import MobileNavigation from "@/components/MobileNavigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  showPricingButton?: boolean;
  onShowPricing?: () => void;
}

const Layout = ({ 
  children, 
  title = "Dashboard", 
  description = "Gerencie sua jornada fitness",
  showPricingButton = false,
  onShowPricing 
}: LayoutProps) => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { subscription } = useSubscription();

  const currentPlan = subscription?.plan || 'Nutri';

  return (
    <>
      {/* Desktop Layout with Sidebar */}
      <div className="hidden lg:flex min-h-screen bg-gradient-to-br from-health-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Sidebar 
          collapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
        
        {/* Main Content Area */}
        <div className="flex-1 transition-all duration-300">
          {/* Desktop Header */}
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border-b border-white/20 dark:border-slate-800/20 shadow-sm">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-primary-dark">
                    {title}
                  </h1>
                  <p className="text-secondary-dark mt-1">
                    {description}
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  {showPricingButton && !subscription?.subscribed && (
                    <Button 
                      onClick={onShowPricing}
                      className="health-gradient shadow-health hover:shadow-lg transition-all"
                      size="sm"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      {t('dashboard.subscription')}
                    </Button>
                  )}
                  <LanguageSwitcher fixed={false} />
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </div>

          {/* Page Content */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Layout */}
      <div className="lg:hidden min-h-screen bg-gradient-to-br from-health-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pb-20">
        {/* Mobile Header */}
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-health-200/50 dark:border-slate-700/50 sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 health-gradient rounded-xl flex items-center justify-center shadow-lg">
                  <Apple className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-primary-dark">
                    {title}
                  </h1>
                  <div className="flex items-center gap-2">
                    <Badge className="health-gradient text-white border-0 text-xs">
                      Plano {currentPlan}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {showPricingButton && !subscription?.subscribed && (
                  <Button 
                    onClick={onShowPricing}
                    size="sm"
                    className="health-gradient shadow-health h-8 px-3 text-xs"
                  >
                    <Zap className="w-3 h-3 mr-1" />
                    Premium
                  </Button>
                )}
                <LanguageSwitcher fixed={false} />
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Content */}
        <div className="container mx-auto px-4 py-6">
          {children}
        </div>

        {/* Mobile Navigation */}
        <MobileNavigation />
      </div>
    </>
  );
};

export default Layout;