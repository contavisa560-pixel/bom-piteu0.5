import { useState, useEffect, useCallback } from 'react';
import { getSettings, saveSettings, DEFAULT_SETTINGS, applyTheme, applyLanguage, getCurrentUserId } from '@/services/settingsApi';

export function useSettings() {
  const [settings, setSettings] = useState({ ...DEFAULT_SETTINGS });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Carrega settings
  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSettings();
      setSettings(data);
      setHasChanges(false);
      if (data.theme) applyTheme(data.theme);
      if (data.language) applyLanguage(data.language);
      console.log('✅ Settings carregados');
    } catch (err) {
      setError(err.message);
      console.error('❌ Erro ao carregar settings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Salva settings
  const save = useCallback(async (overrideSettings) => {
    setLoading(true);
    setError(null);
    try {
      const toSave = overrideSettings || settings;
      const result = await saveSettings(toSave);
      setSettings(result);
      setHasChanges(false);
      console.log(' Settings salvos');
      return { success: true, data: result };
    } catch (err) {
      setError(err.message);
      console.error(' Erro ao salvar settings:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [settings]);

  // Atualiza campo simples
  const updateField = useCallback((field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
    if (field === 'theme') applyTheme(value);
    if (field === 'language') applyLanguage(value);
  }, []);

  // Atualiza campos aninhados (notifications, security, privacy)
  const updateNested = useCallback((path, value) => {
    setSettings(prev => {
      const copy = { ...prev };
      const keys = path.split('.');
      let obj = copy;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!obj[keys[i]]) obj[keys[i]] = {};
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return copy;
    });
    setHasChanges(true);
  }, []);

  const updateNotifications = useCallback((path, value) => updateNested(`notifications.${path}`, value), [updateNested]);
  const updateSecurity = useCallback((field, value) => updateNested(`security.${field}`, value), [updateNested]);
  const updatePrivacy = useCallback((field, value) => updateNested(`privacy.${field}`, value), [updateNested]);

  // Reseta para defaults
  const reset = useCallback(() => {
    setSettings({ ...DEFAULT_SETTINGS });
    setHasChanges(false);
    applyTheme(DEFAULT_SETTINGS.theme);
    applyLanguage(DEFAULT_SETTINGS.language);
    const userId = getCurrentUserId();
    const storageKey = userId ? `smartchef_settings_${userId}` : 'smartchef_settings';
    localStorage.setItem(storageKey, JSON.stringify(DEFAULT_SETTINGS));
  }, []);

  // Sync manual
  const sync = useCallback(async () => {
    setLoading(true);
    try {
      await loadSettings();
      console.log('✅ Settings sincronizados');
    } catch (err) {
      console.error('❌ Erro ao sincronizar:', err);
    } finally {
      setLoading(false);
    }
  }, [loadSettings]);

  // Efeito inicial
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    loading,
    error,
    hasChanges,
    load: loadSettings,
    save,
    reset,
    sync,
    updateField,
    updateNotifications,
    updateSecurity,
    updatePrivacy
  };
}
