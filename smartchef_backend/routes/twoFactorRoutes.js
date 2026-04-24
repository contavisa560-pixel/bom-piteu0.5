const express = require('express');
const router = express.Router();
const User = require('../models/User');
const TwoFactorService = require('../services/twoFactorService');
const NotificationService = require('../services/notificationService');
const authenticate = require('../middleware/auth');
const { comparePassword } = require('../middleware/security/passwordUtils');
const twoFactorLimiter = require('../middleware/security/twoFactorLimiter');

router.use(authenticate);

// ==================== SETUP 2FA ====================
router.post('/setup', twoFactorLimiter, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('+settings.security.twoFactorSecret +settings.security.twoFactorTempSecret');

        if (user.settings?.security?.twoFactorAuth) {
            return res.status(400).json({
                error: '2FA já está ativo nesta conta'
            });
        }

        const secret = TwoFactorService.generateSecret(user.email);
        const qrCode = await TwoFactorService.generateQRCode(secret);

        if (!user.settings) user.settings = {};
        if (!user.settings.security) user.settings.security = {};

        user.settings.security.twoFactorTempSecret = secret.base32;
        await user.save();

        res.json({
            success: true,
            secret: secret.base32,
            qrCode: qrCode
        });

    } catch (error) {
        console.error('Erro no setup 2FA:', error);
        res.status(500).json({ error: 'Erro ao configurar 2FA' });
    }
});

// ==================== VERIFICAR E ATIVAR 2FA ====================
router.post('/verify', twoFactorLimiter, async (req, res) => {
    try {
        const { token } = req.body;
        const user = await User.findById(req.user.id).select('+settings.security.twoFactorSecret +settings.security.twoFactorTempSecret');

        if (!user.settings?.security?.twoFactorTempSecret) {
            return res.status(400).json({
                error: 'Nenhuma configuração de 2FA em andamento'
            });
        }

        const isValid = TwoFactorService.verifyToken(
            user.settings.security.twoFactorTempSecret,
            token
        );

        if (!isValid) {
            return res.status(400).json({ error: 'Código inválido' });
        }

        const backupCodes = TwoFactorService.generateBackupCodes();

        user.settings.security.twoFactorSecret = user.settings.security.twoFactorTempSecret;
        user.settings.security.twoFactorBackupCodes = backupCodes;
        user.settings.security.twoFactorAuth = true;
        user.settings.security.twoFactorTempSecret = undefined;

        await user.save();
        await NotificationService.createSecurityAlert(
            user._id,
            '2FA Ativado',
            'A autenticação de dois fatores foi ativada na sua conta'
        );
        res.json({
            success: true,
            backupCodes: backupCodes,
            twoFactorEnabled: true,
            message: '2FA ativado com sucesso! Guarde os códigos de backup em local seguro.'
        });

    } catch (error) {
        console.error('Erro ao verificar 2FA:', error);
        res.status(500).json({ error: 'Erro ao verificar código' });
    }
});

// ==================== DESATIVAR 2FA ====================
router.post('/disable', twoFactorLimiter, async (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ error: 'Senha é obrigatória' });
        }

        const user = await User.findById(req.user.id).select('+password +settings.security.twoFactorSecret');

        const isValidPassword = await comparePassword(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Senha incorreta' });
        }

        user.settings.security.twoFactorAuth = false;
        user.settings.security.twoFactorSecret = undefined;
        user.settings.security.twoFactorBackupCodes = undefined;
        user.settings.security.twoFactorTempSecret = undefined;

        await user.save();
        await NotificationService.createSecurityAlert(
            user._id,
            '2FA Desativado',
            'A autenticação de dois fatores foi desativada da sua conta'
        );
        res.json({
            success: true,
            message: '2FA desativado com sucesso'
        });

    } catch (error) {
        console.error('Erro ao desativar 2FA:', error);
        res.status(500).json({ error: 'Erro ao desativar 2FA' });
    }
});

