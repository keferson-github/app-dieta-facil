import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  pt: {
    translation: {
      "change_language": "Idioma",
      "language.portuguese": "Português",
      "language.english": "Inglês",
      "language.spanish": "Espanhol",
      "brand": "Dieta Fácil",
      "nav": {
        "login": "Entrar",
        "start_now": "Começar Agora"
      },
      "hero": {
        "badge": "🎯 Sua transformação começa aqui",
        "title": "Dietas personalizadas para",
        "title_highlight": "seus objetivos",
        "subtitle": "Crie seu plano alimentar e de treino personalizado em minutos. Baseado em ciência, feito para você.",
        "cta": "Criar Minha Dieta Gratuita",
        "users_count": "Mais de 10.000 pessoas já transformaram suas vidas"
      },
      "stats": {
        "active_users": "Usuários Ativos",
        "diets_created": "Dietas Criadas",
        "success_rate": "Taxa de Sucesso",
        "rating": "Avaliação"
      },
      "features": {
        "title": "Tudo que você precisa em um só lugar",
        "subtitle": "Ferramentas completas para sua jornada de transformação",
        "custom_diets": {
          "title": "Dietas Personalizadas",
          "description": "Planos alimentares únicos baseados no seu perfil e objetivos"
        },
        "workout_plans": {
          "title": "Fichas de Treino",
          "description": "Exercícios adaptados para casa ou academia"
        },
        "tracking": {
          "title": "Acompanhamento",
          "description": "Monitore seu progresso e evolução"
        },
        "fast_results": {
          "title": "Resultados Rápidos",
          "description": "Veja mudanças em poucas semanas"
        }
      },
      "how_it_works": {
        "title": "Como funciona",
        "subtitle": "3 passos simples para transformar sua vida",
        "steps": {
          "1": {
            "title": "Conte sobre você",
            "description": "Idade, peso, altura, objetivo e nível de atividade"
          },
          "2": {
            "title": "Receba seu plano",
            "description": "Dieta personalizada e ficha de treino sob medida"
          },
          "3": {
            "title": "Veja os resultados",
            "description": "Acompanhe seu progresso e conquiste seus objetivos"
          }
        }
      },
      "testimonials": {
        "title": "Histórias de sucesso",
        "subtitle": "Veja como o Dieta Fácil transformou a vida dessas pessoas",
        "1": {
          "name": "Ana Silva",
          "result": "Perdeu 8kg em 2 meses",
          "text": "O Dieta Fácil mudou minha vida! Finalmente consegui um plano que funciona para minha rotina."
        },
        "2": {
          "name": "Carlos Santos",
          "result": "Ganhou 5kg de massa muscular",
          "text": "As fichas de treino são perfeitas. Consegui ganhar massa muscular treinando em casa."
        },
        "3": {
          "name": "Maria Oliveira",
          "result": "Mantém peso ideal há 6 meses",
          "text": "Depois de anos tentando, finalmente encontrei equilíbrio na alimentação."
        }
      },
      "cta": {
        "title": "Pronto para transformar sua vida?",
        "subtitle": "Junte-se a milhares de pessoas que já alcançaram seus objetivos com o Dieta Fácil",
        "button": "Começar Minha Transformação"
      },
      "footer": {
        "rights": "© 2024 Dieta Fácil. Transformando vidas através da alimentação saudável."
      },
      "dashboard": {
        "welcome_champion": "Olá, campeão!",
        "welcome_champion_female": "Olá, campeã!",
        "ready_evolution": "Pronto para mais um dia de evolução?",
        "plan": "Plano",
        "active": "Ativo",
        "upgrade": "Upgrade",
        "settings": "Configurações",
        "current_weight": "Peso Atual",
        "target": "Meta",
        "bmi": "IMC",
        "goal": "Objetivo",
        "main_goal": "Meta principal",
        "activity": "Atividade",
        "current_level": "Nível atual",
        "not_defined": "Não definido",
        "not_informed": "Não informado",
        "nutrition": {
          "title": "Alimentação",
          "description": "Monte refeições personalizadas para sua rotina alimentar",
          "create_meal": "Criar Refeição",
          "weekly_menu": "Cardápio Semanal",
          "included_features": "Recursos inclusos:"
        },
        "exercises": {
          "title": "Exercícios",
          "description": "Crie refeições e treinos para manter o corpo ativo e saudável",
          "start_workout": "Iniciar Treino",
          "workout_sheet": "Ficha de Treino"
        },
        "progress": {
          "title": "Acompanhamento de Progresso",
          "description": "Alimentação, treinos e progresso em um só lugar. Evolua de verdade",
          "detailed_reports": "Relatórios Detalhados",
          "body_measurements": "Medidas Corporais",
          "progress_photos": "Fotos de Progresso"
        },
        "cta_upgrade": {
          "title": "🚀 Acelere seus resultados!",
          "description": "Desbloqueie treinos personalizados e acompanhamento completo de progresso. Transforme seu corpo mais rápido!",
          "button": "Fazer Upgrade Agora",
          "trial": "7 dias grátis"
        },
        "loading": "Carregando seu painel...",
        "premium_feature": "�� Recurso Premium",
        "premium_description": "Esta funcionalidade está disponível no plano {plan}. Faça upgrade para acessar!",
        "coming_soon": "Em breve!",
        "feature_coming_soon": "A funcionalidade \"{feature}\" estará disponível em breve.",
        "bmi_categories": {
          "underweight": "Abaixo do peso",
          "normal": "Peso normal",
          "overweight": "Sobrepeso",
          "obese": "Obesidade"
        },
        "goals": {
          "lose_weight": "emagrecer",
          "maintain_weight": "manter peso",
          "gain_muscle": "ganhar massa muscular"
        },
        "activity_levels": {
          "sedentary": "sedentário",
          "lightly_active": "levemente ativo",
          "moderately_active": "moderadamente ativo",
          "very_active": "muito ativo",
          "extremely_active": "extremamente ativo"
        }
      }
    }
  },
  en: {
    translation: {
      "change_language": "Language",
      "language.portuguese": "Portuguese",
      "language.english": "English",
      "language.spanish": "Spanish",
      "brand": "Easy Diet",
      "nav": {
        "login": "Login",
        "start_now": "Start Now"
      },
      "hero": {
        "badge": "🎯 Your transformation starts here",
        "title": "Personalized diets for",
        "title_highlight": "your goals",
        "subtitle": "Create your personalized meal and workout plan in minutes. Science-based, made for you.",
        "cta": "Create My Free Diet",
        "users_count": "Over 10,000 people have already transformed their lives"
      },
      "stats": {
        "active_users": "Active Users",
        "diets_created": "Diets Created",
        "success_rate": "Success Rate",
        "rating": "Rating"
      },
      "features": {
        "title": "Everything you need in one place",
        "subtitle": "Complete tools for your transformation journey",
        "custom_diets": {
          "title": "Custom Diets",
          "description": "Unique meal plans based on your profile and goals"
        },
        "workout_plans": {
          "title": "Workout Plans",
          "description": "Exercises adapted for home or gym"
        },
        "tracking": {
          "title": "Progress Tracking",
          "description": "Monitor your progress and evolution"
        },
        "fast_results": {
          "title": "Fast Results",
          "description": "See changes in weeks"
        }
      },
      "how_it_works": {
        "title": "How it works",
        "subtitle": "3 simple steps to transform your life",
        "steps": {
          "1": {
            "title": "Tell us about you",
            "description": "Age, weight, height, goal and activity level"
          },
          "2": {
            "title": "Get your plan",
            "description": "Custom diet and workout plan"
          },
          "3": {
            "title": "See results",
            "description": "Track your progress and achieve your goals"
          }
        }
      },
      "testimonials": {
        "title": "Success Stories",
        "subtitle": "See how Easy Diet transformed these people's lives",
        "1": {
          "name": "Ana Silva",
          "result": "Lost 8kg in 2 months",
          "text": "Easy Diet changed my life! I finally found a plan that works for my routine."
        },
        "2": {
          "name": "Carlos Santos",
          "result": "Gained 5kg of muscle",
          "text": "The workout plans are perfect. I managed to gain muscle mass training at home."
        },
        "3": {
          "name": "Maria Oliveira",
          "result": "Maintains ideal weight for 6 months",
          "text": "After years of trying, I finally found balance in my diet."
        }
      },
      "cta": {
        "title": "Ready to transform your life?",
        "subtitle": "Join thousands of people who have already achieved their goals with Easy Diet",
        "button": "Start My Transformation"
      },
      "footer": {
        "rights": "© 2024 Easy Diet. Transforming lives through healthy eating."
      },
      "dashboard": {
        "welcome_champion": "Hello, champion!",
        "welcome_champion_female": "Hello, champion!",
        "ready_evolution": "Ready for another day of evolution?",
        "plan": "Plan",
        "active": "Active",
        "upgrade": "Upgrade",
        "settings": "Settings",
        "current_weight": "Current Weight",
        "target": "Target",
        "bmi": "BMI",
        "goal": "Goal",
        "main_goal": "Main goal",
        "activity": "Activity",
        "current_level": "Current level",
        "not_defined": "Not defined",
        "not_informed": "Not informed",
        "nutrition": {
          "title": "Nutrition",
          "description": "Create personalized meals for your daily routine",
          "create_meal": "Create Meal",
          "weekly_menu": "Weekly Menu",
          "included_features": "Included features:"
        },
        "exercises": {
          "title": "Exercises",
          "description": "Create meals and workouts to keep your body active and healthy",
          "start_workout": "Start Workout",
          "workout_sheet": "Workout Sheet"
        },
        "progress": {
          "title": "Progress Tracking",
          "description": "Nutrition, workouts and progress in one place. Truly evolve",
          "detailed_reports": "Detailed Reports",
          "body_measurements": "Body Measurements",
          "progress_photos": "Progress Photos"
        },
        "cta_upgrade": {
          "title": "🚀 Accelerate your results!",
          "description": "Unlock personalized workouts and complete progress tracking. Transform your body faster!",
          "button": "Upgrade Now",
          "trial": "7 days free"
        },
        "loading": "Loading your dashboard...",
        "premium_feature": "🔒 Premium Feature",
        "premium_description": "This feature is available in the {plan} plan. Upgrade to access!",
        "coming_soon": "Coming soon!",
        "feature_coming_soon": "The \"{feature}\" feature will be available soon.",
        "bmi_categories": {
          "underweight": "Underweight",
          "normal": "Normal weight",
          "overweight": "Overweight",
          "obese": "Obesity"
        },
        "goals": {
          "lose_weight": "lose weight",
          "maintain_weight": "maintain weight",
          "gain_muscle": "gain muscle"
        },
        "activity_levels": {
          "sedentary": "sedentary",
          "lightly_active": "lightly active",
          "moderately_active": "moderately active",
          "very_active": "very active",
          "extremely_active": "extremely active"
        }
      }
    }
  },
  es: {
    translation: {
      "change_language": "Idioma",
      "language.portuguese": "Portugués",
      "language.english": "Inglés",
      "language.spanish": "Español",
      "brand": "Dieta Fácil",
      "nav": {
        "login": "Iniciar Sesión",
        "start_now": "Empezar Ahora"
      },
      "hero": {
        "badge": "🎯 Tu transformación empieza aquí",
        "title": "Dietas personalizadas para",
        "title_highlight": "tus objetivos",
        "subtitle": "Crea tu plan de alimentación y entrenamiento personalizado en minutos. Basado en ciencia, hecho para ti.",
        "cta": "Crear Mi Dieta Gratis",
        "users_count": "Más de 10.000 personas ya transformaron sus vidas"
      },
      "stats": {
        "active_users": "Usuarios Activos",
        "diets_created": "Dietas Creadas",
        "success_rate": "Tasa de Éxito",
        "rating": "Valoración"
      },
      "features": {
        "title": "Todo lo que necesitas en un solo lugar",
        "subtitle": "Herramientas completas para tu viaje de transformación",
        "custom_diets": {
          "title": "Dietas Personalizadas",
          "description": "Planes de comida únicos basados en tu perfil y objetivos"
        },
        "workout_plans": {
          "title": "Planes de Entrenamiento",
          "description": "Ejercicios adaptados para casa o gimnasio"
        },
        "tracking": {
          "title": "Seguimiento",
          "description": "Monitorea tu progreso y evolución"
        },
        "fast_results": {
          "title": "Resultados Rápidos",
          "description": "Ve cambios en semanas"
        }
      },
      "how_it_works": {
        "title": "Cómo funciona",
        "subtitle": "3 pasos simples para transformar tu vida",
        "steps": {
          "1": {
            "title": "Cuéntanos sobre ti",
            "description": "Edad, peso, altura, objetivo y nivel de actividad"
          },
          "2": {
            "title": "Recibe tu plan",
            "description": "Dieta personalizada y plan de entrenamiento a medida"
          },
          "3": {
            "title": "Ve resultados",
            "description": "Sigue tu progreso y alcanza tus objetivos"
          }
        }
      },
      "testimonials": {
        "title": "Historias de éxito",
        "subtitle": "Mira cómo Dieta Fácil transformó la vida de estas personas",
        "1": {
          "name": "Ana Silva",
          "result": "Perdió 8kg en 2 meses",
          "text": "¡Dieta Fácil cambió mi vida! Por fin encontré un plan que funciona para mi rutina."
        },
        "2": {
          "name": "Carlos Santos",
          "result": "Ganó 5kg de músculo",
          "text": "Los planes de entrenamiento son perfectos. Logré ganar masa muscular entrenando en casa."
        },
        "3": {
          "name": "Maria Oliveira",
          "result": "Mantiene peso ideal hace 6 meses",
          "text": "Después de años intentando, finalmente encontré equilibrio en mi alimentación."
        }
      },
      "cta": {
        "title": "¿Listo para transformar tu vida?",
        "subtitle": "Únete a miles de personas que ya alcanzaron sus objetivos con Dieta Fácil",
        "button": "Comenzar Mi Transformación"
      },
      "footer": {
        "rights": "© 2024 Dieta Fácil. Transformando vidas a través de la alimentación saludable."
      },
      "dashboard": {
        "welcome_champion": "¡Hola, campeón!",
        "welcome_champion_female": "¡Hola, campeona!",
        "ready_evolution": "¿Listo para otro día de evolución?",
        "plan": "Plan",
        "active": "Activo",
        "upgrade": "Actualizar",
        "settings": "Configuración",
        "current_weight": "Peso Actual",
        "target": "Meta",
        "bmi": "IMC",
        "goal": "Objetivo",
        "main_goal": "Meta principal",
        "activity": "Actividad",
        "current_level": "Nivel actual",
        "not_defined": "No definido",
        "not_informed": "No informado",
        "nutrition": {
          "title": "Alimentación",
          "description": "Crea comidas personalizadas para tu rutina alimentaria",
          "create_meal": "Crear Comida",
          "weekly_menu": "Menú Semanal",
          "included_features": "Características incluidas:"
        },
        "exercises": {
          "title": "Ejercicios",
          "description": "Crea comidas y entrenamientos para mantener el cuerpo activo y saludable",
          "start_workout": "Iniciar Entrenamiento",
          "workout_sheet": "Hoja de Entrenamiento"
        },
        "progress": {
          "title": "Seguimiento de Progreso",
          "description": "Alimentación, entrenamientos y progreso en un solo lugar. Evoluciona de verdad",
          "detailed_reports": "Informes Detallados",
          "body_measurements": "Medidas Corporales",
          "progress_photos": "Fotos de Progreso"
        },
        "cta_upgrade": {
          "title": "🚀 ¡Acelera tus resultados!",
          "description": "Desbloquea entrenamientos personalizados y seguimiento completo de progreso. ¡Transforma tu cuerpo más rápido!",
          "button": "Actualizar Ahora",
          "trial": "7 días gratis"
        },
        "loading": "Cargando tu panel...",
        "premium_feature": "🔒 Característica Premium",
        "premium_description": "Esta funcionalidad está disponible en el plan {plan}. ¡Actualiza para acceder!",
        "coming_soon": "¡Próximamente!",
        "feature_coming_soon": "La funcionalidad \"{feature}\" estará disponible pronto.",
        "bmi_categories": {
          "underweight": "Bajo peso",
          "normal": "Peso normal",
          "overweight": "Sobrepeso",
          "obese": "Obesidad"
        },
        "goals": {
          "lose_weight": "perder peso",
          "maintain_weight": "mantener peso",
          "gain_muscle": "ganar músculo"
        },
        "activity_levels": {
          "sedentary": "sedentario",
          "lightly_active": "ligeramente activo",
          "moderately_active": "moderadamente activo",
          "very_active": "muy activo",
          "extremely_active": "extremadamente activo"
        }
      }
    }
  }
};

// Initialize i18n
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'pt', // default language
    fallbackLng: 'pt',
    debug: true,
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
  });

export default i18n; 