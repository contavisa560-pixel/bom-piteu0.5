// src/components/UserProfile.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  User, Award, Heart, ChefHat, Mail, Shield, Globe, Camera,
  Sparkles, Nut, MilkOff, Egg, Wheat, Leaf, Fish, Sprout, CircleDot,
  AlertTriangle, WheatOff, Apple, Ban, ThermometerSun, Candy, Wine,
  CandyOff, UtensilsCrossed, Lock, Bell, Palette, Download, Trash2,
  Save, X, Check, Edit2, Eye, EyeOff, LogOut, Upload, FileText,
  Calendar, Phone, Droplets, Target, Zap, TrendingUp, Thermometer,
  Scale, Brain, Dumbbell, Baby, Pill, Moon, Sun, Monitor,
  AlertCircle, Star, ChevronDown, Plus, Minus, Settings, Key
} from 'lucide-react';
import { useTheme } from "@/context/ThemeContext";
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from "react-i18next";


// Components UI
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from '@/components/ui/progress';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import ErrorBoundary from '@/components/ErrorBoundary';

// Hooks personalizados
import { usePreferences } from '@/hooks/usePreferences';
import { useSettings } from '@/hooks/useSettings';

// APIs
import {
  getUser,
  updateUser,
  uploadAvatar,
  deleteUser,
  changePassword,
  exportUserData,
  updateExperience,
  getAuthHeaders
} from '@/services/api';


//  Função para obter o token padronizada
const getAuthToken = () => {
  return localStorage.getItem('bomPiteuToken');
};

//  Função para verificar autenticação
const isAuthenticated = () => {
  return !!getAuthToken();
};

// Função para obter ID do usuário do token
const getUserId = () => {
  const token = getAuthToken();
  if (!token) return null;

  try {
    // Extrai payload do JWT (se for JWT)
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId || payload.sub || null;
  } catch {
    // Fallback: pega do localStorage
    const userStr = localStorage.getItem('bomPiteuUser');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.id || user._id || null;
      } catch {
        return null;
      }
    }
    return null;
  }
};

// Funções auxiliares
const getInitials = (name) => {
  if (!name || typeof name !== 'string') return 'U';
  const parts = name.trim().split(' ');
  if (parts.length > 1) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name[0]?.toUpperCase() || 'U';
};

