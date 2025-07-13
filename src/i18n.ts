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
        "logout": "Sair",
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
          "description": "Crie refeições e treinos para manter o corpo muito mais ativo e saudável",
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
        "premium_feature": "🔒 Recurso Premium",
        "premium_description": "Esta funcionalidade está disponível no plano {plan}. Faça upgrade para acessar!",
        "coming_soon": "Em breve!",
        "feature_coming_soon": "A funcionalidade \"{feature}\" estará disponível em breve.",
        "logout_error": "Erro",
        "logout_error_desc": "Não foi possível fazer logout. Tente novamente.",
        "logout_success": "Logout realizado",
        "logout_success_desc": "Você foi desconectado com sucesso.",
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
        },
        // Gráficos
        "weightProgress": "Evolução do Peso",
        "weightProgressDescription": "Acompanhe seu progresso em direção à meta",
        "currentWeight": "Peso Atual",
        "targetWeight": "Peso Meta",
        "weeklyActivity": "Atividade Semanal",
        "weeklyActivityDescription": "Seus treinos da semana",
        "thisWeek": "Esta Semana",
        "totalWorkouts": "Total de Treinos",
        "avgDuration": "Duração Média",
        "goalProgress": "Progresso da Meta",
        "progressLabel": "Progresso",
        "weeklyGoal": "Meta Semanal",
        "workouts": "Treinos",
        "duration": "Duração",
        "nutritionDescription": "Seus dados nutricionais",
        "today": "Hoje",
        "calories": "Calorias",
        "protein": "Proteína",
        "avgCalories": "Média de Calorias",
        "avgProtein": "Média de Proteína",
        "consistency": "Consistência",
        "achievements": "Conquistas",
        "achievementsDescription": "Suas conquistas e progresso",
        "level": "Nível",
        "points": "pontos",
        "completed": "Concluídas",
        "inProgress": "Em Progresso",
        "total": "Total",
        "recentAchievements": "Conquistas Recentes",
        "currentProgress": "Progresso Atual",
        "nextLevel": "Próximo Nível",
        "pointsToNextLevel": "pontos para o próximo nível"
      },
      "settings": {
        "language": {
          "title": "Idioma",
          "description": "Escolha o idioma da aplicação"
        },
        "title": "Configurações",
        "subtitle": "Atualize suas informações pessoais e preferências",
        "back_to_dashboard": "Voltar ao Dashboard",
        "personal_info": {
          "title": "Informações Pessoais",
          "description": "Suas informações básicas para cálculo nutricional",
          "age": "Idade",
          "age_placeholder": "Ex: 30",
          "gender": "Sexo",
          "male": "Masculino",
          "female": "Feminino"
        },
        "body_measurements": {
          "title": "Medidas Corporais",
          "description": "Suas medidas atuais para cálculo de necessidades nutricionais",
          "height": "Altura (cm)",
          "height_placeholder": "Ex: 170",
          "weight": "Peso atual (kg)",
          "weight_placeholder": "Ex: 70.5"
        },
        "goals_activity": {
          "title": "Objetivos e Atividade",
          "description": "Seus objetivos e nível de atividade física",
          "main_goal": "Objetivo principal",
          "lose_weight": {
            "title": "Emagrecer",
            "description": "Reduzir peso e gordura corporal"
          },
          "maintain_weight": {
            "title": "Manter peso",
            "description": "Manter peso atual com alimentação equilibrada"
          },
          "gain_muscle": {
            "title": "Ganhar massa muscular",
            "description": "Aumentar massa muscular e peso"
          },
          "activity_level": "Nível de atividade física",
          "activity_placeholder": "Selecione seu nível de atividade",
          "sedentary": "Sedentário (pouco ou nenhum exercício)",
          "lightly_active": "Levemente ativo (1-3 dias por semana)",
          "moderately_active": "Moderadamente ativo (3-5 dias por semana)",
          "very_active": "Muito ativo (6-7 dias por semana)",
          "extremely_active": "Extremamente ativo (2x por dia ou trabalho físico)",
          "target_weight": "Peso desejado (kg)",
          "target_weight_placeholder": "Ex: 65.0"
        },
        "account": {
          "title": "Conta",
          "description": "Gerenciar sua conta e configurações",
          "save_changes": "Salvar Alterações",
          "saving": "Salvando...",
          "logout": "Sair da Conta"
        },
        "messages": {
          "profile_load_error": "Erro ao carregar perfil",
          "profile_load_error_desc": "Não foi possível carregar seus dados.",
          "save_success": "Configurações salvas!",
          "save_success_desc": "Suas informações foram atualizadas com sucesso.",
          "save_error": "Erro ao salvar",
          "unexpected_error": "Erro inesperado",
          "unexpected_error_desc": "Ocorreu um erro. Tente novamente.",
          "logout_success": "Logout realizado",
          "logout_success_desc": "Você foi desconectado com sucesso.",
          "logout_error": "Erro ao sair"
        }
      },
      "pricing": {
        "most_popular": "Mais Popular",
        "your_plan": "Seu Plano",
        "per_month": "/mês",
        "subscribe_now": "Assinar Agora",
        "manage_subscription": "Gerenciar Assinatura",
        "loading": "Carregando...",
        "error_title": "Erro",
        "error_checkout": "Não foi possível iniciar o processo de assinatura. Tente novamente.",
        "error_portal": "Não foi possível abrir o portal de gerenciamento. Tente novamente."
      },
      "notifications": {
        "auth": {
          "login_error": "Erro no login",
          "invalid_credentials": "Email ou senha incorretos. Verifique seus dados e tente novamente.",
          "email_not_confirmed": "Email não confirmado",
          "email_not_confirmed_desc": "Por favor, verifique seu email e clique no link de confirmação antes de fazer login.",
          "login_success": "Login realizado com sucesso!",
          "login_success_desc": "Bem-vindo de volta ao Dieta Fácil",
          "user_exists": "Usuário já existe",
          "user_exists_desc": "Este email já está cadastrado. Tente fazer login.",
          "signup_error": "Erro no cadastro",
          "signup_success": "Cadastro realizado com sucesso!",
          "signup_success_desc": "Verifique seu email para confirmar a conta e então faça login.",
          "unexpected_error": "Erro inesperado",
          "unexpected_error_desc": "Ocorreu um erro. Tente novamente."
        },
        "onboarding": {
          "profile_error": "Erro ao salvar perfil",
          "profile_success": "Perfil criado com sucesso!",
          "profile_success_desc": "Agora você pode acessar todas as funcionalidades do Dieta Fácil",
          "unexpected_error": "Erro inesperado",
          "unexpected_error_desc": "Ocorreu um erro. Tente novamente."
        },
        "dashboard": {
          "welcome_team": "🎉 Bem-vindo ao time!",
          "welcome_team_desc": "Sua assinatura foi ativada com sucesso! Vamos alcançar seus objetivos juntos.",
          "process_canceled": "Processo cancelado",
          "process_canceled_desc": "Sem problemas! Você ainda pode continuar usando o plano gratuito."
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
        "logout": "Logout",
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
        "logout_error": "Error",
        "logout_error_desc": "Could not initiate logout. Please try again.",
        "logout_success": "Logout successful",
        "logout_success_desc": "You have been disconnected successfully.",
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
        },
        // Charts
        "weightProgress": "Weight Progress",
        "weightProgressDescription": "Track your progress towards your goal",
        "currentWeight": "Current Weight",
        "targetWeight": "Target Weight",
        "weeklyActivity": "Weekly Activity",
        "weeklyActivityDescription": "Your workouts this week",
        "thisWeek": "This Week",
        "totalWorkouts": "Total Workouts",
        "avgDuration": "Average Duration",
        "goalProgress": "Goal Progress",
        "progressLabel": "Progress",
        "weeklyGoal": "Weekly Goal",
        "workouts": "Workouts",
        "duration": "Duration",
        "nutritionDescription": "Your nutritional data",
        "today": "Today",
        "calories": "Calories",
        "protein": "Protein",
        "avgCalories": "Average Calories",
        "avgProtein": "Average Protein",
        "consistency": "Consistency",
        "achievements": "Achievements",
        "achievementsDescription": "Your achievements and progress",
        "level": "Level",
        "points": "points",
        "completed": "Completed",
        "inProgress": "In Progress",
        "total": "Total",
        "recentAchievements": "Recent Achievements",
        "currentProgress": "Current Progress",
        "nextLevel": "Next Level",
        "pointsToNextLevel": "points to next level"
      },
      "settings": {
        "language": {
          "title": "Language",
          "description": "Choose the application language"
        },
        "title": "Settings",
        "subtitle": "Update your personal information and preferences",
        "back_to_dashboard": "Back to Dashboard",
        "personal_info": {
          "title": "Personal Information",
          "description": "Your basic information for nutritional calculation",
          "age": "Age",
          "age_placeholder": "Ex: 30",
          "gender": "Gender",
          "male": "Male",
          "female": "Female"
        },
        "body_measurements": {
          "title": "Body Measurements",
          "description": "Your current measurements for nutritional needs",
          "height": "Height (cm)",
          "height_placeholder": "Ex: 170",
          "weight": "Current weight (kg)",
          "weight_placeholder": "Ex: 70.5"
        },
        "goals_activity": {
          "title": "Goals and Activity",
          "description": "Your goals and physical activity level",
          "main_goal": "Main Goal",
          "lose_weight": {
            "title": "Lose Weight",
            "description": "Reduce body weight and fat"
          },
          "maintain_weight": {
            "title": "Maintain Weight",
            "description": "Maintain current weight with balanced nutrition"
          },
          "gain_muscle": {
            "title": "Gain Muscle",
            "description": "Increase muscle mass and weight"
          },
          "activity_level": "Physical Activity Level",
          "activity_placeholder": "Select your activity level",
          "sedentary": "Sedentary (little or no exercise)",
          "lightly_active": "Lightly Active (1-3 days per week)",
          "moderately_active": "Moderately Active (3-5 days per week)",
          "very_active": "Very Active (6-7 days per week)",
          "extremely_active": "Extremely Active (2x per day or physically demanding work)",
          "target_weight": "Desired Weight (kg)",
          "target_weight_placeholder": "Ex: 65.0"
        },
        "account": {
          "title": "Account",
          "description": "Manage your account and settings",
          "save_changes": "Save Changes",
          "saving": "Saving...",
          "logout": "Logout"
        },
        "messages": {
          "profile_load_error": "Error loading profile",
          "profile_load_error_desc": "Could not load your data.",
          "save_success": "Settings saved!",
          "save_success_desc": "Your information has been updated successfully.",
          "save_error": "Error saving",
          "unexpected_error": "Unexpected error",
          "unexpected_error_desc": "An error occurred. Please try again.",
          "logout_success": "Logout successful",
          "logout_success_desc": "You have been disconnected successfully.",
          "logout_error": "Error logging out"
        }
      },
      "pricing": {
        "most_popular": "Most Popular",
        "your_plan": "Your Plan",
        "per_month": "/month",
        "subscribe_now": "Subscribe Now",
        "manage_subscription": "Manage Subscription",
        "loading": "Loading...",
        "error_title": "Error",
        "error_checkout": "Could not initiate subscription process. Please try again.",
        "error_portal": "Could not open management portal. Please try again."
      },
      "notifications": {
        "auth": {
          "login_error": "Login Error",
          "invalid_credentials": "Invalid email or password. Please check your credentials and try again.",
          "email_not_confirmed": "Email Not Confirmed",
          "email_not_confirmed_desc": "Please check your email and click the confirmation link before logging in.",
          "login_success": "Login Successful!",
          "login_success_desc": "Welcome back to Easy Diet",
          "user_exists": "User Already Exists",
          "user_exists_desc": "This email is already registered. Try logging in.",
          "signup_error": "Registration Error",
          "signup_success": "Registration Successful!",
          "signup_success_desc": "Check your email to confirm your account and then log in.",
          "unexpected_error": "Unexpected Error",
          "unexpected_error_desc": "An error occurred. Please try again."
        },
        "onboarding": {
          "profile_error": "Error Saving Profile",
          "profile_success": "Profile Created Successfully!",
          "profile_success_desc": "You can now access all Easy Diet features",
          "unexpected_error": "Unexpected Error",
          "unexpected_error_desc": "An error occurred. Please try again."
        },
        "dashboard": {
          "welcome_team": "🎉 Welcome to the team!",
          "welcome_team_desc": "Your subscription has been activated successfully! Let's achieve your goals together.",
          "process_canceled": "Process Canceled",
          "process_canceled_desc": "No problem! You can still continue using the free plan."
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
        "logout": "Cerrar Sesión",
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
        "logout_error": "Error",
        "logout_error_desc": "No se pudo iniciar el cierre de sesión. Inténtelo de nuevo.",
        "logout_success": "Cierre de sesión exitoso",
        "logout_success_desc": "Has sido desconectado con éxito.",
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
        },
        // Gráficos
        "weightProgress": "Evolución del Peso",
        "weightProgressDescription": "Sigue tu progreso hacia tu meta",
        "currentWeight": "Peso Actual",
        "targetWeight": "Peso Meta",
        "weeklyActivity": "Actividad Semanal",
        "weeklyActivityDescription": "Tus entrenamientos esta semana",
        "thisWeek": "Esta Semana",
        "totalWorkouts": "Total de Entrenamientos",
        "avgDuration": "Duración Promedio",
        "goalProgress": "Progreso de la Meta",
        "progressLabel": "Progreso",
        "weeklyGoal": "Meta Semanal",
        "workouts": "Entrenamientos",
        "duration": "Duración",
        "nutritionDescription": "Tus datos nutricionales",
        "today": "Hoy",
        "calories": "Calorías",
        "protein": "Proteína",
        "avgCalories": "Promedio de Calorías",
        "avgProtein": "Promedio de Proteína",
        "consistency": "Consistencia",
        "achievements": "Logros",
        "achievementsDescription": "Tus logros y progreso",
        "level": "Nivel",
        "points": "puntos",
        "completed": "Completados",
        "inProgress": "En Progreso",
        "total": "Total",
        "recentAchievements": "Logros Recientes",
        "currentProgress": "Progreso Actual",
        "nextLevel": "Próximo Nivel",
        "pointsToNextLevel": "puntos para el próximo nivel"
      },
      "settings": {
        "language": {
          "title": "Idioma",
          "description": "Elige el idioma de la aplicación"
        },
        "title": "Configuración",
        "subtitle": "Actualiza tus datos personales y preferencias",
        "back_to_dashboard": "Volver al Dashboard",
        "personal_info": {
          "title": "Información Personal",
          "description": "Tus datos básicos para el cálculo nutricional",
          "age": "Edad",
          "age_placeholder": "Ej: 30",
          "gender": "Género",
          "male": "Masculino",
          "female": "Femenino"
        },
        "body_measurements": {
          "title": "Medidas Corporales",
          "description": "Tus medidas actuales para las necesidades nutricionales",
          "height": "Altura (cm)",
          "height_placeholder": "Ej: 170",
          "weight": "Peso actual (kg)",
          "weight_placeholder": "Ej: 70.5"
        },
        "goals_activity": {
          "title": "Objetivos y Actividad",
          "description": "Tus objetivos y nivel de actividad física",
          "main_goal": "Objetivo Principal",
          "lose_weight": {
            "title": "Perder Peso",
            "description": "Reducir peso y grasa corporal"
          },
          "maintain_weight": {
            "title": "Mantener Peso",
            "description": "Mantener el peso actual con una alimentación equilibrada"
          },
          "gain_muscle": {
            "title": "Ganar Masa Muscular",
            "description": "Aumentar masa muscular y peso"
          },
          "activity_level": "Nivel de Actividad Física",
          "activity_placeholder": "Selecciona tu nivel de actividad",
          "sedentary": "Sedentario (poco o ningún ejercicio)",
          "lightly_active": "Ligeramente Activo (1-3 días por semana)",
          "moderately_active": "Moderadamente Activo (3-5 días por semana)",
          "very_active": "Muy Activo (6-7 días por semana)",
          "extremely_active": "Extremadamente Activo (2x por día o trabajo físico)",
          "target_weight": "Peso Deseado (kg)",
          "target_weight_placeholder": "Ej: 65.0"
        },
        "account": {
          "title": "Cuenta",
          "description": "Gestiona tu cuenta y configuraciones",
          "save_changes": "Guardar Cambios",
          "saving": "Guardando...",
          "logout": "Cerrar Sesión"
        },
        "messages": {
          "profile_load_error": "Error al cargar el perfil",
          "profile_load_error_desc": "No se pudieron cargar sus datos.",
          "save_success": "Configuraciones guardadas!",
          "save_success_desc": "Tus datos se han actualizado correctamente.",
          "save_error": "Error al guardar",
          "unexpected_error": "Error inesperado",
          "unexpected_error_desc": "Ocurrió un error. Inténtelo de nuevo.",
          "logout_success": "Cierre de sesión exitoso",
          "logout_success_desc": "Has sido desconectado con éxito.",
          "logout_error": "Error al cerrar sesión"
        }
      },
      "pricing": {
        "most_popular": "Más Popular",
        "your_plan": "Tu Plan",
        "per_month": "/mes",
        "subscribe_now": "Suscribirse Ahora",
        "manage_subscription": "Gestionar Suscripción",
        "loading": "Cargando...",
        "error_title": "Error",
        "error_checkout": "No se pudo iniciar el proceso de suscripción. Inténtelo de nuevo.",
        "error_portal": "No se pudo abrir el portal de gestión. Inténtelo de nuevo."
      },
      "notifications": {
        "auth": {
          "login_error": "Error de Inicio de Sesión",
          "invalid_credentials": "Email o contraseña incorrectos. Verifique sus datos e inténtelo de nuevo.",
          "email_not_confirmed": "Email No Confirmado",
          "email_not_confirmed_desc": "Por favor, verifique su email y haga clic en el enlace de confirmación antes de iniciar sesión.",
          "login_success": "¡Inicio de Sesión Exitoso!",
          "login_success_desc": "Bienvenido de vuelta a Dieta Fácil",
          "user_exists": "Usuario Ya Existe",
          "user_exists_desc": "Este email ya está registrado. Intente iniciar sesión.",
          "signup_error": "Error de Registro",
          "signup_success": "¡Registro Exitoso!",
          "signup_success_desc": "Verifique su email para confirmar la cuenta y luego inicie sesión.",
          "unexpected_error": "Error Inesperado",
          "unexpected_error_desc": "Ocurrió un error. Inténtelo de nuevo."
        },
        "onboarding": {
          "profile_error": "Error al Guardar Perfil",
          "profile_success": "¡Perfil Creado Exitosamente!",
          "profile_success_desc": "Ahora puede acceder a todas las funcionalidades de Dieta Fácil",
          "unexpected_error": "Error Inesperado",
          "unexpected_error_desc": "Ocurrió un error. Inténtelo de nuevo."
        },
        "dashboard": {
          "welcome_team": "🎉 ¡Bienvenido al equipo!",
          "welcome_team_desc": "¡Su suscripción se ha activado exitosamente! Vamos a alcanzar sus objetivos juntos.",
          "process_canceled": "Proceso Cancelado",
          "process_canceled_desc": "¡Sin problemas! Aún puede continuar usando el plan gratuito."
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