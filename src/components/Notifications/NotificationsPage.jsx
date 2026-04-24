// src/components/Notifications/NotificationsPage.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Check, Trash2, RefreshCw, ArrowLeft, LogIn, Shield, ChefHat, Mail, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { notificationService } from '@/services/notificationService';
import { formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

const NotificationsPage = ({ onNavigate }) => {
    const { t } = useTranslation();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const data = await notificationService.getNotifications(1, 50);
            if (data.success) {
                setNotifications(data.notifications);
            }
        } catch (error) {
            console.error('Erro ao carregar notificações:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNotifications();
    }, []);

    const handleMarkAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev =>
                prev.map(n => (n._id === id ? { ...n, read: true } : n))
            );
        } catch (error) {
            toast({
                title: t('common.error'),
                description: t('notificationsPage.markAsReadError'),
                variant: 'destructive'
            });
        }
    };

    const handleDelete = async (id) => {
        try {
            await notificationService.deleteNotification(id);
            setNotifications(prev => prev.filter(n => n._id !== id));
            toast({
                title: t('notificationsPage.success'),
                description: t('notificationsPage.deleted')
            });
        } catch (error) {
            toast({
                title: t('common.error'),
                description: t('notificationsPage.deleteError'),
                variant: 'destructive'
            });
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            toast({
                title: t('notificationsPage.success'),
                description: t('notificationsPage.markAllAsReadDesc')
            });
        } catch (error) {
            toast({
                title: t('common.error'),
                description: t('notificationsPage.markAllError'),
                variant: 'destructive'
            });
        }
    };

    const handleDeleteAll = async () => {
        try {
            await notificationService.deleteAllNotifications();
            setNotifications([]);
            toast({
                title: t('notificationsPage.success'),
                description: t('notificationsPage.deleteAllDesc')
            });
        } catch (error) {
            toast({
                title: t('common.error'),
                description: t('notificationsPage.deleteAllError'),
                variant: 'destructive'
            });
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'login_alert': return <LogIn className="h-5 w-5 text-blue-500" />;
            case 'security_alert': return <Shield className="h-5 w-5 text-red-500" />;
            case 'new_recipe': return <ChefHat className="h-5 w-5 text-orange-500" />;
            case 'newsletter': return <Mail className="h-5 w-5 text-purple-500" />;
            default: return <AlertCircle className="h-5 w-5 text-gray-500" />;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-4xl"
        >
            <Button
                variant="ghost"
                onClick={() => onNavigate('dashboard')}
                className="mb-3 sm:mb-4 text-sm sm:text-base"
            >
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                {t('common.back')}
            </Button>

            <Card>
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 sm:p-6">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                        {t('notificationsPage.title')}
                    </CardTitle>
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleMarkAllAsRead}
                            className="text-xs sm:text-sm flex-1 sm:flex-none"
                        >
                            <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            <span className="hidden sm:inline">{t('notificationsPage.markAllRead')}</span>
                            <span className="sm:hidden">{t('notificationsPage.markAllReadShort')}</span>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDeleteAll}
                            className="text-xs sm:text-sm text-red-600 hover:text-red-700 flex-1 sm:flex-none"
                        >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            <span className="hidden sm:inline">{t('notificationsPage.deleteAll')}</span>
                            <span className="sm:hidden">{t('notificationsPage.deleteShort')}</span>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={loadNotifications}
                            disabled={loading}
                            className="flex-1 sm:flex-none"
                        >
                            <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 ${loading ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-3 sm:p-6">
                    {loading ? (
                        <div className="text-center py-8 sm:py-12">
                            <div className="h-6 w-6 sm:h-8 sm:w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent mx-auto mb-3 sm:mb-4" />
                            <p className="text-sm sm:text-base text-gray-500">{t('notificationsPage.loading')}</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center py-8 sm:py-12">
                            <Bell className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-gray-300" />
                            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2">
                                {t('notificationsPage.emptyTitle')}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-500">
                                {t('notificationsPage.emptyDesc')}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2 sm:space-y-3">
                            {notifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    className={`p-3 sm:p-4 rounded-lg border ${notification.read
                                            ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                            : 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800'
                                        }`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex gap-2 sm:gap-3 flex-1 min-w-0">
                                            <div className="mt-1 flex-shrink-0">
                                                {getIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                                                    {notification.title}
                                                </h4>
                                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1 break-words">
                                                    {notification.message}
                                                </p>
                                                <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 mt-2">
                                                    {formatDistanceToNow(new Date(notification.createdAt), {
                                                        addSuffix: true,
                                                        locale: pt
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1 flex-shrink-0">
                                            {!notification.read && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleMarkAsRead(notification._id)}
                                                    className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                                                    title={t('notificationsPage.markAsReadTooltip')}
                                                >
                                                    <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(notification._id)}
                                                className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:text-red-500"
                                                title={t('notificationsPage.deleteTooltip')}
                                            >
                                                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default NotificationsPage;