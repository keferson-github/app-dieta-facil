
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle, Users, Target, Zap, Heart, Apple, Dumbbell, Utensils, Clock, Calendar, TrendingUp, Star, Shield, Flame, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const Index = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeFeature, setActiveFeature] = useState(0);

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
    <div className="min-h-screen bg-gradient-to-br from-health-50 via-white to-health-100">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 health-gradient rounded-xl flex items-center justify-center">
              <Apple className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{t('brand')}</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button className="health-gradient shadow-health px-4 py-2" onClick={() => navigate('/auth?mode=login')}>
              Entrar
            </Button>
            <Button className="health-gradient shadow-health hidden lg:block" onClick={() => navigate('/auth?mode=register')}>
              {t('nav.start_now')}
            </Button>
            <LanguageSwitcher fixed={false} />
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <Badge className="mb-6 health-gradient text-white border-0">
            {t('hero.badge')}
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            {t('hero.title')}{' '}
            <span className="health-gradient bg-clip-text text-transparent">{t('hero.title_highlight')}</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
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
            <div className="flex items-center text-sm text-gray-500">
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
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {t('features.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('features.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className={`cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group relative overflow-hidden rounded-xl h-96 ${
                activeFeature === index ? 'ring-4 ring-health-500 shadow-2xl' : ''
              }`}
              onMouseEnter={() => setActiveFeature(-1)}
              onClick={() => setActiveFeature(activeFeature === index ? -1 : index)}
            >
              {/* Imagem ocupando todo o container */}
              <div className="absolute inset-0">
                <img 
                  src={
                    index === 0 ? "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=500&h=400&fit=crop&crop=center" :
                    index === 1 ? "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=400&fit=crop&crop=center" :
                    index === 2 ? "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=500&h=400&fit=crop&crop=center" :
                    "https://images.unsplash.com/photo-1517963628607-235ccdd5476c?w=500&h=400&fit=crop&crop=center"
                  }
                  alt={feature.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>

              {/* Overlay escuro permanente com gradiente */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

              {/* Ícone e título sempre visíveis - ocultos quando slide up está ativo */}
              <div className={`absolute top-6 left-6 z-10 transition-all duration-500 ${
                activeFeature === index ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
              }`}>
                <div className="w-14 h-14 health-gradient rounded-2xl flex items-center justify-center shadow-lg mb-3">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-white font-bold text-lg">{feature.title}</h3>
              </div>

              {/* Overlay com slide up - aparece quando clicado */}
              <div className={`absolute inset-0 bg-gradient-to-t from-health-600/95 via-health-500/85 to-health-400/75 backdrop-blur-sm transition-all duration-700 ${
                activeFeature === index ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
              }`}>
                <div className="absolute inset-0 flex flex-col justify-center items-center p-6 text-white">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{feature.overlayContent.title}</h3>
                    <p className="text-white/90 text-sm">{feature.overlayContent.subtitle}</p>
                  </div>
                  
                  <div className="space-y-3 w-full max-w-xs">
                    {feature.overlayContent.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-center gap-3 bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                          <item.icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-white font-medium text-sm">{item.text}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveFeature(-1);
                      }}
                      className="text-white/70 hover:text-white text-sm underline transition-colors"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-gradient-to-r from-health-500 to-health-600 py-20 text-white">
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
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {t('testimonials.title')}
          </h2>
          <p className="text-xl text-gray-600">
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
                <p className="text-gray-600 italic">"{testimonial.text}"</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Final */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            {t('cta.title')}
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
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
      <footer className="bg-gray-900 text-white py-12">
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
