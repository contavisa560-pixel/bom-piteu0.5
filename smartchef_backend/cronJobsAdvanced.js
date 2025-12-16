// cronJobsAdvanced.js
const cron = require("node-cron");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { Parser } = require("json2csv");

const User = require("./models/User");

const UPLOAD_DIR = path.join(__dirname, "uploads");
const BACKUP_DIR = path.join(__dirname, "backups");

// Cria pasta de backups se não existir
if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

// ===================== 1️⃣ Reset de Limites =====================
const resetLimits = async () => {
  try {
    const users = await User.find();
    for (const u of users) {
      u.usedDaily = { text: 0, gen: 0, vision: 0 };
      u.usedWeekly = { text: 0, gen: 0, vision: 0 };
      u.lastReset = new Date();
      await u.save();
    }
    console.log("✅ Limites diários e semanais resetados");
  } catch (err) {
    console.error("Erro ao resetar limites:", err.message);
  }
};
cron.schedule("0 0 * * *", resetLimits); // Diário à meia-noite

// ===================== 2️⃣ Compressão de imagens antigas =====================
const compressOldImages = async () => {
  try {
    const files = fs.readdirSync(UPLOAD_DIR);
    for (const file of files) {
      const filePath = path.join(UPLOAD_DIR, file);
      const stats = fs.statSync(filePath);
      const ageInDays = (Date.now() - stats.mtimeMs) / (1000 * 60 * 60 * 24);
      if (ageInDays > 7) { // compressão apenas de arquivos com mais de 7 dias
        await sharp(filePath)
          .resize({ width: 1024 })
          .jpeg({ quality: 80 })
          .toBuffer()
          .then(data => fs.writeFileSync(filePath, data));
      }
    }
    console.log("🖼️ Imagens antigas comprimidas");
  } catch (err) {
    console.error("Erro ao comprimir imagens:", err.message);
  }
};
cron.schedule("0 1 * * *", compressOldImages); // Diário 01:00

// ===================== 3️⃣ Backup diário organizado por mês =====================
const backupDB = async () => {
  try {
    const users = await User.find();
    const now = new Date();
    const monthDir = path.join(BACKUP_DIR, `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`);
    if (!fs.existsSync(monthDir)) fs.mkdirSync(monthDir, { recursive: true });
    const backupPath = path.join(monthDir, `backup-${Date.now()}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(users, null, 2));
    console.log("💾 Backup diário concluído:", backupPath);
  } catch (err) {
    console.error("Erro ao criar backup:", err.message);
  }
};
cron.schedule("0 2 * * *", backupDB); // Diário 02:00

// ===================== 4️⃣ Relatório de consumo da IA em CSV =====================
const generateIAReportCSV = async () => {
  try {
    const users = await User.find();
    const report = users.map(u => ({
      email: u.email,
      daily_text: u.usedDaily?.text || 0,
      daily_gen: u.usedDaily?.gen || 0,
      daily_vision: u.usedDaily?.vision || 0,
      weekly_text: u.usedWeekly?.text || 0,
      weekly_gen: u.usedWeekly?.gen || 0,
      weekly_vision: u.usedWeekly?.vision || 0,
    }));

    const parser = new Parser();
    const csv = parser.parse(report);

    const now = new Date();
    const reportDir = path.join(BACKUP_DIR, "reports");
    if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });

    const reportPath = path.join(reportDir, `IA_report-${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${now.getDate()}.csv`);
    fs.writeFileSync(reportPath, csv);
    console.log("📊 Relatório de IA gerado:", reportPath);
  } catch (err) {
    console.error("Erro ao gerar relatório CSV:", err.message);
  }
};
cron.schedule("0 3 * * *", generateIAReportCSV); // Diário 03:00

// ===================== 5️⃣ Limpeza de usuários inativos =====================
const cleanInactiveUsers = async () => {
  try {
    const threshold = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000); // 1 ano
    const inactiveUsers = await User.find({ lastLogin: { $lt: threshold } });
    for (const u of inactiveUsers) {
      await User.deleteOne({ _id: u._id });
    }
    console.log("🗑️ Usuários inativos removidos:", inactiveUsers.length);
  } catch (err) {
    console.error("Erro ao limpar usuários inativos:", err.message);
  }
};
cron.schedule("0 4 * * 0", cleanInactiveUsers); // Semanal aos domingos 04:00

module.exports = {
  resetLimits,
  compressOldImages,
  backupDB,
  generateIAReportCSV,
  cleanInactiveUsers,
};
