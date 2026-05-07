// src/services/settingsApi.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ==================== AUXILIARES ====================

export function getAuthHeader() {
    const token = localStorage.getItem('bomPiteuToken');
    return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : null;
}

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
    restrictionsInSuggestions: true,
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
    const key = userId ? `smartchef_settings_${userId}` : 'smartchef_settings';

    if (!userId || !headers) {
        const local = localStorage.getItem(key);
        return local ? JSON.parse(local) : { ...DEFAULT_SETTINGS };
    }

    try {
        const res = await fetch(`${API_URL}/api/users/${userId}/settings`, { method: 'GET', headers });
        const data = await handleResponse(res);
        const returned = data.settings || data;
        const merged = {
            ...DEFAULT_SETTINGS,
            ...returned,
            restrictionsInSuggestions: returned.restrictionsInSuggestions !== undefined
                ? returned.restrictionsInSuggestions
                : DEFAULT_SETTINGS.restrictionsInSuggestions,
        };
        localStorage.setItem(key, JSON.stringify(merged));
        return merged;
    } catch (err) {
        console.warn('⚠️ Backend offline ou erro, usando localStorage:', err.message);
        const local = localStorage.getItem(key);
        return local ? JSON.parse(local) : { ...DEFAULT_SETTINGS };
    }
}

export async function saveSettings(settings) {
    const userId = getCurrentUserId();
    const headers = getAuthHeader();
    const key = userId ? `smartchef_settings_${userId}` : 'smartchef_settings';

    localStorage.setItem(key, JSON.stringify(settings));

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
        const returned = data.settings || data;
        const merged = {
            ...DEFAULT_SETTINGS,
            ...returned,
            // Campos booleanos: se o servidor devolveu explicitamente, usar esse valor
            restrictionsInSuggestions: returned.restrictionsInSuggestions !== undefined
                ? returned.restrictionsInSuggestions
                : DEFAULT_SETTINGS.restrictionsInSuggestions,
        };
        localStorage.setItem(key, JSON.stringify(merged));
        return merged;
    } catch (err) {
        console.warn('⚠️ Não foi possível salvar no backend, mantendo localStorage:', err.message);
        return settings;
    }
}

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

export function applyTheme(theme) {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    const userId = getCurrentUserId();
    localStorage.setItem(userId ? `smartchef_theme_${userId}` : 'smartchef_theme', theme);
}

export function applyLanguage(language) {
    if (window.i18n && window.i18n.changeLanguage) window.i18n.changeLanguage(language);
    document.documentElement.lang = language;
    const userId = getCurrentUserId();
    localStorage.setItem(userId ? `smartchef_language_${userId}` : 'smartchef_language', language);
}

export async function syncSettings() {
    const userId = getCurrentUserId();
    const key = userId ? `smartchef_settings_${userId}` : 'smartchef_settings';
    try {
        const backend = await getSettings();
        const local = JSON.parse(localStorage.getItem(key) || '{}');
        const merged = {
            ...local, ...backend,
            restrictionsInSuggestions: backend.restrictionsInSuggestions !== undefined
                ? backend.restrictionsInSuggestions
                : local.restrictionsInSuggestions
        };
        localStorage.setItem(key, JSON.stringify(merged));
        if (merged.theme) applyTheme(merged.theme);
        if (merged.language) applyLanguage(merged.language);
        return merged;
    } catch {
        const local = JSON.parse(localStorage.getItem(key) || '{}');
        if (local.theme) applyTheme(local.theme);
        if (local.language) applyLanguage(local.language);
        return local || DEFAULT_SETTINGS;
    }
}

export const updateSettings = saveSettings;