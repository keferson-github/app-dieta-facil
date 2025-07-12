import React from 'react';
import { useTranslation } from 'react-i18next';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng: string) => {
    console.log('Changing language to:', lng);
    i18n.changeLanguage(lng).then(() => {
      console.log('Language changed successfully to:', lng);
      localStorage.setItem('i18nextLng', lng);
    }).catch((error) => {
      console.error('Error changing language:', error);
    });
  };

  const languages = [
    { code: 'pt', label: 'Português' },
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' }
  ];

  const getCurrentLanguageLabel = () => {
    const current = languages.find(lang => lang.code === i18n.language);
    return current ? current.label : 'Idioma';
  };

  console.log('Current language:', i18n.language);
  console.log('Available languages:', Object.keys(i18n.store.data));

  return (
    <div className="fixed top-4 right-4 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 border rounded-md px-3 py-1.5 bg-white/70 backdrop-blur-sm shadow-sm hover:bg-white/90 transition-colors">
          <Globe className="w-4 h-4 text-health-600" />
          <span className="text-sm font-medium text-gray-700">
            {getCurrentLanguageLabel()}
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          {languages.map(({ code, label }) => (
            <DropdownMenuItem
              key={code}
              onClick={() => changeLanguage(code)}
              className={`flex items-center gap-2 cursor-pointer ${
                code === i18n.language ? 'bg-health-50 text-health-700' : ''
              }`}
            >
              {label}
              {code === i18n.language && (
                <div className="w-2 h-2 rounded-full bg-health-500 ml-auto"></div>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default LanguageSwitcher; 