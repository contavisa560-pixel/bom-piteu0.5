// src/components/Security/TwoFactorAuth.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield, QrCode, Key, Copy, Check, AlertCircle,
    Smartphone, Mail, Download, RefreshCw, X, Eye, EyeOff,
    Lock, ShieldAlert, ShieldCheck, HelpCircle, Info
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

const TwoFactorAuth = ({ user, security, setSecurity, saveSettings }) => {
    const { toast } = useToast();
    const { t } = useTranslation();
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    // Estados
    const [isEnabled, setIsEnabled] = useState(security?.twoFactorAuth || false);
    const [showSetup, setShowSetup] = useState(false);
    const [qrCode, setQrCode] = useState(null);
    const [secret, setSecret] = useState(null);
    const [verificationCode, setVerificationCode] = useState('');
    const [verificationStep, setVerificationStep] = useState('setup'); // setup, verify, success
    const [loading, setLoading] = useState(false);
    const [backupCodes, setBackupCodes] = useState([]);
    const [showBackupCodes, setShowBackupCodes] = useState(false);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showDisableDialog, setShowDisableDialog] = useState(false);
    const [recoveryEmail, setRecoveryEmail] = useState(security?.recoveryEmail || '');
    const [showRecoverySetup, setShowRecoverySetup] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showPasswordDialog, setShowPasswordDialog] = useState(false);
    const [passwordForNewCodes, setPasswordForNewCodes] = useState('');
    const [showPasswordField, setShowPasswordField] = useState(false);

    // Sincronizar estado com o backend quando o componente montar
    useEffect(() => {
        const check2FAStatus = async () => {
            try {
                const response = await fetch(`${API_URL}/api/2fa/status`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('bomPiteuToken')}`
                    }
                });
                const data = await response.json();

                if (data.success) {
                    console.log('Status 2FA sincronizado:', data);
                    setIsEnabled(data.twoFactorEnabled);

                    //  Sincronizar também com o estado pai (UserProfile)
                    setSecurity(prev => ({
                        ...prev,
                        twoFactorAuth: data.twoFactorEnabled
                    }));
                }
            } catch (error) {
                console.error('Erro ao verificar status 2FA:', error);
            }
        };

        check2FAStatus();
    }, [API_URL]);

    useEffect(() => {
        if (security?.twoFactorAuth !== undefined) {
            setIsEnabled(security.twoFactorAuth);
        }
    }, [security?.twoFactorAuth]);

    // Timer para códigos TOTP
    const [timeLeft, setTimeLeft] = useState(30);
    const [progress, setProgress] = useState(100);

    // Iniciar setup 2FA
    const start2FASetup = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/2fa/setup`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('bomPiteuToken')}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success) {
                setQrCode(data.qrCode);
                setSecret(data.secret);
                setShowSetup(true);
                setVerificationStep('verify');
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            toast({
                title: t('common.error'),
                description: t('twoFactor.setupError'),
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    // Verificar código e ativar 2FA
    const verifyAndEnable = async () => {
        if (!verificationCode || verificationCode.length < 6) {
            toast({
                title: t('twoFactor.invalidCode'),
                description: t('twoFactor.enter6Digits'),
                variant: 'destructive'
            });
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/2fa/verify`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('bomPiteuToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token: verificationCode })
            });

            const data = await response.json();

            if (data.success) {
                setBackupCodes(data.backupCodes);

                // 🔥 IMPORTANTE: Atualizar estado global PRIMEIRO
                const updatedSecurity = {
                    ...security,
                    twoFactorAuth: true,
                    twoFactorEnabled: true,
                    backupCodesGenerated: true,
                    twoFactorBackupCodes: data.backupCodes
                };

                setSecurity(updatedSecurity);

                // 🔥 Salvar no backend e AGUARDAR confirmação
                const saveResult = await saveSettings({ security: updatedSecurity });

                if (saveResult?.success) {
                    setIsEnabled(true);
                    setVerificationStep('success');

                    // 🔥 VERIFICAÇÃO EXTRA: buscar status do backend
                    const statusResponse = await fetch(`${API_URL}/api/2fa/status`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('bomPiteuToken')}`
                        }
                    });
                    const statusData = await statusResponse.json();
                    console.log('Status 2FA no backend:', statusData);

                    toast({
                        title: t('twoFactor.enabled'),
                        description: t('twoFactor.enabledDesc'),
                        duration: 5000
                    });
                } else {
                    throw new Error('Falha ao salvar no backend');
                }
            } else {
                toast({
                    title: t('twoFactor.invalidCode'),
                    description: t('twoFactor.codeInvalidDesc'),
                    variant: 'destructive'
                });
            }
        } catch (error) {
            console.error('Erro detalhado:', error);
            toast({
                title: t('common.error'),
                description: error.message || t('twoFactor.verifyError'),
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    // Desativar 2FA
    const disable2FA = async () => {
        if (!password) {
            toast({
                title: t('twoFactor.passwordRequired'),
                description: t('twoFactor.enterPasswordToDisable'),
                variant: 'destructive'
            });
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/2fa/disable`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('bomPiteuToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ password })
            });

            const data = await response.json();

            if (data.success) {
                // Atualizar estado
                const updatedSecurity = {
                    ...security,
                    twoFactorAuth: false,
                    twoFactorEnabled: false
                };
                setSecurity(updatedSecurity);
                await saveSettings({ security: updatedSecurity });

                setShowDisableDialog(false);
                setPassword('');
                setShowSetup(false);

                toast({
                    title: t('twoFactor.disabled'),
                    description: t('twoFactor.disabledDesc'),
                });
            } else {
                toast({
                    title: t('common.error'),
                    description: data.error || t('twoFactor.incorrectPassword'),
                    variant: 'destructive'
                });
            }
        } catch (error) {
            toast({
                title: t('common.error'),
                description: t('twoFactor.disableError'),
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };


    // Gerar novos códigos de backup
    const regenerateBackupCodes = async () => {
        // Em vez de pedir senha diretamente, abre o modal
        setShowPasswordDialog(true);
    };

    // Função para realmente gerar os códigos
    const confirmRegenerateBackupCodes = async () => {
        if (!passwordForNewCodes) {
            toast({
                title: t('twoFactor.passwordRequired'),
                description: t('twoFactor.enterPasswordForNewCodes'),
                variant: 'destructive'
            });
            return;
        }

        setLoading(true);
        try {
            console.log('Tentando gerar novos códigos...');

            const response = await fetch(`${API_URL}/api/2fa/regenerate-backup-codes`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('bomPiteuToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ password: passwordForNewCodes })
            });

            const data = await response.json();
            console.log('Resposta do servidor:', data);

            if (data.success) {
                setBackupCodes(data.backupCodes);
                setShowBackupCodes(true);
                setShowPasswordDialog(false);
                setPasswordForNewCodes('');

                // 🔥 Atualizar security com novos códigos
                const updatedSecurity = {
                    ...security,
                    twoFactorBackupCodes: data.backupCodes
                };
                setSecurity(updatedSecurity);
                await saveSettings({ security: updatedSecurity });

                toast({
                    title: t('twoFactor.codesGenerated'),
                    description: t('twoFactor.codesGeneratedDesc'),
                });
            } else {
                toast({
                    title: t('common.error'),
                    description: data.error || t('twoFactor.incorrectPassword'),
                    variant: 'destructive'
                });
            }
        } catch (error) {
            console.error('Erro detalhado:', error);
            toast({
                title: t('common.error'),
                description: error.message || t('twoFactor.regenerateError'),
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    // Copiar códigos de backup
    const copyBackupCodes = () => {
        const codesText = backupCodes.join('\n');
        navigator.clipboard.writeText(codesText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);

        toast({
            title: t('twoFactor.copied'),
            description: t('twoFactor.codesCopied'),
        });
    };

    // Baixar códigos de backup como arquivo
    const downloadBackupCodes = () => {
        const content = `
${t('twoFactor.backupCodesHeader')}
${t('twoFactor.backupCodesDate')}: ${new Date().toLocaleString()}
${t('twoFactor.backupCodesInstruction')}

${backupCodes.join('\n')}

${t('twoFactor.backupCodesImportant')}
• ${t('twoFactor.backupCodesBullet1')}
• ${t('twoFactor.backupCodesBullet2')}
• ${t('twoFactor.backupCodesBullet3')}
    `;

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bompiteu-backup-codes-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Timer para TOTP
    useEffect(() => {
        if (!showSetup || verificationStep !== 'verify') return;

        const timer = setInterval(() => {
            const now = Math.floor(Date.now() / 1000);
            const timeStep = 30;
            const timeInStep = now % timeStep;
            const remaining = timeStep - timeInStep;

            setTimeLeft(remaining);
            setProgress((remaining / timeStep) * 100);

            if (remaining === 30) {
                // Código expirou - poderia limpar ou indicar
            }
        }, 100);

        return () => clearInterval(timer);
    }, [showSetup, verificationStep]);

    return (
        <div className="space-y-6">
            {/* Status Atual */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                    {isEnabled ? (
                        <ShieldCheck className="h-6 w-6 text-green-500 dark:text-green-400" />
                    ) : (
                        <ShieldAlert className="h-6 w-6 text-yellow-500 dark:text-yellow-400" />
                    )}
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            {isEnabled ? t('twoFactor.active') : t('twoFactor.inactive')}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {isEnabled
                                ? t('twoFactor.activeDesc')
                                : t('twoFactor.inactiveDesc')
                            }
                        </p>
                    </div>
                </div>

                {!isEnabled ? (
                    <Button
                        onClick={start2FASetup}
                        disabled={loading}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                    >
                        {loading ? t('common.loading') : t('twoFactor.enable')}
                    </Button>
                ) : (
                    <Button
                        variant="outline"
                        onClick={() => setShowDisableDialog(true)}
                        className="border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                        {t('twoFactor.disable')}
                    </Button>
                )}
            </div>

            {/* Setup 2FA Dialog */}
            <Dialog open={showSetup} onOpenChange={setShowSetup}>
                <DialogContent className="max-w-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                            <Shield className="h-5 w-5 text-green-500 dark:text-green-400" />
                            {t('twoFactor.setupTitle')}
                        </DialogTitle>
                        <DialogDescription className="text-gray-600 dark:text-gray-400">
                            {t('twoFactor.setupDesc')}
                        </DialogDescription>
                    </DialogHeader>
                    <AnimatePresence mode="wait">
                        {verificationStep === 'verify' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-4"
                            >
                                {/* QR Code */}
                                <div className="flex justify-center p-1 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                                    {qrCode && (
                                        <img
                                            src={qrCode}
                                            alt={t('twoFactor.qrCodeAlt')}
                                            className="w-20 h-20"
                                        />
                                    )}
                                </div>

                                {/* Código Manual */}
                                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                        {t('twoFactor.manualCodeDesc')}
                                    </p>
                                    <div className="flex items-center justify-between bg-white dark:bg-gray-900 p-2 rounded border border-gray-200 dark:border-gray-700">
                                        <code className="text-sm font-mono text-gray-800 dark:text-gray-200">{secret}</code>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                navigator.clipboard.writeText(secret);
                                                toast({ title: t('twoFactor.copied'), description: t('twoFactor.secretCopied') });
                                            }}
                                            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Timer Visual */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-700 dark:text-gray-300">{t('twoFactor.codeExpiresIn')}:</span>
                                        <span className="font-mono text-gray-900 dark:text-white">{timeLeft}s</span>
                                    </div>
                                    <Progress
                                        value={progress}
                                        className="h-2 bg-gray-200 dark:bg-gray-700 [&>div]:bg-orange-500 dark:[&>div]:bg-orange-400"
                                    />
                                </div>

                                {/* Input de Verificação */}
                                <div className="space-y-2">
                                    <Label htmlFor="verificationCode" className="text-gray-700 dark:text-gray-300">
                                        {t('twoFactor.verificationCode')}
                                    </Label>
                                    <Input
                                        id="verificationCode"
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        placeholder="000000"
                                        maxLength={6}
                                        className="text-center text-2xl tracking-widest font-mono bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {t('twoFactor.verificationCodeDesc')}
                                    </p>
                                </div>

                                {/* Apps Recomendados */}
                                <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                                    <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    <AlertTitle className="text-blue-800 dark:text-blue-300">{t('twoFactor.recommendedApps')}</AlertTitle>
                                    <AlertDescription className="text-blue-700 dark:text-blue-400">
                                        Google Authenticator, Microsoft Authenticator, Authy {t('common.or')} 1Password
                                    </AlertDescription>
                                </Alert>
                            </motion.div>
                        )}

                        {verificationStep === 'success' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-4"
                            >
                                <div className="text-center py-6">
                                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <ShieldCheck className="h-6 w-6 text-green-500 dark:text-green-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                        {t('twoFactor.successTitle')}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {t('twoFactor.successDesc')}
                                    </p>
                                </div>

                                {/* Códigos de Backup */}
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2 flex items-center gap-2">
                                        <Key className="h-4 w-4" />
                                        {t('twoFactor.backupCodes')} ({t('twoFactor.useIfLost')})
                                    </h4>

                                    <div className="grid grid-cols-2 gap-1 mb-2">
                                        {backupCodes.map((code, index) => (
                                            <div
                                                key={index}
                                                className="bg-white dark:bg-gray-800 p-1 rounded font-mono text-sm text-center border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                                            >
                                                {code}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex gap-2 justify-center">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={copyBackupCodes}
                                            className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                            <span className="ml-2">{copied ? t('twoFactor.copied') : t('twoFactor.copy')}</span>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={downloadBackupCodes}
                                            className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            {t('twoFactor.download')}
                                        </Button>
                                    </div>
                                </div>

                                <Alert variant="destructive" className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                                    <AlertTitle className="text-red-800 dark:text-red-300">{t('common.important')}!</AlertTitle>
                                    <AlertDescription className="text-red-700 dark:text-red-400">
                                        {t('twoFactor.backupWarning')}
                                    </AlertDescription>
                                </Alert>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <DialogFooter className="flex gap-2">
                        {verificationStep === 'verify' && (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowSetup(false)}
                                    disabled={loading}
                                    className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    {t('common.cancel')}
                                </Button>
                                <Button
                                    onClick={verifyAndEnable}
                                    disabled={loading || verificationCode.length < 6}
                                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                                >
                                    {loading ? (
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                                    ) : (
                                        <Shield className="h-4 w-4 mr-2" />
                                    )}
                                    {loading ? t('common.verifying') : t('twoFactor.verifyAndEnable')}
                                </Button>
                            </>
                        )}

                        {verificationStep === 'success' && (
                            <Button
                                onClick={() => {
                                    setShowSetup(false);
                                    setVerificationStep('setup');
                                    setVerificationCode('');
                                }}
                                className="w-full bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white"
                            >
                                {t('common.finish')}
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Diálogo de Desativação */}
            <Dialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
                <DialogContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                            <ShieldAlert className="h-5 w-5" />
                            {t('twoFactor.disableTitle')}
                        </DialogTitle>
                        <DialogDescription className="text-gray-600 dark:text-gray-400">
                            {t('twoFactor.disableConfirm')}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-4">
                        <Alert variant="destructive" className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                            <AlertTitle className="text-red-800 dark:text-red-300">{t('common.warning')}!</AlertTitle>
                            <AlertDescription className="text-red-700 dark:text-red-400">
                                {t('twoFactor.disableWarning')}
                            </AlertDescription>
                        </Alert>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">
                                {t('twoFactor.confirmPassword')}
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={t('twoFactor.enterCurrentPassword')}
                                    className="pr-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowDisableDialog(false);
                                setPassword('');
                            }}
                            disabled={loading}
                            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={disable2FA}
                            disabled={loading || !password}
                            className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white"
                        >
                            {loading ? t('common.disabling') : t('twoFactor.yesDisable')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Seção de Códigos de Backup (quando 2FA já está ativo) */}
            {isEnabled && (
                <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-white">
                            <Key className="h-5 w-5 text-orange-500 dark:text-orange-400" />
                            {t('twoFactor.backupCodes')}
                        </CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400">
                            {t('twoFactor.backupCodesDesc')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {showBackupCodes && (
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                    <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-3">
                                        {t('twoFactor.yourBackupCodes')}:
                                    </h4>
                                    <div className="grid grid-cols-2 gap-2 mb-4">
                                        {backupCodes.map((code, index) => (
                                            <div
                                                key={index}
                                                className="bg-white dark:bg-gray-700 p-2 rounded font-mono text-sm text-center border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                                            >
                                                {code}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={copyBackupCodes}
                                            className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            <Copy className="h-4 w-4 mr-2" />
                                            {t('twoFactor.copy')}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={downloadBackupCodes}
                                            className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            {t('twoFactor.download')}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setPasswordForNewCodes('');
                                        setShowPasswordDialog(true);
                                    }}
                                    className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    {t('twoFactor.regenerateCodes')}
                                </Button>
                                {!showBackupCodes && (
                                    <Button
                                        variant="ghost"
                                        onClick={() => setShowBackupCodes(true)}
                                        className="flex-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        <Eye className="h-4 w-4 mr-2" />
                                        {t('twoFactor.viewCurrentCodes')}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
            {/* Email de Recuperação */}
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-white">
                        <Mail className="h-5 w-5 text-orange-500 dark:text-orange-400" />
                        {t('twoFactor.recoveryEmail')}
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                        {t('twoFactor.recoveryEmailDesc')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <Input
                                value={recoveryEmail}
                                onChange={(e) => setRecoveryEmail(e.target.value)}
                                placeholder="email@alternativo.com"
                                className="flex-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                            />
                            <Button
                                onClick={async () => {
                                    const updatedSecurity = {
                                        ...security,
                                        recoveryEmail
                                    };
                                    setSecurity(updatedSecurity);
                                    await saveSettings({ security: updatedSecurity });
                                    toast({
                                        title: t('twoFactor.emailUpdated'),
                                        description: t('twoFactor.emailUpdatedDesc'),
                                    });
                                }}
                                disabled={!recoveryEmail}
                                className="bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white"
                            >
                                <Check className="h-4 w-4 mr-2" />
                                {t('common.save')}
                            </Button>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t('twoFactor.recoveryEmailNote')}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Guia de Segurança */}
            <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <HelpCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertTitle className="text-blue-800 dark:text-blue-300">{t('twoFactor.howItWorks')}</AlertTitle>
                <AlertDescription className="text-blue-700 dark:text-blue-400">
                    <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                        <li>{t('twoFactor.howItWorks1')}</li>
                        <li>{t('twoFactor.howItWorks2')}</li>
                        <li>{t('twoFactor.howItWorks3')}</li>
                        <li>{t('twoFactor.howItWorks4')}</li>
                        <li>{t('twoFactor.howItWorks5')}</li>
                    </ul>
                </AlertDescription>
            </Alert>
            {/* Diálogo para confirmar senha ao gerar novos códigos */}
            <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                <DialogContent className="max-w-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                            <Key className="h-5 w-5 text-orange-500 dark:text-orange-400" />
                            {t('twoFactor.confirmPasswordTitle')}
                        </DialogTitle>
                        <DialogDescription className="text-gray-600 dark:text-gray-400">
                            {t('twoFactor.confirmPasswordDesc')}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <div className="space-y-2">
                            <Label htmlFor="passwordForNewCodes" className="text-gray-700 dark:text-gray-300">
                                {t('twoFactor.yourCurrentPassword')}
                            </Label>
                            <div className="relative">
                                <Input
                                    id="passwordForNewCodes"
                                    type={showPasswordField ? "text" : "password"}
                                    value={passwordForNewCodes}
                                    onChange={(e) => setPasswordForNewCodes(e.target.value)}
                                    placeholder={t('twoFactor.enterYourPassword')}
                                    className="pr-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                                    onClick={() => setShowPasswordField(!showPasswordField)}
                                >
                                    {showPasswordField ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {t('twoFactor.oldCodesInvalidated')}
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowPasswordDialog(false);
                                setPasswordForNewCodes('');
                            }}
                            disabled={loading}
                            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button
                            onClick={confirmRegenerateBackupCodes}
                            disabled={loading || !passwordForNewCodes}
                            className="bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white"
                        >
                            {loading ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                                    {t('common.generating')}
                                </>
                            ) : (
                                t('twoFactor.confirmAndGenerate')
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default TwoFactorAuth;