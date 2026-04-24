// src/components/Notifications/NotificationBell.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Bell, BellRing, Check, X, Trash2, RefreshCw, AlertCircle, LogIn, Shield, Mail, ChefHat } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { notificationService } from '@/services/notificationService';
import { formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const NotificationBell = ({ onNavigate }) => {
    const { t } = useTranslation();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const dropdownRef = useRef(null);
    const { toast } = useToast();
    const navigate = useNavigate();

    // Carregar notificações
    const loadNotifications = async (reset = false) => {
        setLoading(true);
        try {
            const currentPage = reset ? 1 : page;
            const data = await notificationService.getNotifications(currentPage, 10);

            if (data.success) {
                if (reset) {
                    setNotifications(data.notifications);
                    setPage(2);
                } else {
                    setNotifications(prev => [...prev, ...data.notifications]);
                    setPage(prev => prev + 1);
                }
                setHasMore(data.notifications.length === 10);
                setUnreadCount(data.unreadCount);
            }
        } catch (error) {
            console.error('Erro ao carregar notificações:', error);
        } finally {
            setLoading(false);
        }
    };

    // Carregar contagem de não lidas
    const loadUnreadCount = async () => {
        try {
            const count = await notificationService.getUnreadCount();
            setUnreadCount(count);
        } catch (error) {
            console.error('Erro ao carregar contagem:', error);
        }
    };

    // Marcar como lida
    const handleMarkAsRead = async (notificationId) => {
        try {
            await notificationService.markAsRead(notificationId);
            setNotifications(prev =>
                prev.map(n =>
                    n._id === notificationId ? { ...n, read: true } : n
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            toast({
                title: t('common.error'),
                description: t('notificationBell.markAsReadError'),
                variant: 'destructive'
            });
        }
    };

    // Marcar todas como lidas
    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
            toast({
                title: t('notificationBell.markAllSuccess'),
                description: t('notificationBell.markAllSuccessDesc')
            });
        } catch (error) {
            toast({
                title: t('common.error'),
                description: t('notificationBell.markAllError'),
                variant: 'destructive'
            });
        }
    };

    // Apagar notificação
    const handleDelete = async (notificationId) => {
        try {
            await notificationService.deleteNotification(notificationId);
            const wasUnread = notifications.find(n => n._id === notificationId)?.read === false;
            setNotifications(prev => prev.filter(n => n._id !== notificationId));
            if (wasUnread) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            toast({
                title: t('common.error'),
                description: t('notificationBell.deleteError'),
                variant: 'destructive'
            });
        }
    };

    // Ícone por tipo
    const getIcon = (type) => {
        switch (type) {
            case 'login_alert': return <LogIn className="h-4 w-4 text-blue-500" />;
            case 'security_alert': return <Shield className="h-4 w-4 text-red-500" />;
            case 'new_recipe': return <ChefHat className="h-4 w-4 text-orange-500" />;
            case 'newsletter': return <Mail className="h-4 w-4 text-purple-500" />;
            default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
        }
    };

    const handleViewAll = () => {
        setShowDropdown(false);
        onNavigate('notifications');
    };

    // Fechar dropdown ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Carregar ao montar
    useEffect(() => {
        loadNotifications(true);
        const interval = setInterval(loadUnreadCount, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Ícone do sino */}
            <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setShowDropdown(!showDropdown)}
            >
                {showDropdown && (
                    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm sm:hidden z-40" />
                )}
                {unreadCount > 0 ? (
                    <>
                        <BellRing className="h-5 w-5" />
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    </>
                ) : (
                    <Bell className="h-5 w-5" />
                )}
            </Button>

            {/* Dropdown de notificações */}
            <AnimatePresence>
                {showDropdown && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="
    fixed sm:absolute
    top-16 sm:top-auto
    left-4 right-4 sm:left-auto sm:right-0
    mt-2 sm:mt-2
    w-auto sm:w-96
    max-h-[80vh]
    bg-white dark:bg-gray-800
    rounded-2xl sm:rounded-lg
    shadow-2xl
    border border-gray-200 dark:border-gray-700
    z-[999]
  "
                    >
                        {/* Cabeçalho */}
                        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                                {t('notificationBell.title')}
                            </h3>
                            <div className="flex gap-1">
                                {unreadCount > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleMarkAllAsRead}
                                        title={t('notificationBell.markAllTooltip')}
                                        className="h-8 w-8 p-0"
                                    >
                                        <Check className="h-4 w-4" />
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => loadNotifications(true)}
                                    disabled={loading}
                                    title={t('notificationBell.refreshTooltip')}
                                    className="h-8 w-8 p-0"
                                >
                                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                </Button>
                            </div>
                        </div>

                        {/* Lista de notificações */}
                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                    <Bell className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                    <p>{t('notificationBell.empty')}</p>
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <div
                                        key={notification._id}
                                        className={`p-3 sm:p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                                            }`}
                                    >
                                        <div className="flex gap-2 sm:gap-3">
                                            <div className="flex-shrink-0 mt-1">
                                                {getIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm">
                                                    {notification.title}
                                                </p>
                                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                                                    {notification.message}
                                                </p>
                                                <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                    {formatDistanceToNow(new Date(notification.createdAt), {
                                                        addSuffix: true,
                                                        locale: pt
                                                    })}
                                                </p>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                {!notification.read && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-5 w-5 sm:h-6 sm:w-6 p-0"
                                                        onClick={() => handleMarkAsRead(notification._id)}
                                                        title={t('notificationBell.markAsReadTooltip')}
                                                    >
                                                        <Check className="h-3 w-3 sm:h-3 sm:w-3" />
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-5 w-5 sm:h-6 sm:w-6 p-0 hover:text-red-500"
                                                    onClick={() => handleDelete(notification._id)}
                                                    title={t('notificationBell.deleteTooltip')}
                                                >
                                                    <Trash2 className="h-3 w-3 sm:h-3 sm:w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Rodapé com "Ver todas" */}
                        {notifications.length > 0 && (
                            <div className="p-2 sm:p-3 border-t border-gray-200 dark:border-gray-700 text-center">
                                <Button
                                    variant="link"
                                    size="sm"
                                    className="text-xs sm:text-sm text-blue-600 dark:text-blue-400"
                                    onClick={handleViewAll}
                                >
                                    {t('notificationBell.viewAll')}
                                </Button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationBell;