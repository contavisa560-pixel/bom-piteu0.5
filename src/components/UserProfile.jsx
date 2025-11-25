// src/components/UserProfile.jsx
import { useTheme } from "@/context/ThemeContext";
import { getUser, updateUser, uploadAvatar, deleteUser } from '@/services/api';
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Award, Heart, ChefHat, Mail, Info, BookOpen, Shield, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { getUserSettings, updateUserSettings } from '@/services/api'; // ou '@/api' dependendo do caminho real
import i18n from '@/i18n';
import { useTranslation } from "react-i18next";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Sparkles } from "lucide-react";

import { useContext } from "react";
import {
  Nut,
  MilkOff,
  Egg,
  Wheat,
  Leaf,
  Fish,
  Sprout,
  CircleDot,
  AlertTriangle,
  WheatOff,
  Apple,
  Ban,
  ThermometerSun,
  Candy,
  Wine,
  CandyOff,
  UtensilsCrossed
} from "lucide-react";


const UserProfile = ({ user: initialUser, onNavigate }) => {

  const { toast } = useToast();
  const fileInputRef = useRef(null);
  const certInputRef = useRef(null);
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [otherAllergy, setOtherAllergy] = useState("");
  const [otherIntolerance, setOtherIntolerance] = useState("");


  const alergias = [
    { id: "alergia_amendoim", label: "Alergia a Amendoim", icon: Nut },
    { id: "alergia_leite", label: "Alergia ao Leite", icon: MilkOff },
    { id: "alergia_ovo", label: "Alergia ao Ovo", icon: Egg },
    { id: "alergia_trigo", label: "Alergia ao Trigo", icon: Wheat },
    { id: "alergia_frutos_secos", label: "Alergia a Frutos Secos", icon: Leaf },
    { id: "alergia_marisco", label: "Alergia a Marisco", icon: AlertTriangle },
    { id: "alergia_peixe", label: "Alergia a Peixe", icon: Fish },
    { id: "alergia_soja", label: "Alergia à Soja", icon: Sprout },
    { id: "alergia_sesamo", label: "Alergia a Sésamo", icon: CircleDot },
    { id: "alergia_sulfitos", label: "Alergia a Sulfitos", icon: AlertTriangle },
  ];

  const intolerancias = [
    { id: "intolerancia_lactose", label: "Intolerância à Lactose", icon: MilkOff },
    { id: "doenca_celiaca", label: "Doença Celíaca (Glúten)", icon: WheatOff },
    { id: "sensibilidade_gluten", label: "Sensibilidade ao Glúten", icon: Ban },
    { id: "intolerancia_frutose", label: "Intolerância à Frutose", icon: Apple },
    { id: "intolerancia_frutose_hered", label: "Frutose Hereditária", icon: Ban },
    { id: "intolerancia_histamina", label: "Intolerância à Histamina", icon: ThermometerSun },
    { id: "intolerancia_sacarose", label: "Intolerância à Sacarose", icon: Candy },
    { id: "intolerancia_alcool", label: "Intolerância ao Álcool", icon: Wine },
    { id: "intolerancia_sorbitol", label: "Intolerância ao Sorbitol", icon: CandyOff },
    { id: "sindrome_fodmap", label: "Síndrome FODMAP", icon: UtensilsCrossed },
  ];




  // --- estado principal do utilizador (prop -> localStorage by user id)
  const [user, setUser] = useState(() => {
    try {
      const local = localStorage.getItem('bomPiteuUser') || localStorage.getItem('smartchef_user');
      return initialUser || (local ? JSON.parse(local) : null);
    } catch (e) {
      return initialUser || null;
    }
  });

  if (!user || !user.id) {
    console.error('❌ Erro: user.id não está definido!');
    return <div>Erro: utilizador não encontrado</div>;
  }

  // perfil image guardado por utilizador (evita mistura entre contas)
  const LOCAL_USER_KEY = `bomPiteuUser_${user.id}`;

  const [profileImage, setProfileImage] = useState(() => {
    const stored = localStorage.getItem(LOCAL_USER_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed.picture || user.picture || '';
      } catch { return user.picture || ''; }
    }
    return user.picture || '';
  });

  const [showMenu, setShowMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('geral');

  // profile data (editable)
  const [profileData, setProfileData] = useState({
    name: user.name || '',
    email: user.email || '',
    age: user.age || '',
    country: user.country || '',
    language: user.language || 'Português',
    gender: user.gender || '',
    bio: user.bio || '',
  });

  // Alimentação: dieta, restrições, objetivos, metas calóricas, macro split
  const [nutrition, setNutrition] = useState(() => user.settings?.nutrition || {
    diets: [],                // ex: ['Vegetariano']
    allergies: [],            // [{ name: 'Lactose', severity: 'moderada' }]
    goals: [],                // ex: ['Perder Peso']
    calorieTarget: null,
    macros: { carb: 50, protein: 25, fat: 25 } // percent
  });

  // Experiência: cozinhas com proficiência, técnicas, equipamentos, certificações
  const [experience, setExperience] = useState(() => user.settings?.experience || {
    level: user.level || '',
    cuisines: [],   // [{name:'Italiana', prof: 'Avançado'}]
    techniques: [], // [{name:'Sous-vide', prof:'Intermédio'}]
    equipment: [],  // ['Airfryer', 'Forno']
    years: user.years || 0,
    certifications: user.certifications || [] // [{name, url}]
  });

  // Segurança: 2FA, recovery, sessions (guardado no user.settings.sessions)
  const [security, setSecurity] = useState(() => user.settings?.security || {
    twoFactorAuth: user.security?.twoFactorAuth || false,
    recoveryEmail: user.recoveryEmail || '',
    notifyLogin: user.settings?.notifyLogin ?? true,
    notifyPasswordChange: user.settings?.notifyPasswordChange ?? true,
    sessions: user.settings?.sessions || [] // [{id, device, ip, createdAt, current}]
  });

  // outras preferências (mantidas)
  const [preferences, setPreferences] = useState(() => user.settings?.preferences || {
    diet: [],
    restrictions: [],
    goals: []
  });


  const [settings, setSettings] = useState(() => {
    const stored = JSON.parse(localStorage.getItem("smartchef_settings") || "{}");

    return {
      theme: stored.theme || "light",             // respeita o user
      language: stored.language || user.language || "pt",
      compactMode: stored.compactMode ?? false,
      animations: stored.animations ?? true,
      alertLogin: stored.alertLogin ?? true,
      alertSecurity: stored.alertSecurity ?? true,
      region: stored.region || "pt-AO",
      dateFormat: stored.dateFormat || "dd/MM/yyyy",
      autoLock: stored.autoLock || 10,
      devices: stored.devices || [
        { id: 1, name: "Chrome • Windows 10", active: true },
        { id: 2, name: "Chrome Mobile • Android", active: true },
      ],
      backup: stored.backup || null
    };
  });


  // small helpers
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    return parts.length > 1
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : name[0].toUpperCase();
  };

  // --- sincronizar quando user muda (ex: login Google)
  useEffect(() => {
    if (user) {
      setProfileData(prev => ({ ...prev, name: user.name || prev.name, email: user.email || prev.email }));
      if (user.picture) {
        setProfileImage(user.picture);
        persistLocalUser({ ...user, picture: user.picture });
      }
    }
  }, [user]);

  // persist local por utilizador
  function persistLocalUser(u) {
    const cur = JSON.parse(localStorage.getItem(LOCAL_USER_KEY) || '{}');
    const merged = { ...cur, ...u };
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(merged));
    localStorage.setItem('bomPiteuUser', JSON.stringify(merged)); // backwards compat
  }

  // --- FUNÇÕES PARA SALVAR NO BACKEND (usa updateUser)
  const saveToServer = async (payload, showToast = true) => {
    try {
      const res = await updateUser(user.id, payload);
      // tentar obter user actualizado
      const updatedUser = res?.user || { ...user, ...payload };
      setUser(updatedUser);
      persistLocalUser(updatedUser);
      if (showToast) toast({ title: 'Guardado', description: 'Alterações guardadas com sucesso.' });
      // actualizar local copies of settings if present
      return updatedUser;
    } catch (err) {
      console.error('saveToServer error', err);
      toast({ title: 'Erro', description: 'Falha ao gravar no servidor', variant: 'destructive' });
      throw err;
    }
  };

  // salvar settings completos (conveniência)
  // salva settings local + backend e atualiza localStorage
  const saveSettings = async (patch) => {
    try {
      const updated = { ...settings, ...patch };
      setSettings(updated);

      // envia para o backend
      await updateUserSettings(user.id, updated);

      // actualiza localStorage user
      const stored = JSON.parse(localStorage.getItem(LOCAL_USER_KEY) || "{}");
      const merged = { ...stored, settings: updated };
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(merged));
      localStorage.setItem('bomPiteuUser', JSON.stringify(merged));

      toast({ title: "Guardado", description: "Configurações guardadas com sucesso." });
    } catch (err) {
      console.error("Erro ao guardar settings:", err);
      toast({ title: "Erro", description: "Falha ao gravar settings", variant: "destructive" });
    }
  };

  // avatar upload
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await uploadAvatar(user.id, file);
      if (!res.imageUrl) throw new Error('Sem imageUrl');
      const updatedUser = await saveToServer({ picture: res.imageUrl }, false);
      setProfileImage(res.imageUrl);
      persistLocalUser(updatedUser);
      window.dispatchEvent(new CustomEvent("user_updated", { detail: updatedUser }));
      toast({ title: "Foto atualizada!", description: "Imagem alterada com sucesso." });
    } catch (err) {
      console.error(err);
      toast({ title: "Erro", description: "Falha ao enviar imagem", variant: "destructive" });
    }
  };

  // --- ALIMENTAÇÃO: helpers (diets, allergies, goals, macros)
  const toggleDiet = (diet) => {
    setNutrition(prev => {
      const exists = prev.diets.includes(diet);
      const next = { ...prev, diets: exists ? prev.diets.filter(d => d !== diet) : [...prev.diets, diet] };
      // salvar local imediatamente
      setTimeout(() => saveSettings({ nutrition: next }), 200);
      return next;
    });
  };

  const setAllergy = (name, severity) => {
    setNutrition(prev => {
      const filtered = prev.allergies.filter(a => a.name !== name);
      const nextAll = severity ? [...filtered, { name, severity }] : filtered;
      const next = { ...prev, allergies: nextAll };
      saveSettings({ nutrition: next });
      return next;
    });
  };

  const toggleGoal = (goal) => {
    setNutrition(prev => {
      const exists = prev.goals.includes(goal);
      const next = { ...prev, goals: exists ? prev.goals.filter(g => g !== goal) : [...prev.goals, goal] };
      saveSettings({ nutrition: next });
      return next;
    });
  };

  const setCalories = (value) => {
    setNutrition(prev => {
      const next = { ...prev, calorieTarget: Number(value) || null };
      saveSettings({ nutrition: next });
      return next;
    });
  };

  const setMacro = (field, value) => {
    setNutrition(prev => {
      const v = Number(value);
      const nextMacros = { ...prev.macros, [field]: v };
      // normalize to 100 if needed - keep simple: allow manual
      const next = { ...prev, macros: nextMacros };
      saveSettings({ nutrition: next });
      return next;
    });
  };

  // --- EXPERIÊNCIA: helpers
  const toggleCuisine = (cuisine, prof = 'Intermédio') => {
    setExperience(prev => {
      const exists = prev.cuisines.find(c => c.name === cuisine);
      let next;
      if (exists) {
        next = { ...prev, cuisines: prev.cuisines.map(c => c.name === cuisine ? { ...c, prof } : c) };
      } else {
        next = { ...prev, cuisines: [...prev.cuisines, { name: cuisine, prof }] };
      }
      saveSettings({ experience: next });
      return next;
    });
  };

  const setCuisineProf = (cuisine, prof) => {
    setExperience(prev => {
      const next = { ...prev, cuisines: prev.cuisines.map(c => c.name === cuisine ? { ...c, prof } : c) };
      saveSettings({ experience: next });
      return next;
    });
  };

  const toggleTechnique = (tech, prof = 'Básico') => {
    setExperience(prev => {
      const exists = prev.techniques.find(t => t.name === tech);
      let next;
      if (exists) next = { ...prev, techniques: prev.techniques.map(t => t.name === tech ? { ...t, prof } : t) };
      else next = { ...prev, techniques: [...prev.techniques, { name: tech, prof }] };
      saveSettings({ experience: next });
      return next;
    });
  };

  const toggleEquipment = (eq) => {
    setExperience(prev => {
      const exists = prev.equipment.includes(eq);
      const next = { ...prev, equipment: exists ? prev.equipment.filter(e => e !== eq) : [...prev.equipment, eq] };
      saveSettings({ experience: next });
      return next;
    });
  };

  const setYears = (v) => {
    setExperience(prev => {
      const next = { ...prev, years: Number(v) || 0 };
      saveSettings({ experience: next });
      return next;
    });
  };

  const uploadCertification = async (file) => {
    if (!file) return;
    // Reuse avatar endpoint for simplicity, backend will store file and we save reference as certification
    try {
      const res = await uploadAvatar(user.id, file);
      if (!res.imageUrl) throw new Error('No imageUrl');
      setExperience(prev => {
        const cert = { name: file.name, url: res.imageUrl, uploadedAt: new Date().toISOString() };
        const next = { ...prev, certifications: [...(prev.certifications || []), cert] };
        saveSettings({ experience: next });
        return next;
      });
      toast({ title: 'Certificado enviado', description: 'Certificado adicionado ao perfil.' });
    } catch (err) {
      console.error(err);
      toast({ title: 'Erro', description: 'Falha ao enviar certificado', variant: 'destructive' });
    }
  };

  // --- SEGURANÇA: 2FA toggle e sessões
  const toggle2FA = async () => {
    const nextSec = { ...security, twoFactorAuth: !security.twoFactorAuth };
    setSecurity(nextSec);
    await saveSettings({ security: nextSec });
    toast({ title: nextSec.twoFactorAuth ? '2FA ativado' : '2FA desativado' });
  };
  const updateSetting = async (field, value) => {
    const next = { ...settings, [field]: value };
    setSettings(next);

    // guardar local
    localStorage.setItem("smartchef_settings", JSON.stringify(next));

    // aplicar tema global
    if (field === "theme") {
      setTheme(value); // ThemeProvider global
    }

    // aplicar idioma global
    if (field === "language") {
      i18n.changeLanguage(value);
    }

    // gravar no backend
    try {
      await fetch(`http://localhost:4000/api/users/${user.id}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next), // CORRIGIDO
      });

      toast({ title: t("saved"), description: t("settings_saved") });
    } catch (err) {
      console.error("Erro ao atualizar settings:", err);
      toast({ title: t("error"), description: t("cannot_save_settings") });
    }
  };


  const changeRecoveryEmail = async (e) => {
    const email = e.target.value;
    setSecurity(prev => ({ ...prev, recoveryEmail: email }));
    // save on blur or explicit save
  };

  const saveSecurity = async () => {
    await saveSettings({ security });
    toast({ title: 'Segurança actualizada' });
  };

  // sessions (revogar)
  const revokeSession = async (sessionId) => {
    const nextSessions = (security.sessions || []).filter(s => s.id !== sessionId);
    const nextSec = { ...security, sessions: nextSessions };
    setSecurity(nextSec);
    await saveSettings({ security: nextSec });
    toast({ title: 'Sessão revogada' });
  };

  // if no sessions exist, create a current simulated session for UI consistency (client-side)
  useEffect(() => {
    if (!security.sessions || security.sessions.length === 0) {
      const now = new Date().toISOString();
      const currentSession = {
        id: `sess_${Date.now()}`,
        device: navigator.userAgent.split(')')[0] || 'Browser',
        ip: '127.0.0.1',
        createdAt: now,
        current: true
      };
      const next = { ...security, sessions: [currentSession] };
      setSecurity(next);
      saveSettings({ security: next }).catch(() => { /* ignore save errors here */ });
    }
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", settings.theme === "dark");
    localStorage.setItem("smartchef_theme", settings.theme);
  }, [settings.theme]);
  // only runs once on mount

  // alterar senha (local) — este exemplo assume que a call de alteração real é feita pelo backend,
  // mas para já guardamos localmente se o backend não expuser endpoint. Se tiveres endpoint, substitui.
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const current = e.target.currentPassword.value;
    const newPass = e.target.newPassword.value;
    const confirm = e.target.confirmPassword.value;

    // verifica se tem password armazenada no user (campo passwordHash no backend)
    // Aqui só simulamos a troca local se current for igual à security.password (do armazenamento local)
    if (user.security?.password && current !== user.security.password) {
      toast({ title: 'Erro', description: 'Senha atual incorreta.', variant: 'destructive' });
      return;
    }
    if (newPass !== confirm) {
      toast({ title: 'Erro', description: 'As senhas não coincidem.', variant: 'destructive' });
      return;
    }

    const nextSec = { ...security, password: newPass };
    setSecurity(nextSec);
    await saveSettings({ security: nextSec });
    // também adiciona ao user.security local
    const updatedUser = await saveToServer({ security: nextSec });
    setUser(updatedUser);
    toast({ title: 'Senha atualizada!', description: 'A tua senha foi alterada com sucesso.' });
    e.target.reset();
  };

  // --- PERSIST profileData changes
  const handleProfileField = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    const updated = { ...user, ...profileData };
    const res = await saveToServer(updated);
    setUser(res);
    toast({ title: 'Perfil actualizado', description: 'Dados guardados.' });
    if (otherAllergy.trim())
      finalProfiles.push(`outra_alergia: ${otherAllergy}`);

    if (otherIntolerance.trim())
      finalProfiles.push(`outra_intolerancia: ${otherIntolerance}`);

  };

  // export account (gera JSON com dados do user e força download)
  const exportAccount = () => {
    const data = { ...user, settings: { nutrition, experience, security, preferences } };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bompiteu_user_${user.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Exportado', description: 'Os teus dados foram descarregados.' });
  };

  // delete account (front local + call backend)
  const handleDeleteAccount = async () => {
    if (!confirm('Tens a certeza que queres eliminar a tua conta? Esta acção é irreversível.')) return;
    try {
      await deleteUser(user.id);
      localStorage.removeItem(LOCAL_USER_KEY);
      localStorage.removeItem('bomPiteuUser');
      toast({ title: 'Conta eliminada', description: 'A tua conta foi removida.' });
      if (typeof onNavigate === 'function') onNavigate('welcome');
    } catch (err) {
      toast({ title: 'Erro', description: 'Falha ao eliminar conta', variant: 'destructive' });
    }
  };
  // ===== PROGRESSO FIX =====
  const progressPercentage =
    user.level > 0
      ? Math.min(100, (user.points / (user.level * 100)) * 100)
      : 0;

  const stats = [
    { icon: ChefHat, value: user.level, label: "Nível de Chef" },
    { icon: Award, value: user.points, label: "Pontos acumulados" },
    { icon: Heart, value: user.favorites?.length || 0, label: "Favoritos" },
  ];

  // --- UI: opções profissionalizadas para as abas conforme pediste
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700 relative">
        {/* FOTO E INFO */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="flex flex-col items-center relative">
            <div className="relative group cursor-pointer" onClick={() => setShowMenu(!showMenu)}>
              <Avatar className={`h-32 w-32 border-4 ${user.isPremium ? 'border-yellow-400' : 'border-orange-400'}`}>
                <AvatarImage src={profileImage} alt={user.name} />
                <AvatarFallback className="text-4xl bg-orange-100 text-orange-600 font-bold">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
            </div>

            {showMenu && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="absolute top-36 bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 rounded-xl z-50 p-3 flex flex-col gap-2">
                <Button variant="outline" onClick={() => { fileInputRef.current?.click(); setShowMenu(false); }}>
                  Trocar Foto
                </Button>
                <Button variant="ghost" className="text-red-500 hover:text-red-600" onClick={() => setShowMenu(false)}>
                  Fechar
                </Button>
              </motion.div>
            )}

            <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleImageChange} />

            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-4">{profileData.name}</h1>
            <p className="text-gray-500 dark:text-gray-300 flex items-center gap-2">
              <Mail className="h-4 w-4" /> {profileData.email}
            </p>
            <p className={`font-bold mt-1 ${user.isPremium ? 'text-yellow-600' : 'text-gray-500'}`}>
              {user.isPremium ? 'Membro Premium' : 'Membro Gratuito'}
            </p>
          </div>

          {/* PROGRESSO */}
          <div className="flex-1 w-full">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Progresso</h2>
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-orange-500">Nível {user.level}</span>
                <span className="text-sm text-gray-600 dark:text-gray-300">{user.points} / {user.level * 100} XP</span>
              </div>
              <Progress value={Math.min(100, (user.points / (user.level * 100)) * 100 || 0)} />
            </div>

            <div className="grid grid-cols-3 gap-4 text-center mt-6">
              {[{ icon: ChefHat, value: user.level, label: 'Nível de Chef' }, { icon: Award, value: user.points, label: 'Pontos' }, { icon: Heart, value: user.favorites?.length || 0, label: 'Favoritos' }].map((s, i) => (
                <motion.div key={i} whileHover={{ scale: 1.05 }} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                  <s.icon className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{s.value}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-300">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* ABAS */}
        <div className="flex gap-4 mt-10 border-b pb-2">
          <button onClick={() => setActiveTab("geral")} className={`px-3 py-1 rounded ${activeTab === "geral" ? 'text-orange-500 font-bold' : 'text-gray-600 dark:text-gray-300'}`}>Dados Pessoais</button>
          <button onClick={() => setActiveTab("alimentacao")} className={`px-3 py-1 rounded ${activeTab === "alimentacao" ? 'text-orange-500 font-bold' : 'text-gray-600 dark:text-gray-300'}`}>Alimentação</button>
          <button onClick={() => setActiveTab("experiencia")} className={`px-3 py-1 rounded ${activeTab === "experiencia" ? 'text-orange-500 font-bold' : 'text-gray-600 dark:text-gray-300'}`}>Experiência</button>
          <button onClick={() => setActiveTab("seguranca")} className={`px-3 py-1 rounded ${activeTab === "seguranca" ? 'text-orange-500 font-bold' : 'text-gray-600 dark:text-gray-300'}`}>Segurança</button>
          <button onClick={() => setActiveTab("definicoes")} className={`px-3 py-1 rounded ${activeTab === "definicoes" ? 'text-orange-500 font-bold' : 'text-gray-600 dark:text-gray-300'}`}>Definições</button>
          <button
            onClick={() => setActiveTab("conta")}
            className={`px-3 py-1 rounded ${activeTab === "conta" ? 'text-orange-500 font-bold' : 'text-gray-600 dark:text-gray-300'
              }`}
          >
            Conta
          </button>

        </div>

        {/* TAB: Dados Pessoais */}

        {/* ========================  
      ABA GERAL PREMIUM  
======================== */}
        {activeTab === "geral" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >

            {/* 🧑 Perfil resumido */}
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <User className="h-6 w-6 text-orange-500" />
                Minhas Informações
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Nome */}
                <div>
                  <label className="text-gray-600 font-semibold">Nome completo</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData({ ...profileData, name: e.target.value })
                    }
                    className="w-full mt-1 p-3 border rounded-xl bg-gray-50"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="text-gray-600 font-semibold">E-mail</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) =>
                      setProfileData({ ...profileData, email: e.target.value })
                    }
                    className="w-full mt-1 p-3 border rounded-xl bg-gray-50"
                  />
                </div>

                {/* Data de Nascimento */}
                <div>
                  <label className="text-gray-600 font-semibold">Data de Nascimento</label>
                  <input
                    type="date"
                    value={profileData.date}
                    onChange={(e) =>
                      setProfileData({ ...profileData, date: e.target.value })
                    }
                    className="w-full mt-1 p-3 border rounded-xl bg-gray-50"
                  />
                </div>
                {/* TIpo sanguíneo*/}
                <div>
                  <label className="text-gray-600 font-semibold">Tipo Sanguíneo</label>
                  <select
                    value={profileData.gender}
                    onChange={(e) =>
                      setProfileData({ ...profileData, gender: e.target.value })
                    }
                    className="w-full mt-1 p-3 border rounded-xl bg-gray-50"
                  >
                    <option value="">A+</option>
                    <option>A-</option>
                    <option>B+</option>
                    <option>B-</option>
                    <option>AB+</option>
                    <option>AB-</option>
                    <option>O+</option>
                    <option>O-</option>
                  </select>
                </div>

                {/* País */}
                <div>
                  <label className="text-gray-600 font-semibold">Contacto</label>
                  <input
                    type="tel"
                    value={profileData.Number}
                    onChange={(e) =>
                      setProfileData({ ...profileData, Number: e.target.value })
                    }
                    className="w-full mt-1 p-3 border rounded-xl bg-gray-50"
                    placeholder="+244 912345678"
                  />
                </div>

                {/* Género */}
                <div>
                  <label className="text-gray-600 font-semibold">Gênero</label>
                  <select
                    value={profileData.gender}
                    onChange={(e) =>
                      setProfileData({ ...profileData, gender: e.target.value })
                    }
                    className="w-full mt-1 p-3 border rounded-xl bg-gray-50"
                  >
                    <option value="">Selecionar</option>
                    <option>Masculino</option>
                    <option>Feminino</option>
                    <option>Outro</option>
                  </select>
                </div>

                {/* Localização e Idiomas*/}
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Globe className="h-6 w-6 text-orange-500" />
                  Localização e Idioma
                </h2>
                <p></p>
                {/* País */}
                <div>
                  <label className="text-gray-600 font-semibold">País</label>
                  <select
                    value={profileData.country}
                    onChange={(e) =>
                      setProfileData({ ...profileData, country: e.target.value })
                    }
                    className="w-full mt-1 p-3 border rounded-xl bg-gray-50"
                  >
                    <option value="">Angola</option>
                    <option>Brasil</option>
                    <option>Portugal</option>
                    <option>EUA</option>
                    <option>Moçambique</option>
                    <option>Rússia</option>
                  </select>
                </div>

                {/* Idioma */}
                <div>
                  <label className="text-gray-600 font-semibold">Idioma</label>
                  <select
                    value={profileData.language}
                    onChange={(e) =>
                      setProfileData({ ...profileData, language: e.target.value })
                    }
                    className="w-full mt-1 p-3 border rounded-xl bg-gray-50"
                  >
                    <option value="">Português</option>
                    <option>Inglês</option>
                    <option>Espanhol</option>
                    <option>Françês</option>
                  </select>
                </div>


              </div>

              {/* Bio */}
              <div className="mt-6">
                <label className="text-gray-600 font-semibold">Sobre você</label>
                <textarea
                  rows="4"
                  value={profileData.bio}
                  onChange={(e) =>
                    setProfileData({ ...profileData, bio: e.target.value })
                  }
                  className="w-full mt-1 p-3 border rounded-xl bg-gray-50"
                  placeholder="Fale sobre você e sua paixão pela gastronômia..."
                />
                <Button variant="outline" onClick={() => { ; setShowMenu(false); }}
                  className="bg-orange-500 text-white font-semibold p-4 rounded-xl shadow-md flex items-center justify-center gap-3">
                  Salvar
                </Button>
              </div>
            </div>
            {/* ==========================
       
            {/* ==========================
              ATALHOS
    =========================== */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: "Segurança", icon: Shield, tab: "seguranca" },
                { name: "Alimentação", icon: Heart, tab: "alimentacao" },
                { name: "Experiência Culinária", icon: ChefHat, tab: "experiencia" },
              ].map((item, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setActiveTab(item.tab)}
                  className="bg-orange-500 text-white font-semibold p-4 rounded-xl shadow-md flex items-center justify-center gap-3"
                >
                  <item.icon className="h-6 w-6" />
                  {item.name}
                </motion.button>
              ))}
            </div>

          </motion.div>
        )}

        {/* TAB: ALIMENTAÇÃO (PROFISSIONAL E FUNCIONAL) */}
        {activeTab === "alimentacao" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Alimentação & Nutrição</h2>

            {/* DIETAS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-14">

              {/* Dieta Estilo de Vida */}
              <div>
                <label className=" text-gray-600 font-semibold ">Dieta Estilo de Vida</label>
                <select
                  value={profileData.dieta1}
                  onChange={(e) =>
                    setProfileData({ ...profileData, dieta1: e.target.value })
                  }
                  className="w-full mt-1 mb-8 p-4 border rounded-xl bg-orange-50 text-center"
                >
                  <option value="">Dieta Vegana</option>
                  <option>Dieta Vegetariana</option>
                  <option>Dieta Flexitariana</option>
                  <option>Dieta Macrobiótica</option>
                  <option>Dieta (Crudivorismo)</option>
                </select>
              </div>

              {/* Dietas Para Perda de Peso */}
              <div>
                <label className=" text-gray-600 font-semibold">Controle Calórico</label>
                <select
                  value={profileData.dieta2}
                  onChange={(e) =>
                    setProfileData({ ...profileData, dieta2: e.target.value })
                  }
                  className="w-full mt-1 mb-8 p-4 border rounded-xl bg-orange-50 text-center"
                >
                  <option value="">Dieta Cetogénica (Keto)</option>
                  <option>Dieta Atkins</option>
                  <option>Dieta Low Carb</option>
                  <option>Dieta South Beach</option>
                  <option>Dieta Zone</option>
                </select>
              </div>

              {/* Dietas Terapêuticas*/}
              <div>
                <label className=" text-gray-600 font-semibold">Dietas Terapêuticas</label>
                <select
                  value={profileData.dieta3}
                  onChange={(e) =>
                    setProfileData({ ...profileData, dieta3: e.target.value })
                  }
                  className="w-full mt-1 mb-8 p-4 border rounded-xl bg-orange-50 text-center"
                >
                  <option value="">Dieta DASH</option>
                  <option>Dieta Sem Glúten</option>
                  <option>Dieta FODMAP</option>
                  <option>Dieta Anti-inflamatória</option>
                  <option>Dieta Detox</option>
                </select>
              </div>

              {/* Dietas TRADICIONAIS*/}
              <div>
                <label className=" text-gray-600 font-semibold">Dietas Tradicionais</label>
                <select
                  value={profileData.diet4}
                  onChange={(e) =>
                    setProfileData({ ...profileData, dieta4: e.target.value })
                  }
                  className="w-full mt-1 mb-8 p-4 border rounded-xl bg-orange-50 text-center"
                >
                  <option value="">Dieta Mediterrânica</option>
                  <option>Dieta Paleo</option>
                  <option>Dieta Whole30</option>
                  <option>Dieta Carnívora</option>
                  <option>Dieta (Jejum Intermitente)</option>
                </select>
              </div>

            </div>



            {/* ALERGIAS e intolerancias*/}

            <h3 className="font-semibold text-xl text-gray-700 flex items-center mb-3">
              Alergias Alimentares
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
              {alergias.map(p => (
                <motion.div
                  key={p.id}
                  whileHover={{ scale: 1.05 }}
                  className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all
        ${profileData.foodProfile?.includes(p.id)
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200"}`}
                >
                  <Checkbox
                    id={p.id}
                    checked={profileData.foodProfile?.includes(p.id)}
                    className="mr-3"
                  />

                  <p.icon
                    className={`h-5 w-5 mr-2 ${profileData.foodProfile?.includes(p.id)
                      ? "text-orange-600"
                      : "text-gray-500"
                      }`}
                  />

                  <label htmlFor={p.id} className="text-sm font-medium text-gray-800 cursor-pointer">
                    {p.label}
                  </label>
                </motion.div>

              ))}
            </div>
            <div className="mt-3">
              <Label htmlFor="otherAllergy" className="flex items-center mb-1">
                <Sparkles className="h-4 w-4 mr-2 text-orange-500" />
                Outra Alergia
              </Label>
              <Input
                id="otherAllergy"
                type="text"
                placeholder="Ex: Alergia a corantes..."
                className="w-full"
                value={otherAllergy}
                onChange={(e) => setOtherAllergy(e.target.value)}
              />
            </div>


            <h3 className="font-semibold text-xl text-gray-700 flex items-center mb-3 mt-6">
              Intolerâncias Alimentares
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
              {intolerancias.map(p => (
                <motion.div
                  key={p.id}
                  whileHover={{ scale: 1.05 }}
                  className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all
        ${profileData.foodProfile?.includes(p.id)
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200"}`}
                >
                  <Checkbox
                    id={p.id}
                    checked={profileData.foodProfile?.includes(p.id)}
                    className="mr-3"
                  />

                  <p.icon
                    className={`h-5 w-5 mr-2 ${profileData.foodProfile?.includes(p.id)
                      ? "text-orange-600"
                      : "text-gray-500"
                      }`}
                  />

                  <label htmlFor={p.id} className="text-sm font-medium text-gray-800 cursor-pointer">
                    {p.label}
                  </label>
                </motion.div>
              ))}
            </div>
            <div className="mt-3">
              <Label htmlFor="otherIntolerance" className="flex items-center mb-1">
                <Sparkles className="h-4 w-4 mr-2 text-blue-500" />
                Outra Intolerância
              </Label>
              <Input
                id="otherIntolerance"
                type="text"
                placeholder="Ex: Intolerância a aditivos..."
                className="w-full"
                value={otherIntolerance}
                onChange={(e) => setOtherIntolerance(e.target.value)}
              />
            </div>





            {/* OBJECTIVOS */}
            <div className="mt-4">
              <h3 className="font-bold">Objectivos Nutricionais</h3>
              <div className="grid md:grid-cols-2 gap-5 mt-2">
                {["Aumentar Massa Muscular", "Perder Peso(Caloria)", "Aumentar Força", "Aumentar Consumo de Proteinas", "Melhorar Saúde Mental", "Aumentar Hidratação", "Pós-Cirúrgia", "Apoio à Menopausa", "Performance Disportiva","Aumentar Imunidade","Equilibrio Hormonal","Gestação ou Pré-Gravidez","Melhorar a Saúde Intestinal","Melhorar a Qualidade do Sono","Reduzir Colesterol" ].map(c => {
                  const item = experience.cuisines.find(x => x.name === c);
                  return (
                    <div key={c} className="flex items-center gap-2 p-2 border rounded">
                      <input type="checkbox" checked={!!item} onChange={() => toggleCuisine(c)} />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <div>{c}</div>
                          <select value={item?.prof || 'Intermédio'} onChange={(e) => setCuisineProf(c, e.target.value)} className="p-1 border rounded w-32">
                            <option>Leve</option>
                            <option>Intermédio</option>
                            <option>Acelerado</option>
                           
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-7 mb-12">
              <Label htmlFor="otherObject" className="flex items-center mb-1">
                <Sparkles className="h-4 w-4 mr-2 text-green-500" />
                Outros Objectivos
              </Label>
              <Input
                id="otherIntolerance"
                type="text"
                placeholder="Ex: Os teus Objectivos..."
                className="w-full"
                value={otherIntolerance}
                onChange={(e) => setOtherIntolerance(e.target.value)}
              />
            </div>

            {/* QUICK PLAN */}
            <div className="mb-6">
              <h3 className="font-bold text-gray-700 dark:text-gray-200 mb-2">Plano Rápido</h3>
              <p className="text-sm text-gray-500">Gerar um plano alimentar simples baseado na sua Alimentação e Nutrição.<hr></hr>Aqui guardamos as suas preferências para quando solicitares uma receita ao Assistente de cozinha."</p>
              <div className="mt-2">
                <Button onClick={() => {
                  saveSettings({ nutrition });
                  toast({ title: 'Preferências guardadas', description: 'Pronto para gerar plano quando IA estiver ativa.' });
                }}>Salvar Preferências para Plano</Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB: EXPERIÊNCIA (PROFISSIONAL) */}
        {activeTab === "experiencia" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Experiência Culinária (profissional)</h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold">Anos de experiência</label>
                <input type="number" value={experience.years || 0} onChange={(e) => setYears(e.target.value)} className="p-2 border rounded w-32" />
              </div>

              <div>
                <label className="text-sm font-bold">Nível Culinário</label>
                <select value={experience.level || ''} onChange={(e) => { const lvl = e.target.value; setExperience(prev => { const next = { ...prev, level: lvl }; saveSettings({ experience: next }); return next; }); }} className="p-2 border rounded">
                  <option value="">Selecionar</option>
                  <option>Iniciante</option>
                  <option>Intermédio</option>
                  <option>Profissional</option>
                  <option>Chef</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="font-bold">Técnicas Culinárias (Profissionais + Caseiras)</h3>
              <div className="grid md:grid-cols-2 gap-2 mt-2">
                {["Técnicas de Cozedura (Calor Úmido)", "Técnicas de Cozedura a Seco", "Técnicas de Corte (Manejo de Faca)", "Técnicas de Conservação e Preparação Avançada", "Técnicas de Preparação Geral (Base)", "Técnicas com Equipamentos Modernos"].map(t => {
                  const item = experience.techniques.find(x => x.name === t);
                  return (
                    <div key={t} className="flex items-center gap-2 p-2 border rounded">
                      <input type="checkbox" checked={!!item} onChange={() => toggleTechnique(t)} />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <div>{t}</div>
                          <select value={item?.prof || 'Básico'} onChange={(e) => toggleTechnique(t, e.target.value)} className="p-1 border rounded w-28">
                            <option>Básico</option>
                            <option>Intermédio</option>
                            <option>Avançado</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4">
              <h3 className="font-bold">Equipamentos Disponíveis</h3>
              <div className="flex gap-5 flex-wrap mt-2">
                {["Airfryer", "Forno", "Fogão", "Liquidificador", "Panela de Pressão", "Batedeira","Micro-ondas","Vara Mágica","Grelhador","Batedeira","Processador de Alimentos", "Outros..."].map(eq => (
                  <label key={eq} className="flex items-center gap-2 p-2 border rounded">
                    <input type="checkbox" checked={experience.equipment.includes(eq)} onChange={() => toggleEquipment(eq)} />
                    <span>{eq}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <h3 className="font-bold">Certificações</h3>
              <p className="text-sm text-gray-500 mb-2">Faz upload de certificados (formação, higiene, cursos) — ficam visíveis no perfil.</p>
              <div className="flex gap-2 items-center">
                <input ref={certInputRef} type="file" accept=".pdf,.jpg,.png" className="hidden" onChange={(e) => uploadCertification(e.target.files[0])} />
                <Button onClick={() => certInputRef.current?.click()}>Enviar Certificado</Button>
                <div>
                  {(experience.certifications || []).map((c, idx) => (
                    <div key={idx} className="text-sm">
                      <a href={c.url} target="_blank" rel="noreferrer" className="underline">{c.name}</a> <span className="text-xs text-gray-500">({new Date(c.uploadedAt).toLocaleDateString()})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <Button onClick={() => saveSettings({ experience })}>Guardar Experiência</Button>
            </div>
          </motion.div>
        )}

        {/* TAB: SEGURANÇA */}
        {activeTab === "seguranca" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Segurança Avançada</h2>

            {/* 2FA */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold">Autenticação de Dois Fatores (2FA)</h3>
                  <p className="text-sm text-gray-500">Ativa 2FA para maior segurança. Podes usar email ou app autenticadora.</p>
                </div>
                <div>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={security.twoFactorAuth} onChange={toggle2FA} />
                    <span className="text-sm">{security.twoFactorAuth ? 'Ativado' : 'Desativado'}</span>
                  </label>
                </div>
              </div>
            </div>

            {/* RECOVERY EMAIL */}
            <div className="mb-6">
              <h3 className="font-bold">Email de recuperação</h3>
              <div className="flex gap-2 items-center">
                <input type="email" value={security.recoveryEmail || ''} onChange={(e) => setSecurity(prev => ({ ...prev, recoveryEmail: e.target.value }))} className="p-2 border rounded w-80" placeholder="email@exemplo.com" />
                <Button onClick={saveSecurity}>Guardar</Button>
              </div>
            </div>

            {/* SESSIONS */}
            <div className="mb-6">
              <h3 className="font-bold">Sessões ativas</h3>
              <p className="text-sm text-gray-500">Revoga sessões que não reconheças.</p>
              <div className="mt-2 space-y-2">
                {(security.sessions || []).map(s => (
                  <div key={s.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <div className="font-bold">{s.device}</div>
                      <div className="text-sm text-gray-500">{s.ip} • {new Date(s.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="flex gap-2 items-center">
                      {s.current ? <span className="text-sm text-green-500">Actual</span> : <Button variant="ghost" onClick={() => revokeSession(s.id)}>Revogar</Button>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ALTERAR SENHA */}
            <div className="mb-6">
              <h3 className="font-bold">Alterar senha</h3>
              <form onSubmit={handlePasswordChange} className="grid gap-2 md:grid-cols-2">
                <input name="currentPassword" type="password" placeholder="Senha atual" className="p-2 border rounded" />
                <input name="newPassword" type="password" placeholder="Nova senha" className="p-2 border rounded" />
                <input name="confirmPassword" type="password" placeholder="Confirmar senha" className="p-2 border rounded md:col-span-2" />
                <div className="md:col-span-2">
                  <Button type="submit">Alterar senha</Button>
                </div>
              </form>
            </div>

            {/* EXPORTAR / RETENÇÃO */}
            <div className="mb-6">
              <h3 className="font-bold">Dados & Privacidade</h3>
              <div className="flex gap-2 items-center mt-2">
                <Button onClick={exportAccount}>Exportar Conta (JSON)</Button>
                <Button variant="ghost" onClick={() => {
                  const next = { ...security, retention: '30' }; // exemplo
                  setSecurity(next);
                  saveSettings({ security: next });
                  toast({ title: 'Política guardada' });
                }}>Configurar Retenção</Button>
                <Button variant="destructive" onClick={handleDeleteAccount}>Eliminar Conta</Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB: DEFINIÇÕES (tema, idioma, notificações, privacidade) */}
        {activeTab === "definicoes" && (
          <div className="space-y-8 mt-6">

            {/* ==== TEMA ==== */}
            <div>
              <h3 className="text-xl font-bold mb-3">{t("appearance")}</h3>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl space-y-3">

                <label className="font-semibold">Tema</label>
                <select
                  value={settings.theme}
                  onChange={(e) => {
                    setTheme(e.target.value);          // muda tema global
                    updateSetting("theme", e.target.value); // grava nos settings
                  }}

                  className="w-full p-3 rounded-lg bg-white dark:bg-gray-900 border dark:border-gray-700"
                >
                  <option value="light">Claro</option>
                  <option value="dark">Escuro</option>
                  <option value="system">Automático pelo sistema</option>
                </select>

                <div className="flex items-center gap-3 mt-4">
                  <input type="checkbox" checked={settings.compactMode}
                    onChange={(e) => updateSetting("compactMode", e.target.checked)} />
                  <label>Modo Compacto</label>
                </div>

                <div className="flex items-center gap-3">
                  <input type="checkbox" checked={settings.animations}
                    onChange={(e) => updateSetting("animations", e.target.checked)} />
                  <label>Animações</label>
                </div>

              </div>
            </div>


            {/* ==== IDIOMA ==== */}
            <div>
              <h3 className="text-xl font-bold mb-3">{t("language_region")}</h3>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl space-y-3">

                <label className="font-semibold">Idioma</label>
                <select
                  value={settings.language}
                  onChange={(e) => updateSetting("language", e.target.value)}
                  className="w-full p-3 rounded-lg bg-white dark:bg-gray-900 border dark:border-gray-700"
                >
                  <option value="pt">Português</option>
                  <option value="en">Inglês</option>
                  <option value="es">Espanhol</option>
                </select>

                <label className="font-semibold">Formato de Data</label>
                <select
                  value={settings.dateFormat}
                  onChange={(e) => updateSetting("dateFormat", e.target.value)}
                  className="w-full p-3 rounded-lg bg-white dark:bg-gray-900 border dark:border-gray-700"
                >
                  <option value="dd/MM/yyyy">dd/MM/yyyy</option>
                  <option value="MM/dd/yyyy">MM/dd/yyyy</option>
                  <option value="yyyy-MM-dd">yyyy-MM-dd</option>
                </select>
              </div>
            </div>


            {/* ==== ALERTAS ==== */}
            <div>
              <h3 className="text-xl font-bold mb-3">{t("alerts_notifications")}</h3>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl space-y-4">

                <div className="flex items-center gap-3">
                  <input type="checkbox" checked={settings.alertLogin}
                    onChange={(e) => updateSetting("alertLogin", e.target.checked)} />
                  <label>Alerta de login</label>
                </div>

                <div className="flex items-center gap-3">
                  <input type="checkbox" checked={settings.alertSecurity}
                    onChange={(e) => updateSetting("alertSecurity", e.target.checked)} />
                  <label>Alerta de segurança</label>
                </div>
              </div>
            </div>


            {/* ==== DISPOSITIVOS ==== */}
            <div>
              <h3 className="text-xl font-bold mb-3">{t("connected_devices")}</h3>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl space-y-3">
                {settings.devices.map((d) => (
                  <div key={d.id} className="flex justify-between bg-white dark:bg-gray-900 p-3 rounded-lg border dark:border-gray-700">
                    <span>{d.name}</span>
                    <button
                      onClick={() =>
                        updateSetting(
                          "devices",
                          settings.devices.filter(dev => dev.id !== d.id)
                        )
                      }
                      className="text-red-500"
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
        {/* TAB: CONTA (BACKUP, EXPORTAÇÃO, SESSÕES, ELIMINAÇÃO) */}
        {activeTab === "conta" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 space-y-8">

            {/* EXPORTAR CONTA */}
            <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-xl space-y-3">
              <h3 className="text-xl font-bold">Exportar Conta (JSON)</h3>
              <p className="text-sm text-gray-500">Baixa um ficheiro com todos os teus dados.</p>

              <Button
                onClick={() => {
                  const blob = new Blob([JSON.stringify(user, null, 2)], { type: "application/json" });
                  const url = URL.createObjectURL(blob);

                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `backup_${user.id}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Baixar Dados da Conta
              </Button>
            </div>

            {/* BACKUP NA NUVEM */}
            <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-xl space-y-3">
              <h3 className="text-xl font-bold">Backup na Nuvem</h3>
              <p className="text-sm text-gray-500">
                Guardar um backup completo dentro do teu perfil no servidor.
              </p>

              <Button
                onClick={async () => {
                  const backupData = {
                    savedAt: new Date().toISOString(),
                    data: {
                      settings,
                      nutrition,
                      experience,
                      security,
                      preferences,
                      profile,
                    },
                  };

                  const next = {
                    ...settings,
                    backup: backupData,
                  };

                  await saveSettings({ backup: backupData });

                  toast({ title: "Backup guardado", description: "O backup foi salvo com sucesso." });
                }}
              >
                Guardar Backup
              </Button>

              {settings?.backup?.savedAt && (
                <p className="text-xs text-gray-400">
                  Último backup: {new Date(settings.backup.savedAt).toLocaleString()}
                </p>
              )}
            </div>

            {/* RESTAURAR BACKUP */}
            <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-xl space-y-3">
              <h3 className="text-xl font-bold">Restaurar Backup</h3>
              <p className="text-sm text-gray-500">
                Restaura todas as tuas definições para o estado do último backup guardado.
              </p>

              <Button
                variant="destructive"
                onClick={() => {
                  if (!settings?.backup?.data) {
                    toast({ title: "Nenhum backup encontrado", description: "Guarde um backup primeiro." });
                    return;
                  }

                  const b = settings.backup.data;

                  saveSettings({
                    ...settings,
                    ...b.settings,
                  });

                  toast({
                    title: "Backup restaurado",
                    description: "Todas as definições foram restauradas.",
                  });
                }}
              >
                Restaurar Backup
              </Button>
            </div>

            {/* TERMINAR SESSÕES */}
            <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-xl space-y-3">
              <h3 className="text-xl font-bold">Terminar Sessões</h3>
              <p className="text-sm text-gray-500">
                Remove todas as sessões antigas e mantém apenas a sessão atual.
              </p>

              <Button
                onClick={() => {
                  const current = security.sessions?.find(s => s.current);
                  const nextSessions = current ? [current] : [];

                  const nextSecurity = {
                    ...security,
                    sessions: nextSessions,
                  };

                  saveSettings({ security: nextSecurity });

                  toast({
                    title: "Sessões limpas",
                    description: "Apenas a sessão atual permanece ativa.",
                  });
                }}
              >
                Terminar Todas as Sessões
              </Button>
            </div>

            {/* DESATIVAR CONTA */}
            <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-xl space-y-3">
              <h3 className="text-xl font-bold">Desativar Conta</h3>
              <p className="text-sm text-gray-500">
                Impede acesso, faz logout mas mantém os teus dados. Podes reativar ao fazer login outra vez.
              </p>

              <Button
                variant="ghost"
                onClick={() => {
                  localStorage.removeItem("bomPiteuUser");
                  localStorage.removeItem("bomPiteuUserToken");
                  window.location.href = "/auth/login";
                }}
              >
                Desativar Conta
              </Button>
            </div>

            {/* ELIMINAR CONTA */}
            <div className="bg-red-50 dark:bg-red-900 p-5 rounded-xl space-y-3 border border-red-400">
              <h3 className="text-xl font-bold text-red-600 dark:text-red-300">Eliminar Conta</h3>
              <p className="text-sm text-red-500 dark:text-red-300">
                Esta ação é permanente. Todos os teus dados serão apagados do servidor.
              </p>

              <Button
                variant="destructive"
                onClick={async () => {
                  if (!confirm("Tens certeza absoluta que queres eliminar a conta?")) return;

                  await deleteUser(user.id);

                  localStorage.removeItem("bomPiteuUser");
                  localStorage.removeItem("bomPiteuUserToken");

                  window.location.href = "/auth/login";
                }}
              >
                Eliminar Conta Permanentemente
              </Button>
            </div>

          </motion.div>
        )}


      </div>
    </motion.div>
  );
};

export default UserProfile;