const calculateAge = (birthDate) => {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

const UserProfile = ({ user: initialUser, onNavigate }) => {
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  const certInputRef = useRef(null);
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();

  // Estados
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(true);
  console.log('🔍 Estado isDeleteDialogOpen:', isDeleteDialogOpen);
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [userError, setUserError] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('geral');
  const [editingField, setEditingField] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [activeSelect, setActiveSelect] = useState(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [otherAllergy, setOtherAllergy] = useState("");
  const [otherIntolerance, setOtherIntolerance] = useState("");
  const [newCertification, setNewCertification] = useState(null);
  const [customGoalInput, setCustomGoalInput] = useState('');
  const [enableAnimations, setEnableAnimations] = useState(false);

  // Arrays de alergias e intolerâncias
  const alergias = [
    { id: "Amendoim", label: "Alergia a Amendoim", icon: Nut, severity: "Alta" },
    { id: "Leite", label: "Alergia ao Leite", icon: MilkOff, severity: "Alta" },
    { id: "Ovo", label: "Alergia ao Ovo", icon: Egg, severity: "Média" },
    { id: "Trigo", label: "Alergia ao Trigo", icon: Wheat, severity: "Alta" },
    { id: "Frutos Secos", label: "Alergia a Frutos Secos", icon: Leaf, severity: "Alta" },
    { id: "Marisco", label: "Alergia a Marisco", icon: AlertTriangle, severity: "Alta" },
    { id: "Peixe", label: "Alergia a Peixe", icon: Fish, severity: "Média" },
    { id: "Soja", label: "Alergia à Soja", icon: Sprout, severity: "Baixa" },
    { id: "Sésamo", label: "Alergia a Sésamo", icon: CircleDot, severity: "Média" },
    { id: "Sulfitos", label: "Alergia a Sulfitos", icon: AlertTriangle, severity: "Baixa" },
  ];

  const intolerancias = [
    { id: "Lactose", label: "Intolerância à Lactose", icon: MilkOff, severity: "Média" },
    { id: "Glúten (Celíaca)", label: "Doença Celíaca (Glúten)", icon: WheatOff, severity: "Alta" },
    { id: "Glúten (Sensibilidade)", label: "Sensibilidade ao Glúten", icon: Ban, severity: "Média" },
    { id: "Frutose", label: "Intolerância à Frutose", icon: Apple, severity: "Média" },
    { id: "Frutose", label: "Frutose Hereditária", icon: Ban, severity: "Alta" },
    { id: "Histamina", label: "Intolerância à Histamina", icon: ThermometerSun, severity: "Média" },
    { id: "Sacarose", label: "Intolerância à Sacarose", icon: Candy, severity: "Baixa" },
    { id: "Álcool", label: "Intolerância ao Álcool", icon: Wine, severity: "Média" },
    { id: "Sorbitol", label: "Intolerância ao Sorbitol", icon: CandyOff, severity: "Baixa" },
    { id: "FODMAP", label: "Síndrome FODMAP", icon: UtensilsCrossed, severity: "Alta" },
  ];

  // Estado principal do utilizador
  const [user, setUser] = useState(() => {
    try {
      const local = localStorage.getItem('bomPiteuUser') || localStorage.getItem('smartchef_user');
      return initialUser || (local ? JSON.parse(local) : null);
    } catch (e) {
      console.error('Erro ao carregar usuário:', e);
      return initialUser || null;
    }
  });

  // Chave local por utilizador
  const LOCAL_USER_KEY = user?.id ? `bomPiteuUser_${user.id}` : 'bomPiteuUser';

  const [profileImage, setProfileImage] = useState(() => {
    if (!user) return '';
    const stored = localStorage.getItem(LOCAL_USER_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed.picture || user.picture || '';
      } catch {
        return user.picture || '';
      }
    }
    return user.picture || '';
  });
  // Dados do perfil (editáveis)
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    birthDate: user?.birthDate || '',
    country: user?.country || 'Angola',
    language: user?.language || 'Português',
    gender: user?.gender || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
    bloodType: user?.bloodType || '',
    address: user?.address || '',
    city: user?.city || '',
    zipCode: user?.zipCode || '',
    dietaryPreferences: user?.dietaryPreferences || [],
    foodProfile: user?.foodProfile || [],
  });

  // Experiência
  const [experience, setExperience] = useState(() => ({
    level: user?.settings?.experience?.level || user?.level || 'Iniciante',
    cuisines: user?.settings?.experience?.cuisines || [],
    techniques: user?.settings?.experience?.techniques || [],
    equipment: user?.settings?.experience?.equipment || [],
    years: user?.settings?.experience?.years || user?.years || 0,
    certifications: user?.settings?.experience?.certifications || user?.certifications || []
  }));

  // Segurança
  const [security, setSecurity] = useState(() => ({
    twoFactorAuth: user?.settings?.security?.twoFactorAuth || false,
    recoveryEmail: user?.settings?.security?.recoveryEmail || user?.recoveryEmail || '',
    notifyLogin: user?.settings?.security?.notifyLogin ?? true,
    notifyPasswordChange: user?.settings?.security?.notifyPasswordChange ?? true,
    sessions: user?.settings?.security?.sessions || [],

    lastPasswordChange: user?.settings?.security?.lastPasswordChange || null,
    failedAttempts: user?.settings?.security?.failedAttempts || 0
  }));

  // 🔧 Funções auxiliares para detectar navegador e OS
  const getBrowserName = () => {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edg')) return 'Edge';
    return 'Navegador desconhecido';
  };

  const getOSName = () => {
    const ua = navigator.userAgent;
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS') || ua.includes('iPhone')) return 'iOS';
    return 'Sistema desconhecido';
  };
  // REFS PARA CANCELAR
  const originalProfileRef = useRef(null);
  const originalSecurityRef = useRef(null);
  const initialPreferencesRef = useRef(null);
  const initialSettingsRef = useRef(null);

  // Hooks personalizados
  const {
    preferences,
    loading: prefsLoading,
    error: prefsError,
    hasChanges: prefsHasChanges,
    save: savePreferences,
    addDiet,
    removeDiet,
    addAllergy,
    removeAllergy,
    addIntolerance,
    removeIntolerance,
    addGoal,
    removeGoal,
    updateMacros,
    updateField: updatePrefField,
    reset: resetPreferences,
    load: loadPreferences
  } = usePreferences();

  const {
    settings,
    loading: settingsLoading,
    error: settingsError,
    hasChanges: settingsHasChanges,
    save: saveSettings,
    updateField: updateSettingField,
    updateNotifications,
    updateSecurity,
    updatePrivacy,
    reset: resetSettings,
    sync: syncSettings
  } = useSettings();

  console.log('🔍 DEBUG - UserProfile State:', {
    user: user,
    userSettings: user?.settings,
    securityState: security,
    hookSettings: settings,
    userId: user?.id
  });

  // Ativar animações após carregamento inicial
  useEffect(() => {
    const timer = setTimeout(() => setEnableAnimations(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Timeout de segurança para evitar loading infinito
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (loadingUser) {
        console.warn("Loading timeout - forçando saída do loading");
        setLoadingUser(false);
      }
    }, 10000); // 10 segundos máximo

    return () => clearTimeout(timeoutId);
  }, [loadingUser]);

  useEffect(() => {
    if (!user) {
      // Tentar carregar do localStorage
      try {
        const local = localStorage.getItem('bomPiteuUser') || localStorage.getItem('smartchef_user');
        if (local) {
          const parsedUser = JSON.parse(local);
          setUser(parsedUser);
        }
      } catch (e) {
        console.error('Erro ao carregar usuário:', e);
      } finally {
        setLoadingUser(false);
      }
    } else {
      setLoadingUser(false);
    }
  }, []);

  // FUNÇÃO CANCELAR PARA TODAS AS ABAS (CORRIGIDA)
  const handleCancelAll = useCallback(() => {
    // Restaurar dados do perfil original
    if (originalProfileRef.current) {
      setProfileData(originalProfileRef.current);
    }

    // Restaurar preferências
    if (resetPreferences) {
      resetPreferences();
    }

    // Restaurar configurações
    if (resetSettings) {
      resetSettings();
    }

    // Restaurar dados de segurança
    if (originalSecurityRef.current) {
      setSecurity(originalSecurityRef.current);
    }

    // Limpar estados temporários
    setEditingField(null);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setDeletePassword('');
    setOtherAllergy('');
    setOtherIntolerance('');
    setCustomGoalInput('');

    toast({
      title: 'Alterações descartadas',
      description: 'Todos os dados foram restaurados com sucesso.',
    });
  }, [resetPreferences, resetSettings, toast]);

  // Função para persistir usuário no localStorage
  const persistLocalUser = useCallback((userData) => {
    try {
      const current = JSON.parse(localStorage.getItem(LOCAL_USER_KEY) || '{}');
      const merged = { ...current, ...userData };
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(merged));
      localStorage.setItem('bomPiteuUser', JSON.stringify(merged));
      setUser(prev => ({ ...prev, ...merged }));
    } catch (error) {
      console.error('Erro ao persistir usuário local:', error);
    }
  }, [LOCAL_USER_KEY]);

  // Salvar no servidor - CORRIGIDO
  const saveToServer = useCallback(async (payload, showToast = true) => {
    setLoading(true);
    try {
      const res = await updateUser(user.id, payload);
      const updatedUser = {
        ...user,
        ...payload,
        ...(res?.user || {})
      };

      // 🔥 GARANTIR ATUALIZAÇÃO COMPLETA DO ESTADO
      setUser(updatedUser);
      persistLocalUser(updatedUser);

      // 🔥 ATUALIZAR profileData também para sincronizar
      setProfileData(prev => ({
        ...prev,
        ...payload
      }));

      if (showToast) {
        toast({
          title: 'Alterações guardadas',
          description: 'As suas informações foram atualizadas com sucesso.',
          duration: 3000,
        });
      }
      return updatedUser;
    } catch (err) {
      console.error('Erro ao salvar no servidor:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível guardar as alterações. Verifique sua conexão.',
        variant: 'destructive',
        duration: 5000,
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, persistLocalUser, toast]);

  // Funções de perfil - CORRIGIDO
  const handleProfileField = useCallback((field, value) => {
    console.log('📝 Campo alterado:', field, '| Novo valor:', value);
    setProfileData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSaveProfile = useCallback(async () => {
    if (loading) return;

    // Pequeno delay para estabilizar o DOM
    await new Promise(resolve => setTimeout(resolve, 50));

    // Validações básicas
    if (!profileData.name?.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Por favor, insira seu nome completo.',
        variant: 'destructive',
      });
      return;
    }

    if (!profileData.email?.trim() || !/\S+@\S+\.\S+/.test(profileData.email)) {
      toast({
        title: 'Email inválido',
        description: 'Por favor, insira um email válido.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // 🔥 NOVO: FILTRAR CAMPOS VAZIOS ANTES DE ENVIAR
      const cleanedData = {};

      for (const [key, value] of Object.entries(profileData)) {
        // Sempre enviar esses campos (obrigatórios)
        if (['name', 'email'].includes(key)) {
          cleanedData[key] = value;
          continue;
        }

        // Ignorar strings vazias para campos enum (gender, bloodType)
        if (key === 'gender' || key === 'bloodType') {
          if (value && value.trim() !== '') {
            cleanedData[key] = value;
          }
          // Se vazio, não envia (deixa o backend usar o default)
          continue;
        }

        // Outros campos: enviar se não for string vazia
        if (value !== '' && value !== null && value !== undefined) {
          cleanedData[key] = value;
        }
      }

      console.log('📤 Dados enviados ao servidor:', cleanedData);

      const updatedUser = await saveToServer({
        ...cleanedData,
        updatedAt: new Date().toISOString(),
      });
      setProfileData(prev => ({
        ...prev,
        bloodType: cleanedData.bloodType ?? prev.bloodType
      }));


      setEditingField(null);

      // 🔥 RESOLVIDO: Garantir que não fique em estado de carregamento
      setLoadingUser(false);

      toast({
        title: 'Perfil atualizado!',
        description: 'Suas informações pessoais foram salvas com sucesso.',
        duration: 3000,
      });
    } catch (error) {
      console.error('❌ Erro ao salvar perfil:', error);
      // 🔥 RESOLVIDO: Também em caso de erro
      setLoadingUser(false);
    }
  }, [profileData, saveToServer, loading, toast]);

  // Upload de imagem
  const handleImageChange = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validações
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Arquivo inválido',
        description: 'Por favor, selecione uma imagem.',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast({
        title: 'Arquivo muito grande',
        description: 'A imagem deve ter no máximo 5MB.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);

      // Criar preview local
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result;
        setProfileImage(base64Image);

        // Atualizar estado local imediatamente
        const updatedUser = { ...user, picture: base64Image };
        setUser(updatedUser);
        persistLocalUser(updatedUser);

        toast({
          title: 'Foto atualizada!',
          description: 'Sua foto de perfil foi alterada com sucesso.',
        });
      };
      reader.readAsDataURL(file);

      // Upload para servidor
      try {
        const formData = new FormData();
        formData.append('avatar', file);
        await uploadAvatar(user.id, formData);
      } catch (err) {
        console.error('Erro no upload para servidor:', err);
      }

    } catch (err) {
      console.error('Erro no upload:', err);
      toast({
        title: 'Erro no upload',
        description: 'Não foi possível atualizar a foto. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setShowMenu(false);
    }
  }, [user, persistLocalUser, toast]);

  // FUNÇÕES PARA ALERGIAS E INTOLERÂNCIAS
  const handleAllergyToggle = useCallback((alergia) => {
    const hasAllergy = preferences.allergies?.some(a => a.name === alergia.id);

    if (hasAllergy) {
      removeAllergy(alergia.id);
    } else {
      addAllergy(alergia.id, 'moderada', alergia.label);
    }
  }, [preferences.allergies, addAllergy, removeAllergy]);

  const handleIntoleranceToggle = useCallback((intolerancia) => {
    const hasIntolerance = preferences.intolerances?.some(i => i.name === intolerancia.id);

    if (hasIntolerance) {
      removeIntolerance(intolerancia.id);
    } else {
      addIntolerance(intolerancia.id, intolerancia.label);
    }
  }, [preferences.intolerances, addIntolerance, removeIntolerance]);

  const addCustomAllergy = useCallback(() => {
    if (!otherAllergy.trim()) return;
    addAllergy('Outro', 'moderada', otherAllergy);
    setOtherAllergy('');

    toast({
      title: 'Alergia adicionada',
      description: 'Sua alergia personalizada foi adicionada.',
    });
  }, [otherAllergy, addAllergy, toast]);

  const addCustomIntolerance = useCallback(() => {
    if (!otherIntolerance.trim()) return;

    addIntolerance('Outro', otherIntolerance);
    setOtherIntolerance('');

    toast({
      title: 'Intolerância adicionada',
      description: 'Sua intolerância personalizada foi adicionada.',
    });
  }, [otherIntolerance, addIntolerance, toast]);

  // Experiência culinária
  const toggleCuisine = useCallback((cuisine, difficulty = 'Intermediário') => {
    setExperience(prev => {
      const exists = prev.cuisines.find(c => c.name === cuisine);
      let nextCuisines;

      if (exists) {
        nextCuisines = prev.cuisines.filter(c => c.name !== cuisine);
      } else {
        nextCuisines = [...prev.cuisines, { name: cuisine, difficulty }];
      }

      const next = { ...prev, cuisines: nextCuisines };
      return next;
    });
  }, []);

  const toggleTechnique = useCallback((technique, difficulty = 'Intermediário') => {
    setExperience(prev => {
      const exists = prev.techniques.find(t => t.name === technique);
      let nextTechniques;

      if (exists) {
        nextTechniques = prev.techniques.filter(t => t.name !== technique);
      } else {
        nextTechniques = [...prev.techniques, { name: technique, difficulty }];
      }

      const next = { ...prev, techniques: nextTechniques };
      return next;
    });
  }, []);

  const toggleEquipment = useCallback((eq) => {
    setExperience(prev => {
      const exists = prev.equipment.includes(eq);
      const nextEquipment = exists
        ? prev.equipment.filter(e => e !== eq)
        : [...prev.equipment, eq];

      const next = { ...prev, equipment: nextEquipment };
      return next;
    });
  }, []);

  const uploadCertification = useCallback(async (file) => {
    if (!file) return;

    // Validação de tipo de arquivo
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Tipo de arquivo inválido',
        description: 'Apenas PDF, JPG e PNG são permitidos.',
        variant: 'destructive',
      });
      return;
    }

    // Validação de tamanho
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        title: 'Arquivo muito grande',
        description: 'O certificado deve ter no máximo 5MB.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);

      // Criar objeto de certificado CORRETO
      const newCert = {
        id: `cert_${Date.now()}`,
        name: file.name,
        url: URL.createObjectURL(file),
        uploadedAt: new Date().toISOString(),
        type: file.type,
        size: file.size
      };

      // Criar novo array
      const nextCerts = [...(experience.certifications || []), newCert];

      // Criar novo objeto experience
      const next = {
        ...experience,
        certifications: nextCerts
      };

      console.log("📤 Enviando certificações para backend:", next.certifications);
      setExperience(next);

      // ✅ CORREÇÃO: Garantir que estamos enviando um objeto válido
      const payload = {
        level: next.level,
        years: next.years,
        techniques: next.techniques || [],
        equipment: next.equipment || [],
        certifications: next.certifications.map(cert => ({
          id: cert.id,
          name: cert.name,
          url: cert.url,
          uploadedAt: cert.uploadedAt,
          type: cert.type,
          size: cert.size
        }))
      };

      // Salvar no servidor
      await updateExperience(user.id, payload);

      toast({
        title: 'Certificado enviado',
        description: 'Seu certificado foi adicionado com sucesso.',
      });
    } catch (error) {
      console.error('❌ Erro ao enviar certificado:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar o certificado.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [experience, user.id, toast]);

  const removeCertification = useCallback((certId) => {
    const nextCerts = experience.certifications.filter(cert => cert.id !== certId);
    const next = { ...experience, certifications: nextCerts };
    setExperience(next);
    saveSettings({ experience: next });

    toast({
      title: 'Certificado removido',
      description: 'Seu certificado foi removido com sucesso.',
    });
  }, [experience, saveSettings, toast]);

  const saveExperience = useCallback(async () => {
    try {
      setLoading(true);
      await updateExperience(user.id, experience);

      // ✅ ATUALIZAR ESTADO LOCAL também
      persistLocalUser({
        settings: {
          ...user.settings,
          experience: experience
        }
      });

      toast({
        title: '✅ Experiência salva',
        description: 'Suas informações de experiência foram atualizadas.',
        duration: 3000,
      });
    } catch (error) {
      console.error(' Erro ao salvar experiência:', error);
      toast({
        title: ' Erro',
        description: 'Não foi possível salvar as informações.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [experience, user.id, persistLocalUser, toast]);

  // Segurança
  const toggle2FA = useCallback(async () => {
    const newTwoFactorAuth = !security.twoFactorAuth;

    try {
      // 1. Primeiro, construir o objeto settings completo
      const updatedSettings = {
        ...settings,
        security: {
          ...settings?.security,
          twoFactorAuth: newTwoFactorAuth
        }
      };

      // 2. Salvar no servidor
      const result = await saveSettings(updatedSettings);

      if (result?.success) {
        // 3. Atualizar estado local
        setSecurity(prev => ({
          ...prev,
          twoFactorAuth: newTwoFactorAuth
        }));

        toast({
          title: newTwoFactorAuth ? '2FA Ativado' : '2FA Desativado',
          description: newTwoFactorAuth
            ? 'Agora sua conta está mais segura com 2FA ativado.'
            : 'A autenticação de dois fatores foi desativada.',
        });
      }
    } catch (error) {
      console.error('Erro ao alterar 2FA:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar a configuração de 2FA.',
        variant: 'destructive',
      });
    }
  }, [security.twoFactorAuth, settings, saveSettings, toast]);

  const handleUpdateRecoveryEmail = useCallback(async () => {
    if (!security.recoveryEmail?.trim()) {
      toast({
        title: 'Email vazio',
        description: 'Por favor, digite um email válido.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const updatedSettings = {
        ...settings,
        security: {
          ...settings?.security,
          recoveryEmail: security.recoveryEmail
        }
      };

      const result = await saveSettings(updatedSettings);

      if (result?.success) {
        toast({
          title: 'Email atualizado',
          description: 'Seu email de recuperação foi atualizado.',
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar email:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o email.',
        variant: 'destructive',
      });
    }
  }, [security.recoveryEmail, settings, saveSettings, toast]);

  const handlePasswordChange = useCallback(async (e) => {
    e.preventDefault();

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos de senha.',
        variant: 'destructive',
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'Senhas não coincidem',
        description: 'A nova senha e confirmação devem ser iguais.',
        variant: 'destructive',
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: 'Senha muito curta',
        description: 'A senha deve ter pelo menos 8 caracteres.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);

      console.log('🔑 Tentando alterar senha com dados:', {
        temSenhaAtual: !!passwordData.currentPassword,
        temNovaSenha: !!passwordData.newPassword,
        senhasIguais: passwordData.newPassword === passwordData.confirmPassword
      });

      const result = await changePassword(passwordData.currentPassword, passwordData.newPassword);

      console.log('✅ Senha alterada com sucesso:', result);

      if (result.success) {
        // Atualizar segurança
        const nextSec = {
          ...security,
          lastPasswordChange: new Date().toISOString()
        };
        setSecurity(nextSec);

        toast({
          title: 'Senha alterada!',
          description: 'Sua senha foi atualizada com sucesso.',
        });

        // Limpar formulário
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }

    } catch (error) {
      console.error('❌ Erro COMPLETO ao mudar senha:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });

      // 🔥 MOSTRAR A MENSAGEM ORIGINAL DO BACKEND
      let errorMessage = error.message;

      // Se a mensagem veio do backend ("Senha atual incorreta"), mostrar ela
      if (errorMessage.includes('Senha atual incorreta')) {
        errorMessage = 'A senha atual está incorreta. Por favor, verifique e tente novamente.';
      }
      // Se for "Sessão expirada", mostrar mensagem amigável
      else if (errorMessage.includes('Sessão expirada')) {
        errorMessage = 'Sua sessão expirou. Por favor, faça login novamente.';
      }

      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [security, passwordData, toast]);
  // Carregar sessões reais do backend
  const loadSessions = useCallback(async () => {
    if (!user?.id) return;

    try {
      console.log('🔄 Carregando sessões...');
      const response = await fetch(`http://localhost:5000/api/sessions/sessions`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Sessões carregadas:', data.sessions);

        setSecurity(prev => ({
          ...prev,
          sessions: data.sessions || []
        }));
      } else {
        console.error('❌ Erro ao carregar sessões:', response.status);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar sessões:', error);
    }
  }, [user?.id]);

  // Revogar sessão específica
  const revokeSession = useCallback(async (sessionId) => {
    try {
      console.log('🔄 Revogando sessão:', sessionId);
      const response = await fetch(`http://localhost:5000/api/sessions/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        // Recarregar sessões
        await loadSessions();
        toast({
          title: 'Sessão revogada',
          description: 'A sessão foi desconectada com sucesso.',
        });
      } else {
        toast({
          title: 'Erro',
          description: 'Não foi possível revogar a sessão.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('❌ Erro ao revogar sessão:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível revogar a sessão.',
        variant: 'destructive',
      });
    }
  }, [loadSessions, toast]);

  // Revogar todas as outras sessões
  const revokeAllSessions = useCallback(async () => {
    try {
      console.log('🔄 Revogando outras sessões...');
      const response = await fetch(`http://localhost:5000/api/sessions/sessions/revoke-others`, {
        method: 'POST',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        // Recarregar sessões
        await loadSessions();
        toast({
          title: 'Sessões finalizadas',
          description: 'Todas as outras sessões foram encerradas.',
        });
      } else {
        toast({
          title: 'Erro',
          description: 'Não foi possível finalizar as sessões.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('❌ Erro ao revogar outras sessões:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível finalizar as sessões.',
        variant: 'destructive',
      });
    }
  }, [loadSessions, toast]);

  // Carregar sessões quando abrir a aba de segurança
  useEffect(() => {
    if (user?.id && activeTab === 'seguranca') {
      console.log('📱 Aba segurança aberta - carregando sessões');
      loadSessions();
    }
  }, [user?.id, activeTab, loadSessions]);
  // Funções para objetivos
  const toggleGoal = useCallback((goal) => {
    const hasGoal = preferences.goals?.some(g => g.name === goal);

    if (hasGoal) {
      removeGoal(goal);
    } else {
      addGoal(goal, 'moderado');
    }
  }, [preferences.goals, addGoal, removeGoal]);

  const addCustomGoal = useCallback(() => {
    if (!customGoalInput.trim()) return;

    addGoal('Outro', 'moderado', customGoalInput);
    setCustomGoalInput('');

    toast({
      title: 'Objetivo adicionado',
      description: 'Seu objetivo personalizado foi adicionado.',
    });
  }, [customGoalInput, addGoal, toast]);

  // Exportação de dados
  const exportAccount = useCallback(async () => {
    setIsExporting(true);
    try {
      const data = await exportUserData(user.id);

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_${user.id}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Backup exportado',
        description: 'Seus dados foram salvos localmente.',
      });
    } catch (error) {
      console.error('Erro na exportação:', error);
      toast({
        title: 'Erro na exportação',
        description: 'Não foi possível exportar seus dados.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  }, [user?.id, toast]);

  // Eliminação de conta
  const handleDeleteAccount = useCallback(async () => {
    if (!deletePassword.trim()) {
      toast({
        title: ' Senha obrigatória',
        description: 'Por favor, digite sua senha para confirmar.',
        variant: 'destructive',
      });
      return;
    }

    setIsDeleting(true);
    try {
      console.log(' Tentando eliminar conta...');

      //  PRIMEIRO: Verificar senha atual
      await changePassword(deletePassword, 'temporary_check_123');

      console.log(' Senha verificada. Eliminando conta...');

      // SEGUNDO: Eliminar conta
      await deleteUser(user.id);

      // Limpar localStorage COMPLETAMENTE
      localStorage.clear();

      toast({
        title: ' Conta eliminada',
        description: 'Sua conta foi removida com sucesso.',
        duration: 3000,
      });

      // Redirecionar após 2 segundos
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);

    } catch (error) {
      console.error(' Erro ao eliminar conta:', error);

      let errorMessage = 'Não foi possível eliminar a conta. ';

      if (error.message.includes('Senha') || error.message.includes('senha')) {
        errorMessage = 'Senha incorreta. Por favor, tente novamente.';
      } else if (error.message.includes('Sessão') || error.message.includes('401')) {
        errorMessage = 'Sessão expirada. Faça login novamente.';
      } else {
        errorMessage += error.message;
      }

      toast({
        title: ' Erro',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setDeletePassword("");
      setIsDeleteDialogOpen(false);
    }
  }, [user?.id, deletePassword, toast]);

  // Desativar conta temporariamente
  const handleDeactivateAccount = useCallback(async () => {
    try {
      setLoading(true);
      console.log(' Desativando conta...');

      // Atualizar usuário para inativo
      await updateUser(user.id, {
        active: false,
        deactivatedAt: new Date().toISOString(),
        status: 'inactive'
      });

      // Marcar no localStorage
      localStorage.setItem('account_deactivated', 'true');
      localStorage.setItem('deactivation_date', new Date().toISOString());

      toast({
        title: ' Conta desativada',
        description: 'Sua conta foi desativada temporariamente. Faça login para reativar.',
        duration: 5000,
      });

      // Redirecionar após 3 segundos
      setTimeout(() => {
        window.location.href = '/login';
      }, 3000);

    } catch (error) {
      console.error(' Erro ao desativar conta:', error);
      toast({
        title: ' Erro',
        description: error.message || 'Não foi possível desativar a conta.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setIsDeactivateDialogOpen(false);
    }
  }, [user?.id, toast]);


  // Resetar configurações
  const handleResetSettings = useCallback(async () => {
    try {
      resetSettings();
      toast({
        title: 'Configurações resetadas',
        description: 'Suas configurações foram restauradas para os valores padrão.',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível resetar as configurações.',
        variant: 'destructive',
      });
    }
  }, [resetSettings, toast]);

  // Resetar preferências
  const handleResetPreferences = useCallback(async () => {
    try {
      resetPreferences();
      toast({
        title: 'Preferências resetadas',
        description: 'Suas preferências alimentares foram restauradas para os valores padrão.',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível resetar as preferências.',
        variant: 'destructive',
      });
    }
  }, [resetPreferences, toast]);

  // CORREÇÃO: useEffect para inicializar dados
  useEffect(() => {
    if (!user) return;

    const profileSnapshot = {
      name: user.name || '',
      email: user.email || '',
      birthDate: user.birthDate || '',
      country: user.country || 'Angola',
      language: user.language || 'Português',
      gender: user.gender || '',
      bio: user.bio || '',
      phone: user.phone || '',
      bloodType: user.bloodType || '',
    };

    console.log('🩸 bloodType do user:', user.bloodType);
    console.log('📋 profileSnapshot:', profileSnapshot);
    setProfileData(prev => ({
      ...prev,
      ...profileSnapshot,
    }));

    // Guardar snapshot original
    originalProfileRef.current = profileSnapshot;
    originalSecurityRef.current = security;

    if (user.picture) {
      setProfileImage(user.picture);
    }
  }, [user]);

  useEffect(() => {
    // Guardar snapshots iniciais para Cancelar
    if (preferences && !initialPreferencesRef.current) {
      initialPreferencesRef.current = JSON.parse(JSON.stringify(preferences));
    }
    if (settings && !initialSettingsRef.current) {
      initialSettingsRef.current = JSON.parse(JSON.stringify(settings));
    }
  }, [preferences, settings]);

  // CORREÇÃO: Tema sincronizado com settings
  useEffect(() => {
    if (!settings) return;

    const appliedTheme = settings.theme || 'system';

    if (appliedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (appliedTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }

    localStorage.setItem("smartchef_theme", appliedTheme);

    // Atualizar também no ThemeContext
    if (setTheme) {
      setTheme(appliedTheme);
    }
  }, [settings?.theme, setTheme]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Limpar eventuais listeners ou timeouts
      const fileInput = fileInputRef.current;
      const certInput = certInputRef.current;

      if (fileInput) {
        fileInput.value = '';
      }
      if (certInput) {
        certInput.value = '';
      }
    };
  }, []);

  // Cálculo de idade
  const userAge = profileData.birthDate ? calculateAge(profileData.birthDate) : null;

  // Progresso
  const progressPercentage = user?.level > 0
    ? Math.min(100, ((user?.points || 0) / (user.level * 100)) * 100)
    : 0;

  const stats = [
    { icon: ChefHat, value: user?.level || 1, label: "Nível", color: "text-orange-500", bg: "bg-orange-50" },
    { icon: Award, value: user?.points || 0, label: "Pontos", color: "text-blue-500", bg: "bg-blue-50" },
    { icon: Heart, value: user?.favorites?.length || 0, label: "Favoritos", color: "text-pink-500", bg: "bg-pink-50" },
    { icon: Calendar, value: userAge || '--', label: "Idade", color: "text-green-500", bg: "bg-green-50" },
  ];

  // Técnicas culinárias disponíveis
  const availableTechniques = [
    { name: 'Corte de Legumes', difficulty: 'Básico' },
    { name: 'Temperos e Marinadas', difficulty: 'Intermediário' },
    { name: 'Assados e Grelhados', difficulty: 'Intermediário' },
    { name: 'Massas Caseiras', difficulty: 'Avançado' },
    { name: 'Sous-vide', difficulty: 'Profissional' },
    { name: 'Decoração de Pratos', difficulty: 'Avançado' },
    { name: 'Panificação', difficulty: 'Intermediário' },
    { name: 'Doces e Confeitaria', difficulty: 'Avançado' },
  ];

  // Função para renderizar com animação condicional
  const AnimatedDiv = ({ children, ...props }) => {
    if (!enableAnimations) {
      return <div {...props}>{children}</div>;
    }
    return <motion.div {...props}>{children};</motion.div>
  };

  // 🚨 RESOLVIDO: LÓGICA DE CARREGAMENTO CORRIGIDA
  // 1. Primeiro verifica carregamento
  if (loadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando seu perfil...</p>
        </div>
      </div>
    );
  }

  // 2. Depois verifica se tem usuário
  if (!user || !user.id) {
    // Se chegou aqui sem loadingUser=true, é porque não encontrou usuário
    const token = getAuthToken();

    if (!token) {
      // Realmente não autenticado
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center text-orange-500">Sessão Expirada</CardTitle>
              <CardDescription className="text-center">
                Sua sessão expirou ou você não está autenticado.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-500">Para acessar seu perfil, faça login novamente.</p>
              <Button
                onClick={() => window.location.href = '/login'}
                className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
              >
                Ir para Login
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Tem token mas usuário não carregou - Pode mostrar opção de recarregar
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-blue-500">Erro ao carregar perfil</CardTitle>
            <CardDescription className="text-center">
              Não foi possível carregar suas informações.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto" />
            <p className="text-gray-500">Verifique sua conexão ou tente novamente.</p>
            <div className="flex gap-2 justify-center">
              <Button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
              >
                Recarregar Página
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = '/'}
              >
                Voltar ao Início
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <TooltipProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          {/* Header Fixo */}
          <div className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-12 w-12 border-2 border-orange-500 shadow-lg">
                      <AvatarImage src={profileImage} alt={user.name} />
                      <AvatarFallback className="bg-gradient-to-br from-orange-100 to-yellow-100 text-orange-600 font-bold text-lg">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full shadow-md hover:scale-110 transition-transform duration-200"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="h-3 w-3" />
                    </Button>
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                      {user.name}
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user.email}
                    </p>
                  </div>
                </div>

                <Badge variant={user.isPremium ? "default" : "outline"} className={user.isPremium ? "bg-gradient-to-r from-orange-500 to-yellow-500" : ""}>
                  {user.isPremium ? "Premium" : "Free"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Conteúdo Principal */}
          <div className="container mx-auto px-4 py-6 max-w-6xl">
            {/* Tabs Navegacionais */}
            <div className="mb-8">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 md:grid-cols-6 gap-2 h-auto p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                  <TabsTrigger
                    value="geral"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-orange-600 py-3 rounded-lg hover:bg-white/50 transition-colors"
                  >
                    <User className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Dados Pessoais</span>
                    <span className="sm:hidden">Dados</span>
                  </TabsTrigger>

                  <TabsTrigger
                    value="alimentacao"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-orange-600 py-3 rounded-lg hover:bg-white/50 transition-colors"
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Alimentação</span>
                    <span className="sm:hidden">Aliment.</span>
                  </TabsTrigger>

                  <TabsTrigger
                    value="experiencia"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-orange-600 py-3 rounded-lg hover:bg-white/50 transition-colors"
                  >
                    <ChefHat className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Experiência</span>
                    <span className="sm:hidden">Exp.</span>
                  </TabsTrigger>

                  <TabsTrigger
                    value="seguranca"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-orange-600 py-3 rounded-lg hover:bg-white/50 transition-colors"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Segurança</span>
                    <span className="sm:hidden">Seg.</span>
                  </TabsTrigger>

                  <TabsTrigger
                    value="definicoes"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-orange-600 py-3 rounded-lg hover:bg-white/50 transition-colors"
                  >
                    <Palette className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Definições</span>
                    <span className="sm:hidden">Def.</span>
                  </TabsTrigger>

                  <TabsTrigger
                    value="conta"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-orange-600 py-3 rounded-lg hover:bg-white/50 transition-colors"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Conta</span>
                    <span className="sm:hidden">Conta</span>
                  </TabsTrigger>
                </TabsList>

                {/* Conteúdo das Tabs */}

                {/* TAB: DADOS PESSOAIS */}
                <TabsContent value="geral" className="mt-6 space-y-6">
                  <Card className="overflow-hidden border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
                      <CardTitle className="flex items-center justify-between">
                        <span>Meu Perfil</span>
                        <Badge className="bg-white/20 hover:bg-white/30 transition-colors">
                          {user.isPremium ? "Membro Premium" : "Membro Gratuito"}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="text-white/90">
                        Gerencie suas informações pessoais e preferências
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-6">
                      {/* Avatar e Upload */}
                      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
                        <div className="relative group mx-auto md:mx-0">
                          <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
                            <AvatarImage src={profileImage} alt={user.name} />
                            <AvatarFallback className="text-3xl bg-gradient-to-br from-orange-100 to-yellow-100 text-orange-600">
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant="secondary"
                                className="absolute bottom-0 right-0 rounded-full shadow-lg hover:scale-110 transition-transform duration-200"
                                onClick={() => fileInputRef.current?.click()}
                              >
                                <Camera className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Alterar foto</TooltipContent>
                          </Tooltip>
                          <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleImageChange}
                            accept="image/*"
                          />
                        </div>

                        <div className="flex-1 text-center md:text-left w-full">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            {user.name}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 mb-4">
                            {user.email}
                          </p>

                          {/* Progresso */}
                          <div className="space-y-2 max-w-md mx-auto md:mx-0">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium text-gray-700 dark:text-gray-300">
                                Nível {user.level}
                              </span>
                              <span className="text-gray-500">
                                {user.points} / {user.level * 100} XP
                              </span>
                            </div>
                            <Progress
                              value={progressPercentage}
                              className="h-2 bg-gray-200 dark:bg-gray-700"
                            />
                          </div>
                        </div>
                      </div>

                      <Separator className="my-6" />

                      {/* Grid de Estatísticas */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        {stats.map((stat, index) => (
                          <div
                            key={index}
                            className={`${stat.bg} dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${stat.bg} dark:bg-gray-700`}>
                                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                              </div>
                              <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                  {stat.value}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {stat.label}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <Separator className="my-6" />

                      {/* Formulário de Dados Pessoais */}
                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <User className="h-5 w-5 text-orange-500" />
                          Informações Básicas
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Nome */}
                          <div className="space-y-2">
                            <Label htmlFor="name" className="text-gray-700 dark:text-gray-300 font-medium">
                              Nome Completo *
                            </Label>
                            <Input
                              id="name"
                              value={profileData.name}
                              onChange={(e) => handleProfileField('name', e.target.value)}
                              placeholder="Seu nome completo"
                              className="h-11"
                            />
                          </div>

                          {/* Email */}
                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-gray-700 dark:text-gray-300 font-medium">
                              Email *
                            </Label>
                            <Input
                              id="email"
                              type="email"
                              value={profileData.email}
                              onChange={(e) => handleProfileField('email', e.target.value)}
                              placeholder="seu@email.com"
                              className="h-11"
                            />
                          </div>

                          {/* Data de Nascimento */}
                          <div className="space-y-2">
                            <Label htmlFor="birthDate" className="text-gray-700 dark:text-gray-300 font-medium">
                              Data de Nascimento
                            </Label>
                            <Input
                              id="birthDate"
                              type="date"
                              value={profileData.birthDate}
                              onChange={(e) => handleProfileField('birthDate', e.target.value)}
                              className="h-11"
                            />
                            {userAge && (
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Idade: {userAge} anos
                              </p>
                            )}
                          </div>

                          {/* Tipo Sanguíneo */}
                          <div className="space-y-2">
                            <Label htmlFor="bloodType" className="text-gray-700 dark:text-gray-300 font-medium">
                              Tipo Sanguíneo
                            </Label>
                            <Select
                              value={profileData.bloodType || undefined}
                              onValueChange={(value) => handleProfileField('bloodType', value === "none" ? "" : value)}
                            >
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="Selecionar tipo" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">
                                  <span className="text-gray-400 italic">Não especificado</span>
                                </SelectItem>
                                <SelectItem value="A+">A+</SelectItem>
                                <SelectItem value="A-">A-</SelectItem>
                                <SelectItem value="B+">B+</SelectItem>
                                <SelectItem value="B-">B-</SelectItem>
                                <SelectItem value="AB+">AB+</SelectItem>
                                <SelectItem value="AB-">AB-</SelectItem>
                                <SelectItem value="O+">O+</SelectItem>
                                <SelectItem value="O-">O-</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Telefone */}
                          <div className="space-y-2">
                            <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300 font-medium">
                              Telefone
                            </Label>
                            <Input
                              id="phone"
                              value={profileData.phone}
                              onChange={(e) => handleProfileField('phone', e.target.value)}
                              placeholder="+244 912 345 678"
                              className="h-11"
                            />
                          </div>

                          {/* Gênero */}
                          <div className="space-y-2">
                            <Label htmlFor="gender" className="text-gray-700 dark:text-gray-300 font-medium">
                              Gênero
                            </Label>
                            <Select
                              value={profileData.gender || undefined}
                              onValueChange={(value) => handleProfileField('gender', value === "none" ? "" : value)}
                            >
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="Selecionar gênero" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">
                                  <span className="text-gray-400 italic">Não especificado</span>
                                </SelectItem>
                                <SelectItem value="Masculino">Masculino</SelectItem>
                                <SelectItem value="Feminino">Feminino</SelectItem>
                                <SelectItem value="Outro">Outro</SelectItem>
                                <SelectItem value="Prefiro não dizer">Prefiro não dizer</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* País */}
                          <div className="space-y-2">
                            <Label htmlFor="country" className="text-gray-700 dark:text-gray-300 font-medium">
                              País
                            </Label>
                            <Select
                              value={profileData.country || undefined}
                              onValueChange={(value) => handleProfileField('country', value)}
                            >
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="Selecionar país" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Angola">Angola</SelectItem>
                                <SelectItem value="Brasil">Brasil</SelectItem>
                                <SelectItem value="Portugal">Portugal</SelectItem>
                                <SelectItem value="Moçambique">Moçambique</SelectItem>
                                <SelectItem value="Outro">Outro</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Idioma */}
                          <div className="space-y-2">
                            <Label htmlFor="language" className="text-gray-700 dark:text-gray-300 font-medium">
                              Idioma Preferido
                            </Label>
                            <Select
                              value={profileData.language || undefined}
                              onValueChange={(value) => handleProfileField('language', value)}
                            >
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="Selecionar idioma" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Português">Português</SelectItem>
                                <SelectItem value="Inglês">Inglês</SelectItem>
                                <SelectItem value="Espanhol">Espanhol</SelectItem>
                                <SelectItem value="Francês">Francês</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Biografia */}
                        <div className="mt-8">
                          <Label htmlFor="bio" className="text-gray-700 dark:text-gray-300 font-medium block mb-2">
                            Sobre Você
                          </Label>
                          <Textarea
                            id="bio"
                            value={profileData.bio}
                            onChange={(e) => handleProfileField('bio', e.target.value)}
                            placeholder="Conte-nos sobre sua paixão pela gastronomia, interesses culinários ou qualquer coisa que você gostaria de compartilhar..."
                            className="min-h-[120px] resize-y"
                            rows={4}
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            {profileData.bio.length}/500 caracteres
                          </p>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
                      <div className="flex justify-end gap-3 w-full">
                        <Button
                          variant="outline"
                          onClick={handleCancelAll}
                          className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancelar
                        </Button>
                        <Button
                          onClick={handleSaveProfile}
                          disabled={loading}
                          className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 transition-all duration-200"
                        >
                          {loading ? (
                            <>
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                              Salvando...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Salvar Alterações
                            </>
                          )}
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                </TabsContent>

                {/* TAB: ALIMENTAÇÃO */}
                <TabsContent value="alimentacao" className="mt-6">
                  <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                      <CardTitle className="flex items-center gap-2">
                        <Heart className="h-6 w-6" />
                        Alimentação & Nutrição
                      </CardTitle>
                      <CardDescription className="text-white/90">
                        Configure suas preferências alimentares, dietas e restrições
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-6">
                      {/* Seção de Dietas */}
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          Dietas e Estilos Alimentares
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {[

                            { id: 'Vegetariana', label: 'Vegetariana', icon: Leaf, color: 'text-green-600', bg: 'bg-green-50' },
                            { id: 'Vegana', label: 'Vegana', icon: Sprout, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                            { id: 'Cetogênica (Keto)', label: 'Cetogênica', icon: Zap, color: 'text-purple-600', bg: 'bg-purple-50' },
                            { id: 'Mediterrânica', label: 'Mediterrânea', icon: Fish, color: 'text-blue-600', bg: 'bg-blue-50' },
                            { id: 'Low Carb', label: 'Low Carb', icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
                            { id: 'Paleo', label: 'Paleo', icon: Apple, color: 'text-amber-600', bg: 'bg-amber-50' },
                            { id: 'Flexitariana', label: 'Flexitariana', icon: Heart, color: 'text-pink-600', bg: 'bg-pink-50' },
                            { id: 'Sem Glúten', label: 'Sem Glúten', icon: WheatOff, color: 'text-red-600', bg: 'bg-red-50' },
                          ].map((diet) => {
                            const hasDiet = preferences?.diets?.includes(diet.id) || false;
                            return (
                              <div
                                key={diet.id}
                                className={`${diet.bg} dark:bg-gray-800 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${hasDiet ? 'border-green-500' : 'border-gray-200 dark:border-gray-700'}`}
                                onClick={() => {
                                  if (hasDiet) {
                                    removeDiet(diet.id);
                                  } else {
                                    addDiet(diet.id);
                                  }
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${diet.bg} dark:bg-gray-700`}>
                                      <diet.icon className={`h-5 w-5 ${diet.color}`} />
                                    </div>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                      {diet.label}
                                    </span>
                                  </div>
                                  <Checkbox
                                    checked={hasDiet}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        addDiet(diet.id);
                                      } else {
                                        removeDiet(diet.id);
                                      }
                                    }}
                                    className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <Separator className="my-8" />

                      {/* Alergias */}
                      <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Alergias Alimentares
                          </h3>
                          <Badge variant="outline" className="text-red-500 border-red-200">
                            Importante para sua segurança
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                          {alergias.map((alergia) => {
                            const hasAllergy = preferences?.allergies?.some(a => a.name === alergia.id) || false;
                            return (
                              <div
                                key={alergia.id}
                                className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all duration-200 ${hasAllergy ? 'border-red-300 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-700'}`}
                              >
                                <div className="flex items-center gap-3">
                                  <alergia.icon className={`h-5 w-5 ${hasAllergy ? 'text-red-600' : 'text-gray-400'}`} />
                                  <div>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                      {alergia.label}
                                    </span>
                                    <span className={`text-xs ml-2 px-2 py-0.5 rounded-full ${alergia.severity === 'Alta' ? 'bg-red-100 text-red-800' : alergia.severity === 'Média' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                                      {alergia.severity}
                                    </span>
                                  </div>
                                </div>
                                <Switch
                                  checked={hasAllergy}
                                  onClick={() => handleAllergyToggle(alergia)}
                                  className="data-[state=checked]:bg-red-500"
                                />
                              </div>
                            );
                          })}
                        </div>

                        <div className="mt-4">
                          <Label htmlFor="otherAllergy" className="text-gray-700 dark:text-gray-300 font-medium">
                            Outras Alergias (especificar)
                          </Label>
                          <div className="flex gap-2 mt-1">
                            <Input
                              id="otherAllergy"
                              value={otherAllergy}
                              onChange={(e) => setOtherAllergy(e.target.value)}
                              placeholder="Ex: Alergia a corantes, conservantes..."
                              className="flex-1"
                            />
                            <Button
                              onClick={addCustomAllergy}
                              disabled={!otherAllergy.trim()}
                              className="bg-red-500 hover:bg-red-600 transition-colors"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* NOVO: Lista de alergias personalizadas */}
                          {preferences?.allergies?.filter(a => a.name === 'Outro').map((allergy, index) => (
                            <div key={index} className="flex items-center justify-between mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded transition-colors hover:bg-gray-100 dark:hover:bg-gray-700">
                              <span className="text-gray-700 dark:text-gray-300">{allergy.customName}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeAllergy(allergy.customName)}

                                className="h-6 w-6 p-0 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <X className="h-3 w-3 text-red-500" />
                              </Button>
                            </div>
                          ))}
                        </div>

                      </div>

                      <Separator className="my-8" />

                      {/* Intolerâncias */}
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          Intolerâncias Alimentares
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                          {intolerancias.map((intolerancia) => {
                            const hasIntolerance = preferences?.intolerances?.some(i => i.name === intolerancia.id) || false;
                            return (
                              <div
                                key={intolerancia.id}
                                className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all duration-200 ${hasIntolerance ? 'border-orange-300 bg-orange-50 dark:bg-orange-900/20' : 'border-gray-200 dark:border-gray-700'}`}
                              >
                                <div className="flex items-center gap-3">
                                  <intolerancia.icon className={`h-5 w-5 ${hasIntolerance ? 'text-orange-600' : 'text-gray-400'}`} />
                                  <div>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                      {intolerancia.label}
                                    </span>
                                    <span className={`text-xs ml-2 px-2 py-0.5 rounded-full ${intolerancia.severity === 'Alta' ? 'bg-red-100 text-red-800' : intolerancia.severity === 'Média' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                                      {intolerancia.severity}
                                    </span>
                                  </div>
                                </div>
                                <Switch
                                  checked={hasIntolerance}
                                  onClick={() => handleIntoleranceToggle(intolerancia)}
                                  className="data-[state=checked]:bg-orange-500"
                                />
                              </div>
                            );
                          })}
                        </div>

                        <div className="mt-4">
                          <Label htmlFor="otherIntolerance" className="text-gray-700 dark:text-gray-300 font-medium">
                            Outras Intolerâncias (especificar)
                          </Label>
                          <div className="flex gap-2 mt-1">
                            <Input
                              id="otherIntolerance"
                              value={otherIntolerance}
                              onChange={(e) => setOtherIntolerance(e.target.value)}
                              placeholder="Ex: Intolerância a aditivos, fermentos..."
                              className="flex-1"
                            />
                            <Button
                              onClick={addCustomIntolerance}
                              disabled={!otherIntolerance.trim()}
                              className="bg-orange-500 hover:bg-orange-600 transition-colors"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* 🔥 NOVO: Lista de intolerâncias personalizadas */}
                          {preferences?.intolerances?.filter(i => i.name === 'Outro').map((intolerance, index) => (
                            <div key={index} className="flex items-center justify-between mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded transition-colors hover:bg-gray-100 dark:hover:bg-gray-700">
                              <span className="text-gray-700 dark:text-gray-300">{intolerance.customName}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeIntolerance(intolerance.customName)}
                                className="h-6 w-6 p-0 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <X className="h-3 w-3 text-red-500" />
                              </Button>
                            </div>
                          ))}
                        </div>

                      </div>

                      <Separator className="my-8" />

                      {/* Objetivos Nutricionais */}
                      <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Target className="h-5 w-5 text-blue-500" />
                            Objetivos Nutricionais
                          </h3>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleResetPreferences}
                            className="text-red-500 border-red-200 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Resetar Preferências
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                          {[
                            { icon: Dumbbell, label: 'Aumentar Massa Muscular', color: 'text-red-500' },
                            { icon: Scale, label: 'Perder Peso (Caloria)', color: 'text-blue-500' },
                            { icon: TrendingUp, label: 'Aumentar Força', color: 'text-orange-500' },
                            { icon: Droplets, label: 'Aumentar Proteínas', color: 'text-purple-500' },
                            { icon: Brain, label: 'Melhorar Saúde Mental', color: 'text-purple-500' },
                            { icon: Droplets, label: 'Aumentar Hidratação', color: 'text-cyan-500' },
                            { icon: Pill, label: 'Pós-Cirurgia', color: 'text-gray-500' },
                            { icon: Heart, label: 'Apoio à Menopausa', color: 'text-pink-500' },
                            { icon: TrendingUp, label: 'Performance Desportiva', color: 'text-yellow-500' },
                            { icon: Heart, label: 'Aumentar Imunidade', color: 'text-green-500' },
                            { icon: Brain, label: 'Equilíbrio Hormonal', color: 'text-indigo-500' },
                            { icon: Baby, label: 'Gestação ou Pré-Gravidez', color: 'text-green-500' },
                            { icon: Pill, label: 'Saúde Intestinal', color: 'text-amber-500' },
                            { icon: Moon, label: 'Qualidade do Sono', color: 'text-blue-500' },
                            { icon: Heart, label: 'Reduzir Colesterol', color: 'text-red-500' },
                          ].map((goal) => {
                            const hasGoal = preferences?.goals?.some(g => g.name === goal.label) || false;
                            return (
                              <div
                                key={goal.label}
                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${hasGoal ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}`}
                                onClick={() => toggleGoal(goal.label)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <goal.icon className={`h-5 w-5 ${goal.color}`} />
                                    <span className="font-medium text-gray-900 dark:text-white">
                                      {goal.label}
                                    </span>
                                  </div>
                                  {hasGoal && <Check className="h-5 w-5 text-blue-500" />}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Objetivos personalizados */}
                        <div className="mt-6">
                          <Label htmlFor="customGoal" className="text-gray-700 dark:text-gray-300 font-medium mb-2 block">
                            Adicionar Objetivo Personalizado
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              id="customGoal"
                              value={customGoalInput}
                              onChange={(e) => setCustomGoalInput(e.target.value)}
                              placeholder="Ex: Controlar colesterol, melhorar digestão..."
                              className="flex-1"
                            />
                            <Button
                              onClick={addCustomGoal}
                              disabled={!customGoalInput.trim()}
                              className="bg-blue-500 hover:bg-blue-600 transition-colors"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Lista de objetivos personalizados */}
                          {preferences?.goals?.filter(i => i.name === 'Outro').map((goal, index) => (
                            <div key={index} className="flex items-center justify-between mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded transition-colors hover:bg-gray-100 dark:hover:bg-gray-700">
                              <span className="text-gray-700 dark:text-gray-300">{goal.customName}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeGoal(goal.customName)}
                                className="h-6 w-6 p-0 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <X className="h-3 w-3 text-red-500" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Meta de Calorias */}
                      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10 p-6 rounded-xl border border-blue-200 dark:border-blue-800 mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          Meta Calórica Diária
                        </h3>
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                          <div className="flex-1">
                            <Label htmlFor="calories" className="text-gray-700 dark:text-gray-300">
                              Calorias (kcal/dia)
                            </Label>
                            <Input
                              id="calories"
                              type="number"
                              value={preferences?.calorieTarget || ''}
                              onChange={(e) => updatePrefField('calorieTarget', parseInt(e.target.value) || 0)}
                              placeholder="Ex: 2000"
                              className="mt-1"
                              min="800"
                              max="5000"
                            />
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            <p>Recomendação geral: 2000-2500 kcal</p>
                            <p className="text-xs mt-1">Consulte um nutricionista para valores personalizados</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
                      <div className="flex justify-between items-center w-full">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {prefsHasChanges ? (
                            <span className="text-orange-600 flex items-center gap-2">
                              <AlertCircle className="h-4 w-4" />
                              Você tem alterações não salvas
                            </span>
                          ) : (
                            <span className="text-green-600 flex items-center gap-2">
                              <Check className="h-4 w-4" />
                              Todas as preferências estão salvas
                            </span>
                          )}
                        </div>
                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            onClick={handleCancelAll}
                            disabled={!prefsHasChanges}
                            className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancelar
                          </Button>
                          <Button
                            onClick={async () => {
                              const result = await savePreferences();
                              if (result?.success) {
                                toast({
                                  title: 'Preferências salvas',
                                  description: 'Suas preferências alimentares foram atualizadas.',
                                });
                              }
                            }}
                            disabled={!prefsHasChanges || prefsLoading}
                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 transition-all duration-200"
                          >
                            {prefsLoading ? (
                              <>
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                                Salvando...
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4 mr-2" />
                                Salvar Preferências
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardFooter>
                  </Card>
                </TabsContent>

                {/* TAB: EXPERIÊNCIA */}
                <TabsContent value="experiencia" className="mt-6">
                  <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                      <CardTitle className="flex items-center gap-2">
                        <ChefHat className="h-6 w-6" />
                        Experiência Culinária
                      </CardTitle>
                      <CardDescription className="text-white/90">
                        Compartilhe suas habilidades, técnicas e equipamentos
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Anos de Experiência */}
                        <div className="space-y-2">
                          <Label className="text-gray-700 dark:text-gray-300 font-medium">
                            Anos de Experiência
                          </Label>
                          <div className="flex items-center gap-3">
                            <Input
                              type="number"
                              value={experience.years}
                              onChange={(e) => {
                                const years = parseInt(e.target.value) || 0;
                                const next = { ...experience, years };
                                setExperience(next);
                              }}
                              className="h-11"
                              min="0"
                              max="50"
                            />
                            <span className="text-gray-500">anos</span>
                          </div>
                        </div>

                        {/* Nível Culinário */}
                        <div className="space-y-2">
                          <Label className="text-gray-700 dark:text-gray-300 font-medium">
                            Nível Culinário
                          </Label>
                          <Select
                            value={experience.level}
                            onValueChange={(value) => {
                              const next = { ...experience, level: value };
                              setExperience(next);
                            }}
                          >
                            <SelectTrigger className="h-11">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Iniciante">Iniciante</SelectItem>
                              <SelectItem value="Intermediário">Intermediário</SelectItem>
                              <SelectItem value="Avançado">Avançado</SelectItem>
                              <SelectItem value="Profissional">Profissional</SelectItem>
                              <SelectItem value="Chef">Chef</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Técnicas Culinárias */}
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          Técnicas que Domina
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {availableTechniques.map((tech) => {
                            const hasTechnique = experience.techniques?.some(t => t.name === tech.name) || false;
                            return (
                              <div
                                key={tech.name}
                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${hasTechnique ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-gray-200 dark:border-gray-700'}`}
                                onClick={() => toggleTechnique(tech.name, tech.difficulty)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <ChefHat className="h-5 w-5 text-purple-500" />
                                    <div>
                                      <span className="font-medium text-gray-900 dark:text-white block">
                                        {tech.name}
                                      </span>
                                      <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {tech.difficulty}
                                      </span>
                                    </div>
                                  </div>
                                  {hasTechnique && <Check className="h-5 w-5 text-purple-500" />}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Equipamentos */}
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          Equipamentos Disponíveis
                        </h3>

                        <div className="flex flex-wrap gap-3">
                          {[
                            'Airfryer', 'Forno Elétrico', 'Fogão a Gás', 'Liquidificador',
                            'Panela de Pressão', 'Batedeira', 'Processador', 'Grelhador',
                            'Micro-ondas', 'Forno a Lenha', 'Churrasqueira', 'Vaporiera'
                          ].map((equipment) => {
                            const hasEquipment = experience.equipment.includes(equipment);
                            return (
                              <Badge
                                key={equipment}
                                variant={hasEquipment ? "default" : "outline"}
                                className={`cursor-pointer px-4 py-2 transition-all duration-200 ${hasEquipment ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600' : 'hover:border-purple-300 hover:text-purple-700'}`}
                                onClick={() => toggleEquipment(equipment)}
                              >
                                {hasEquipment ? (
                                  <>
                                    <Check className="h-3 w-3 mr-1" />
                                    {equipment}
                                  </>
                                ) : (
                                  equipment
                                )}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>

                      {/* Certificações */}
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          Certificações e Cursos
                        </h3>

                        <div className="space-y-4">
                          {(experience.certifications || []).map((cert) => (
                            <div
                              key={cert.id}
                              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                            >
                              <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-gray-400" />
                                <div>
                                  <div className="font-medium text-gray-900 dark:text-white">
                                    {cert.name}
                                  </div>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Enviado em {new Date(cert.uploadedAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {cert.url && (
                                  <a
                                    href={cert.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:text-blue-600 transition-colors"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </a>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeCertification(cert.id)}
                                  className="hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </div>
                          ))}

                          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-purple-500 transition-colors duration-200">
                            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600 dark:text-gray-400 mb-3">
                              Arraste certificados aqui ou clique para enviar
                            </p>
                            <input
                              ref={certInputRef}
                              type="file"
                              accept=".pdf,.jpg,.png,.jpeg"
                              className="hidden"
                              onChange={(e) => uploadCertification(e.target.files?.[0])}
                            />
                            <Button
                              variant="outline"
                              onClick={() => certInputRef.current?.click()}
                              className="border-purple-500 text-purple-600 hover:bg-purple-50 transition-colors"
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Enviar Certificado
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
                      <div className="flex justify-end gap-3 w-full">
                        <Button
                          variant="outline"
                          onClick={handleCancelAll}
                          className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancelar
                        </Button>
                        <Button
                          onClick={saveExperience}
                          disabled={loading}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
                        >
                          {loading ? (
                            <>
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                              Salvando...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Salvar Experiência
                            </>
                          )}
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                </TabsContent>

                {/* TAB: SEGURANÇA */}
                <TabsContent value="seguranca" className="mt-6">
                  <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-6 w-6" />
                        Segurança da Conta
                      </CardTitle>
                      <CardDescription className="text-white/90">
                        Proteja sua conta com configurações avançadas de segurança
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-6">
                      {/* Autenticação de Dois Fatores */}
                      <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              Autenticação de Dois Fatores (2FA)
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                              Adicione uma camada extra de segurança à sua conta
                            </p>
                          </div>
                          <Switch
                            checked={security.twoFactorAuth}
                            onClick={toggle2FA}
                            className="data-[state=checked]:bg-green-500"
                          />
                        </div>

                        <Alert className={security.twoFactorAuth ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'}>
                          <AlertTitle className="flex items-center gap-2">
                            {security.twoFactorAuth ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                            {security.twoFactorAuth ? '2FA Ativo' : '2FA Inativo'}
                          </AlertTitle>
                          <AlertDescription>
                            {security.twoFactorAuth
                              ? 'Sua conta está protegida com autenticação de dois fatores.'
                              : 'Ative o 2FA para proteger sua conta contra acessos não autorizados.'
                            }
                          </AlertDescription>
                        </Alert>
                      </div>

                      <Separator className="my-8" />

                      {/* Email de Recuperação */}
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          Email de Recuperação
                        </h3>

                        <div className="flex flex-col md:flex-row gap-4">
                          <div className="flex-1">
                            <Label htmlFor="recoveryEmail" className="text-gray-700 dark:text-gray-300">
                              Email Alternativo
                            </Label>
                            <Input
                              id="recoveryEmail"
                              type="email"
                              value={security.recoveryEmail}
                              onChange={(e) => setSecurity(prev => ({ ...prev, recoveryEmail: e.target.value }))}
                              placeholder="email@alternativo.com"
                              className="mt-1"
                            />
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                              Usado para recuperação de conta caso perca o acesso
                            </p>
                          </div>
                          <div className="flex items-end">
                            <Button
                              onClick={handleUpdateRecoveryEmail}
                              disabled={!security.recoveryEmail || loading}
                              className="bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 transition-all duration-200"
                            >
                              {loading ? (
                                <>
                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                                  Salvando...
                                </>
                              ) : (
                                <>
                                  <Save className="h-4 w-4 mr-2" />
                                  Atualizar
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>

                      <Separator className="my-8" />

                      {/* Alterar Senha */}
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          Alterar Senha
                        </h3>

                        <form onSubmit={handlePasswordChange} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="currentPassword" className="text-gray-700 dark:text-gray-300">
                                Senha Atual
                              </Label>
                              <div className="relative">
                                <Input
                                  id="currentPassword"
                                  name="currentPassword"
                                  type={showPassword ? "text" : "password"}
                                  value={passwordData.currentPassword}
                                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                  placeholder="Digite sua senha atual"
                                  className="pr-10"
                                  required
                                />
                                <button
                                  type="button"
                                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="newPassword" className="text-gray-700 dark:text-gray-300">
                                Nova Senha
                              </Label>
                              <div className="relative">
                                <Input
                                  id="newPassword"
                                  name="newPassword"
                                  type={showPassword ? "text" : "password"}
                                  value={passwordData.newPassword}
                                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                  placeholder="Mínimo 8 caracteres"
                                  className="pr-10"
                                  required
                                  minLength="8"
                                />
                                <button
                                  type="button"
                                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-gray-700 dark:text-gray-300">
                              Confirmar Nova Senha
                            </Label>
                            <div className="relative">
                              <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showPassword ? "text" : "password"}
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                placeholder="Digite novamente a nova senha"
                                required
                                className="pr-10"
                              />
                              <button
                                type="button"
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </div>

                          <div className="flex justify-end gap-3">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setPasswordData({
                                  currentPassword: '',
                                  newPassword: '',
                                  confirmPassword: ''
                                });
                                toast({
                                  title: 'Formulário limpo',
                                  description: 'Os campos de senha foram limpos.',
                                });
                              }}
                              className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Cancelar
                            </Button>
                            <Button
                              type="submit"
                              disabled={loading}
                              className="bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 transition-all duration-200"
                            >
                              {loading ? (
                                <>
                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                                  Alterando...
                                </>
                              ) : (
                                <>
                                  <Lock className="h-4 w-4 mr-2" />
                                  Alterar Senha
                                </>
                              )}
                            </Button>
                          </div>
                        </form>

                        {security.lastPasswordChange && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                            Última alteração: {new Date(security.lastPasswordChange).toLocaleDateString()}
                          </p>
                        )}
                      </div>

                      <Separator className="my-8" />

                      {/* Sessões Ativas */}
                      <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              Sessões Ativas
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                              Gerencie os dispositivos conectados à sua conta
                            </p>
                          </div>
                          <Badge variant="outline">
                            {security.sessions?.length || 0} dispositivos
                          </Badge>
                        </div>

                        <div className="space-y-3">
                          {(security.sessions || []).map((session) => (
                            <div
                              key={session.id}
                              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                            >
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${session.current ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                  {session.current ? (
                                    <Check className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <Monitor className="h-4 w-4 text-gray-400" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    {session.device}
                                  </p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {session.ip} • {new Date(session.createdAt).toLocaleString()}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {session.current ? (
                                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                    Atual
                                  </Badge>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => revokeSession(session.id)}
                                    className="hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                  >
                                    <LogOut className="h-4 w-4 mr-1" />
                                    Revogar
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-4">
                          <Button
                            variant="outline"
                            onClick={revokeAllSessions}
                            className="w-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            Terminar Todas as Outras Sessões
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* ABA DEFINIÇÕES CORRIGIDA */}
                <TabsContent value="definicoes" className="mt-6">
                  <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                      <CardTitle className="flex items-center gap-2">
                        <Palette className="h-6 w-6" />
                        Definições da Aplicação
                      </CardTitle>
                      <CardDescription className="text-white/90">
                        Personalize a aparência e comportamento do aplicativo
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-6">
                      {/* Tema */}
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          Aparência
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          {[
                            { value: 'light', label: 'Claro', icon: Sun, color: 'text-yellow-500' },
                            { value: 'dark', label: 'Escuro', icon: Moon, color: 'text-blue-500' },
                            { value: 'system', label: 'Automático', icon: Monitor, color: 'text-gray-500' },
                          ].map((themeOption) => (
                            <div
                              key={themeOption.value}
                              className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${settings?.theme === themeOption.value ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}`}
                              onClick={() => {
                                updateSettingField('theme', themeOption.value);
                                // Forçar atualização imediata do tema
                                if (themeOption.value === 'dark') {
                                  document.documentElement.classList.add('dark');
                                } else if (themeOption.value === 'light') {
                                  document.documentElement.classList.remove('dark');
                                } else {
                                  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                                  if (prefersDark) {
                                    document.documentElement.classList.add('dark');
                                  } else {
                                    document.documentElement.classList.remove('dark');
                                  }
                                }
                                localStorage.setItem("smartchef_theme", themeOption.value);
                              }}
                            >
                              <div className="flex flex-col items-center gap-3">
                                <themeOption.icon className={`h-8 w-8 ${themeOption.color}`} />
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {themeOption.label}
                                </span>
                                {settings?.theme === themeOption.value && (
                                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                    Ativo
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="compactMode" className="text-gray-700 dark:text-gray-300 font-medium">
                                Modo Compacto
                              </Label>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Interface mais densa com menos espaçamento
                              </p>
                            </div>
                            <Switch
                              id="compactMode"
                              checked={settings?.compactMode || false}
                              onClick={() =>
                                updateSettingField('compactMode', !settings?.compactMode)
                              }
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="animations" className="text-gray-700 dark:text-gray-300 font-medium">
                                Animações
                              </Label>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Transições suaves e efeitos visuais
                              </p>
                            </div>
                            <Switch
                              id="animations"
                              checked={settings?.animations !== false}
                              onClick={() =>
                                updateSettingField('animations', !(settings?.animations !== false))
                              }
                            />
                          </div>
                        </div>
                      </div>


                      <Separator className="my-8" />

                      {/* Notificações */}
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          Notificações
                        </h3>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="notifyLogin" className="text-gray-700 dark:text-gray-300 font-medium">
                                Alertas de Login
                              </Label>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Notificar quando houver novo acesso à sua conta
                              </p>
                            </div>
                            <Switch
                              id="notifyLogin"
                              checked={settings?.alertLogin !== false}
                              onClick={() =>
                                updateSettingField('alertLogin', !(settings?.alertLogin !== false))
                              }
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="notifySecurity" className="text-gray-700 dark:text-gray-300 font-medium">
                                Alertas de Segurança
                              </Label>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Avisos sobre alterações de segurança na conta
                              </p>
                            </div>
                            <Switch
                              id="notifySecurity"
                              checked={settings?.alertSecurity !== false}
                              onClick={() =>
                                updateSettingField('alertSecurity', !(settings?.alertSecurity !== false))
                              }
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="notifyRecipes" className="text-gray-700 dark:text-gray-300 font-medium">
                                Novas Receitas
                              </Label>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Notificar sobre receitas novas e tendências
                              </p>
                            </div>
                            <Switch
                              id="notifyRecipes"
                              checked={settings?.notifyRecipes !== false}
                              onClick={() =>
                                updateSettingField('notifyRecipes', !(settings?.notifyRecipes !== false))
                              }
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="newsletter" className="text-gray-700 dark:text-gray-300 font-medium">
                                Newsletter
                              </Label>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Receber dicas culinárias e ofertas especiais
                              </p>
                            </div>
                            <Switch
                              id="newsletter"
                              checked={settings?.newsletter !== false}
                              onClick={() =>
                                updateSettingField('newsletter', !(settings?.newsletter !== false))
                              }
                            />
                          </div>
                        </div>
                      </div>

                      {/* Reset Configurações */}
                      <div className="mt-8 p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/10">
                        <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
                          Configurações Avançadas
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          Restaurar todas as configurações para os valores padrão
                        </p>
                        <Button
                          variant="outline"
                          onClick={handleResetSettings}
                          className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700 transition-colors"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Resetar Todas as Configurações
                        </Button>
                      </div>
                    </CardContent>

                    <CardFooter className="bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
                      <div className="flex justify-between items-center w-full">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {settingsHasChanges ? (
                            <span className="text-orange-600 flex items-center gap-2">
                              <AlertCircle className="h-4 w-4" />
                              Você tem alterações não salvas
                            </span>
                          ) : (
                            <span className="text-green-600 flex items-center gap-2">
                              <Check className="h-4 w-4" />
                              Todas as configurações estão salvas
                            </span>
                          )}
                        </div>
                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            onClick={handleCancelAll}
                            disabled={!settingsHasChanges}
                            className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancelar
                          </Button>
                          <Button
                            onClick={async () => {
                              const result = await saveSettings();
                              if (result?.success) {
                                toast({
                                  title: 'Configurações salvas',
                                  description: 'Suas preferências foram atualizadas.',
                                });
                              }
                            }}
                            disabled={!settingsHasChanges || settingsLoading}
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 transition-all duration-200"
                          >
                            {settingsLoading ? (
                              <>
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                                Salvando...
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4 mr-2" />
                                Salvar Configurações
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardFooter>
                  </Card>
                </TabsContent>

                {/* TAB: CONTA */}
                <TabsContent value="conta" className="mt-6">
                  <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-red-500 to-orange-500 text-white">
                      <CardTitle className="flex items-center gap-2">
                        <Lock className="h-6 w-6" />
                        Gerenciamento da Conta
                      </CardTitle>
                      <CardDescription className="text-white/90">
                        Exporte seus dados ou gerencie o estado da sua conta
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-6">
                      {/* Exportar Dados */}
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          Exportar Seus Dados
                        </h3>

                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                Backup Completo
                              </h4>
                              <p className="text-gray-600 dark:text-gray-400">
                                Exporte todos os seus dados em formato JSON. Inclui receitas favoritas, preferências e configurações.
                              </p>
                            </div>
                            <Button
                              onClick={exportAccount}
                              disabled={isExporting}
                              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 transition-all duration-200"
                            >
                              {isExporting ? (
                                <>
                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                                  Exportando...
                                </>
                              ) : (
                                <>
                                  <Download className="h-4 w-4 mr-2" />
                                  Exportar Dados
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>



                      <Separator className="my-8" />

                      {/* Desativar Conta */}
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          Desativar Conta Temporariamente
                        </h3>

                        <Alert className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                          <AlertTitle className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            Ação Reversível
                          </AlertTitle>
                          <AlertDescription>
                            Sua conta será desativada mas seus dados serão mantidos. Você poderá reativar fazendo login novamente.
                          </AlertDescription>
                        </Alert>

                        <div className="mt-4">
                          <Button
                            variant="outline"
                            onClick={() => setIsDeactivateDialogOpen(true)}
                            className="w-full border-yellow-500 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors"
                          >
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Desativar Conta Temporariamente
                          </Button>
                        </div>

                        {/* Diálogo de Desativação */}
                        <Dialog open={isDeactivateDialogOpen} onOpenChange={setIsDeactivateDialogOpen}>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                                Desativar Conta Temporariamente
                              </DialogTitle>
                              <DialogDescription>
                                Tem certeza que deseja desativar sua conta temporariamente?
                              </DialogDescription>
                            </DialogHeader>

                            <div className="py-4 space-y-3">
                              <Alert className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                                <AlertTitle>O que acontece?</AlertTitle>
                                <AlertDescription className="space-y-1">
                                  <p>• Sua conta ficará inacessível</p>
                                  <p>• Seus dados serão mantidos</p>
                                  <p>• Você poderá reativar a qualquer momento fazendo login</p>
                                </AlertDescription>
                              </Alert>

                              <p className="text-sm text-gray-500">
                                Esta ação é reversível. Para reativar, basta fazer login com suas credenciais.
                              </p>
                            </div>

                            <DialogFooter className="flex gap-2">
                              <Button
                                variant="outline"
                                onClick={() => setIsDeactivateDialogOpen(false)}
                                disabled={loading}
                              >
                                Cancelar
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={handleDeactivateAccount}
                                disabled={loading}
                              >
                                {loading ? (
                                  <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                                    Processando...
                                  </>
                                ) : (
                                  'Confirmar Desativação'
                                )}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                      </div>

                      <Separator className="my-8" />

                      {/* Eliminar Conta Permanentemente */}
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          Eliminar Conta Permanentemente
                        </h3>

                        <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                          <AlertTitle className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            Ação Irreversível
                          </AlertTitle>
                          <AlertDescription>
                            Esta ação não pode ser desfeita. Todos os seus dados serão permanentemente apagados.
                          </AlertDescription>
                        </Alert>

                        <div className="mt-4">
                          <Button
                            variant="destructive"
                            onClick={() => setIsDeleteDialogOpen(true)}
                            className="w-full"
                          >
                            <AlertCircle className="h-4 w-4 mr-2" />
                            Eliminar Conta Permanentemente
                          </Button>
                        </div>

                        {/* Diálogo de Eliminação */}
                        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2 text-red-600">
                                <AlertCircle className="h-5 w-5" />
                                ELIMINAR CONTA PERMANENTEMENTE
                              </DialogTitle>
                              <DialogDescription className="text-red-500">
                                Esta ação é <strong>IRREVERSÍVEL</strong>. Digite sua senha para confirmar.
                              </DialogDescription>
                            </DialogHeader>

                            <div className="py-4 space-y-4">
                              <Alert variant="destructive">
                                <AlertTitle className="flex items-center gap-2">
                                  <AlertCircle className="h-4 w-4" />
                                  ATENÇÃO: Ação IRREVERSÍVEL
                                </AlertTitle>
                                <AlertDescription className="space-y-1">
                                  <p>• TODOS os seus dados serão apagados</p>
                                  <p>• Receitas, favoritos, configurações</p>
                                  <p>• Esta ação NÃO PODE ser desfeita</p>
                                </AlertDescription>
                              </Alert>

                              <div className="space-y-2">
                                <Label htmlFor="deletePassword" className="text-gray-700 dark:text-gray-300">
                                  Digite sua senha para confirmar:
                                </Label>
                                <Input
                                  id="deletePassword"
                                  type="password"
                                  value={deletePassword}
                                  onChange={(e) => setDeletePassword(e.target.value)}
                                  placeholder="Sua senha atual"
                                  className="border-red-300 dark:border-red-700"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Para sua segurança, precisamos confirmar sua identidade.
                                </p>
                              </div>
                            </div>

                            <DialogFooter className="flex gap-2">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  console.log('🔄 Botão Cancelar clicado!');
                                  setIsDeleteDialogOpen(false); 
                                  setDeletePassword(''); 
                                }}
                                disabled={isDeleting}
                                className="hover:bg-gray-100 dark:hover:bg-gray-800"
                              >
                                <X className="h-4 w-4 mr-2" />
                                Cancelar
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={handleDeleteAccount}
                                disabled={isDeleting || !deletePassword.trim()}
                              >
                                {isDeleting ? (
                                  <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                                    Eliminando...
                                  </>
                                ) : (
                                  'Sim, Eliminar Permanentemente'
                                )}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Toast de Confirmação Global - VERSÃO SIMPLIFICADA */}
          {loading && (
            <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 shadow-xl rounded-lg p-4 border border-gray-200 dark:border-gray-700 z-50 animate-in fade-in slide-in-from-bottom-5">
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Salvando alterações...</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Por favor, aguarde</p>
                </div>
              </div>
            </div>
          )}

          {/* Botão de debug temporário */}
          {loadingUser && (
            <div className="fixed bottom-20 left-4 z-50">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  console.log("DEBUG: Forçando saída do loadingUser");
                  setLoadingUser(false);
                }}
              >
                DEBUG: Sair do Loading
              </Button>
            </div>
          )}

          {/* Input de arquivo oculto */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>
      </TooltipProvider>
    </ErrorBoundary>
  );
};

export default UserProfile;