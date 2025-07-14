
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle, Users, Target, Zap, Heart, Apple, Dumbbell, Utensils, Clock, Calendar, TrendingUp, Star, Shield, Flame, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";

const Index = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeFeature, setActiveFeature] = useState(-1);
  const featuresRef = useRef<HTMLDivElement>(null);

  // Fechar slide up ao clicar fora dos cards
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (featuresRef.current && !featuresRef.current.contains(event.target as Node)) {
        setActiveFeature(-1);
      }
    };

    if (activeFeature !== -1) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeFeature]);

  const features = [
    {
      icon: Target,
      title: t('features.custom_diets.title'),
      description: t('features.custom_diets.description'),
      overlayContent: {
        title: "Dietas Personalizadas",
        subtitle: "Planos alimentares únicos para você",
        items: [
          { icon: Utensils, text: "Receitas exclusivas" },
          { icon: Calendar, text: "Cardápio semanal" },
          { icon: Star, text: "Ingredientes selecionados" }
        ]
      }
    },
    {
      icon: Dumbbell,
      title: t('features.workout_plans.title'),
      description: t('features.workout_plans.description'),
      overlayContent: {
        title: "Planos de Treino",
        subtitle: "Exercícios adaptados ao seu nível",
        items: [
          { icon: Activity, text: "Treinos progressivos" },
          { icon: Clock, text: "Flexibilidade de horários" },
          { icon: TrendingUp, text: "Acompanhamento de evolução" }
        ]
      }
    },
    {
      icon: Heart,
      title: t('features.tracking.title'),
      description: t('features.tracking.description'),
      overlayContent: {
        title: "Acompanhamento Total",
        subtitle: "Monitore seu progresso em tempo real",
        items: [
          { icon: Heart, text: "Saúde cardiovascular" },
          { icon: Target, text: "Metas personalizadas" },
          { icon: Shield, text: "Resultados garantidos" }
        ]
      }
    },
    {
      icon: Zap,
      title: t('features.fast_results.title'),
      description: t('features.fast_results.description'),
      overlayContent: {
        title: "Resultados Rápidos",
        subtitle: "Transformação acelerada e sustentável",
        items: [
          { icon: Flame, text: "Queima de gordura" },
          { icon: Zap, text: "Energia renovada" },
          { icon: Star, text: "Confiança elevada" }
        ]
      }
    }
  ];

  const testimonials = [
    {
      name: t('testimonials.1.name'),
      result: t('testimonials.1.result'),
      text: t('testimonials.1.text')
    },
    {
      name: t('testimonials.2.name'),
      result: t('testimonials.2.result'),
      text: t('testimonials.2.text')
    },
    {
      name: t('testimonials.3.name'),
      result: t('testimonials.3.result'),
      text: t('testimonials.3.text')
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-health-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 health-gradient rounded-xl flex items-center justify-center">
              <Apple className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-primary-dark">{t('brand')}</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button className="health-gradient shadow-health px-4 py-2" onClick={() => navigate('/auth?mode=login')}>
              Entrar
            </Button>
            <Button className="health-gradient shadow-health hidden lg:block" onClick={() => navigate('/auth?mode=register')}>
              {t('nav.start_now')}
            </Button>
            <LanguageSwitcher fixed={false} />
            <ThemeToggle />
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <Badge className="mb-6 health-gradient text-white border-0">
            {t('hero.badge')}
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold text-primary-dark mb-6 leading-tight">
            {t('hero.title')}{' '}
            <span className="health-gradient bg-clip-text text-transparent">{t('hero.title_highlight')}</span>
          </h1>
          
          <p className="text-xl text-secondary-dark mb-8 max-w-2xl mx-auto">
            {t('hero.subtitle')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              size="lg" 
              className="health-gradient shadow-health text-lg px-8 py-6"
              onClick={() => navigate('/auth?mode=register')}
            >
              Iniciar Plano Fitness
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <div className="flex items-center text-sm text-secondary-dark">
              <Users className="w-4 h-4 mr-2" />
              <span>{t('hero.users_count')}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {[
              { number: "10k+", label: t('stats.active_users') },
              { number: "50k+", label: t('stats.diets_created') },
              { number: "95%", label: t('stats.success_rate') },
              { number: "4.9★", label: t('stats.rating') }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-health-600">{stat.number}</div>
                <div className="text-sm text-secondary-dark">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-primary-dark mb-4">
            {t('features.title')}
          </h2>
          <p className="text-xl text-secondary-dark max-w-2xl mx-auto">
            {t('features.subtitle')}
          </p>
        </div>

        <div ref={featuresRef} className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card 
                className={`cursor-pointer relative overflow-hidden rounded-xl h-[420px] ${
                  activeFeature === index ? 'ring-4 ring-health-500 shadow-2xl' : ''
                }`}
                onMouseEnter={() => setActiveFeature(index)}
                onMouseLeave={() => setActiveFeature(-1)}
                onClick={() => setActiveFeature(activeFeature === index ? -1 : index)}
              >
                {/* Imagem com animação */}
                <motion.div 
                  className="absolute inset-0"
                  animate={{ 
                    scale: activeFeature === index ? 1.02 : 1,
                    filter: activeFeature === index ? 'blur(1px)' : 'blur(0px)'
                  }}
                  transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                >
                  <img 
                    src={
                      index === 0 ? "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=500&h=400&fit=crop&crop=center" :
                      index === 1 ? "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=400&fit=crop&crop=center" :
                      index === 2 ? "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=500&h=400&fit=crop&crop=center" :
                      "https://images.unsplash.com/photo-1517963628607-235ccdd5476c?w=500&h=400&fit=crop&crop=center"
                    }
                    alt={feature.title}
                    className="w-full h-full object-cover"
                  />
                </motion.div>

                {/* Overlay escuro permanente com gradiente */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                {/* Ícone e título sempre visíveis */}
                <motion.div 
                  className="absolute top-6 left-6 z-20"
                  animate={{ 
                    opacity: activeFeature === index ? 0 : 1,
                    y: activeFeature === index ? 10 : 0
                  }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <motion.div 
                    className="w-12 h-12 health-gradient rounded-2xl flex items-center justify-center shadow-lg mb-2"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <feature.icon className="w-6 h-6 text-white" />
                  </motion.div>
                  <h3 className="text-white font-bold text-lg">{feature.title}</h3>
                </motion.div>

                {/* Overlay com slide up - aparece quando clicado ou hover */}
                <AnimatePresence>
                  {activeFeature === index && (
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-t from-health-600/95 via-health-500/85 to-health-400/75 backdrop-blur-sm"
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      exit={{ y: "100%" }}
                      transition={{ 
                        type: "spring",
                        stiffness: 100,
                        damping: 20,
                        mass: 1
                      }}
                    >
                      <div className="h-full flex flex-col justify-between items-center p-4 lg:p-5 text-white">
                        <motion.div 
                          className="flex-shrink-0 text-center pt-2 lg:pt-3"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2, duration: 0.4 }}
                        >
                          <motion.div 
                            className="w-14 h-14 lg:w-16 lg:h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-2 lg:mb-3 backdrop-blur-sm"
                            whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.3)" }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <feature.icon className="w-7 h-7 lg:w-8 lg:h-8 text-white" />
                          </motion.div>
                          <h3 className="text-lg lg:text-xl font-bold mb-1">{feature.overlayContent.title}</h3>
                          <p className="text-white/90 text-sm">{feature.overlayContent.subtitle}</p>
                        </motion.div>
                        
                        <div className="flex-1 flex items-center justify-center w-full my-2">
                          <div className="space-y-2 w-full max-w-xs">
                            {feature.overlayContent.items.map((item, itemIndex) => (
                              <motion.div 
                                key={itemIndex}
                                className="flex items-center gap-2 bg-white/10 rounded-lg p-2 backdrop-blur-sm"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ 
                                  delay: 0.3 + itemIndex * 0.1,
                                  duration: 0.4,
                                  ease: "easeOut"
                                }}
                                whileHover={{ 
                                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                                  scale: 1.02,
                                  transition: { duration: 0.2 }
                                }}
                              >
                                <motion.div 
                                  className="w-7 h-7 lg:w-8 lg:h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <item.icon className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                                </motion.div>
                                <span className="text-white font-medium text-sm">{item.text}</span>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                        
                        <motion.div 
                          className="flex-shrink-0 pb-2"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5, duration: 0.4 }}
                        >
                          <motion.button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveFeature(-1);
                            }}
                            className="bg-white/20 text-white font-medium px-4 py-1.5 rounded-lg backdrop-blur-sm border border-white/30 text-sm"
                            whileHover={{ 
                              scale: 1.05,
                              backgroundColor: "rgba(255, 255, 255, 0.3)",
                              borderColor: "rgba(255, 255, 255, 0.5)"
                            }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Fechar
                          </motion.button>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-gradient-to-r from-health-600 to-health-700 py-20 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">{t('how_it_works.title')}</h2>
            <p className="text-xl opacity-90">{t('how_it_works.subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[1, 2, 3].map((step) => (
              <div key={step} className="text-center">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold">{step}</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  {t(`how_it_works.steps.${step}.title`)}
                </h3>
                <p className="opacity-90">
                  {t(`how_it_works.steps.${step}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-primary-dark mb-4">
            {t('testimonials.title')}
          </h2>
          <p className="text-xl text-secondary-dark">
            {t('testimonials.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="glass-effect hover:shadow-health transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                    <Badge className="health-gradient text-white border-0 mt-1">
                      {testimonial.result}
                    </Badge>
                  </div>
                  <CheckCircle className="w-8 h-8 text-health-500" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-secondary-dark italic">"{testimonial.text}"</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Final */}
      <section className="bg-slate-50 dark:bg-slate-900 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-primary-dark mb-6">
            {t('cta.title')}
          </h2>
          <p className="text-xl text-secondary-dark mb-8 max-w-2xl mx-auto">
            {t('cta.subtitle')}
          </p>
          <Button 
            size="lg" 
            className="health-gradient shadow-health text-lg px-8 py-6"
            onClick={() => navigate('/auth?mode=register')}
          >
            Iniciar Plano Fitness
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 health-gradient rounded-lg flex items-center justify-center">
                <Apple className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">{t('brand')}</span>
            </div>
            <p className="text-gray-400 text-center md:text-right">
              {t('footer.rights')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
