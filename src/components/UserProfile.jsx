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
  AlertCircle, Star, ChevronDown, Plus, Minus, Settings, Key, ArrowLeft,
} from 'lucide-react';
import { useTheme } from "@/context/ThemeContext";
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from "react-i18next";
import TwoFactorAuth from './Security/TwoFactorAuth';
import LanguageSelect from '@/components/LanguageSelect';
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
import { listarFavoritos } from '@/services/healthApi';


//  Função para obter o token padronizada
const getAuthToken = () => {
  return localStorage.getItem('bomPiteuToken');
};

//  Função para verificar autenticação
const isAuthenticated = () => {
  return !!getAuthToken();
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


const UserProfile = ({ user: initialUser, onNavigate, initialTab }) => {
  console.log('🔥🔥🔥 UserProfile ESTÁ A SER MONTADO! 🔥🔥🔥');
  console.log('📥 Props recebidas:', { initialTab, user: initialUser?.name });
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
  const [activeTab, setActiveTab] = useState(initialTab || 'geral');
  const [editingField, setEditingField] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [activeSelect, setActiveSelect] = useState(null);
  const [saudeFavorites, setSaudeFavorites] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
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


  console.log('👤 UserProfile montado!');
  console.log('📥 Props recebidas:', { initialTab, user: initialUser?.name });

  // Verificar se initialTab está a chegar
  useEffect(() => {
    console.log('🎯 useEffect do initialTab disparado!');
    console.log('📌 initialTab value:', initialTab);
    console.log('📌 activeTab antes:', activeTab);

    if (initialTab) {
      console.log('✅ A mudar activeTab para:', initialTab);
      setActiveTab(initialTab);
    }

    console.log('📌 activeTab depois:', initialTab);
  }, [initialTab]);
  // Arrays de alergias e intolerâncias
  const alergias = [
    { id: "Amendoim", label: t('allergies.peanut'), icon: Nut, severity: t('severity.high') },
    { id: "Leite", label: t('allergies.milk'), icon: MilkOff, severity: t('severity.high') },
    { id: "Ovo", label: t('allergies.egg'), icon: Egg, severity: t('severity.medium') },
    { id: "Trigo", label: t('allergies.wheat'), icon: Wheat, severity: t('severity.high') },
    { id: "Frutos Secos", label: t('allergies.nuts'), icon: Leaf, severity: t('severity.high') },
    { id: "Marisco", label: t('allergies.shellfish'), icon: AlertTriangle, severity: t('severity.high') },
    { id: "Peixe", label: t('allergies.fish'), icon: Fish, severity: t('severity.medium') },
    { id: "Soja", label: t('allergies.soy'), icon: Sprout, severity: t('severity.low') },
    { id: "Sésamo", label: t('allergies.sesame'), icon: CircleDot, severity: t('severity.medium') },
    { id: "Sulfitos", label: t('allergies.sulfites'), icon: AlertTriangle, severity: t('severity.low') },
  ];

  const intolerancias = [
    { id: "Lactose", label: t('intolerances.lactose'), icon: MilkOff, severity: t('severity.medium') },
    { id: "Glúten (Celíaca)", label: t('intolerances.celiac'), icon: WheatOff, severity: t('severity.high') },
    { id: "Glúten (Sensibilidade)", label: t('intolerances.glutenSensitivity'), icon: Ban, severity: t('severity.medium') },
    { id: "Frutose", label: t('intolerances.fructose'), icon: Apple, severity: t('severity.medium') },
    { id: "Frutose", label: t('intolerances.fructoseHereditary'), icon: Ban, severity: t('severity.high') },
    { id: "Histamina", label: t('intolerances.histamine'), icon: ThermometerSun, severity: t('severity.medium') },
    { id: "Sacarose", label: t('intolerances.sucrose'), icon: Candy, severity: t('severity.low') },
    { id: "Álcool", label: t('intolerances.alcohol'), icon: Wine, severity: t('severity.medium') },
    { id: "Sorbitol", label: t('intolerances.sorbitol'), icon: CandyOff, severity: t('severity.low') },
    { id: "FODMAP", label: t('intolerances.fodmap'), icon: UtensilsCrossed, severity: t('severity.high') },
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


  // Função para obter ID do usuário de forma confiável
  const getUserId = useCallback(() => {
    // 1. Tenta do estado user
    if (user?.id) return user.id;


    // 2. Tenta do localStorage (user object)
    const userStr = localStorage.getItem('bomPiteuUser');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        if (userData.id || userData._id) {
          return userData.id || userData._id;
        }
      } catch {
        // Ignora erro de parse
      }
    }

    // 3. Tenta decodificar do token JWT
    const token = localStorage.getItem('bomPiteuToken');
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(base64));
        return payload.id || payload.userId || payload.sub;
      } catch (e) {
        console.debug('Não foi possível decodificar token:', e);
      }
    }

    return null;
  }, [user]); // Depende do user


  // Chave local por utilizador
  const LOCAL_USER_KEY = user?._id || user?.id ? `bomPiteuUser_${user.id}` : 'bomPiteuUser';

  const [profileImage, setProfileImage] = useState(() => {
    if (!user) return '';
    const stored = localStorage.getItem(LOCAL_USER_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed.avatar || user.avatar || '';
      } catch {
        return user.avatar || '';
      }
    }
    return user.avatar || '';
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
    level: user?.settings?.experience?.level || user?.level || t('experience.level.beginner'),
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
    return t('security.unknownBrowser');
  };

  const getOSName = () => {
    const ua = navigator.userAgent;
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS') || ua.includes('iPhone')) return 'iOS';
    return t('security.unknownOS');
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
    userId: user?._id || user?.id
  });

  // Ativar animações após carregamento inicial
  useEffect(() => {
    const timer = setTimeout(() => setEnableAnimations(true), 300);
    return () => clearTimeout(timer);
  }, []);
  // Monitorar mudanças no security
  useEffect(() => {
    console.log('🔍 security mudou:', security);
    console.log('🔍 twoFactorAuth:', security.twoFactorAuth);
  }, [security]);
  // Timeout de segurança para evitar loading infinito
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (loadingUser) {
        console.warn("Loading timeout - forçando saída do loading");
        setLoadingUser(false);
      }
    }, 10000);

    return () => clearTimeout(timeoutId);
  }, [loadingUser]);


  const [dataLoaded, setDataLoaded] = useState(false);


  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoadingUser(true);

        const userId = getUserId();

        if (!userId) {
          console.log('❌ Nenhum ID de usuário encontrado');
          if (initialUser) {
            setUser(initialUser);
          }
          if (userData.settings?.security) {
            setSecurity(prev => ({
              ...prev,
              twoFactorAuth: userData.settings.security.twoFactorAuth || false,
              recoveryEmail: userData.settings.security.recoveryEmail || '',
              sessions: userData.settings.security.sessions || [],
              lastPasswordChange: userData.settings.security.lastPasswordChange || null,
            }));
          }
          setLoadingUser(false);
          setDataLoaded(true);
          return;
        }

        console.log('🔄 Carregando usuário do backend. ID:', userId);
        const response = await getUser(userId);

        if (response?.user) {
          const userData = response.user;
          console.log('✅ Dados recebidos do backend:', userData);

          // PRIMEIRO: Atualiza o user
          setUser(userData);
          localStorage.setItem('bomPiteuUser', JSON.stringify(userData));

          // SINCRONIZAR security state com dados frescos do backend
          if (userData.settings?.security) {
            setSecurity(prev => ({
              ...prev,
              twoFactorAuth: userData.settings.security.twoFactorAuth === true,
              recoveryEmail: userData.settings.security.recoveryEmail || '',
              lastPasswordChange: userData.settings.security.lastPasswordChange || null,
            }));
          }

          // MARCA QUE OS DADOS FORAM CARREGADOS!
          setDataLoaded(true);

          // DEPOIS: Dá um tempinho para o user ser atualizado
          setTimeout(() => {
            setLoadingUser(false);
          }, 100); // 100 milissegundos de delay

        } else {
          throw new Error('Resposta inválida do servidor');
        }
      } catch (error) {
        console.error('❌ Erro ao carregar do backend:', error);

        const localUser = localStorage.getItem('bomPiteuUser');
        if (localUser) {
          try {
            const parsedUser = JSON.parse(localUser);
            console.log('⚠️ Usando localStorage como fallback');
            setUser(parsedUser);
            setDataLoaded(true); // 🔥 ADICIONADO!
            setTimeout(() => {
              setLoadingUser(false);
            }, 100);
          } catch (parseError) {
            console.error('❌ Erro ao parsear localStorage:', parseError);
            setLoadingUser(false);
            setDataLoaded(true); // 🔥 ADICIONADO!
          }
        } else {
          setLoadingUser(false);
          setDataLoaded(true); // 🔥 ADICIONADO!
        }
      }
    };

    loadUserData();
  }, []);

  // ← ADICIONAR este useEffect
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        birthDate: user.birthDate || '',
        country: user.country || 'AO',
        language: user.language || 'pt',
        gender: user.gender || '',
        bio: user.bio || '',
        phone: user.phone || '',
        bloodType: user.bloodType || '',
        address: user.address || '',
        city: user.city || '',
        zipCode: user.zipCode || '',
        dietaryPreferences: user.dietaryPreferences || '',
        foodProfile: user.foodProfile || ''
      });
      console.log('🔄 profileData sincronizado com user:', user.name, user.bloodType);
    }
  }, [user?.name, user?.email, user?.birthDate, user?.bloodType, user?.phone]); // Dependências principais


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
      title: t('profile.cancelChangesTitle'),
      description: t('profile.cancelChangesDesc'),
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
          title: t('profile.saveSuccessTitle'),
          description: t('profile.saveSuccessDesc'),
          duration: 3000,
        });
      }
      return updatedUser;
    } catch (err) {
      console.error('Erro ao salvar no servidor:', err);
      toast({
        title: t('common.error'),
        description: t('profile.saveErrorDesc'),
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
        title: t('profile.nameRequired'),
        description: t('profile.nameRequiredDesc'),
        variant: 'destructive',
      });
      return;
    }

    if (!profileData.email?.trim() || !/\S+@\S+\.\S+/.test(profileData.email)) {
      toast({
        title: t('profile.invalidEmail'),
        description: t('profile.invalidEmailDesc'),
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

      setTimeout(() => {
        getUser(user.id).then(response => {
          if (response?.user) {
            setUser(response.user);
            console.log('🔄 User recarregado após save');
          }
        });
      }, 500);

      setProfileData(prev => ({
        ...prev,
        bloodType: cleanedData.bloodType ?? prev.bloodType
      }));


      setEditingField(null);

      // 🔥 RESOLVIDO: Garantir que não fique em estado de carregamento
      setLoadingUser(false);

      toast({
        title: t('profile.updateSuccess'),
        description: t('profile.updateSuccessDesc'),
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
        title: t('profile.invalidFile'),
        description: t('profile.invalidFileDesc'),
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast({
        title: t('profile.fileTooLarge'),
        description: t('profile.fileTooLargeDesc'),
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

        console.log('📸 UserProfile - Imagem carregada:', base64Image.substring(0, 50) + '...');
        setProfileImage(base64Image);

        // Atualizar estado local imediatamente
        const updatedUser = { ...user, avatar: base64Image };
        setUser(updatedUser);
        persistLocalUser(updatedUser);

        if (user?.id) {
          localStorage.setItem(`smartchef_avatar_${user.id}`, base64Image);
        }

        console.log('📢 UserProfile - Disparando evento smartchef_avatar_updated');
        window.dispatchEvent(new CustomEvent('smartchef_avatar_updated', { detail: base64Image }));

        toast({
          title: t('profile.avatarUpdated'),
          description: t('profile.avatarUpdatedDesc'),
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
        title: t('common.error'),
        description: t('profile.avatarError'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setShowMenu(false);
    }
  }, [user, persistLocalUser, toast]);

  // Função para carregar favoritos do Meu Canto de Saúde
  const carregarFavoritosSaude = useCallback(async () => {
    if (!user?.id) return;

    setLoadingFavorites(true);
    try {
      const favoritos = await listarFavoritos(user.id);
      console.log('🍎 Favoritos do Meu Canto de Saúde:', favoritos);
      setSaudeFavorites(favoritos);
    } catch (error) {
      console.error('❌ Erro ao carregar favoritos do Saude:', error);
    } finally {
      setLoadingFavorites(false);
    }
  }, [user?.id]);

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
      title: t('profile.allergyAdded'),
      description: t('profile.allergyAddedDesc'),
    });
  }, [otherAllergy, addAllergy, toast]);

  const addCustomIntolerance = useCallback(() => {
    if (!otherIntolerance.trim()) return;

    addIntolerance('Outro', otherIntolerance);
    setOtherIntolerance('');

    toast({
      title: t('profile.intoleranceAdded'),
      description: t('profile.intoleranceAddedDesc'),
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

    // 🔥 MELHOR VALIDAÇÃO DE TIPO
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    const validExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];

    // Verificar por MIME type
    const isValidMime = validTypes.includes(file.type);

    // Verificar por extensão do nome do arquivo
    const fileName = file.name.toLowerCase();
    const isValidExtension = validExtensions.some(ext => fileName.endsWith(ext));

    if (!isValidMime && !isValidExtension) {
      console.log('❌ Tipo de arquivo inválido:', file.type, file.name);
      toast({
        title: t('profile.invalidFileType'),
        description: t('profile.invalidFileTypeDesc'),
        variant: 'destructive',
      });
      return;
    }

    // Validação de tamanho
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        title: t('profile.fileTooLarge'),
        description: t('profile.fileTooLargeDesc'),
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
        title: t('profile.certificateUploaded'),
        description: t('profile.certificateUploadedDesc'),
      });

      // Limpar o input
      if (certInputRef.current) {
        certInputRef.current.value = '';
      }

    } catch (error) {
      console.error('❌ Erro ao enviar certificado:', error);
      toast({
        title: t('common.error'),
        description: t('profile.certificateError'),
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
      title: t('profile.certificateRemoved'),
      description: t('profile.certificateRemovedDesc'),
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
        title: t('profile.experienceSaved'),
        description: t('profile.experienceSavedDesc'),
        duration: 3000,
      });
    } catch (error) {
      console.error(' Erro ao salvar experiência:', error);
      toast({
        title: t('common.error'),
        description: t('profile.experienceError'),
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
          title: newTwoFactorAuth ? t('security.2faEnabled') : t('security.2faDisabled'),
          description: newTwoFactorAuth
            ? t('security.2faEnabledDesc')
            : t('security.2faDisabledDesc'),
        });
      }
    } catch (error) {
      console.error('Erro ao alterar 2FA:', error);
      toast({
        title: t('common.error'),
        description: t('security.2faError'),
        variant: 'destructive',
      });
    }
  }, [security.twoFactorAuth, settings, saveSettings, toast]);

  const handleUpdateRecoveryEmail = useCallback(async () => {
    if (!security.recoveryEmail?.trim()) {
      toast({
        title: t('security.emptyEmail'),
        description: t('security.emptyEmailDesc'),
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
          title: t('security.recoveryEmailUpdated'),
          description: t('security.recoveryEmailUpdatedDesc'),
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar email:', error);
      toast({
        title: t('common.error'),
        description: t('security.recoveryEmailError'),
        variant: 'destructive',
      });
    }
  }, [security.recoveryEmail, settings, saveSettings, toast]);

  const handlePasswordChange = useCallback(async (e) => {
    e.preventDefault();

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        title: t('security.passwordRequired'),
        description: t('security.passwordRequiredDesc'),
        variant: 'destructive',
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: t('security.passwordMismatch'),
        description: t('security.passwordMismatchDesc'),
        variant: 'destructive',
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: t('security.passwordTooShort'),
        description: t('security.passwordTooShortDesc'),
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
          title: t('security.passwordChanged'),
          description: t('security.passwordChangedDesc'),
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
        errorMessage = t('security.incorrectPassword');
      }
      // Se for "Sessão expirada", mostrar mensagem amigável
      else if (errorMessage.includes('Sessão expirada')) {
        errorMessage = t('security.sessionExpired');
      }

      toast({
        title: t('common.error'),
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
     const response = await fetch(`http://localhost:5000/api/users/${user.id}/sessions`, {
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
  setSecurity(prev => ({
    ...prev,
    sessions: prev.sessions.filter(s => s.id !== sessionId)
  }));
  toast({
    title: t('security.sessionRevoked'),
    description: t('security.sessionRevokedDesc'),
  });
}, [toast]);
  // Revogar todas as outras sessões
 const revokeAllSessions = useCallback(async () => {
  setSecurity(prev => ({
    ...prev,
    sessions: prev.sessions.filter(s => s.current)
  }));
  toast({
    title: t('security.allSessionsRevoked'),
    description: t('security.allSessionsRevokedDesc'),
  });
}, [toast]);
  // Carregar sessões quando abrir a aba de segurança
  useEffect(() => {
    if (user?.id && activeTab === 'seguranca') {
      console.log('📱 Aba segurança aberta - carregando sessões');
      loadSessions();
    }
  }, [user?.id, activeTab, loadSessions]);

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

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
      title: t('profile.goalAdded'),
      description: t('profile.goalAddedDesc'),
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
        title: t('account.exportSuccess'),
        description: t('account.exportSuccessDesc'),
      });
    } catch (error) {
      console.error('Erro na exportação:', error);
      toast({
        title: t('common.error'),
        description: t('account.exportError'),
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
        title: t('account.deletePasswordRequired'),
        description: t('account.deletePasswordRequiredDesc'),
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
        title: t('account.deleted'),
        description: t('account.deletedDesc'),
        duration: 3000,
      });

      // Redirecionar após 2 segundos
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);

    } catch (error) {
      console.error(' Erro ao eliminar conta:', error);

      let errorMessage = t('account.deleteError');

      if (error.message.includes('Senha') || error.message.includes('senha')) {
        errorMessage = t('account.incorrectPassword');
      } else if (error.message.includes('Sessão') || error.message.includes('401')) {
        errorMessage = t('security.sessionExpired');
      }

      toast({
        title: t('common.error'),
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
        title: t('account.deactivated'),
        description: t('account.deactivatedDesc'),
        duration: 5000,
      });

      // Redirecionar após 3 segundos
      setTimeout(() => {
        window.location.href = '/login';
      }, 3000);

    } catch (error) {
      console.error(' Erro ao desativar conta:', error);
      toast({
        title: t('common.error'),
        description: error.message || t('account.deactivateError'),
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
        title: t('settings.resetSuccess'),
        description: t('settings.resetSuccessDesc'),
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('settings.resetError'),
        variant: 'destructive',
      });
    }
  }, [resetSettings, toast]);

  // Resetar preferências
  const handleResetPreferences = useCallback(async () => {
    try {
      resetPreferences();
      toast({
        title: t('nutrition.resetSuccess'),
        description: t('nutrition.resetSuccessDesc'),
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('nutrition.resetError'),
        variant: 'destructive',
      });
    }
  }, [resetPreferences, toast]);

  // useEffect para inicializar dados
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

    if (user.avatar) {
      setProfileImage(user.avatar);
    }
    carregarFavoritosSaude();
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

  // Tema sincronizado com settings
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

    localStorage.setItem(`smartchef_theme_${user?.id}`, appliedTheme);

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

  //  Aplicar classes de configuração no body
  useEffect(() => {
    // Aplica ou remove a classe 'compact-mode' no body
    if (settings?.compactMode) {
      document.body.classList.add('compact-mode');
      console.log('✅ Modo Compacto ATIVADO - classe adicionada ao body');
    } else {
      document.body.classList.remove('compact-mode');
      console.log('❌ Modo Compacto DESATIVADO - classe removida ao body');
    }

    // Aplica ou remove a classe 'no-animations' no body
    if (settings?.animations === false) {
      document.body.classList.add('no-animations');
      console.log('✅ Animações DESATIVADAS - classe adicionada ao body');
    } else {
      document.body.classList.remove('no-animations');
      console.log('❌ Animações ATIVADAS - classe removida ao body');
    }

    // Limpeza quando o componente for desmontado
    return () => {
      document.body.classList.remove('compact-mode', 'no-animations');
    };
  }, [settings?.compactMode, settings?.animations]);

  // Cálculo de idade
  const userAge = profileData.birthDate ? calculateAge(profileData.birthDate) : null;

  // Progresso
  const progressPercentage = user?.level > 0
    ? Math.min(100, ((user?.points || 0) / (user.level * 100)) * 100)
    : 0;

  const stats = [
    { icon: ChefHat, value: user?.level || 1, label: t('profile.level'), color: "text-orange-500", bg: "bg-orange-50" },
    { icon: Award, value: user?.points || 0, label: t('profile.points'), color: "text-blue-500", bg: "bg-blue-50" },
    { icon: Heart, value: saudeFavorites?.length || 0, label: t('profile.favorites'), color: "text-pink-500", bg: "bg-pink-50" },
    { icon: Calendar, value: userAge || '--', label: t('profile.age'), color: "text-green-500", bg: "bg-green-50" },
  ];

  // Técnicas culinárias disponíveis
  const availableTechniques = [
    { name: t('experience.techniques.cutting'), difficulty: t('experience.difficulty.basic') },
    { name: t('experience.techniques.seasoning'), difficulty: t('experience.difficulty.intermediate') },
    { name: t('experience.techniques.roasting'), difficulty: t('experience.difficulty.intermediate') },
    { name: t('experience.techniques.pasta'), difficulty: t('experience.difficulty.advanced') },
    { name: t('experience.techniques.sousvide'), difficulty: t('experience.difficulty.professional') },
    { name: t('experience.techniques.plating'), difficulty: t('experience.difficulty.advanced') },
    { name: t('experience.techniques.baking'), difficulty: t('experience.difficulty.intermediate') },
    { name: t('experience.techniques.pastry'), difficulty: t('experience.difficulty.advanced') },
  ];

  // Função para renderizar com animação condicional - AGORA USA AS SETTINGS
  const AnimatedDiv = ({ children, ...props }) => {
    // Usar settings?.animations em vez de enableAnimations
    if (settings?.animations === false) {
      return <div {...props}>{children}</div>;
    }
    return <motion.div {...props}>{children}</motion.div>
  };
  // 1. Primeiro verifica carregamento
  if (loadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">{t('profile.loading')}</p>
        </div>
      </div>
    );
  }

  // 2. Depois verifica se os dados foram carregados
  if (loadingUser) {
    return <div>{t('common.loading')}</div>;
  } else if (!user || (!user._id && !user.id)) {
    const token = getAuthToken();

    if (!token) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center text-orange-500">{t('profile.sessionExpired')}</CardTitle>
              <CardDescription className="text-center">
                {t('profile.sessionExpiredDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-500">{t('profile.loginRequired')}</p>
              <Button
                onClick={() => window.location.href = '/login'}
                className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
              >
                {t('auth.login')}
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-blue-500">{t('profile.loadErrorTitle')}</CardTitle>
            <CardDescription className="text-center">
              {t('profile.loadErrorDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto" />
            <p className="text-gray-500">{t('profile.checkConnection')}</p>
            <div className="flex gap-2 justify-center">
              <Button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
              >
                {t('profile.reload')}
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = '/'}
              >
                {t('profile.backToHome')}
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
          <div className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-12 w-12 border-2 border-orange-500 shadow-lg">
                      <AvatarImage src={profileImage} alt={user.name} />
                      <AvatarFallback className="bg-gradient-to-br from-orange-100 to-yellow-100 dark:from-orange-900/30 dark:to-yellow-900/30 text-orange-600 dark:text-orange-400 font-bold text-lg">
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
                  {user.isPremium ? t('profile.premium') : t('profile.free')}
                </Badge>
              </div>
            </div>
          </div>

          {/*  BOTÃO DE VOLTAR */}
          <div className="container mx-auto px-4 py-3">
            <button
              onClick={() => onNavigate('dashboard')}
              className="group flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-all duration-300"
            >
              <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-orange-100 dark:group-hover:bg-orange-900/30 transition-colors">
                <ArrowLeft className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium">{t('profile.backToDashboard')}</span>
            </button>
          </div>

          {/* Conteúdo Principal */}
          <div className="container mx-auto px-4 py-6 max-w-6xl">
            {/* Tabs Navegacionais */}
            <div className="mb-8">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 md:grid-cols-6 gap-2 h-auto p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                  <TabsTrigger
                    value="geral"
                    className="data-[state=active]:bg-white data-[state=active]:dark:bg-gray-700 data-[state=active]:shadow-sm data-[state=active]:text-orange-600 dark:data-[state=active]:text-orange-400 py-3 rounded-lg hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <User className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">{t('profile.tabs.general')}</span>
                    <span className="sm:hidden">{t('profile.tabs.generalShort')}</span>
                  </TabsTrigger>

                  <TabsTrigger
                    value="alimentacao"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-orange-600 py-3 rounded-lg hover:bg-white/50 transition-colors"
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">{t('profile.tabs.nutrition')}</span>
                    <span className="sm:hidden">{t('profile.tabs.nutritionShort')}</span>
                  </TabsTrigger>

                  <TabsTrigger
                    value="experiencia"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-orange-600 py-3 rounded-lg hover:bg-white/50 transition-colors"
                  >
                    <ChefHat className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">{t('profile.tabs.experience')}</span>
                    <span className="sm:hidden">{t('profile.tabs.experienceShort')}</span>
                  </TabsTrigger>

                  <TabsTrigger
                    value="seguranca"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-orange-600 py-3 rounded-lg hover:bg-white/50 transition-colors"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">{t('profile.tabs.security')}</span>
                    <span className="sm:hidden">{t('profile.tabs.securityShort')}</span>
                  </TabsTrigger>

                  <TabsTrigger
                    value="definicoes"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-orange-600 py-3 rounded-lg hover:bg-white/50 transition-colors"
                  >
                    <Palette className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">{t('profile.tabs.settings')}</span>
                    <span className="sm:hidden">{t('profile.tabs.settingsShort')}</span>
                  </TabsTrigger>

                  <TabsTrigger
                    value="conta"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-orange-600 py-3 rounded-lg hover:bg-white/50 transition-colors"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">{t('profile.tabs.account')}</span>
                    <span className="sm:hidden">{t('profile.tabs.accountShort')}</span>
                  </TabsTrigger>
                </TabsList>

                {/* Conteúdo das Tabs */}

                {/* TAB: DADOS PESSOAIS */}
                <TabsContent value="geral" className="mt-6 space-y-6">
                  <Card className="overflow-hidden border-0 shadow-lg bg-white dark:bg-gray-800">
                    <CardHeader className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
                      <CardTitle className="flex items-center justify-between">
                        <span>{t('profile.personalData')}</span>
                        <Badge className="bg-white/20 hover:bg-white/30 transition-colors">
                          {user.isPremium ? t('profile.premiumMember') : t('profile.freeMember')}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="text-white/90">
                        {t('profile.personalDataDesc')}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-6">
                      {/* Avatar e Upload */}
                      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
                        <div className="relative group mx-auto md:mx-0">
                          <Avatar className="h-32 w-32 border-4 border-white dark:border-gray-700 shadow-xl">
                            <AvatarImage src={profileImage} alt={user.name} />
                            <AvatarFallback className="text-3xl bg-gradient-to-br from-orange-100 to-yellow-100 dark:from-orange-900/30 dark:to-yellow-900/30 text-orange-600 dark:text-orange-400">
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant="secondary"
                                className="absolute bottom-0 right-0 rounded-full shadow-lg hover:scale-110 transition-transform duration-200 bg-white dark:bg-gray-700"
                                onClick={() => fileInputRef.current?.click()}
                              >
                                <Camera className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>{t('profile.changeAvatar')}</TooltipContent>
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
                                {t('profile.level')} {user.level}
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
                          {t('profile.basicInfo')}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Nome */}
                          <div className="space-y-2">
                            <Label htmlFor="name" className="text-gray-700 dark:text-gray-300 font-medium">
                              {t('profile.fields.name')} *
                            </Label>
                            <Input
                              id="name"
                              value={profileData.name}
                              onChange={(e) => handleProfileField('name', e.target.value)}
                              placeholder={t('profile.fields.namePlaceholder')}
                              className={settings?.compactMode ? 'h-9 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white' : 'h-11 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white'}
                            />
                          </div>

                          {/* Email */}
                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-gray-700 dark:text-gray-300 font-medium">
                              {t('profile.fields.email')} *
                            </Label>
                            <Input
                              id="email"
                              type="email"
                              value={profileData.email}
                              onChange={(e) => handleProfileField('email', e.target.value)}
                              placeholder={t('profile.fields.emailPlaceholder')}
                              className={settings?.compactMode ? 'h-9' : 'h-11'}
                            />
                          </div>

                          {/* Data de Nascimento */}
                          <div className="space-y-2">
                            <Label htmlFor="birthDate" className="text-gray-700 dark:text-gray-300 font-medium">
                              {t('profile.fields.birthDate')}
                            </Label>
                            <Input
                              id="birthDate"
                              type="date"
                              value={profileData.birthDate}
                              onChange={(e) => handleProfileField('birthDate', e.target.value)}
                              className={settings?.compactMode ? 'h-9' : 'h-11'}
                            />
                            {userAge && (
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {t('profile.ageDisplay', { age: userAge })}
                              </p>
                            )}
                          </div>

                          {/* Tipo Sanguíneo */}
                          <div className="space-y-2">
                            <Label htmlFor="bloodType" className="text-gray-700 dark:text-gray-300 font-medium">
                              {t('profile.fields.bloodType')}
                            </Label>
                            <Select
                              value={profileData.bloodType || undefined}
                              onValueChange={(value) => handleProfileField('bloodType', value === "none" ? "" : value)}
                            >
                              <SelectTrigger className={settings?.compactMode ? 'h-9 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white' : 'h-11 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white'}
                              >
                                <SelectValue placeholder={t('profile.fields.selectBloodType')} />
                              </SelectTrigger>
                              <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                                <SelectItem value="none" className="text-gray-400 dark:text-gray-500 italic">{t('profile.fields.notSpecified')}</SelectItem>
                                <SelectItem value="A+" className="text-gray-900 dark:text-white">A+</SelectItem>
                                <SelectItem value="A-" className="text-gray-900 dark:text-white">A-</SelectItem>
                                <SelectItem value="B+" className="text-gray-900 dark:text-white">B+</SelectItem>
                                <SelectItem value="B-" className="text-gray-900 dark:text-white">B-</SelectItem>
                                <SelectItem value="AB+" className="text-gray-900 dark:text-white">AB+</SelectItem>
                                <SelectItem value="AB-" className="text-gray-900 dark:text-white">AB-</SelectItem>
                                <SelectItem value="O+" className="text-gray-900 dark:text-white">O+</SelectItem>
                                <SelectItem value="O-" className="text-gray-900 dark:text-white">O-</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Telefone */}
                          <div className="space-y-2">
                            <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300 font-medium">
                              {t('profile.fields.phone')}
                            </Label>
                            <Input
                              id="phone"
                              value={profileData.phone}
                              onChange={(e) => handleProfileField('phone', e.target.value)}
                              placeholder={t('profile.fields.phonePlaceholder')}
                              className={settings?.compactMode ? 'h-9' : 'h-11'}
                            />
                          </div>

                          {/* Gênero */}
                          <div className="space-y-2">
                            <Label htmlFor="gender" className="text-gray-700 dark:text-gray-300 font-medium">
                              {t('profile.fields.gender')}
                            </Label>
                            <Select
                              value={profileData.gender || undefined}
                              onValueChange={(value) => handleProfileField('gender', value === "none" ? "" : value)}
                            >
                              <SelectTrigger className={settings?.compactMode ? 'h-9' : 'h-11'}
                              >
                                <SelectValue placeholder={t('profile.fields.selectGender')} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">
                                  <span className="text-gray-400 italic">{t('profile.fields.notSpecified')}</span>
                                </SelectItem>
                                <SelectItem value="Masculino">{t('profile.fields.male')}</SelectItem>
                                <SelectItem value="Feminino">{t('profile.fields.female')}</SelectItem>
                                <SelectItem value="Outro">{t('profile.fields.other')}</SelectItem>
                                <SelectItem value="Prefiro não dizer">{t('profile.fields.preferNotToSay')}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* País */}
                         
<div className="space-y-2">
  <Label htmlFor="country" className="text-gray-700 dark:text-gray-300 font-medium">
    {t('profile.fields.country')}
  </Label>
  <Select
    value={profileData.country || undefined}
    onValueChange={(value) => handleProfileField('country', value)}
  >
    <SelectTrigger className={settings?.compactMode ? 'h-9' : 'h-11'}>
      <SelectValue placeholder={t('profile.fields.selectCountry')} />
    </SelectTrigger>
    <SelectContent className="max-h-[300px] overflow-y-auto">
      {/* África */}
      <SelectItem value="Angola" className="font-semibold bg-gray-50 dark:bg-gray-800">🌍 África</SelectItem>
      <SelectItem value="Africa do Sul">🇿🇦 África do Sul</SelectItem>
      <SelectItem value="Argélia">🇩🇿 Argélia</SelectItem>
      <SelectItem value="Benim">🇧🇯 Benim</SelectItem>
      <SelectItem value="Botswana">🇧🇼 Botswana</SelectItem>
      <SelectItem value="Burquina Faso">🇧🇫 Burquina Faso</SelectItem>
      <SelectItem value="Burundi">🇧🇮 Burundi</SelectItem>
      <SelectItem value="Cabo Verde">🇨🇻 Cabo Verde</SelectItem>
      <SelectItem value="Camarões">🇨🇲 Camarões</SelectItem>
      <SelectItem value="Chade">🇹🇩 Chade</SelectItem>
      <SelectItem value="Comores">🇰🇲 Comores</SelectItem>
      <SelectItem value="Congo">🇨🇬 Congo</SelectItem>
      <SelectItem value="Costa do Marfim">🇨🇮 Costa do Marfim</SelectItem>
      <SelectItem value="Djibouti">🇩🇯 Djibouti</SelectItem>
      <SelectItem value="Egito">🇪🇬 Egito</SelectItem>
      <SelectItem value="Eritreia">🇪🇷 Eritreia</SelectItem>
      <SelectItem value="Essuatíni">🇸🇿 Essuatíni</SelectItem>
      <SelectItem value="Etiópia">🇪🇹 Etiópia</SelectItem>
      <SelectItem value="Gabão">🇬🇦 Gabão</SelectItem>
      <SelectItem value="Gâmbia">🇬🇲 Gâmbia</SelectItem>
      <SelectItem value="Gana">🇬🇭 Gana</SelectItem>
      <SelectItem value="Guiné">🇬🇳 Guiné</SelectItem>
      <SelectItem value="Guiné-Bissau">🇬🇼 Guiné-Bissau</SelectItem>
      <SelectItem value="Guiné Equatorial">🇬🇶 Guiné Equatorial</SelectItem>
      <SelectItem value="Lesoto">🇱🇸 Lesoto</SelectItem>
      <SelectItem value="Libéria">🇱🇷 Libéria</SelectItem>
      <SelectItem value="Líbia">🇱🇾 Líbia</SelectItem>
      <SelectItem value="Madagáscar">🇲🇬 Madagáscar</SelectItem>
      <SelectItem value="Malawi">🇲🇼 Malawi</SelectItem>
      <SelectItem value="Mali">🇲🇱 Mali</SelectItem>
      <SelectItem value="Marrocos">🇲🇦 Marrocos</SelectItem>
      <SelectItem value="Maurícia">🇲🇺 Maurícia</SelectItem>
      <SelectItem value="Mauritânia">🇲🇷 Mauritânia</SelectItem>
      <SelectItem value="Moçambique">🇲🇿 Moçambique</SelectItem>
      <SelectItem value="Namíbia">🇳🇦 Namíbia</SelectItem>
      <SelectItem value="Níger">🇳🇪 Níger</SelectItem>
      <SelectItem value="Nigéria">🇳🇬 Nigéria</SelectItem>
      <SelectItem value="Quénia">🇰🇪 Quénia</SelectItem>
      <SelectItem value="República Centro-Africana">🇨🇫 República Centro-Africana</SelectItem>
      <SelectItem value="República Democrática do Congo">🇨🇩 R.D. Congo</SelectItem>
      <SelectItem value="Ruanda">🇷🇼 Ruanda</SelectItem>
      <SelectItem value="São Tomé e Príncipe">🇸🇹 São Tomé e Príncipe</SelectItem>
      <SelectItem value="Senegal">🇸🇳 Senegal</SelectItem>
      <SelectItem value="Serra Leoa">🇸🇱 Serra Leoa</SelectItem>
      <SelectItem value="Seychelles">🇸🇨 Seychelles</SelectItem>
      <SelectItem value="Somália">🇸🇴 Somália</SelectItem>
      <SelectItem value="Sudão">🇸🇩 Sudão</SelectItem>
      <SelectItem value="Sudão do Sul">🇸🇸 Sudão do Sul</SelectItem>
      <SelectItem value="Tanzânia">🇹🇿 Tanzânia</SelectItem>
      <SelectItem value="Togo">🇹🇬 Togo</SelectItem>
      <SelectItem value="Tunísia">🇹🇳 Tunísia</SelectItem>
      <SelectItem value="Uganda">🇺🇬 Uganda</SelectItem>
      <SelectItem value="Zâmbia">🇿🇲 Zâmbia</SelectItem>
      <SelectItem value="Zimbabwe">🇿🇼 Zimbabwe</SelectItem>

      {/* América do Norte */}
      <SelectItem value="America do Norte" className="font-semibold bg-gray-50 dark:bg-gray-800 mt-2">🌎 América do Norte</SelectItem>
      <SelectItem value="Canadá">🇨🇦 Canadá</SelectItem>
      <SelectItem value="Estados Unidos">🇺🇸 Estados Unidos</SelectItem>
      <SelectItem value="México">🇲🇽 México</SelectItem>

      {/* América Central e Caribe */}
      <SelectItem value="Antígua e Barbuda">🇦🇬 Antígua e Barbuda</SelectItem>
      <SelectItem value="Bahamas">🇧🇸 Bahamas</SelectItem>
      <SelectItem value="Barbados">🇧🇧 Barbados</SelectItem>
      <SelectItem value="Belize">🇧🇿 Belize</SelectItem>
      <SelectItem value="Costa Rica">🇨🇷 Costa Rica</SelectItem>
      <SelectItem value="Cuba">🇨🇺 Cuba</SelectItem>
      <SelectItem value="Dominica">🇩🇲 Dominica</SelectItem>
      <SelectItem value="El Salvador">🇸🇻 El Salvador</SelectItem>
      <SelectItem value="Granada">🇬🇩 Granada</SelectItem>
      <SelectItem value="Guatemala">🇬🇹 Guatemala</SelectItem>
      <SelectItem value="Haiti">🇭🇹 Haiti</SelectItem>
      <SelectItem value="Honduras">🇭🇳 Honduras</SelectItem>
      <SelectItem value="Jamaica">🇯🇲 Jamaica</SelectItem>
      <SelectItem value="Nicarágua">🇳🇮 Nicarágua</SelectItem>
      <SelectItem value="Panamá">🇵🇦 Panamá</SelectItem>
      <SelectItem value="República Dominicana">🇩🇴 República Dominicana</SelectItem>
      <SelectItem value="São Cristóvão e Neves">🇰🇳 São Cristóvão e Neves</SelectItem>
      <SelectItem value="São Vicente e Granadinas">🇻🇨 São Vicente e Granadinas</SelectItem>
      <SelectItem value="Santa Lúcia">🇱🇨 Santa Lúcia</SelectItem>
      <SelectItem value="Trindade e Tobago">🇹🇹 Trindade e Tobago</SelectItem>

      {/* América do Sul */}
      <SelectItem value="America do Sul" className="font-semibold bg-gray-50 dark:bg-gray-800 mt-2">🌎 América do Sul</SelectItem>
      <SelectItem value="Argentina">🇦🇷 Argentina</SelectItem>
      <SelectItem value="Bolívia">🇧🇴 Bolívia</SelectItem>
      <SelectItem value="Brasil">🇧🇷 Brasil</SelectItem>
      <SelectItem value="Chile">🇨🇱 Chile</SelectItem>
      <SelectItem value="Colômbia">🇨🇴 Colômbia</SelectItem>
      <SelectItem value="Equador">🇪🇨 Equador</SelectItem>
      <SelectItem value="Guiana">🇬🇾 Guiana</SelectItem>
      <SelectItem value="Paraguai">🇵🇾 Paraguai</SelectItem>
      <SelectItem value="Peru">🇵🇪 Peru</SelectItem>
      <SelectItem value="Suriname">🇸🇷 Suriname</SelectItem>
      <SelectItem value="Uruguai">🇺🇾 Uruguai</SelectItem>
      <SelectItem value="Venezuela">🇻🇪 Venezuela</SelectItem>

      {/* Ásia */}
      <SelectItem value="Asia" className="font-semibold bg-gray-50 dark:bg-gray-800 mt-2">🌏 Ásia</SelectItem>
      <SelectItem value="Afeganistão">🇦🇫 Afeganistão</SelectItem>
      <SelectItem value="Arábia Saudita">🇸🇦 Arábia Saudita</SelectItem>
      <SelectItem value="Arménia">🇦🇲 Arménia</SelectItem>
      <SelectItem value="Azerbaijão">🇦🇿 Azerbaijão</SelectItem>
      <SelectItem value="Bangladesh">🇧🇩 Bangladesh</SelectItem>
      <SelectItem value="Barém">🇧🇭 Barém</SelectItem>
      <SelectItem value="Brunei">🇧🇳 Brunei</SelectItem>
      <SelectItem value="Butão">🇧🇹 Butão</SelectItem>
      <SelectItem value="Camboja">🇰🇭 Camboja</SelectItem>
      <SelectItem value="Catar">🇶🇦 Catar</SelectItem>
      <SelectItem value="Cazaquistão">🇰🇿 Cazaquistão</SelectItem>
      <SelectItem value="China">🇨🇳 China</SelectItem>
      <SelectItem value="Coreia do Norte">🇰🇵 Coreia do Norte</SelectItem>
      <SelectItem value="Coreia do Sul">🇰🇷 Coreia do Sul</SelectItem>
      <SelectItem value="Emirados Árabes Unidos">🇦🇪 EAU</SelectItem>
      <SelectItem value="Filipinas">🇵🇭 Filipinas</SelectItem>
      <SelectItem value="Geórgia">🇬🇪 Geórgia</SelectItem>
      <SelectItem value="Iémen">🇾🇪 Iémen</SelectItem>
      <SelectItem value="Índia">🇮🇳 Índia</SelectItem>
      <SelectItem value="Indonésia">🇮🇩 Indonésia</SelectItem>
      <SelectItem value="Irão">🇮🇷 Irão</SelectItem>
      <SelectItem value="Iraque">🇮🇶 Iraque</SelectItem>
      <SelectItem value="Israel">🇮🇱 Israel</SelectItem>
      <SelectItem value="Japão">🇯🇵 Japão</SelectItem>
      <SelectItem value="Jordânia">🇯🇴 Jordânia</SelectItem>
      <SelectItem value="Kuwait">🇰🇼 Kuwait</SelectItem>
      <SelectItem value="Laos">🇱🇦 Laos</SelectItem>
      <SelectItem value="Líbano">🇱🇧 Líbano</SelectItem>
      <SelectItem value="Malásia">🇲🇾 Malásia</SelectItem>
      <SelectItem value="Maldivas">🇲🇻 Maldivas</SelectItem>
      <SelectItem value="Mianmar">🇲🇲 Mianmar</SelectItem>
      <SelectItem value="Mongólia">🇲🇳 Mongólia</SelectItem>
      <SelectItem value="Nepal">🇳🇵 Nepal</SelectItem>
      <SelectItem value="Omã">🇴🇲 Omã</SelectItem>
      <SelectItem value="Paquistão">🇵🇰 Paquistão</SelectItem>
      <SelectItem value="Quirguistão">🇰🇬 Quirguistão</SelectItem>
      <SelectItem value="Rússia">🇷🇺 Rússia</SelectItem>
      <SelectItem value="Singapura">🇸🇬 Singapura</SelectItem>
      <SelectItem value="Síria">🇸🇾 Síria</SelectItem>
      <SelectItem value="Sri Lanka">🇱🇰 Sri Lanka</SelectItem>
      <SelectItem value="Tailândia">🇹🇭 Tailândia</SelectItem>
      <SelectItem value="Taiwan">🇹🇼 Taiwan</SelectItem>
      <SelectItem value="Tajiquistão">🇹🇯 Tajiquistão</SelectItem>
      <SelectItem value="Timor-Leste">🇹🇱 Timor-Leste</SelectItem>
      <SelectItem value="Turquemenistão">🇹🇲 Turquemenistão</SelectItem>
      <SelectItem value="Turquia">🇹🇷 Turquia</SelectItem>
      <SelectItem value="Usbequistão">🇺🇿 Usbequistão</SelectItem>
      <SelectItem value="Vietname">🇻🇳 Vietname</SelectItem>

      {/* Europa */}
      <SelectItem value="Europa" className="font-semibold bg-gray-50 dark:bg-gray-800 mt-2">🌍 Europa</SelectItem>
      <SelectItem value="Albânia">🇦🇱 Albânia</SelectItem>
      <SelectItem value="Alemanha">🇩🇪 Alemanha</SelectItem>
      <SelectItem value="Andorra">🇦🇩 Andorra</SelectItem>
      <SelectItem value="Áustria">🇦🇹 Áustria</SelectItem>
      <SelectItem value="Bélgica">🇧🇪 Bélgica</SelectItem>
      <SelectItem value="Bielorrússia">🇧🇾 Bielorrússia</SelectItem>
      <SelectItem value="Bósnia e Herzegovina">🇧🇦 Bósnia e Herzegovina</SelectItem>
      <SelectItem value="Bulgária">🇧🇬 Bulgária</SelectItem>
      <SelectItem value="Chipre">🇨🇾 Chipre</SelectItem>
      <SelectItem value="Croácia">🇭🇷 Croácia</SelectItem>
      <SelectItem value="Dinamarca">🇩🇰 Dinamarca</SelectItem>
      <SelectItem value="Eslováquia">🇸🇰 Eslováquia</SelectItem>
      <SelectItem value="Eslovénia">🇸🇮 Eslovénia</SelectItem>
      <SelectItem value="Espanha">🇪🇸 Espanha</SelectItem>
      <SelectItem value="Estónia">🇪🇪 Estónia</SelectItem>
      <SelectItem value="Finlândia">🇫🇮 Finlândia</SelectItem>
      <SelectItem value="França">🇫🇷 França</SelectItem>
      <SelectItem value="Grécia">🇬🇷 Grécia</SelectItem>
      <SelectItem value="Hungria">🇭🇺 Hungria</SelectItem>
      <SelectItem value="Irlanda">🇮🇪 Irlanda</SelectItem>
      <SelectItem value="Islândia">🇮🇸 Islândia</SelectItem>
      <SelectItem value="Itália">🇮🇹 Itália</SelectItem>
      <SelectItem value="Kosovo">🇽🇰 Kosovo</SelectItem>
      <SelectItem value="Letónia">🇱🇻 Letónia</SelectItem>
      <SelectItem value="Liechtenstein">🇱🇮 Liechtenstein</SelectItem>
      <SelectItem value="Lituânia">🇱🇹 Lituânia</SelectItem>
      <SelectItem value="Luxemburgo">🇱🇺 Luxemburgo</SelectItem>
      <SelectItem value="Macedónia do Norte">🇲🇰 Macedónia do Norte</SelectItem>
      <SelectItem value="Malta">🇲🇹 Malta</SelectItem>
      <SelectItem value="Moldávia">🇲🇩 Moldávia</SelectItem>
      <SelectItem value="Mónaco">🇲🇨 Mónaco</SelectItem>
      <SelectItem value="Montenegro">🇲🇪 Montenegro</SelectItem>
      <SelectItem value="Noruega">🇳🇴 Noruega</SelectItem>
      <SelectItem value="Países Baixos">🇳🇱 Países Baixos</SelectItem>
      <SelectItem value="Polónia">🇵🇱 Polónia</SelectItem>
      <SelectItem value="Portugal">🇵🇹 Portugal</SelectItem>
      <SelectItem value="Reino Unido">🇬🇧 Reino Unido</SelectItem>
      <SelectItem value="República Checa">🇨🇿 República Checa</SelectItem>
      <SelectItem value="Roménia">🇷🇴 Roménia</SelectItem>
      <SelectItem value="São Marino">🇸🇲 São Marino</SelectItem>
      <SelectItem value="Sérvia">🇷🇸 Sérvia</SelectItem>
      <SelectItem value="Suécia">🇸🇪 Suécia</SelectItem>
      <SelectItem value="Suíça">🇨🇭 Suíça</SelectItem>
      <SelectItem value="Ucrânia">🇺🇦 Ucrânia</SelectItem>
      <SelectItem value="Vaticano">🇻🇦 Vaticano</SelectItem>

      {/* Oceania */}
      <SelectItem value="Oceania" className="font-semibold bg-gray-50 dark:bg-gray-800 mt-2">🌏 Oceania</SelectItem>
      <SelectItem value="Austrália">🇦🇺 Austrália</SelectItem>
      <SelectItem value="Fiji">🇫🇯 Fiji</SelectItem>
      <SelectItem value="Ilhas Marshall">🇲🇭 Ilhas Marshall</SelectItem>
      <SelectItem value="Ilhas Salomão">🇸🇧 Ilhas Salomão</SelectItem>
      <SelectItem value="Kiribati">🇰🇮 Kiribati</SelectItem>
      <SelectItem value="Micronésia">🇫🇲 Micronésia</SelectItem>
      <SelectItem value="Nauru">🇳🇷 Nauru</SelectItem>
      <SelectItem value="Nova Zelândia">🇳🇿 Nova Zelândia</SelectItem>
      <SelectItem value="Palau">🇵🇼 Palau</SelectItem>
      <SelectItem value="Papua-Nova Guiné">🇵🇬 Papua-Nova Guiné</SelectItem>
      <SelectItem value="Samoa">🇼🇸 Samoa</SelectItem>
      <SelectItem value="Tonga">🇹🇴 Tonga</SelectItem>
      <SelectItem value="Tuvalu">🇹🇻 Tuvalu</SelectItem>
      <SelectItem value="Vanuatu">🇻🇺 Vanuatu</SelectItem>
    </SelectContent>
  </Select>
</div>

                          {/* Idioma */}
                          <LanguageSelect
                            value={profileData.language || 'pt'}
                            onChange={(code) => handleProfileField('language', code)}
                            compact={settings?.compactMode}
                          />
                        </div>

                        {/* Biografia */}
                        <div className="mt-8">
                          <Label htmlFor="bio" className="text-gray-700 dark:text-gray-300 font-medium block mb-2">
                            {t('profile.fields.bio')}
                          </Label>
                          <Textarea
                            id="bio"
                            value={profileData.bio}
                            onChange={(e) => handleProfileField('bio', e.target.value)}
                            placeholder={t('profile.fields.bioPlaceholder')}
                            className="min-h-[120px] resize-y bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                            rows={4}
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            {t('profile.characters', { count: profileData.bio.length })}
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
                          {t('common.cancel')}
                        </Button>
                        <Button
                          onClick={handleSaveProfile}
                          disabled={loading}
                          className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 transition-all duration-200"
                        >
                          {loading ? (
                            <>
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                              {t('common.saving')}
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              {t('profile.saveChanges')}
                            </>
                          )}
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                </TabsContent>

                {/* TAB: ALIMENTAÇÃO */}
                <TabsContent value="alimentacao" className="mt-6">
                  <Card className={`border-0 shadow-lg ${settings?.compactMode ? 'compact-card' : ''}`}>
                    <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                      <CardTitle className="flex items-center gap-2">
                        <Heart className="h-6 w-6" />
                        {t('nutrition.title')}
                      </CardTitle>
                      <CardDescription className="text-white/90">
                        {t('nutrition.description')}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-6">
                      {/* Seção de Dietas */}
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          {t('nutrition.diets')}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {[
                            { id: 'Vegetariana', label: t('diets.vegetarian'), icon: Leaf, color: 'text-green-600', bg: 'bg-green-50' },
                            { id: 'Vegana', label: t('diets.vegan'), icon: Sprout, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                            { id: 'Cetogênica (Keto)', label: t('diets.keto'), icon: Zap, color: 'text-purple-600', bg: 'bg-purple-50' },
                            { id: 'Mediterrânica', label: t('diets.mediterranean'), icon: Fish, color: 'text-blue-600', bg: 'bg-blue-50' },
                            { id: 'Low Carb', label: t('diets.lowCarb'), icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
                            { id: 'Paleo', label: t('diets.paleo'), icon: Apple, color: 'text-amber-600', bg: 'bg-amber-50' },
                            { id: 'Flexitariana', label: t('diets.flexitarian'), icon: Heart, color: 'text-pink-600', bg: 'bg-pink-50' },
                            { id: 'Sem Glúten', label: t('diets.glutenFree'), icon: WheatOff, color: 'text-red-600', bg: 'bg-red-50' },
                          ].map((diet) => {
                            const hasDiet = preferences?.diets?.includes(diet.id) || false;
                            return (
                              <div
                                key={diet.id}
                                className={`${diet.bg} dark:bg-gray-800 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${hasDiet ? 'border-green-500 dark:border-green-400' : 'border-gray-200 dark:border-gray-700'
                                  }`}
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
                                      <diet.icon className={`h-5 w-5 ${diet.color} dark:${diet.color.replace('600', '400')}`} />
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
                                    className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 dark:data-[state=checked]:bg-green-600 dark:data-[state=checked]:border-green-600"
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
                            {t('nutrition.allergies')}
                          </h3>
                          <Badge variant="outline" className="text-red-500 border-red-200">
                            {t('nutrition.safetyImportant')}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                          {alergias.map((alergia) => {
                            const hasAllergy = preferences?.allergies?.some(a => a.name === alergia.id) || false;
                            return (
                              <div
                                key={alergia.id}
                                className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all duration-200 ${hasAllergy
                                  ? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20'
                                  : 'border-gray-200 dark:border-gray-700'
                                  }`}
                              >
                                <div className="flex items-center gap-3">
                                  <alergia.icon className={`h-5 w-5 ${hasAllergy ? 'text-red-600 dark:text-red-400' : 'text-gray-400 dark:text-gray-500'}`} />
                                  <div>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                      {alergia.label}
                                    </span>
                                    <span className={`text-xs ml-2 px-2 py-0.5 rounded-full ${alergia.severity === t('severity.high')
                                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                      : alergia.severity === t('severity.medium')
                                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                      }`}>
                                      {alergia.severity}
                                    </span>
                                  </div>
                                </div>
                                <Switch
                                  checked={hasAllergy}
                                  onClick={() => handleAllergyToggle(alergia)}
                                  className="data-[state=checked]:bg-red-500 dark:data-[state=checked]:bg-red-600"
                                />
                              </div>
                            );
                          })}
                        </div>

                        <div className="mt-4">
                          <Label htmlFor="otherAllergy" className="text-gray-700 dark:text-gray-300 font-medium">
                            {t('nutrition.otherAllergies')}
                          </Label>
                          <div className="flex gap-2 mt-1">
                            <Input
                              id="otherAllergy"
                              value={otherAllergy}
                              onChange={(e) => setOtherAllergy(e.target.value)}
                              placeholder={t('nutrition.otherAllergiesPlaceholder')}
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
                          {t('nutrition.intolerances')}
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                          {intolerancias.map((intolerancia) => {
                            const hasIntolerance = preferences?.intolerances?.some(i => i.name === intolerancia.id) || false;
                            return (
                              <div
                                key={intolerancia.id}
                                className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all duration-200 ${hasIntolerance
                                  ? 'border-orange-300 bg-orange-50 dark:border-orange-700 dark:bg-orange-900/20'
                                  : 'border-gray-200 dark:border-gray-700'
                                  }`}
                              >
                                <div className="flex items-center gap-3">
                                  <intolerancia.icon className={`h-5 w-5 ${hasIntolerance ? 'text-orange-600 dark:text-orange-400' : 'text-gray-400 dark:text-gray-500'}`} />
                                  <div>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                      {intolerancia.label}
                                    </span>
                                    <span className={`text-xs ml-2 px-2 py-0.5 rounded-full ${intolerancia.severity === t('severity.high')
                                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                      : intolerancia.severity === t('severity.medium')
                                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                      }`}>
                                      {intolerancia.severity}
                                    </span>
                                  </div>
                                </div>
                                <Switch
                                  checked={hasIntolerance}
                                  onClick={() => handleIntoleranceToggle(intolerancia)}
                                  className="data-[state=checked]:bg-orange-500 dark:data-[state=checked]:bg-orange-600"
                                />
                              </div>
                            );
                          })}
                        </div>

                        <div className="mt-4">
                          <Label htmlFor="otherIntolerance" className="text-gray-700 dark:text-gray-300 font-medium">
                            {t('nutrition.otherIntolerances')}
                          </Label>
                          <div className="flex gap-2 mt-1">
                            <Input
                              id="otherIntolerance"
                              value={otherIntolerance}
                              onChange={(e) => setOtherIntolerance(e.target.value)}
                              placeholder={t('nutrition.otherIntolerancesPlaceholder')}
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
                            {t('nutrition.goals')}
                          </h3>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleResetPreferences}
                            className="text-red-500 border-red-200 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {t('nutrition.resetPreferences')}
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                          {[
                            { id: 'Aumentar Massa Muscular', icon: Dumbbell, label: t('goals.muscleGain'), color: 'text-red-500' },
                            { id: 'Perder Peso (Caloria)', icon: Scale, label: t('goals.weightLoss'), color: 'text-blue-500' },
                            { id: 'Aumentar Força', icon: TrendingUp, label: t('goals.strength'), color: 'text-orange-500' },
                            { id: 'Aumentar Proteínas', icon: Droplets, label: t('goals.protein'), color: 'text-purple-500' },
                            { id: 'Melhorar Saúde Mental', icon: Brain, label: t('goals.mentalHealth'), color: 'text-purple-500' },
                            { id: 'Aumentar Hidratação', icon: Droplets, label: t('goals.hydration'), color: 'text-cyan-500' },
                            { id: 'Pós-Cirurgia', icon: Pill, label: t('goals.postSurgery'), color: 'text-gray-500' },
                            { id: 'Apoio à Menopausa', icon: Heart, label: t('goals.menopause'), color: 'text-pink-500' },
                            { id: 'Performance Desportiva', icon: TrendingUp, label: t('goals.performance'), color: 'text-yellow-500' },
                            { id: 'Aumentar Imunidade', icon: Heart, label: t('goals.immunity'), color: 'text-green-500' },
                            { id: 'Equilíbrio Hormonal', icon: Brain, label: t('goals.hormonal'), color: 'text-indigo-500' },
                            { id: 'Gestação ou Pré-Gravidez', icon: Baby, label: t('goals.pregnancy'), color: 'text-green-500' },
                            { id: 'Saúde Intestinal', icon: Pill, label: t('goals.gutHealth'), color: 'text-amber-500' },
                            { id: 'Qualidade do Sono', icon: Moon, label: t('goals.sleep'), color: 'text-blue-500' },
                            { id: 'Reduzir Colesterol', icon: Heart, label: t('goals.cholesterol'), color: 'text-red-500' },
                          ].map((goal) => {
                            const hasGoal = preferences?.goals?.some(g => g.name === goal.id) || false;
                            return (
                              <div
                                key={goal.id}
                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${hasGoal
                                  ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
                                  : 'border-gray-200 dark:border-gray-700'
                                  }`}
                                onClick={() => toggleGoal(goal.id)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <goal.icon className={`h-5 w-5 ${goal.color} dark:${goal.color.replace('500', '400')}`} />
                                    <span className="font-medium text-gray-900 dark:text-white">
                                      {goal.label}
                                    </span>
                                  </div>
                                  {hasGoal && <Check className="h-5 w-5 text-blue-500 dark:text-blue-400" />}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Objetivos personalizados */}
                        <div className="mt-6">
                          <Label htmlFor="customGoal" className="text-gray-700 dark:text-gray-300 font-medium mb-2 block">
                            {t('nutrition.customGoal')}
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              id="customGoal"
                              value={customGoalInput}
                              onChange={(e) => setCustomGoalInput(e.target.value)}
                              placeholder={t('nutrition.customGoalPlaceholder')}
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
                          {t('nutrition.calorieTarget')}
                        </h3>
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                          <div className="flex-1">
                            <Label htmlFor="calories" className="text-gray-700 dark:text-gray-300">
                              {t('nutrition.caloriesPerDay')}
                            </Label>
                            <Input
                              id="calories"
                              type="number"
                              value={preferences?.calorieTarget || ''}
                              onChange={(e) => updatePrefField('calorieTarget', parseInt(e.target.value) || 0)}
                              placeholder={t('nutrition.caloriesPlaceholder')}
                              className="mt-1"
                              min="800"
                              max="5000"
                            />
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            <p>{t('nutrition.calorieRecommendation')}</p>
                            <p className="text-xs mt-1">{t('nutrition.nutritionistAdvice')}</p>
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
                              {t('nutrition.unsavedChanges')}
                            </span>
                          ) : (
                            <span className="text-green-600 flex items-center gap-2">
                              <Check className="h-4 w-4" />
                              {t('nutrition.allSaved')}
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
                            {t('common.cancel')}
                          </Button>
                          <Button
                            onClick={async () => {
                              const result = await savePreferences();
                              if (result?.success) {
                                toast({
                                  title: t('nutrition.saveSuccess'),
                                  description: t('nutrition.saveSuccessDesc'),
                                });
                              }
                            }}
                            disabled={!prefsHasChanges || prefsLoading}
                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 transition-all duration-200"
                          >
                            {prefsLoading ? (
                              <>
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                                {t('common.saving')}
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4 mr-2" />
                                {t('nutrition.savePreferences')}
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
                  <Card className={`border-0 shadow-lg ${settings?.compactMode ? 'compact-card' : ''}`}>
                    <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                      <CardTitle className="flex items-center gap-2">
                        <ChefHat className="h-6 w-6" />
                        {t('experience.title')}
                      </CardTitle>
                      <CardDescription className="text-white/90">
                        {t('experience.description')}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Anos de Experiência */}
                        <div className="space-y-2">
                          <Label className="text-gray-700 dark:text-gray-300 font-medium">
                            {t('experience.years')}
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
                              className="h-11 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                              min="0"
                              max="50"
                            />
                            <span className="text-gray-500 dark:text-gray-400">{t('experience.yearsUnit')}</span>
                          </div>
                        </div>

                        {/* Nível Culinário */}
                        <div className="space-y-2">
                          <Label className="text-gray-700 dark:text-gray-300 font-medium">
                            {t('experience.levelLabel')}
                          </Label>
                          <Select
                            value={experience.level}
                            onValueChange={(value) => {
                              const next = { ...experience, level: value };
                              setExperience(next);
                            }}
                          >
                            <SelectTrigger className="h-11 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                              <SelectItem value="Iniciante" className="text-gray-900 dark:text-white">{t('experience.level.beginner')}</SelectItem>
                              <SelectItem value="Intermediário" className="text-gray-900 dark:text-white">{t('experience.level.intermediate')}</SelectItem>
                              <SelectItem value="Avançado" className="text-gray-900 dark:text-white">{t('experience.level.advanced')}</SelectItem>
                              <SelectItem value="Profissional" className="text-gray-900 dark:text-white">{t('experience.level.professional')}</SelectItem>
                              <SelectItem value="Chef" className="text-gray-900 dark:text-white">{t('experience.level.chef')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Técnicas Culinárias */}
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          {t('experience.techniquesTitle')}
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
                          {t('experience.equipmentTitle')}
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
                                className={`cursor-pointer px-4 py-2 transition-all duration-200 ${hasEquipment
                                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-purple-300 dark:hover:border-purple-600 hover:text-purple-700 dark:hover:text-purple-400'
                                  }`}
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
                          {t('experience.certificationsTitle')}
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
                                    {t('experience.uploadedOn')} {new Date(cert.uploadedAt).toLocaleDateString()}
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

                          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-purple-500 dark:hover:border-purple-400 transition-colors duration-200">
                            <Upload className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                            <p className="text-gray-600 dark:text-gray-400 mb-3">
                              {t('experience.dragDrop')}
                            </p>
                            <Button
                              variant="outline"
                              onClick={() => certInputRef.current?.click()}
                              className="border-purple-500 text-purple-600 hover:bg-purple-50 dark:border-purple-400 dark:text-purple-400 dark:hover:bg-purple-900/20 transition-colors"
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              {t('experience.uploadCertificate')}
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
                          {t('common.cancel')}
                        </Button>
                        <Button
                          onClick={saveExperience}
                          disabled={loading}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
                        >
                          {loading ? (
                            <>
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                              {t('common.saving')}
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              {t('experience.save')}
                            </>
                          )}
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                </TabsContent>

                {/* TAB: SEGURANÇA */}
                <TabsContent value="seguranca" className="mt-6">
                  <Card className={`border-0 shadow-lg bg-white dark:bg-gray-800 ${settings?.compactMode ? 'compact-card' : ''}`}>
                    <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-6 w-6" />
                        {t('security.title')}
                      </CardTitle>
                      <CardDescription className="text-white/90">
                        {t('security.description')}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-6 space-y-6">
                      {/* Componente 2FA */}
                      <TwoFactorAuth
                        user={user}
                        security={security}
                        setSecurity={setSecurity}
                        saveSettings={saveSettings}
                      />

                      <Separator className="my-8 bg-gray-200 dark:bg-gray-700" />

                      {/* Alterar Senha */}
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          {t('security.changePassword')}
                        </h3>

                        <form onSubmit={handlePasswordChange} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Senha Atual */}
                            <div className="space-y-2">
                              <Label htmlFor="currentPassword" className="text-gray-700 dark:text-gray-300">
                                {t('security.currentPassword')}
                              </Label>
                              <div className="relative">
                                <Input
                                  id="currentPassword"
                                  name="currentPassword"
                                  type={showPassword ? "text" : "password"}
                                  value={passwordData.currentPassword}
                                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                  placeholder={t('security.currentPasswordPlaceholder')}
                                  className="pr-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                                  required
                                />
                                <button
                                  type="button"
                                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                              </div>
                            </div>

                            {/* Nova Senha */}
                            <div className="space-y-2">
                              <Label htmlFor="newPassword" className="text-gray-700 dark:text-gray-300">
                                {t('security.newPassword')}
                              </Label>
                              <div className="relative">
                                <Input
                                  id="newPassword"
                                  name="newPassword"
                                  type={showPassword ? "text" : "password"}
                                  value={passwordData.newPassword}
                                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                  placeholder={t('security.newPasswordPlaceholder')}
                                  className="pr-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                                  required
                                  minLength="8"
                                />
                                <button
                                  type="button"
                                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Confirmar Nova Senha */}
                          <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-gray-700 dark:text-gray-300">
                              {t('security.confirmPassword')}
                            </Label>
                            <div className="relative">
                              <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showPassword ? "text" : "password"}
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                placeholder={t('security.confirmPasswordPlaceholder')}
                                required
                                className="pr-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                              />
                              <button
                                type="button"
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </div>

                          {/* Botões */}
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
                                  title: t('security.formCleared'),
                                  description: t('security.formClearedDesc'),
                                });
                              }}
                              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                              <X className="h-4 w-4 mr-2" />
                              {t('common.cancel')}
                            </Button>
                            <Button
                              type="submit"
                              disabled={loading}
                              className="bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 dark:from-gray-600 dark:to-gray-700 dark:hover:from-gray-700 dark:hover:to-gray-800 text-white transition-all duration-200"
                            >
                              {loading ? (
                                <>
                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                                  {t('security.changing')}
                                </>
                              ) : (
                                <>
                                  <Lock className="h-4 w-4 mr-2" />
                                  {t('security.changePassword')}
                                </>
                              )}
                            </Button>
                          </div>
                        </form>

                        {security.lastPasswordChange && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                            {t('security.lastChange')} {new Date(security.lastPasswordChange).toLocaleDateString()}
                          </p>
                        )}
                      </div>

                      <Separator className="my-8 bg-gray-200 dark:bg-gray-700" />

                      {/* Sessões Ativas */}
                      <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {t('security.activeSessions')}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {t('security.sessionsDescription')}
                            </p>
                          </div>
                          <Badge variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                            {security.sessions?.length || 0} {t('security.devices')}
                          </Badge>
                        </div>

                        <div className="space-y-3">
                          {(security.sessions || []).map((session) => (
                            <div
                              key={session.id}
                              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700"
                            >
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${session.current ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-600'}`}>
                                  {session.current ? (
                                    <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                                  ) : (
                                    <Monitor className="h-4 w-4 text-gray-400 dark:text-gray-500" />
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
                                    {t('security.current')}
                                  </Badge>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => revokeSession(session.id)}
                                    className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                  >
                                    <LogOut className="h-4 w-4 mr-1" />
                                    {t('security.revoke')}
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}

                          {(!security.sessions || security.sessions.length === 0) && (
                            <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-700">
                              <Monitor className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                              <p className="text-gray-600 dark:text-gray-400">{t('security.noSessions')}</p>
                            </div>
                          )}
                        </div>

                        <div className="mt-4">
                          <Button
                            variant="outline"
                            onClick={revokeAllSessions}
                            className="w-full border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            {t('security.revokeAll')}
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
                        {t('settings.title')}
                      </CardTitle>
                      <CardDescription className="text-white/90">
                        {t('settings.description')}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-6">
                      {/* Tema */}
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          {t('settings.appearance')}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          {[
                            { value: 'light', label: t('settings.theme.light'), icon: Sun, color: 'text-yellow-500' },
                            { value: 'dark', label: t('settings.theme.dark'), icon: Moon, color: 'text-blue-500' },
                            { value: 'system', label: t('settings.theme.system'), icon: Monitor, color: 'text-gray-500' },
                          ].map((themeOption) => (
                            <div
                              key={themeOption.value}
                              className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${settings?.theme === themeOption.value ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}`}

                              onClick={async () => {
                                const newSettings = { ...settings, theme: themeOption.value };
                                updateSettingField('theme', themeOption.value);
                                await saveSettings(newSettings);
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
                                localStorage.setItem(`smartchef_theme_${user?.id}`, themeOption.value);
                              }}
                            >
                              <div className="flex flex-col items-center gap-3">
                                <themeOption.icon className={`h-8 w-8 ${themeOption.color}`} />
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {themeOption.label}
                                </span>
                                {settings?.theme === themeOption.value && (
                                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                    {t('settings.active')}
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
                                {t('settings.compactMode')}
                              </Label>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {t('settings.compactModeDesc')}
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
                                {t('settings.animations')}
                              </Label>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {t('settings.animationsDesc')}
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
                          {t('settings.notifications')}
                        </h3>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="notifyLogin" className="text-gray-700 dark:text-gray-300 font-medium">
                                {t('settings.notifyLogin')}
                              </Label>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {t('settings.notifyLoginDesc')}
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
                                {t('settings.notifySecurity')}
                              </Label>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {t('settings.notifySecurityDesc')}
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
                                {t('settings.notifyRecipes')}
                              </Label>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {t('settings.notifyRecipesDesc')}
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
                                {t('settings.newsletter')}
                              </Label>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {t('settings.newsletterDesc')}
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

                                        <Separator className="my-6" />

                  <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <Heart className="h-4 w-4 text-green-500" />
                      Sugestões diárias
                    </h3>
                    <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-green-50 dark:bg-green-900/10">
                      <div>
                        <Label htmlFor="restrictionsInSuggestions" className="text-gray-700 dark:text-gray-300 font-medium">
                          Aplicar restrições alimentares
                        </Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                          Quando ligado, as sugestões do dia respeitam as tuas alergias e dietas.
                        </p>
                      </div>
                              <Switch
  id="restrictionsInSuggestions"
  checked={settings?.restrictionsInSuggestions !== false}
  onClick={() => {
    const newVal = !(settings?.restrictionsInSuggestions !== false);
    updateSettingField('restrictionsInSuggestions', newVal);
  }}
/>
                    </div>
                  </div>


                      {/* Reset Configurações */}
                      <div className="mt-8 p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/10">
                        <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
                          {t('settings.advanced')}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          {t('settings.advancedDesc')}
                        </p>
                        <Button
                          variant="outline"
                          onClick={handleResetSettings}
                          className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700 transition-colors"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          {t('settings.resetAll')}
                        </Button>
                      </div>
                    </CardContent>

                    <CardFooter className="bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
                      <div className="flex justify-between items-center w-full">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {settingsHasChanges ? (
                            <span className="text-orange-600 flex items-center gap-2">
                              <AlertCircle className="h-4 w-4" />
                              {t('settings.unsavedChanges')}
                            </span>
                          ) : (
                            <span className="text-green-600 flex items-center gap-2">
                              <Check className="h-4 w-4" />
                              {t('settings.allSaved')}
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
                            {t('common.cancel')}
                          </Button>
                          <Button
                            onClick={async () => {
                              const result = await saveSettings();
                              if (result?.success) {
                                toast({
                                  title: t('settings.saved'),
                                  description: t('settings.savedDesc'),
                                });
                              }
                            }}
                            disabled={!settingsHasChanges || settingsLoading}
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 transition-all duration-200"
                          >
                            {settingsLoading ? (
                              <>
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                                {t('common.saving')}
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4 mr-2" />
                                {t('settings.save')}
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
                        {t('account.title')}
                      </CardTitle>
                      <CardDescription className="text-white/90">
                        {t('account.description')}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-6">
                      {/* Exportar Dados */}
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          {t('account.exportData')}
                        </h3>

                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                {t('account.fullBackup')}
                              </h4>
                              <p className="text-gray-600 dark:text-gray-400">
                                {t('account.exportDesc')}
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
                                  {t('account.exporting')}
                                </>
                              ) : (
                                <>
                                  <Download className="h-4 w-4 mr-2" />
                                  {t('account.exportData')}
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
                          {t('account.deactivateTitle')}
                        </h3>

                        <Alert className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                          <AlertTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-300">
                            <AlertCircle className="h-4 w-4" />
                            {t('account.reversibleAction')}
                          </AlertTitle>
                          <AlertDescription className="text-yellow-700 dark:text-yellow-400">
                            {t('account.deactivateDesc')}
                          </AlertDescription>
                        </Alert>

                        <div className="mt-4">
                          <Button
                            variant="outline"
                            onClick={() => setIsDeactivateDialogOpen(true)}
                            className="w-full border-yellow-500 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors"
                          >
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            {t('account.deactivateButton')}
                          </Button>
                        </div>

                        {/* Diálogo de Desativação */}
                        <Dialog open={isDeactivateDialogOpen} onOpenChange={setIsDeactivateDialogOpen}>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                                {t('account.deactivateConfirmTitle')}
                              </DialogTitle>
                              <DialogDescription>
                                {t('account.deactivateConfirmDesc')}
                              </DialogDescription>
                            </DialogHeader>

                            <div className="py-4 space-y-3">
                              <Alert className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                                <AlertTitle>{t('account.whatHappens')}</AlertTitle>
                                <AlertDescription className="space-y-1">
                                  <p>• {t('account.deactivateBullet1')}</p>
                                  <p>• {t('account.deactivateBullet2')}</p>
                                  <p>• {t('account.deactivateBullet3')}</p>
                                </AlertDescription>
                              </Alert>

                              <p className="text-sm text-gray-500">
                                {t('account.deactivateReversibleNote')}
                              </p>
                            </div>

                            <DialogFooter className="flex gap-2">
                              <Button
                                variant="outline"
                                onClick={() => setIsDeactivateDialogOpen(false)}
                                disabled={loading}
                              >
                                {t('common.cancel')}
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={handleDeactivateAccount}
                                disabled={loading}
                              >
                                {loading ? (
                                  <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                                    {t('common.processing')}
                                  </>
                                ) : (
                                  t('account.confirmDeactivate')
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
                          {t('account.deleteTitle')}
                        </h3>

                        <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                          <AlertTitle className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            {t('account.irreversibleAction')}
                          </AlertTitle>
                          <AlertDescription>
                            {t('account.deleteDesc')}
                          </AlertDescription>
                        </Alert>

                        <div className="mt-4">
                          <Button
                            variant="destructive"
                            onClick={() => setIsDeleteDialogOpen(true)}
                            className="w-full"
                          >
                            <AlertCircle className="h-4 w-4 mr-2" />
                            {t('account.deleteButton')}
                          </Button>
                        </div>

                        {/* Diálogo de Eliminação */}
                        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2 text-red-600">
                                <AlertCircle className="h-5 w-5" />
                                {t('account.deleteConfirmTitle')}
                              </DialogTitle>
                              <DialogDescription className="text-red-500">
                                {t('account.deleteConfirmDesc')}
                              </DialogDescription>
                            </DialogHeader>

                            <div className="py-4 space-y-4">
                              <Alert variant="destructive">
                                <AlertTitle className="flex items-center gap-2">
                                  <AlertCircle className="h-4 w-4" />
                                  {t('account.irreversibleWarning')}
                                </AlertTitle>
                                <AlertDescription className="space-y-1">
                                  <p>• {t('account.deleteBullet1')}</p>
                                  <p>• {t('account.deleteBullet2')}</p>
                                  <p>• {t('account.deleteBullet3')}</p>
                                </AlertDescription>
                              </Alert>

                              <div className="space-y-2">
                                <Label htmlFor="deletePassword" className="text-gray-700 dark:text-gray-300">
                                  {t('account.enterPasswordToConfirm')}
                                </Label>
                                <Input
                                  id="deletePassword"
                                  type="password"
                                  value={deletePassword}
                                  onChange={(e) => setDeletePassword(e.target.value)}
                                  placeholder={t('account.currentPassword')}
                                  className="border-red-300 dark:border-red-700"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {t('account.confirmIdentity')}
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
                                {t('common.cancel')}
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={handleDeleteAccount}
                                disabled={isDeleting || !deletePassword.trim()}
                              >
                                {isDeleting ? (
                                  <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                                    {t('account.deleting')}
                                  </>
                                ) : (
                                  t('account.confirmDelete')
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
                  <p className="font-medium text-gray-900 dark:text-white">{t('common.saving')}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('common.pleaseWait')}</p>
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
          <input
            type="file"
            ref={certInputRef}
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadCertification(file);
            }}
          />
        </div>
      </TooltipProvider>
    </ErrorBoundary>
  );
};

export default UserProfile;