const AdminNotification = require('../models/AdminNotification');

class AdminNotificationService {
  /**
   * Cria uma notificação para os administradores
   * @param {Object} data
   * @param {string} data.title - Título da notificação
   * @param {string} data.message - Mensagem detalhada
   * @param {string} data.type - 'info' | 'warning' | 'error' | 'success'
   * @param {string} [data.createdBy] - ID do utilizador que gerou (opcional)
   */
  static async create(data) {
    try {
      const notif = new AdminNotification({
        title: data.title,
        message: data.message,
        type: data.type || 'info',
        createdBy: data.createdBy || null,
      });
      await notif.save();
      console.log(`📢 Notificação admin criada: ${data.title}`);
      return notif;
    } catch (err) {
      console.error('❌ Erro ao criar notificação admin:', err);
    }
  }

  // Método rápido para novos utilizadores
  static async notifyNewUser(user) {
    await this.create({
      title: 'Novo utilizador registado',
      message: `${user.name} (${user.email}) acabou de criar uma conta.`,
      type: 'info',
      createdBy: user._id,
    });
  }

  // Método rápido para downgrade de premium
  static async notifyPremiumExpired(user) {
    await this.create({
      title: 'Premium expirado',
      message: `${user.name} (${user.email}) perdeu acesso Premium.`,
      type: 'warning',
      createdBy: user._id,
    });
  }

  // Método rápido para falhas de email
  static async notifyEmailFailure(email, error) {
    await this.create({
      title: 'Falha no envio de email',
      message: `Erro ao enviar email para ${email}: ${error.message}`,
      type: 'error',
    });
  }

  // Método para backup concluído
  static async notifyBackupCompleted(backupFile) {
    await this.create({
      title: 'Backup diário concluído',
      message: `Backup criado: ${backupFile}`,
      type: 'success',
    });
  }

  // Método para backup falhou
  static async notifyBackupFailed(error) {
    await this.create({
      title: 'Erro no backup',
      message: `Falha ao criar backup: ${error.message}`,
      type: 'error',
    });
  }

  // Método para notificar atividade suspeita (ex: múltiplas tentativas de login)
  static async notifySuspiciousActivity(user, ip, attempts) {
    await this.create({
      title: 'Atividade suspeita',
      message: `${user.email} excedeu ${attempts} tentativas de login a partir do IP ${ip}.`,
      type: 'warning',
      createdBy: user._id,
    });
  }

  /**
   * Notificar tentativa de login suspeita (múltiplas falhas)
   * @param {Object} user
   * @param {string} ip
   * @param {Object} ipDetails
   * @param {Object} device
   * @param {number} attempts
   */
  static async notifySuspiciousLogin(user, ip, ipDetails, device, attempts) {
    await this.create({
      title: '⚠️ Tentativa de acesso suspeita',
      message: `Utilizador: ${user.email}\nIP: ${ip}\nLocalização: ${ipDetails.location}\nDispositivo: ${device.device} (${device.browser}/${device.os})\nTentativas: ${attempts}`,
      type: 'warning',
      createdBy: user._id,
    });
  }

  /**
   * Notificar acesso não autorizado (ex: rota admin sem permissão)
   * @param {Object} user
   * @param {string} ip
   * @param {Object} ipDetails
   * @param {Object} device
   * @param {string} route
   */
  static async notifyUnauthorizedAccess(user, ip, ipDetails, device, route) {
    await this.create({
      title: '🚨 Acesso não autorizado',
      message: `Utilizador: ${user.email}\nIP: ${ip}\nLocalização: ${ipDetails.location}\nDispositivo: ${device.device} (${device.browser}/${device.os})\nRota: ${route}`,
      type: 'error',
      createdBy: user._id,
    });
  }

  /**
   * Notificar mudança de role para admin (ou outro evento sensível)
   * @param {Object} targetUser
   * @param {Object} changedBy
   * @param {string} ip
   * @param {Object} ipDetails
   */
  static async notifyRoleChange(targetUser, changedBy, ip, ipDetails) {
    await this.create({
      title: '🔐 Alteração de permissões',
      message: `Utilizador ${targetUser.email} foi promovido a ${targetUser.role} por ${changedBy.email}\nIP do admin: ${ip}\nLocalização: ${ipDetails.location}`,
      type: 'warning',
      createdBy: changedBy._id,
    });
  }

  /**
   * Notificar alteração de definições de segurança
   * @param {Object} user
   * @param {string} settingName
   * @param {any} oldValue
   * @param {any} newValue
   * @param {string} ip
   * @param {Object} ipDetails
   */
  static async notifySecuritySettingChange(user, settingName, oldValue, newValue, ip, ipDetails) {
    await this.create({
      title: '⚙️ Configuração de segurança alterada',
      message: `Administrador: ${user.email}\nIP: ${ip}\nLocalização: ${ipDetails.location}\nConfiguração: ${settingName}\nAntes: ${JSON.stringify(oldValue)}\nDepois: ${JSON.stringify(newValue)}`,
      type: 'warning',
      createdBy: user._id,
    });
  }
}
module.exports = AdminNotificationService;