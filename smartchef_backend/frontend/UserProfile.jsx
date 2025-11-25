// Updated UserProfile frontend snippet that calls the backend API for security actions & avatar upload.
// Replace your existing UserProfile.jsx with this or integrate the fetch calls where needed.

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Award, Heart, ChefHat, Gem, Mail, X, Info, BookOpen, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4000';

const UserProfile = ({ user, onNavigate }) => {
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  const [profileImage, setProfileImage] = useState(user.picture || '');
  const [showMenu, setShowMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('geral');
  const [profileData, setProfileData] = useState({
    name: user.name || '',
    email: user.email || '',
    age: user.age || '',
    country: user.country || '',
    language: user.language || 'Português',
    gender: user.gender || '',
    bio: user.bio || '',
  });
  const [security, setSecurity] = useState({ twoFactorAuth: false });

  useEffect(() => {
    // load saved avatar from backend (if the user has picture path)
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/users/${user.id}`);
        if (res.ok) {
          const u = await res.json();
          setProfileImage(u.picture || '');
          // fetch security settings
          setSecurity(u.security || { twoFactorAuth: false });
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (user?.id) fetchUser();
  }, [user]);

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append('avatar', file);
    try {
      const res = await fetch(`${API_BASE}/api/users/${user.id}/avatar`, {
        method: 'POST',
        body: form
      });
      const data = await res.json();
      if (res.ok) {
        setProfileImage(data.picture);
        toast({ title: 'Foto atualizada!', description: 'Avatar enviado para o servidor.' });
      } else {
        toast({ title: 'Erro', description: data.error || 'Falha ao enviar.' , variant: 'destructive'});
      }
    } catch (err) {
      console.error(err);
      toast({ title: 'Erro', description: 'Erro de rede.', variant: 'destructive' });
    }
  };

  const handleToggle2FA = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/security/toggle-2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
      const data = await res.json();
      if (res.ok) {
        setSecurity(prev => ({ ...prev, twoFactorAuth: data.twoFactorAuth }));
        toast({ title: 'Configuração atualizada' });
      } else {
        toast({ title: 'Erro', description: data.error, variant: 'destructive' });
      }
    } catch (err) {
      console.error(err);
      toast({ title: 'Erro', description: 'Erro de rede.', variant: 'destructive' });
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const current = e.target.currentPassword.value;
    const newPass = e.target.newPassword.value;
    const confirm = e.target.confirmPassword.value;
    if (newPass !== confirm) { toast({ title: 'Erro', description: 'Senhas não coincidem', variant: 'destructive' }); return; }
    try {
      const res = await fetch(`${API_BASE}/api/security/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, currentPassword: current, newPassword: newPass })
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: 'Senha atualizada!' });
        e.target.reset();
      } else {
        toast({ title: 'Erro', description: data.error, variant: 'destructive' });
      }
    } catch (err) {
      console.error(err);
      toast({ title: 'Erro', description: 'Erro de rede.', variant: 'destructive' });
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Tens a certeza que queres eliminar a tua conta?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/users/${user.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        toast({ title: 'Conta eliminada' });
        if (typeof onNavigate === 'function') onNavigate('welcome');
      } else {
        toast({ title: 'Erro', description: data.error, variant: 'destructive' });
      }
    } catch (err) {
      console.error(err);
      toast({ title: 'Erro', description: 'Erro de rede.', variant: 'destructive' });
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    return parts.length > 1 ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase() : name[0].toUpperCase();
  };

  const progressPercentage = (user.points / (user.level * 100)) * 100;
  const stats = [
    { icon: ChefHat, value: user.level, label: 'Nível de Chef' },
    { icon: Award, value: user.points, label: 'Pontos' },
    { icon: Heart, value: user.favorites?.length || 0, label: 'Favoritos' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 relative">
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
              <div className="absolute top-36 bg-white shadow-lg border border-gray-200 rounded-xl z-50 p-3 flex flex-col gap-2">
                <Button variant="outline" onClick={() => { setShowMenu(false); setActiveTab('geral'); }}>Ver Perfil</Button>
                <Button variant="outline" onClick={() => { fileInputRef.current?.click(); setShowMenu(false); }}>Trocar Foto</Button>
                <Button variant="ghost" className="text-red-500 hover:text-red-600" onClick={() => setShowMenu(false)}>Fechar</Button>
              </div>
            )}
            <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleImageChange} />

            <h1 className="text-2xl font-bold text-gray-800 mt-4">{profileData.name}</h1>
            <p className="text-gray-500 flex items-center gap-2">
              <Mail className="h-4 w-4" /> {profileData.email}
            </p>
            <p className={`font-bold mt-1 ${user.isPremium ? 'text-yellow-600' : 'text-gray-500'}`}>
              {user.isPremium ? 'Membro Premium ✨' : 'Membro Gratuito'}
            </p>
          </div>

          <div className="flex-1 w-full">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Progresso</h2>
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-orange-500">Nível {user.level}</span>
                <span className="text-sm text-gray-600">{user.points} / {user.level * 100} XP</span>
              </div>
              <Progress value={progressPercentage} />
            </div>

            <div className="grid grid-cols-3 gap-4 text-center mt-6">
              {stats.map((s, i) => (
                <motion.div key={i} whileHover={{ scale: 1.05 }} className="bg-gray-50 p-4 rounded-xl">
                  <s.icon className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-800">{s.value}</p>
                  <p className="text-sm text-gray-500">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs & security form are unchanged visually; security actions call the backend */}
        <div className="mt-10 border-t pt-6">
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { id: 'geral', label: 'Geral' },
              { id: 'alimentar', label: 'Preferências' },
              { id: 'experiencia', label: 'Experiência' },
              { id: 'seguranca', label: 'Segurança' },
            ].map(tab => (
              <Button key={tab.id} variant={activeTab === tab.id ? 'default' : 'outline'} onClick={() => setActiveTab(tab.id)} className="flex items-center gap-2">
                {tab.label}
              </Button>
            ))}
          </div>

          <div className="bg-gray-50 rounded-xl p-6 min-h-[200px]">
            {activeTab === 'seguranca' && (
              <div className="space-y-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">🔐 Segurança da Conta</h3>
                <form onSubmit={handlePasswordChange} className="bg-white p-4 rounded-xl shadow-sm space-y-3">
                  <h4 className="font-semibold text-orange-600">Alterar Senha</h4>
                  <input name="currentPassword" type="password" placeholder="Senha atual" className="border rounded-lg p-2 w-full" required />
                  <input name="newPassword" type="password" placeholder="Nova senha" className="border rounded-lg p-2 w-full" required />
                  <input name="confirmPassword" type="password" placeholder="Confirmar nova senha" className="border rounded-lg p-2 w-full" required />
                  <Button type="submit" className="bg-orange-500 text-white hover:bg-orange-600">Atualizar Senha</Button>
                </form>

                <div className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-orange-600">Autenticação de 2 Fatores</h4>
                    <p className="text-sm text-gray-600">Ativa uma camada extra de segurança ao iniciar sessão.</p>
                  </div>
                  <label className="inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={security.twoFactorAuth} onChange={handleToggle2FA} />
                    <div className="w-11 h-6 bg-gray-300 rounded-full relative transition-all">
                      <span className={`absolute top-0.5 left-[2px] bg-white h-5 w-5 rounded-full transition-all ${security.twoFactorAuth ? 'translate-x-full' : ''}`}></span>
                    </div>
                  </label>
                </div>

                <div className="bg-red-50 p-4 rounded-xl shadow-sm border border-red-200">
                  <h4 className="font-semibold text-red-600 mb-2">Eliminar Conta</h4>
                  <p className="text-sm text-gray-600 mb-3">Esta ação é permanente e removerá todos os teus dados.</p>
                  <Button variant="destructive" onClick={handleDeleteAccount}>Eliminar Conta</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default UserProfile;
