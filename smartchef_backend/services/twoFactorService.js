// smartchef_backend/services/twoFactorService.js
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

class TwoFactorService {
  // Gerar segredo para 2FA
  static generateSecret(email) {
    return speakeasy.generateSecret({
      name: `BomPiteu:${email}`
    });
  }

  // Gerar QR Code a partir do segredo
  static async generateQRCode(secret) {
    try {
      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
      return qrCodeUrl;
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      throw error;
    }
  }

  // Verificar código TOTP
  static verifyToken(secret, token) {
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 1 // Permite 1 passo de tempo de diferença (30s para mais ou menos)
    });
  }

  // Gerar códigos de backup
  static generateBackupCodes() {
    const codes = [];
    for (let i = 0; i < 8; i++) {
      // Gerar código no formato XXXX-XXXX
      const part1 = Math.random().toString(36).substring(2, 6).toUpperCase();
      const part2 = Math.random().toString(36).substring(2, 6).toUpperCase();
      codes.push(`${part1}-${part2}`);
    }
    return codes;
  }

  // Verificar código de backup
  static verifyBackupCode(backupCodes, code) {
    // Remover hífens para comparação
    const cleanCode = code.replace(/-/g, '').toUpperCase();
    return backupCodes.find(c => {
      const cleanStored = c.replace(/-/g, '').toUpperCase();
      return cleanStored === cleanCode;
    });
  }

  // Formatar códigos de backup para exibição (sem informações sensíveis)
  static formatBackupCodesForDisplay(codes) {
    return codes.map(code => {
      // Mostrar apenas últimos 4 caracteres se já foram usados?
      // Por enquanto retornamos o código completo
      return code;
    });
  }
}

module.exports = TwoFactorService;