const SystemSetting = require('../models/SystemSetting');

let cache = null;
let cacheTime = 0;
const CACHE_TTL = 60 * 1000; // 1 minuto

async function getSettings() {
  const now = Date.now();
  if (cache && (now - cacheTime) < CACHE_TTL) return cache;
  let settings = await SystemSetting.findOne();
  if (!settings) settings = await SystemSetting.create({});
  cache = settings;
  cacheTime = now;
  return settings;
}

function clearCache() {
  cache = null;
  cacheTime = 0;
}

module.exports = { getSettings, clearCache };