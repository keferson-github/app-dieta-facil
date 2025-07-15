import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import ReactCountryFlag from 'react-country-flag';
import { useIsMobile } from '@/hooks/use-mobile';

interface LanguageSwitcherProps {
  fixed?: boolean;
}

// Hook customizado para detectar mobile/tablet
const useIsMobileOrTablet = () => {
  const [isMobileOrTablet, setIsMobileOrTablet] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia('(max-width: 1023px)');
    const onChange = () => {
      setIsMobileOrTablet(window.innerWidth < 1024);
    };
    mql.addEventListener('change', onChange);
    setIsMobileOrTablet(window.innerWidth < 1024);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return !!isMobileOrTablet;
};

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ fixed = true }) => {
  const { i18n, t } = useTranslation();
  const isMobile = useIsMobile();
  const isMobileOrTablet = useIsMobileOrTablet();
  const [open, setOpen] = useState(false);

  const changeLanguage = (lng: string) => {
    console.log('Changing language to:', lng);
    i18n.changeLanguage(lng).then(() => {
      console.log('Language changed successfully to:', lng);
      localStorage.setItem('i18nextLng', lng);
      setOpen(false); // Fechar modal após seleção
    }).catch((error) => {
      console.error('Error changing language:', error);
    });
  };

  const languages = [
    { code: 'pt', label: 'Português', countryCode: 'BR' },
    { code: 'en', label: 'English', countryCode: 'US' },
    { code: 'es', label: 'Español', countryCode: 'ES' }
  ];

  const getCurrentLanguage = () => {
    const current = languages.find(lang => lang.code === i18n.language);
    return current || { code: 'pt', label: 'Idioma', countryCode: 'BR' };
  };

  console.log('Current language:', i18n.language);
  console.log('Available languages:', Object.keys(i18n.store.data));

  const containerClass = fixed ? "fixed top-4 right-4 z-50" : "";

  const triggerButton = (
    <Button
      variant="outline"
      className={`flex items-center gap-2 px-3 py-1.5 bg-white/70 backdrop-blur-sm shadow-sm hover:bg-white/90 transition-colors border ${
        isMobileOrTablet ? 'rounded-[10px] p-2 w-10 h-10' : 'rounded-[10px]'
      }`}
    >
      <ReactCountryFlag 
        countryCode={getCurrentLanguage().countryCode} 
        svg 
        style={{ width: '1.2em', height: '1.2em' }}
      />
      {!isMobileOrTablet && (
        <span className="text-sm font-semibold text-gray-600">
          {getCurrentLanguage().label}
        </span>
      )}
    </Button>
  );

  // Renderizar modal para todos os dispositivos (mobile, tablet, desktop)
  return (
    <div className={containerClass}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {triggerButton}
        </DialogTrigger>
        <DialogContent className={`${isMobile ? 'max-w-xs' : 'max-w-sm'} rounded-[10px]`}>
          <DialogHeader>
            <DialogTitle className="text-center">
              {isMobile ? t('dashboard.language.language') : t('dashboard.language.selectLanguage')}
            </DialogTitle>
          </DialogHeader>
          <div className={`space-y-2 ${isMobile ? 'pt-2' : 'pt-4'}`}>
            {languages.map(({ code, label, countryCode }) => (
              <Button
                key={code}
                variant={code === i18n.language ? "default" : "ghost"}
                onClick={() => changeLanguage(code)}
                className={`w-full justify-start gap-3 ${isMobile ? 'h-10' : 'h-12'} ${
                  code === i18n.language 
                    ? 'health-gradient text-white' 
                    : 'hover:bg-health-50'
                }`}
              >
                <ReactCountryFlag 
                  countryCode={countryCode} 
                  svg 
                  style={{ 
                    width: isMobile ? '1.2em' : '1.5em', 
                    height: isMobile ? '1.2em' : '1.5em' 
                  }}
                />
                <span className={`flex-1 text-left ${isMobile ? 'text-sm' : ''}`}>
                  {label}
                </span>
                {code === i18n.language && (
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                )}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LanguageSwitcher; 