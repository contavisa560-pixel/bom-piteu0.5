import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { ChefHat, Sparkles, LogOut, User, Home, Star, Gem, ShoppingCart, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeContext } from "@/context/ThemeContext";
import { useTranslation } from "react-i18next";
import NotificationBell from './Notifications/NotificationBell';
import { useQueryClient } from '@tanstack/react-query';

const Header = ({ user, onLogout, onNavigate }) => {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);
  const queryClient = useQueryClient();
  const avatarStorageKey = user?.id ? `smartchef_avatar_${user.id}` : 'smartchef_avatar_temp';

  console.log('🔍 Header - localStorage avatar:', localStorage.getItem('smartchef_avatar'));

  const [profileImage, setProfileImage] = useState(() => {
    return localStorage.getItem(avatarStorageKey) || user?.picture || '';
  });

  // PRIMEIRO HANDLER - CORRIGIDO!
  useEffect(() => {
    const handler = (e) => {
      console.log('📢 Header - Evento recebido no handler 1!', e.detail ? 'com imagem' : 'sem imagem');
      setProfileImage(e.detail);
    };

    window.addEventListener('smartchef_avatar_updated', handler);
    return () => window.removeEventListener('smartchef_avatar_updated', handler);
  }, []);

  const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name.charAt(0);
  };

  const [avatarUrl, setAvatarUrl] = useState(localStorage.getItem(avatarStorageKey) || user?.avatar || user?.picture || ''
  );

  useEffect(() => {
    const storedAvatar = localStorage.getItem(avatarStorageKey);
    setAvatarUrl(storedAvatar || user?.avatar || user?.picture || '');
  }, [user?.avatar, user?.picture, avatarStorageKey]);

  // SEGUNDO HANDLER - JÁ ESTÁ CORRETO
  useEffect(() => {
    const handleAvatarChange = (e) => {
      console.log('📢 Header - Evento recebido no handler 2!', e.detail ? 'com imagem' : 'sem imagem');
      const newAvatar = e.detail || localStorage.getItem(avatarStorageKey) || '';
      setAvatarUrl(newAvatar);
    };

    window.addEventListener('smartchef_avatar_updated', handleAvatarChange);
    return () => window.removeEventListener('smartchef_avatar_updated', handleAvatarChange);
  }, []);

  console.log('🔍 Header - Renderizando com:', {
    avatarUrl: avatarUrl ? 'tem imagem' : 'vazio',
    userPicture: user?.picture ? 'tem imagem' : 'vazio',
    profileImage: profileImage ? 'tem imagem' : 'vazio'
  });
const handleHomeClick = () => {
  // Força a recarga dos dados do dashboard
  queryClient.invalidateQueries({ queryKey: ['special-recipes'] });
  queryClient.invalidateQueries({ queryKey: ['international-recipes-public'] });
  // Navega para o dashboard
  onNavigate('dashboard');
};
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="
        sticky top-0 z-50
        bg-white/80 dark:bg-gray-900/80
        backdrop-blur-md
        border-b border-orange-200 dark:border-gray-700
      "
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">

          {/* LOGO */}
<div className="flex items-center space-x-3 cursor-pointer" onClick={handleHomeClick}>
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-1.5 md:p-2 rounded-xl">
              <ChefHat className="h-6 w-6 md:h-8 md:w-8 text-white" />
            </div>
            <div>
              <span className="text-lg md:text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                {t('header.logo')}
              </span>

              <div className="flex items-center space-x-1">
                <span className="text-xs md:text-sm text-gray-600 dark:text-gray-300">
                  {t("header.smartKitchen")}
                </span>
              </div>
            </div>
          </div>

          {/* NAVIGATION */}
          <div className="flex items-center space-x-2">
            <nav className="hidden md:flex items-center space-x-1">
              <Button variant="ghost" onClick={() => onNavigate('dashboard')}>
                <Home className="mr-2 h-4 w-4" />
              </Button>
            </nav>

            {/* Sino de notificações */}
            <NotificationBell onNavigate={onNavigate} />

            {/* PREMIUM */}
            {!user.isPremium && (
              <Button onClick={() => onNavigate('subscription')} size="sm"
                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-md hover:shadow-lg px-2 md:px-4 text-xs md:text-sm">
                <Gem className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">{t("header.premium")}</span>
                <span className="sm:hidden">Pro</span>
              </Button>
            )}

            {/* AVATAR MENU */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 md:h-10 md:w-10 rounded-full">
                  <Avatar className={`h-8 w-8 md:h-10 md:w-10 border-2 ${user.isPremium ? 'border-yellow-400' : 'border-orange-200'}`}>
                    <AvatarImage src={avatarUrl} alt={user?.name} />
                    <AvatarFallback className="bg-orange-100 text-orange-600 font-bold">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className="w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg"
                align="end"
                forceMount
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-gray-900 dark:text-white">
                      {user.name}
                    </p>
                    <p className="text-xs leading-none text-gray-500 dark:text-gray-400">
                      {user.isPremium ? t("header.premiumMember") : t("header.freeMember")}
                    </p>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />

                <DropdownMenuItem
                  onClick={() => onNavigate('profile')}
                  className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 cursor-pointer"
                >
                  <User className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <span>{t("header.myProfile")}</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => onNavigate('subscription')}
                  className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 cursor-pointer"
                >
                  <Gem className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <span>{t("header.subscription")}</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />

                <DropdownMenuItem
                  onClick={onLogout}
                  className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 focus:bg-red-50 dark:focus:bg-red-900/20 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4 text-red-500 dark:text-red-400" />
                  <span>{t("header.logout")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;