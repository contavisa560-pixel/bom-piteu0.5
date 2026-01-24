
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ==================== FUNÇÕES AUXILIARES ====================

export function getAuthHeader() {
  const token = localStorage.getItem('bomPiteuToken');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export function getAuthHeaders(contentType = 'application/json') {
  const headers = { ...getAuthHeader() };
  if (contentType) {
    headers['Content-Type'] = contentType;
  }
  return headers;
}

export function getCurrentUserId() {
  try {
    const userStr = localStorage.getItem('bomPiteuUser') || localStorage.getItem('smartchef_user');
    if (!userStr) return null;

    const user = JSON.parse(userStr);
    return user.id || user._id || null;
  } catch (error) {
    console.error('❌ Erro ao obter ID do usuário:', error);
    return null;
  }
}
async function handleResponse(response) {
  // Primeiro, ler a resposta UMA VEZ
  let responseText = '';
  let jsonData = null;

  try {
    responseText = await response.text();
    if (responseText) {
      jsonData = JSON.parse(responseText);
    }
  } catch (parseError) {
    console.warn('⚠️ Não foi possível parsear resposta como JSON:', responseText);
  }

  console.log(`🔍 handleResponse: ${response.status}`, {
    ok: response.ok,
    statusText: response.statusText,
    data: jsonData
  });

  // ⚠️ IMPORTANTE: Erro 401 NÃO significa necessariamente sessão expirada!
  if (response.status === 401) {
    const errorMessage = jsonData?.error || jsonData?.message || `Erro ${response.status}`;
    const errorLower = errorMessage.toLowerCase();

    console.log('🔐 Analisando erro 401:', {
      message: errorMessage,
      lower: errorLower
    });

    // 🔥 CRÍTICO: Se a mensagem contém "senha" ou "password", é erro de SENHA, não de token
    const isPasswordError =
      errorLower.includes('senha') ||
      errorLower.includes('password') ||
      errorLower.includes('current') ||
      errorLower.includes('atual') ||
      errorLower.includes('incorrect') ||
      errorLower.includes('inválid');

    console.log('🔐 É erro de senha?', isPasswordError);

    if (isPasswordError) {
      // É erro de senha - manter token, retornar mensagem original
      throw new Error(errorMessage);
    } else {
      // É erro de autenticação (token inválido/expirado)
      console.log('🔐 Limpando token expirado...');
      localStorage.removeItem('bomPiteuToken');
      localStorage.removeItem('bomPiteuUser');
      throw new Error('Sessão expirada. Faça login novamente.');
    }
  }

  // Outros erros HTTP
  if (!response.ok) {
    const errorMessage = jsonData?.error || jsonData?.message || `Erro ${response.status}: ${response.statusText}`;
    throw new Error(errorMessage);
  }

  // Sucesso
  return jsonData || {};
}

// 🔧 FUNÇÃO DE DEBUG PARA VERIFICAR TOKEN
export function debugToken() {
  const token = localStorage.getItem('bomPiteuToken');

  if (!token) {
    console.log('🔴 Nenhum token encontrado');
    return null;
  }

  try {
    // Decodificar JWT sem verificar assinatura
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));

    console.log('🔐 Token Debug:', {
      userId: payload.id || payload.userId || payload.sub,
      expira: new Date(payload.exp * 1000).toLocaleString(),
      válido: payload.exp * 1000 > Date.now(),
      agora: new Date().toLocaleString()
    });

    return payload;
  } catch (error) {
    console.error('❌ Erro ao decodificar token:', error);
    return null;
  }
}
// ==================== FUNÇÕES PRINCIPAIS ====================

export async function getUser(id) {
  const res = await fetch(`${API_URL}/api/users/${id}`, {
    headers: getAuthHeaders()
  });
  return handleResponse(res);
}

export async function updateUser(id, data) {
  const res = await fetch(`${API_URL}/api/users/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

// ✅ CORRIGIDO: Upload de avatar agora usa a rota correta
export async function uploadAvatar(id, formData) {
  const res = await fetch(`${API_URL}/api/users/${id}/avatar`, {
    method: "POST",
    headers: getAuthHeader(), // Não incluir Content-Type para FormData
    body: formData,
  });
  return handleResponse(res);
}

export async function deleteUser(id) {
  const res = await fetch(`${API_URL}/api/users/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders()
  });
  return handleResponse(res);
}

