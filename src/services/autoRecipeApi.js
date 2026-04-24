const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// 🔥 FUNÇÃO AUXILIAR PARA REQUISIÇÕES
const makeRequest = async (method, endpoint, data = null, language = 'pt') => {
  const token = localStorage.getItem('bomPiteuToken');
  const headers = {
    'Authorization': token ? `Bearer ${token}` : '',
    'Accept-Language': language,
  };

  if (!(data instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // Injecta language no body se for JSON (não FormData)
  let bodyData = data;
  if (data && !(data instanceof FormData)) {
    bodyData = { ...data, language };
  }

  const config = {
    method,
    headers,
  };

  if (bodyData) {
    config.body = bodyData instanceof FormData ? bodyData : JSON.stringify(bodyData);
  }

  const res = await fetch(`${API_URL}/api${endpoint}`, config);

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`❌ Erro ${res.status} em ${endpoint}:`, errorText);
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  return res.json();
};

/**
 * 1️⃣ Envia imagem → opções
 */
export async function uploadImageForOptions(file, language = 'pt') {
  const formData = new FormData();
  formData.append("image", file);
  return makeRequest('POST', "/auto-recipe/options", formData, language);
}

/**
 * 2️⃣ Envia texto → opções
 */
export async function uploadTextForOptions(ingredients, category = 'general', language = 'pt') {
  const formData = new FormData();
  formData.append("ingredients", ingredients);
  if (category) formData.append("category", category);
  return makeRequest('POST', "/auto-recipe/options", formData, language);
}

/**
 * 3️⃣ Escolher receita
 */
export async function selectRecipe(sessionId, choice, language = 'pt') {
  return makeRequest('POST', "/auto-recipe/select", { sessionId, choice }, language);
}

/**
 * 4️⃣ Gerar passo
 */
export async function generateStep(sessionId, language = 'pt') {
  return makeRequest('POST', "/auto-recipe/step", { sessionId }, language);
}

/**
 * 5️⃣ Usuário quer fazer prato específico
 */
export async function handleDesejoPrato(pratoDesejado, ingredientesDisponiveis = null, sessionId = null, language = 'pt') {
  return makeRequest('POST', "/auto-recipe/desejo-prato", {
    pratoDesejado,
    ingredientesDisponiveis,
    sessionId
  }, language);
}

/**
 * 6️⃣ Iniciar passo a passo
 */
export async function iniciarPassoAPasso(sessionId, language = 'pt') {
  try {
    console.log("🚀 Iniciando passo a passo para sessão:", sessionId);
    return makeRequest('POST', "/auto-recipe/iniciar-passo-a-passo", { sessionId }, language);
  } catch (error) {
    console.error("❌ Erro ao iniciar passo a passo:", error);
    throw error;
  }
}

/**
 * 7️⃣ Chat livre inteligente
 */
export async function chatLivre(mensagem, sessionId = null, language = 'pt') {
  return makeRequest('POST', "/auto-recipe/chat", { mensagem, sessionId }, language);
}

/**
 * 8️⃣ Obter status da sessão
 */
export async function getSessionStatus(sessionId) {
  return makeRequest('GET', `/auto-recipe/session/${sessionId}`);
}

/**
 * 9️⃣ Pergunta sobre passo específico
 */
export async function perguntaPasso(sessionId, pergunta, language = 'pt') {
  return makeRequest('POST', "/auto-recipe/pergunta-passo", { sessionId, pergunta }, language);
}

/**
 *  Iniciar receita internacional direto ao passo a passo
 */
export async function iniciarReceitaDireta(nomeReceita, pais, language = 'pt') {
  return makeRequest('POST', "/auto-recipe/iniciar-receita-direta", {
    nomeReceita,
    pais
  }, language);
}


export default {
  uploadImageForOptions,
  uploadTextForOptions,
  selectRecipe,
  generateStep,
  handleDesejoPrato,
  iniciarPassoAPasso,
  chatLivre,
  getSessionStatus,
  perguntaPasso,
  iniciarReceitaDireta 
};