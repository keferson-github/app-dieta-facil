
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle, Users, Target, Zap, Heart, Apple, Dumbbell } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: Target,
      title: "Dietas Personalizadas",
      description: "Planos alimentares únicos baseados no seu perfil e objetivos"
    },
    {
      icon: Dumbbell,
      title: "Fichas de Treino",
      description: "Exercícios adaptados para casa ou academia"
    },
    {
      icon: Heart,
      title: "Acompanhamento",
      description: "Monitore seu progresso e evolução"
    },
    {
      icon: Zap,
      title: "Resultados Rápidos",
      description: "Veja mudanças em poucas semanas"
    }
  ];

  const testimonials = [
    {
      name: "Ana Silva",
      result: "Perdeu 8kg em 2 meses",
      text: "O Dieta Fácil mudou minha vida! Finalmente consegui um plano que funciona para minha rotina."
    },
    {
      name: "Carlos Santos",
      result: "Ganhou 5kg de massa muscular",
      text: "As fichas de treino são perfeitas. Consegui ganhar massa muscular treinando em casa."
    },
    {
      name: "Maria Oliveira",
      result: "Mantém peso ideal há 6 meses",
      text: "Depois de anos tentando, finalmente encontrei equilíbrio na alimentação."
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
            <span className="text-2xl font-bold text-gray-900">Dieta Fácil</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/auth')}>
              Entrar
            </Button>
            <Button className="health-gradient shadow-health" onClick={() => navigate('/auth')}>
              Começar Agora
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <Badge className="mb-6 health-gradient text-white border-0">
            🎯 Sua transformação começa aqui
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Dietas personalizadas para
            <span className="health-gradient bg-clip-text text-transparent"> seus objetivos</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Crie seu plano alimentar e de treino personalizado em minutos. 
            Baseado em ciência, feito para você.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              size="lg" 
              className="health-gradient shadow-health text-lg px-8 py-6"
              onClick={() => navigate('/auth')}
            >
              Criar Minha Dieta Gratuita
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <div className="flex items-center text-sm text-gray-500">
              <Users className="w-4 h-4 mr-2" />
              <span>Mais de 10.000 pessoas já transformaram suas vidas</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {[
              { number: "10k+", label: "Usuários Ativos" },
              { number: "50k+", label: "Dietas Criadas" },
              { number: "95%", label: "Taxa de Sucesso" },
              { number: "4.9★", label: "Avaliação" }
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
            Tudo que você precisa em um só lugar
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Ferramentas completas para sua jornada de transformação
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className={`cursor-pointer transition-all duration-300 hover:shadow-health hover:-translate-y-2 ${
                activeFeature === index ? 'ring-2 ring-health-500 shadow-health' : ''
              }`}
              onMouseEnter={() => setActiveFeature(index)}
            >
              <CardHeader className="text-center">
                <div className="w-16 h-16 health-gradient rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-gradient-to-r from-health-500 to-health-600 py-20 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Como funciona</h2>
            <p className="text-xl opacity-90">3 passos simples para transformar sua vida</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "1",
                title: "Conte sobre você",
                description: "Idade, peso, altura, objetivo e nível de atividade"
              },
              {
                step: "2", 
                title: "Receba seu plano",
                description: "Dieta personalizada e ficha de treino sob medida"
              },
              {
                step: "3",
                title: "Veja os resultados",
                description: "Acompanhe seu progresso e conquiste seus objetivos"
              }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold">{item.step}</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="opacity-90">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Histórias de sucesso
          </h2>
          <p className="text-xl text-gray-600">
            Veja como o Dieta Fácil transformou a vida dessas pessoas
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
            Pronto para transformar sua vida?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de pessoas que já alcançaram seus objetivos com o Dieta Fácil
          </p>
          <Button 
            size="lg" 
            className="health-gradient shadow-health text-lg px-8 py-6"
            onClick={() => navigate('/auth')}
          >
            Começar Minha Transformação
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
              <span className="text-xl font-bold">Dieta Fácil</span>
            </div>
            <p className="text-gray-400 text-center md:text-right">
              © 2024 Dieta Fácil. Transformando vidas através da alimentação saudável.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
