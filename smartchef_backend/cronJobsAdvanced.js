const cron = require("node-cron");
const fs = require("fs");
const path = require("path");
const User = require("./models/User");

const UPLOAD_DIR = path.join(__dirname, "uploads");
const BACKUP_DIR = path.join(__dirname, "backups");

// Garante que a pasta de backups existe
if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

/**
 * 1️⃣ MANUTENÇÃO DIÁRIA: RESET DE LIMITES E DOWNGRADE (Ponto 2 do roteiro)
 * Executa todos os dias às 00:00
 */
const dailyUserMaintenance = async () => {
  try {
    const agora = new Date();

    // Reset de limites diários
    await User.updateMany(
      {},
      {
        $set: {
          "usage.dailyTextRequests": 0,
          "usage.dailyImageGenerations": 0,
          "usage.dailyImageAnalysis": 0,
          lastReset: agora,
        },
      }
    );

    // Verificação de Expiração Premium e Downgrade Automático
    const expired = await User.updateMany(
      {
        isPremium: true,
        premiumExpiresAt: { $lt: agora, $ne: null }
      },
      {
        $set: { 
          isPremium: false, 
          premiumExpiresAt: null,
          // Retorna aos limites básicos de FREE
          "limits.textLimit": 7,
          "limits.imageLimit": 2
        }
      }
    );

    console.log(`✅ Manutenção de usuários concluída. Downgrades: ${expired.modifiedCount}`);
  } catch (err) {
    console.error("❌ Erro na manutenção diária:", err.message);
  }
};
cron.schedule("0 0 * * *", dailyUserMaintenance);

/**
 * 2️⃣ LIMPEZA DE FICHEIROS TEMPORÁRIOS (Ponto 2.3 do roteiro)
 * Remove uploads locais usados apenas para análise de IA após 24h
 */
const cleanTempUploads = () => {
  try {
    const files = fs.readdirSync(UPLOAD_DIR);
    const agora = Date.now();
    let contagem = 0;

    files.forEach(file => {
      const filePath = path.join(UPLOAD_DIR, file);
      const stats = fs.statSync(filePath);
      
      // Se o ficheiro tem mais de 24 horas, apaga
      if (agora - stats.mtimeMs > 24 * 60 * 60 * 1000) {
        fs.unlinkSync(filePath);
        contagem++;
      }
    });
    console.log(`🗑️ Limpeza de temporários: ${contagem} ficheiros removidos.`);
  } catch (err) {
    console.error("❌ Erro ao limpar ficheiros:", err.message);
  }
};
cron.schedule("0 1 * * *", cleanTempUploads);

/**
 * 3️⃣ BACKUP DIÁRIO E ESTRUTURADO (Ponto 5 - Segurança)
 * Backup em JSON organizado por pastas de ano-mês
 */
const backupDatabase = async () => {
  try {
    const users = await User.find();
    const agora = new Date();
    const folderName = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}`;
    const targetDir = path.join(BACKUP_DIR, folderName);

    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    const fileName = `db-backup-${agora.toISOString().split('T')[0]}.json`;
    fs.writeFileSync(path.join(targetDir, fileName), JSON.stringify(users, null, 2));
    
    console.log("💾 Backup diário concluído.");
  } catch (err) {
    console.error("❌ Erro no backup:", err.message);
  }
};
cron.schedule("0 2 * * *", backupDatabase);

module.exports = {
  dailyUserMaintenance,
  cleanTempUploads,
  backupDatabase
};