// ==================== GERAR NOVOS CÓDIGOS DE BACKUP ====================
router.post('/regenerate-backup-codes', twoFactorLimiter, async (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ error: 'Senha é obrigatória' });
        }

        const user = await User.findById(req.user.id).select('+password +settings.security.twoFactorSecret');

        const isValidPassword = await comparePassword(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Senha incorreta' });
        }

        if (!user.settings?.security?.twoFactorAuth) {
            return res.status(400).json({ error: '2FA não está ativo' });
        }

        const newBackupCodes = TwoFactorService.generateBackupCodes();
        user.settings.security.twoFactorBackupCodes = newBackupCodes;

        await user.save();

        res.json({
            success: true,
            backupCodes: newBackupCodes
        });

    } catch (error) {
        console.error('Erro ao gerar novos códigos:', error);
        res.status(500).json({ error: 'Erro ao gerar novos códigos' });
    }
});

// ==================== VERIFICAR DURANTE LOGIN ====================

router.post('/verify-login', twoFactorLimiter, async (req, res) => {
    try {
        const { userId, token } = req.body;

        const user = await User.findById(userId).select('+settings.security.twoFactorSecret +settings.security.twoFactorBackupCodes');

        if (!user) {
            return res.status(404).json({ error: 'Utilizador não encontrado' });
        }

        // Verificar se é código de backup
        if (user.settings?.security?.twoFactorBackupCodes) {
            const backupCode = TwoFactorService.verifyBackupCode(
                user.settings.security.twoFactorBackupCodes,
                token
            );

            if (backupCode) {
                user.settings.security.twoFactorBackupCodes =
                    user.settings.security.twoFactorBackupCodes.filter(c => c !== backupCode);
                await user.save();

                return res.json({
                    success: true,
                    usedBackupCode: true,
                    remainingCodes: user.settings.security.twoFactorBackupCodes.length
                });
            }
        }

        const isValid = TwoFactorService.verifyToken(
            user.settings?.security?.twoFactorSecret,
            token
        );

        if (isValid) {
            res.json({
                success: true,
                usedBackupCode: false
            });
        } else {
            res.status(400).json({ error: 'Código inválido' });
        }

    } catch (error) {
        console.error('Erro ao verificar 2FA no login:', error);
        res.status(500).json({ error: 'Erro ao verificar código' });
    }
});

// ==================== OBTER STATUS 2FA ====================
router.get('/status', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select('+settings.security.twoFactorAuth +settings.security.twoFactorBackupCodes +settings.security.twoFactorRecoveryEmail');

        if (!user) {
            return res.status(404).json({ error: 'Utilizador não encontrado' });
        }

        const twoFactorEnabled = user.settings?.security?.twoFactorAuth === true;

        console.log('🔍 [2FA STATUS] userId:', req.user.id, '| twoFactorAuth:', user.settings?.security?.twoFactorAuth, '| resultado:', twoFactorEnabled);

        res.json({
            success: true,
            twoFactorEnabled: twoFactorEnabled,
            hasRecoveryEmail: !!user.settings?.security?.twoFactorRecoveryEmail,
            backupCodesCount: user.settings?.security?.twoFactorBackupCodes?.length || 0
        });
    } catch (error) {
        console.error('Erro ao obter status 2FA:', error);
        res.status(500).json({ error: 'Erro ao obter status' });
    }
});

// ==================== DEFINIR EMAIL DE RECUPERAÇÃO ====================
router.post('/recovery-email', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            return res.status(400).json({ error: 'Email inválido' });
        }

        const user = await User.findById(req.user.id);

        if (!user.settings) user.settings = {};
        if (!user.settings.security) user.settings.security = {};

        user.settings.security.twoFactorRecoveryEmail = email;
        await user.save();

        res.json({
            success: true,
            message: 'Email de recuperação atualizado'
        });

    } catch (error) {
        console.error('Erro ao definir email de recuperação:', error);
        res.status(500).json({ error: 'Erro ao definir email' });
    }
});

module.exports = router;