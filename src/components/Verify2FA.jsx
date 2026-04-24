// src/components/Verify2FA.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Key, AlertCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from 'react-i18next';

const Verify2FA = ({ onLogin }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(30);
    const [progress, setProgress] = useState(100);
    const [isBackupCode, setIsBackupCode] = useState(false);

    const userId = location.state?.userId || sessionStorage.getItem('tempUserId');
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

    // Timer para TOTP
    useEffect(() => {
        if (isBackupCode) return; // Não precisa timer para código de backup

        const timer = setInterval(() => {
            const now = Math.floor(Date.now() / 1000);
            const timeStep = 30;
            const timeInStep = now % timeStep;
            const remaining = timeStep - timeInStep;

            setTimeLeft(remaining);
            setProgress((remaining / timeStep) * 100);
        }, 100);

        return () => clearInterval(timer);
    }, [isBackupCode]);

    const handleVerify = async (e) => {
        e.preventDefault();

        if (!token || token.length < 6) {
            toast({
                title: t('verify2fa.invalidCode'),
                description: t('verify2fa.enter6Digits'),
                variant: 'destructive'
            });
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/2fa/verify-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, token })
            });

            const data = await response.json();


            if (data.success) {
               
                // Se a API retornar o token 
                if (data.token && data.user) {
                    localStorage.setItem('bomPiteuToken', data.token);
                    localStorage.setItem('bomPiteuUser', JSON.stringify(data.user));
                    sessionStorage.removeItem('tempUserId');

                    if (data.usedBackupCode) {
                        toast({
                            title: t('verify2fa.backupCodeUsed'),
                            description: t('verify2fa.backupCodeUsedDesc', { remaining: data.remainingCodes }),
                            duration: 10000
                        });
                    }

                    setTimeout(() => {
                        onLogin(data.user);
                    }, 1000);
                }
            } else {
                toast({
                    title: t('verify2fa.invalidCode'),
                    description: data.error || t('verify2fa.incorrectCode'),
                    variant: 'destructive'
                });
            }
        } catch (error) {
            toast({
                title: t('common.error'),
                description: t('verify2fa.verificationError'),
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-orange-50 to-yellow-50">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full mx-4"
            >
                <div className="text-center mb-6">
                    <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield className="h-8 w-8 text-orange-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">{t('verify2fa.title')}</h1>
                    <p className="text-gray-500 mt-2">
                        {isBackupCode
                            ? t('verify2fa.backupPrompt')
                            : t('verify2fa.appPrompt')}
                    </p>
                </div>

                {!isBackupCode && (
                    <div className="mb-6 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>{t('verify2fa.codeExpiresIn')}</span>
                            <span className="font-mono font-bold">{timeLeft}s</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                    </div>
                )}

                <form onSubmit={handleVerify} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="token">{t('verify2fa.verificationCode')}</Label>
                        <Input
                            id="token"
                            value={token}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                setToken(value);
                            }}
                            placeholder="000000"
                            className="text-center text-2xl tracking-widest font-mono"
                            maxLength={6}
                            autoFocus
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={loading || token.length < 6}
                        className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
                    >
                        {loading ? t('common.verifying') : t('verify2fa.verify')}
                    </Button>
                </form>

                <div className="mt-4 text-center">
                    <button
                        onClick={() => setIsBackupCode(!isBackupCode)}
                        className="text-sm text-orange-600 hover:underline"
                    >
                        {isBackupCode
                            ? t('verify2fa.useAppCode')
                            : t('verify2fa.useBackupCode')}
                    </button>
                </div>

                <Alert className="mt-6 bg-blue-50 border-blue-200">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-blue-800">{t('verify2fa.needHelp')}</AlertTitle>
                    <AlertDescription className="text-blue-600">
                        {t('verify2fa.helpDescription')}
                    </AlertDescription>
                </Alert>
            </motion.div>
        </div>
    );
};

export default Verify2FA;