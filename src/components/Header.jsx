import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { ChefHat, Sparkles, LogOut, User, Home, Star, Gem, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeContext } from "@/context/ThemeContext";
import { useTranslation } from "react-i18next";

const Header = ({ user, onLogout, onNavigate }) => {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);

  const [profileImage, setProfileImage] = useState(() => {
    return localStorage.getItem('smartchef_avatar') || '';
  });

  useEffect(() => {
    const handler = (e) => setProfileImage(e.detail);
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

  const [avatarUrl, setAvatarUrl] = useState(localStorage.getItem('smartchef_avatar') || user.picture || '');

  useEffect(() => {
    const handleAvatarChange = (e) => {
      const newAvatar = e.detail || localStorage.getItem('smartchef_avatar') || '';
      setAvatarUrl(newAvatar);
    };

    window.addEventListener('smartchef_avatar_updated', handleAvatarChange);
    return () => window.removeEventListener('smartchef_avatar_updated', handleAvatarChange);
  }, []);

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
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-xl">
              <ChefHat className="h-8 w-8 text-white" />
            </div>

            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Bom Piteu!
              </span>

              <div className="flex items-center space-x-1">
                <Sparkles className="h-4 w-4 text-orange-500" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {t("header.smartKitchen")}
                </span>
              </div>
            </div>
          </div>

          {/* NAVIGATION */}
          <div className="flex items-center space-x-2">
            <nav className="hidden md:flex items-center space-x-1">
              <Button variant="ghost" onClick={() => onNavigate('dashboard')}>
                <Home className="mr-2 h-4 w-4" /> {t("header.home")}
              </Button>

              <Button variant="ghost" onClick={() => onNavigate('marketplace')}>
                <ShoppingCart className="mr-2 h-4 w-4" /> {t("header.marketplace")}
              </Button>
            </nav>

            {/* PREMIUM */}
            {!user.isPremium && (
              <Button onClick={() => onNavigate('subscription')} size="sm"
                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-md hover:shadow-lg">
                <Gem className="mr-2 h-4 w-4" /> {t("header.premium")}
              </Button>
            )}

            {/* AVATAR MENU */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className={`h-10 w-10 border-2 ${user.isPremium ? 'border-yellow-400' : 'border-orange-200'}`}>
                    <AvatarImage src={user?.picture} alt={user?.name} />
                    <AvatarFallback className="bg-orange-100 text-orange-600 font-bold">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-56 dark:bg-gray-900 dark:border-gray-700" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground dark:text-gray-400">
                      {user.isPremium ? t("header.premiumMember") : t("header.freeMember")}
                    </p>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => onNavigate('profile')} className="dark:hover:bg-gray-800">
                  <User className="mr-2 h-4 w-4" />
                  <span>{t("header.myProfile")}</span>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => onNavigate('subscription')} className="dark:hover:bg-gray-800">
                  <Gem className="mr-2 h-4 w-4" />
                  <span>{t("header.subscription")}</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={onLogout} className="dark:hover:bg-gray-800">
                  <LogOut className="mr-2 h-4 w-4" />
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
