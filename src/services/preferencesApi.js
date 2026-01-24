// src/services/preferencesApi.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * 🔐 Obtém token JWT do localStorage
 */
function getAuthHeader() {
  const token = localStorage.getItem('bomPiteuToken');
  
  if (!token) {
    console.warn('⚠️ Token não encontrado no localStorage');
    return {};
  }
  
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}

/**
 * 🚨 Trata erros de resposta HTTP
 */
async function handleResponse(response) {
  if (!response.ok) {
    let errorMessage = `Erro HTTP ${response.status}`;
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      // Não conseguiu parsear JSON
    }
    
    // Token expirado ou inválido
    if (response.status === 401) {
      console.error('❌ Token expirado ou inválido');
      localStorage.removeItem('bomPiteuToken');
      throw new Error('Sessão expirada. Faça login novamente.');
    }
    
    throw new Error(errorMessage);
  }
  
  return response.json();
}

// ==================== PREFERENCES API ====================

/**
 * 📥 GET - Buscar preferências do usuário autenticado
 */
export async function getPreferences() {
  try {
    console.log('📥 Buscando preferências...');
    
    const response = await fetch(`${API_URL}/api/preferences`, {
      method: 'GET',
      headers: getAuthHeader()
    });
    
    const result = await handleResponse(response);
    console.log('✅ Preferências carregadas');
    
    return result.data || result;
  } catch (error) {
    console.error('❌ Erro ao buscar preferências:', error);
    throw error;
  }
}

/**
 * 📤 POST - Criar/atualizar preferências (upsert)
 */
export async function savePreferences(preferences) {
  try {
    console.log('📤 Salvando preferências...');
    
    const response = await fetch(`${API_URL}/api/preferences`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(preferences)
    });
    
    const result = await handleResponse(response);
    console.log('✅ Preferências salvas');
    
    return result.data || result;
  } catch (error) {
    console.error('❌ Erro ao salvar preferências:', error);
    throw error;
  }
}

/**
 * 🔧 PATCH - Atualizar campo específico
 */
export async function updatePreferenceField(fieldName, value) {
  try {
    console.log(`🔧 Atualizando campo '${fieldName}':`, value);
    
    const response = await fetch(`${API_URL}/api/preferences`, {
      method: 'PATCH',
      headers: getAuthHeader(),
      body: JSON.stringify({ [fieldName]: value })
    });
    
    const result = await handleResponse(response);
    console.log('✅ Campo atualizado');
    
    return result.data || result;
  } catch (error) {
    console.error('❌ Erro ao atualizar campo:', error);
    throw error;
  }
}

/**
 * 🤖 GET - Buscar prompt formatado para IA
 */
export async function getPreferencesForAI() {
  try {
    const response = await fetch(`${API_URL}/api/preferences/for-ai`, {
      method: 'GET',
      headers: getAuthHeader()
    });
    
    const result = await handleResponse(response);
    console.log('✅ Prompt IA carregado');
    
    return result.prompt;
  } catch (error) {
    console.error('❌ Erro ao buscar prompt IA:', error);
    throw error;
  }
}

/**
 * 🗑️ DELETE - Resetar preferências
 */
export async function resetPreferences() {
  try {
    const response = await fetch(`${API_URL}/api/preferences`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    
    const result = await handleResponse(response);
    console.log('✅ Preferências resetadas');
    
    return result;
  } catch (error) {
    console.error('❌ Erro ao resetar preferências:', error);
    throw error;
  }
}

// ==================== HELPERS ====================

/**
 * 🔍 Valida dados de preferências antes de enviar
 */
export function validatePreferences(prefs) {
  const errors = [];
  
  // Valida macros (devem somar ~100)
  if (prefs.macros) {
    const total = (prefs.macros.carb || 0) + (prefs.macros.protein || 0) + (prefs.macros.fat || 0);
    if (total > 0 && (total < 95 || total > 105)) {
      errors.push('Macros devem somar aproximadamente 100%');
    }
  }
  
  // Valida calorias
  if (prefs.calorieTarget && (prefs.calorieTarget < 800 || prefs.calorieTarget > 5000)) {
    errors.push('Meta calórica deve estar entre 800 e 5000 kcal');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * 🧹 Limpa dados de preferências (remove campos vazios)
 */
export function cleanPreferences(prefs) {
  const cleaned = { ...prefs };
  
  // Remove arrays vazios
  if (cleaned.diets && cleaned.diets.length === 0) delete cleaned.diets;
  if (cleaned.allergies && cleaned.allergies.length === 0) delete cleaned.allergies;
  if (cleaned.intolerances && cleaned.intolerances.length === 0) delete cleaned.intolerances;
  if (cleaned.goals && cleaned.goals.length === 0) delete cleaned.goals;
  
  // Remove valores null/undefined
  Object.keys(cleaned).forEach(key => {
    if (cleaned[key] === null || cleaned[key] === undefined) {
      delete cleaned[key];
    }
  });
  
  return cleaned;
}

// ==================== ALIASES ====================

// Aliases para compatibilidade
export const updatePreferences = savePreferences;