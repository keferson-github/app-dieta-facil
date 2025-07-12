
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Apple, ArrowLeft, Loader2, Mail, Lock, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/dashboard');
      }
    };
    checkAuth();
  }, [navigate]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = "Email é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!formData.password) {
      newErrors.password = "Senha é obrigatória";
    } else if (formData.password.length < 6) {
      newErrors.password = "Senha deve ter pelo menos 6 caracteres";
    }

    if (activeTab === "signup") {
      if (!formData.name) {
        newErrors.name = "Nome é obrigatório";
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Senhas não coincidem";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast({
            variant: "destructive",
            title: "Erro no login",
            description: "Email ou senha incorretos. Verifique seus dados e tente novamente.",
          });
        } else if (error.message.includes("Email not confirmed")) {
          toast({
            variant: "destructive",
            title: "Email não confirmado",
            description: "Por favor, verifique seu email e clique no link de confirmação antes de fazer login.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Erro no login",
            description: error.message,
          });
        }
      } else {
        // Verifica se o usuário já possui perfil
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user.id;

        if (userId) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('user_id', userId)
            .single();

          toast({
            title: "Login realizado com sucesso!",
            description: "Bem-vindo de volta ao Dieta Fácil",
          });

          if (profile) {
            navigate('/dashboard');
          } else {
            navigate('/onboarding');
          }
        }
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: "Ocorreu um erro. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/onboarding`;
      
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: formData.name,
          }
        }
      });

      if (error) {
        if (error.message.includes("User already registered")) {
          toast({
            variant: "destructive",
            title: "Usuário já existe",
            description: "Este email já está cadastrado. Tente fazer login.",
          });
          setActiveTab("login");
        } else {
          toast({
            variant: "destructive",
            title: "Erro no cadastro",
            description: error.message,
          });
        }
      } else {
        toast({
          title: "Cadastro realizado com sucesso!",
          description: "Verifique seu email para confirmar a conta e então faça login.",
        });
        setActiveTab("login");
        setFormData({
          email: formData.email,
          password: "",
          confirmPassword: "",
          name: ""
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: "Ocorreu um erro. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-health-50 via-white to-health-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Button
            variant="ghost" 
            className="absolute top-4 left-4"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-12 h-12 health-gradient rounded-xl flex items-center justify-center">
              <Apple className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold text-gray-900">Dieta Fácil</span>
          </div>
          <p className="text-gray-600">Sua jornada de transformação começa aqui</p>
        </div>

        {/* Auth Form */}
        <Card className="glass-effect shadow-health">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              {activeTab === "login" ? "Entrar na sua conta" : "Criar conta gratuita"}
            </CardTitle>
            <CardDescription className="text-center">
              {activeTab === "login" 
                ? "Acesse seu painel personalizado" 
                : "Comece sua transformação hoje mesmo"
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Cadastrar</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        className="pl-10"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                      />
                    </div>
                    {errors.email && (
                      <Alert variant="destructive">
                        <AlertDescription>{errors.email}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                      />
                    </div>
                    {errors.password && (
                      <Alert variant="destructive">
                        <AlertDescription>{errors.password}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full health-gradient shadow-health"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Entrando...</>
                    ) : (
                      "Entrar"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="Seu nome completo"
                        className="pl-10"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                      />
                    </div>
                    {errors.name && (
                      <Alert variant="destructive">
                        <AlertDescription>{errors.name}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="seu@email.com"
                        className="pl-10"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                      />
                    </div>
                    {errors.email && (
                      <Alert variant="destructive">
                        <AlertDescription>{errors.email}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                      />
                    </div>
                    {errors.password && (
                      <Alert variant="destructive">
                        <AlertDescription>{errors.password}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      />
                    </div>
                    {errors.confirmPassword && (
                      <Alert variant="destructive">
                        <AlertDescription>{errors.confirmPassword}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full health-gradient shadow-health"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Criando conta...</>
                    ) : (
                      "Criar conta gratuita"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-gray-600">
          Ao criar uma conta, você concorda com nossos termos de uso e política de privacidade.
        </div>
      </div>
    </div>
  );
};

export default Auth;
