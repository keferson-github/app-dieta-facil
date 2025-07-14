import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft, 
  Camera,
  Plus,
  Save,
  Calendar,
  Image as ImageIcon,
  Upload,
  X,
  Eye,
  Download,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProgressPhoto {
  id: string;
  photo_url: string;
  photo_type: 'front' | 'side' | 'back';
  notes?: string;
  taken_at: string;
}

const ProgressPhotos = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [photoType, setPhotoType] = useState<'front' | 'side' | 'back'>('front');
  const [notes, setNotes] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<ProgressPhoto | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { subscription } = useSubscription();

  const checkAccess = useCallback(() => {
    if (!subscription?.subscribed || subscription?.plan !== 'Performance') {
      toast({
        title: "Acesso Restrito",
        description: "Este recurso é exclusivo do Plano Performance.",
        variant: "destructive",
      });
      navigate('/dashboard');
      return false;
    }
    return true;
  }, [subscription, toast, navigate]);

  const fetchPhotos = useCallback(async () => {
    if (!checkAccess()) return;

    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('progress_photos')
        .select('*')
        .eq('user_id', session.user.id)
        .order('taken_at', { ascending: false });

      if (error) throw error;
      setPhotos((data || []) as ProgressPhoto[]);
    } catch (error) {
      console.error('Erro ao carregar fotos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as fotos de progresso.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [checkAccess, toast]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione apenas arquivos de imagem.",
        variant: "destructive",
      });
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O arquivo deve ter no máximo 5MB.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    
    // Criar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadPhoto = async (file: File): Promise<string | null> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const fileExt = file.name.split('.').pop();
      const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('progress-photos')
        .upload(fileName, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('progress-photos')
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      return null;
    }
  };

  const handleSavePhoto = async () => {
    if (!selectedFile) {
      toast({
        title: "Nenhuma foto selecionada",
        description: "Por favor, selecione uma foto para continuar.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      setUploading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Upload da foto
      const photoUrl = await uploadPhoto(selectedFile);
      if (!photoUrl) throw new Error('Falha no upload da foto');

      // Salvar no banco de dados
      const { error } = await supabase
        .from('progress_photos')
        .insert([{
          user_id: session.user.id,
          photo_url: photoUrl,
          photo_type: photoType,
          notes: notes.trim() || null,
          taken_at: new Date().toISOString()
        }]);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Foto de progresso salva com sucesso.",
      });

      // Reset form
      setSelectedFile(null);
      setPreviewUrl(null);
      setPhotoType('front');
      setNotes('');
      setShowAddDialog(false);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      fetchPhotos();
    } catch (error) {
      console.error('Erro ao salvar foto:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a foto de progresso.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photo: ProgressPhoto) => {
    try {
      const { error } = await supabase
        .from('progress_photos')
        .delete()
        .eq('id', photo.id);

      if (error) throw error;

      // Tentar deletar do storage também
      try {
        const path = photo.photo_url.split('/').pop();
        if (path) {
          await supabase.storage
            .from('progress-photos')
            .remove([path]);
        }
      } catch (storageError) {
        console.warn('Erro ao deletar do storage:', storageError);
      }

      toast({
        title: "Foto deletada",
        description: "A foto foi removida com sucesso.",
      });

      fetchPhotos();
    } catch (error) {
      console.error('Erro ao deletar foto:', error);
      toast({
        title: "Erro",
        description: "Não foi possível deletar a foto.",
        variant: "destructive",
      });
    }
  };

  const getPhotoTypeLabel = (type: string) => {
    const labels = {
      front: 'Frontal',
      side: 'Lateral',
      back: 'Costas'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getPhotoTypeColor = (type: string) => {
    const colors = {
      front: 'bg-blue-100 text-blue-800',
      side: 'bg-green-100 text-green-800',
      back: 'bg-purple-100 text-purple-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const groupPhotosByDate = () => {
    const grouped: Record<string, ProgressPhoto[]> = {};
    photos.forEach(photo => {
      const date = new Date(photo.taken_at).toLocaleDateString('pt-BR');
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(photo);
    });
    return grouped;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-health-50 via-white to-health-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 health-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Camera className="w-8 h-8 text-white" />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-health-500 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Carregando fotos...</p>
        </div>
      </div>
    );
  }

  const groupedPhotos = groupPhotosByDate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-health-50 via-white to-health-100">
      <div className="container mx-auto px-4 py-6 lg:py-8 max-w-7xl">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-health p-6 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate('/dashboard')}
                variant="ghost"
                size="sm"
                className="mb-2 lg:mb-0"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Camera className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  📸 Fotos de Progresso
                </h1>
                <p className="text-gray-600 mt-1">
                  Documente sua transformação visual
                </p>
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 mt-2">
                  Plano Performance
                </Badge>
              </div>
            </div>
            
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="health-gradient shadow-health">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Foto
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Adicionar Foto de Progresso</DialogTitle>
                  <DialogDescription>
                    Capture seu progresso com uma nova foto.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tipo de Foto</Label>
                    <Select value={photoType} onValueChange={(value: 'front' | 'side' | 'back') => setPhotoType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="front">Frontal</SelectItem>
                        <SelectItem value="side">Lateral</SelectItem>
                        <SelectItem value="back">Costas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Foto</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      {previewUrl ? (
                        <div className="space-y-4">
                          <img 
                            src={previewUrl} 
                            alt="Preview" 
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedFile(null);
                              setPreviewUrl(null);
                              if (fileInputRef.current) {
                                fileInputRef.current.value = '';
                              }
                            }}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Remover
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-sm text-gray-600 mb-2">
                            Clique para selecionar uma foto
                          </p>
                          <p className="text-xs text-gray-400">
                            PNG, JPG até 5MB
                          </p>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Observações (opcional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Adicione suas observações sobre esta foto..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleSavePhoto}
                      disabled={saving || !selectedFile}
                      className="flex-1 health-gradient"
                    >
                      {saving ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      {uploading ? 'Enviando...' : 'Salvar'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowAddDialog(false);
                        setSelectedFile(null);
                        setPreviewUrl(null);
                        setNotes('');
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      disabled={saving}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {photos.length === 0 ? (
          <Card className="glass-effect shadow-health max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma foto registrada</h3>
              <p className="text-gray-600 mb-6">
                Comece documentando seu progresso com sua primeira foto.
              </p>
              <Button 
                onClick={() => setShowAddDialog(true)}
                className="health-gradient"
              >
                <Camera className="w-4 h-4 mr-2" />
                Primeira Foto
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="glass-effect hover:shadow-health transition-all">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total de Fotos</CardTitle>
                  <ImageIcon className="h-4 w-4 text-health-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{photos.length}</div>
                  <p className="text-xs text-gray-500">
                    Documentando seu progresso
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-effect hover:shadow-health transition-all">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Primeira Foto</CardTitle>
                  <Calendar className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold">
                    {new Date(photos[photos.length - 1]?.taken_at).toLocaleDateString('pt-BR')}
                  </div>
                  <p className="text-xs text-gray-500">
                    Início da jornada
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-effect hover:shadow-health transition-all">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Última Foto</CardTitle>
                  <Calendar className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold">
                    {new Date(photos[0]?.taken_at).toLocaleDateString('pt-BR')}
                  </div>
                  <p className="text-xs text-gray-500">
                    Registro mais recente
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Timeline de Fotos */}
            <div className="space-y-8">
              {Object.entries(groupedPhotos).map(([date, datePhotos]) => (
                <Card key={date} className="glass-effect shadow-health">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-health-500" />
                      {date}
                    </CardTitle>
                    <CardDescription>
                      {datePhotos.length} foto{datePhotos.length > 1 ? 's' : ''} registrada{datePhotos.length > 1 ? 's' : ''}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {datePhotos.map((photo) => (
                        <div key={photo.id} className="relative group">
                          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                            <img
                              src={photo.photo_url}
                              alt={`Foto ${getPhotoTypeLabel(photo.photo_type)}`}
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => {
                                    setSelectedPhoto(photo);
                                    setShowViewDialog(true);
                                  }}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDeletePhoto(photo)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                          <div className="mt-2">
                            <Badge variant="outline" className={getPhotoTypeColor(photo.photo_type)}>
                              {getPhotoTypeLabel(photo.photo_type)}
                            </Badge>
                            {photo.notes && (
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                {photo.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Dicas para Fotos */}
            <Card className="glass-effect shadow-health">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-health-500" />
                  Dicas para Melhores Fotos de Progresso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-green-600 mb-2">✅ Faça assim:</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Use sempre o mesmo local e iluminação</li>
                      <li>• Mantenha a mesma pose e distância</li>
                      <li>• Tire fotos no mesmo horário do dia</li>
                      <li>• Use roupas justas ou trajes de banho</li>
                      <li>• Mantenha postura natural e relaxada</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-600 mb-2">❌ Evite:</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Iluminação inconsistente</li>
                      <li>• Roupas muito largas ou diferentes</li>
                      <li>• Poses forçadas ou não naturais</li>
                      <li>• Fotos após treinos ou refeições</li>
                      <li>• Ângulos muito diferentes</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Dialog para visualizar foto */}
        <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Foto {selectedPhoto ? getPhotoTypeLabel(selectedPhoto.photo_type) : ''}
              </DialogTitle>
              <DialogDescription>
                {selectedPhoto && new Date(selectedPhoto.taken_at).toLocaleDateString('pt-BR')}
              </DialogDescription>
            </DialogHeader>
            {selectedPhoto && (
              <div className="space-y-4">
                <img
                  src={selectedPhoto.photo_url}
                  alt={`Foto ${getPhotoTypeLabel(selectedPhoto.photo_type)}`}
                  className="w-full max-h-96 object-contain rounded-lg"
                />
                {selectedPhoto.notes && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-700">{selectedPhoto.notes}</p>
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = selectedPhoto.photo_url;
                      link.download = `progresso-${selectedPhoto.photo_type}-${new Date(selectedPhoto.taken_at).toLocaleDateString('pt-BR')}.jpg`;
                      link.click();
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Baixar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleDeletePhoto(selectedPhoto);
                      setShowViewDialog(false);
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Deletar
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ProgressPhotos;