export async function getUserSettings(id) {
  try {
    const res = await fetch(`${API_URL}/api/users/${id}/settings`, {
      headers: getAuthHeaders()
    });

    if (!res.ok) {
      const localSettings = localStorage.getItem('smartchef_settings');
      if (localSettings) {
        console.log('⚠️ Usando settings do localStorage como fallback');
        return { settings: JSON.parse(localSettings) };
      }
      throw new Error('Erro ao buscar configurações');
    }

    return await res.json();
  } catch (error) {
    console.error('❌ Erro ao buscar settings:', error);
    throw error;
  }
}

export async function updateUserSettings(id, settings) {
  try {
    const res = await fetch(`${API_URL}/api/users/${id}/settings`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(settings),
    });

    const result = await handleResponse(res);
    localStorage.setItem('smartchef_settings', JSON.stringify(settings));

    return result;
  } catch (error) {
    console.error('❌ Erro ao atualizar settings:', error);
    throw error;
  }
}

// ✅ CORRIGIDO: Mudar senha agora usa a rota correta
export async function changePassword(currentPassword, newPassword) {
  try {
    console.log('🔐 Iniciando mudança de senha...');

    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error('Usuário não autenticado');
    }

    console.log('📤 Enviando para:', `${API_URL}/api/users/${userId}/password`);

    const response = await fetch(`${API_URL}/api/users/${userId}/password`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    console.log('📥 Status da resposta:', response.status, response.statusText);

    // 🔥 LOG TEMPORÁRIO: Ver o cabeçalho de autorização
    const headers = getAuthHeaders();
    console.log('🔑 Headers enviados:', headers);

    const result = await handleResponse(response);
    console.log('✅ Resultado:', result);

    return result;
  } catch (error) {
    console.error('❌ Erro detalhado na mudança de senha:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    throw error;
  }
}

// ✅ CORRIGIDO: Exportar dados agora usa a rota correta
export async function exportUserData(userId) {
  try {
    const res = await fetch(`${API_URL}/api/users/${userId}/export`, {
      headers: getAuthHeaders()
    });

    if (res.ok) {
      return await res.json();
    }

    // Fallback: monta dados do localStorage
    console.log('⚠️ Usando fallback local para exportação');

    const user = JSON.parse(localStorage.getItem('bomPiteuUser') || '{}');
    const prefs = JSON.parse(localStorage.getItem('bomPiteuPreferences') || '{}');
    const settings = JSON.parse(localStorage.getItem('smartchef_settings') || '{}');

    const { password, ...safeUser } = user;

    return {
      user: safeUser,
      preferences: prefs,
      settings: settings,
      exportDate: new Date().toISOString(),
      exportVersion: '1.0',
      source: 'localStorage_fallback'
    };
  } catch (error) {
    console.error('❌ Erro ao exportar dados:', error);
    throw error;
  }
}

// Aliases
export const getSettings = getUserSettings;
export const updateSettings = updateUserSettings;
export const updateUserProfile = updateUser;

// ==================== AUTENTICAÇÃO ====================

export async function login(credentials) {
  try {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    const data = await handleResponse(res);

    if (data.token) {
      localStorage.setItem('bomPiteuToken', data.token);
    }
    if (data.user) {
      localStorage.setItem('bomPiteuUser', JSON.stringify(data.user));
    }

    return data;
  } catch (error) {
    console.error('❌ Erro no login:', error);
    throw error;
  }
}

export function isAuthenticated() {
  const token = localStorage.getItem('bomPiteuToken');
  return !!token;
}
// Atualizar experiência culinária COMPLETA
export const updateExperience = async (userId, experience) => {
  const response = await fetch(`${API_URL}/api/users/${userId}/experience`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      level: experience.level,
      years: experience.years,
      techniques: experience.techniques || [],
      equipment: experience.equipment || [],
      certifications: Array.isArray(experience.certifications)
        ? experience.certifications.map(cert => ({
          id: cert.id || `cert_${Date.now()}`,
          name: cert.name || '',
          url: cert.url || '',
          uploadedAt: cert.uploadedAt || new Date().toISOString(),
          type: cert.type || '',
          size: cert.size || 0
        }))
        : []
    })
  });

  if (!response.ok) {
    throw new Error('Erro ao atualizar experiência');
  }

  return response.json();
};
export function logout() {
  localStorage.removeItem('bomPiteuToken');
  localStorage.removeItem('bomPiteuUser');
  localStorage.removeItem('bomPiteuPreferences');
  localStorage.removeItem('smartchef_settings');
  window.location.href = '/login';
}