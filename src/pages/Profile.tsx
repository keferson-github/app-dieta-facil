import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Edit, 
  Save,
  Camera,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Target,
  Activity,
  Scale,
  Ruler,
  Heart,
  Trophy,
  Star,
  Upload
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Tables } from "@/integrations/supabase/types";
import Layout from "@/components/Layout";

const Profile = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Tables<"user_profiles"> | null>(null);
  const [userMetadata, setUserMetadata] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    bio: "",
    age: 0,
    gender: "",
    height: 0,
    weight: 0,
    target_weight: 0,
    activity_level: "",
    goal: "",
    phone: "",
    location: ""
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Load user metadata
      setUserMetadata(session.user.user_metadata);

      // Load profile data
      const { data: profileData, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (profileData) {
        setProfile(profileData);
        setFormData({
          full_name: session.user.user_metadata?.full_name || "",
          bio: profileData.bio || "",
          age: profileData.age || 0,
          gender: profileData.gender || "",
          height: profileData.height || 0,
          weight: profileData.weight || 0,
          target_weight: profileData.target_weight || 0,
          activity_level: profileData.activity_level || "",
          goal: profileData.goal || "",
          phone: profileData.phone || "",
          location: profileData.location || ""
        });
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o perfil",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Update user metadata (name)
      if (formData.full_name !== userMetadata?.full_name) {
        const { error: authError } = await supabase.auth.updateUser({
          data: { full_name: formData.full_name }
        });
        if (authError) throw authError;
      }

      // Update profile data
      const profileUpdate = {
        bio: formData.bio,
        age: formData.age,
        gender: formData.gender,
        height: formData.height,
        weight: formData.weight,
        target_weight: formData.target_weight,
        activity_level: formData.activity_level,
        goal: formData.goal,
        phone: formData.phone,
        location: formData.location,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: session.user.id,
          ...profileUpdate
        });

      if (error) throw error;

      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso",
      });

      setEditing(false);
      loadProfile();
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as alterações",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getActivityLevelLabel = (level: string) => {
    const levels = {
      sedentary: "Sedentário",
      lightly_active: "Levemente ativo",
      moderately_active: "Moderadamente ativo",
      very_active: "Muito ativo",
      extremely_active: "Extremamente ativo"
    };
    return levels[level as keyof typeof levels] || level;
  };

  const getGoalLabel = (goal: string) => {
    const goals = {
      lose_weight: "Perder peso",
      maintain_weight: "Manter peso",
      gain_muscle: "Ganhar massa muscular"
    };
    return goals[goal as keyof typeof goals] || goal;
  };

  const calculateBMI = () => {
    if (formData.height && formData.weight) {
      return (formData.weight / Math.pow(formData.height / 100, 2)).toFixed(1);
    }
    return null;
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: "Abaixo do peso", color: "text-blue-600" };
    if (bmi < 25) return { label: "Peso normal", color: "text-green-600" };
    if (bmi < 30) return { label: "Sobrepeso", color: "text-yellow-600" };
    return { label: "Obesidade", color: "text-red-600" };
  };

  if (loading) {
    return (
      <Layout title="Meu Perfil" description="Carregando suas informações...">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 health-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-health-500 mx-auto mb-4"></div>
            <p className="text-lg font-medium text-secondary-dark">Carregando perfil...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const bmi = calculateBMI();
  const bmiCategory = bmi ? getBMICategory(Number(bmi)) : null;

  return (
    <Layout 
      title="👤 Meu Perfil" 
      description="Gerencie suas informações pessoais"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header Actions */}
        <div className="flex justify-end mb-6">
          <Button
            onClick={() => editing ? handleSave() : setEditing(true)}
            className={editing ? "health-gradient shadow-health" : ""}
            variant={editing ? "default" : "outline"}
            disabled={saving}
          >
            {editing ? (
              <>
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Salvando..." : "Salvar"}
              </>
            ) : (
              <>
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="glass-effect">
              <CardContent className="p-6 text-center">
                <div className="relative mb-4">
                  <Avatar className="w-24 h-24 mx-auto">
                    <AvatarImage src={userMetadata?.avatar_url} />
                    <AvatarFallback className="text-2xl">
                      {formData.full_name.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {editing && (
                    <Button
                      size="sm"
                      className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                      variant="outline"
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {editing ? (
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    className="text-center font-semibold text-lg mb-2"
                    placeholder="Seu nome completo"
                  />
                ) : (
                  <h2 className="text-xl font-semibold text-primary-dark mb-2">
                    {formData.full_name || "Nome não informado"}
                  </h2>
                )}

                <div className="flex items-center justify-center gap-1 text-sm text-gray-500 mb-4">
                  <Mail className="w-4 h-4" />
                  {userMetadata?.email}
                </div>

                {editing ? (
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    placeholder="Conte um pouco sobre você..."
                    className="text-center text-sm"
                    rows={3}
                  />
                ) : (
                  <p className="text-sm text-gray-600">
                    {formData.bio || "Nenhuma biografia adicionada"}
                  </p>
                )}

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t">
                  <div className="text-center">
                    <div className="text-lg font-bold text-health-600">
                      {profile?.created_at ? 
                        Math.ceil((new Date().getTime() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24)) :
                        0
                      }
                    </div>
                    <div className="text-xs text-gray-500">dias conosco</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">Nível 1</div>
                    <div className="text-xs text-gray-500">progresso</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-health-500" />
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="age">Idade</Label>
                    {editing ? (
                      <Input
                        id="age"
                        type="number"
                        value={formData.age}
                        onChange={(e) => setFormData({...formData, age: Number(e.target.value)})}
                      />
                    ) : (
                      <div className="p-2 bg-gray-50 rounded-md">
                        {formData.age || "Não informado"} anos
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="gender">Gênero</Label>
                    {editing ? (
                      <Select value={formData.gender} onValueChange={(value) => setFormData({...formData, gender: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Masculino</SelectItem>
                          <SelectItem value="female">Feminino</SelectItem>
                          <SelectItem value="other">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="p-2 bg-gray-50 rounded-md">
                        {formData.gender === 'male' ? 'Masculino' : 
                         formData.gender === 'female' ? 'Feminino' : 
                         formData.gender === 'other' ? 'Outro' : 'Não informado'}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    {editing ? (
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="(11) 99999-9999"
                      />
                    ) : (
                      <div className="p-2 bg-gray-50 rounded-md">
                        {formData.phone || "Não informado"}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="location">Localização</Label>
                    {editing ? (
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        placeholder="Cidade, Estado"
                      />
                    ) : (
                      <div className="p-2 bg-gray-50 rounded-md">
                        {formData.location || "Não informado"}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Physical Information */}
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-health-500" />
                  Informações Físicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="height">Altura (cm)</Label>
                    {editing ? (
                      <Input
                        id="height"
                        type="number"
                        value={formData.height}
                        onChange={(e) => setFormData({...formData, height: Number(e.target.value)})}
                      />
                    ) : (
                      <div className="p-2 bg-gray-50 rounded-md">
                        {formData.height || "Não informado"} cm
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="weight">Peso Atual (kg)</Label>
                    {editing ? (
                      <Input
                        id="weight"
                        type="number"
                        step="0.1"
                        value={formData.weight}
                        onChange={(e) => setFormData({...formData, weight: Number(e.target.value)})}
                      />
                    ) : (
                      <div className="p-2 bg-gray-50 rounded-md">
                        {formData.weight || "Não informado"} kg
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="target_weight">Peso Meta (kg)</Label>
                    {editing ? (
                      <Input
                        id="target_weight"
                        type="number"
                        step="0.1"
                        value={formData.target_weight}
                        onChange={(e) => setFormData({...formData, target_weight: Number(e.target.value)})}
                      />
                    ) : (
                      <div className="p-2 bg-gray-50 rounded-md">
                        {formData.target_weight || "Não informado"} kg
                      </div>
                    )}
                  </div>
                </div>

                {bmi && (
                  <div className="p-4 bg-health-50 dark:bg-health-950/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-primary-dark">IMC (Índice de Massa Corporal)</h4>
                        <p className="text-sm text-gray-600">Baseado na sua altura e peso atual</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-health-600">{bmi}</div>
                        <div className={`text-sm font-medium ${bmiCategory?.color}`}>
                          {bmiCategory?.label}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Fitness Goals */}
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-health-500" />
                  Objetivos Fitness
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="goal">Objetivo Principal</Label>
                    {editing ? (
                      <Select value={formData.goal} onValueChange={(value) => setFormData({...formData, goal: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione seu objetivo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lose_weight">Perder peso</SelectItem>
                          <SelectItem value="maintain_weight">Manter peso</SelectItem>
                          <SelectItem value="gain_muscle">Ganhar massa muscular</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="p-2 bg-gray-50 rounded-md">
                        {getGoalLabel(formData.goal) || "Não informado"}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="activity_level">Nível de Atividade</Label>
                    {editing ? (
                      <Select value={formData.activity_level} onValueChange={(value) => setFormData({...formData, activity_level: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione seu nível" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sedentary">Sedentário</SelectItem>
                          <SelectItem value="lightly_active">Levemente ativo</SelectItem>
                          <SelectItem value="moderately_active">Moderadamente ativo</SelectItem>
                          <SelectItem value="very_active">Muito ativo</SelectItem>
                          <SelectItem value="extremely_active">Extremamente ativo</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="p-2 bg-gray-50 rounded-md">
                        {getActivityLevelLabel(formData.activity_level) || "Não informado"}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {editing && (
              <div className="flex gap-3">
                <Button
                  onClick={handleSave}
                  className="health-gradient shadow-health flex-1"
                  disabled={saving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Salvando..." : "Salvar Alterações"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditing(false);
                    loadProfile(); // Reset form data
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;