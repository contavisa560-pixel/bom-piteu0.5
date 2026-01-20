// src/services/settingsApi.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ==================== AUXILIARES ====================

/**
 * 🔐 Pega token JWT do localStorage
 */
export function getAuthHeader() {
    const token = localStorage.getItem('bomPiteuToken'); 
    return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : null;
}

/**
 * 👤 Pega ID do usuário atual
 */
export function getCurrentUserId() {
    try {
        const userStr = localStorage.getItem('bomPiteuUser') || localStorage.getItem('smartchef_user');
        if (!userStr) return null;
        const user = JSON.parse(userStr);
        return user.id || user._id || null;
    } catch {
        return null;
    }
}

/**
 * 🚨 Trata respostas HTTP
 */
async function handleResponse(response) {
    if (!response.ok) {
        let msg = `Erro HTTP ${response.status}`;
        try {
            const data = await response.json();
            msg = data.message || data.error || msg;
        } catch { }
        if (response.status === 401) {
            localStorage.removeItem('bomPiteuToken');
            localStorage.removeItem('bomPiteuUser');
            throw new Error('Sessão expirada. Faça login novamente.');
        }
        throw new Error(msg);
    }
    return response.json();
}

// ==================== DEFAULTS ====================
export const DEFAULT_SETTINGS = {
    theme: 'light',
    language: 'pt',
    compactMode: false,
    animations: true,
    dateFormat: 'dd/MM/yyyy',
    region: 'pt-AO',
    autoLock: 10,
    alertLogin: true,
    alertSecurity: true,
    notifyRecipes: true,
    newsletter: true,
    notifications: {
        email: { enabled: true, recipes: true, tips: true, promotions: false },
        push: { enabled: true, recipeReady: true, dailyTips: false },
        inApp: { sound: true, vibration: true }
    },
    security: { alertLogin: true, alertPasswordChange: true, twoFactorEnabled: false },
    privacy: { profilePublic: false, showFavorites: true, showLevel: true, allowAnalytics: true }
};

// ==================== SETTINGS API ====================

export async function getSettings() {
    const userId = getCurrentUserId();
    const headers = getAuthHeader();

    // fallback localStorage
    if (!userId || !headers) {
        const local = localStorage.getItem('smartchef_settings');
        return local ? JSON.parse(local) : { ...DEFAULT_SETTINGS };
    }

    try {
        const res = await fetch(`${API_URL}/api/users/${userId}/settings`, { method: 'GET', headers });
        const data = await handleResponse(res);
        const merged = { ...DEFAULT_SETTINGS, ...(data.settings || data) };
        localStorage.setItem('smartchef_settings', JSON.stringify(merged));
        return merged;
    } catch (err) {
        console.warn('⚠️ Backend offline ou erro, usando localStorage:', err.message);
        const local = localStorage.getItem('smartchef_settings');
        return local ? JSON.parse(local) : { ...DEFAULT_SETTINGS };
    }
}

export async function saveSettings(settings) {
    localStorage.setItem('smartchef_settings', JSON.stringify(settings));
    const userId = getCurrentUserId();
    const headers = getAuthHeader();

    console.log("🔹 userId:", userId);
    console.log("🔹 headers:", headers);
    console.log("🔹 token armazenado:", localStorage.getItem('bomPiteuUserToken'));

    if (!userId || !headers) {
        console.warn('⚠️ Usuário/token ausente, salvando apenas localmente');
        return settings;
    }

    try {
        const res = await fetch(`${API_URL}/api/users/${userId}/settings`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(settings)
        });
        const data = await handleResponse(res);
        const merged = { ...DEFAULT_SETTINGS, ...(data.settings || settings) };
        localStorage.setItem('smartchef_settings', JSON.stringify(merged));
        return merged;
    } catch (err) {
        console.warn('⚠️ Não foi possível salvar no backend, mantendo localStorage:', err.message);
        return settings;
    }
}

// Atualizações específicas
export async function updateSettingField(field, value) {
    const current = await getSettings();
    const updated = { ...current, [field]: value };
    return await saveSettings(updated);
}

export async function updateNotifications(notifications) {
    const current = await getSettings();
    const updated = { ...current, notifications: { ...(current.notifications || {}), ...notifications } };
    return await saveSettings(updated);
}

export async function updateSecurity(security) {
    const current = await getSettings();
    const updated = { ...current, security: { ...(current.security || {}), ...security } };
    return await saveSettings(updated);
}

export async function updatePrivacy(privacy) {
    const current = await getSettings();
    const updated = { ...current, privacy: { ...(current.privacy || {}), ...privacy } };
    return await saveSettings(updated);
}

// Helpers
export function applyTheme(theme) {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('smartchef_theme', theme);
}

export function applyLanguage(language) {
    if (window.i18n && window.i18n.changeLanguage) window.i18n.changeLanguage(language);
    document.documentElement.lang = language;
    localStorage.setItem('smartchef_language', language);
}

export async function syncSettings() {
    try {
        const backend = await getSettings();
        const local = JSON.parse(localStorage.getItem('smartchef_settings') || '{}');
        const merged = { ...local, ...backend };
        localStorage.setItem('smartchef_settings', JSON.stringify(merged));
        if (merged.theme) applyTheme(merged.theme);
        if (merged.language) applyLanguage(merged.language);
        return merged;
    } catch {
        const local = JSON.parse(localStorage.getItem('smartchef_settings') || '{}');
        if (local.theme) applyTheme(local.theme);
        if (local.language) applyLanguage(local.language);
        return local || DEFAULT_SETTINGS;
    }
}

// Alias
export const updateSettings = saveSettings;
