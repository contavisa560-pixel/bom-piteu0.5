// src/services/healthApi.js - VERSÃO REAL
import { getAuthHeaders } from './api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// 🔥 FUNÇÃO AUXILIAR PARA DEBUG
export const debugHealthApi = async (userId) => {
    try {
        const res = await fetch(`${API_URL}/api/saude/${userId}`, {
            headers: getAuthHeaders()
        });

        console.log('🔍 Debug Health API Response:', {
            status: res.status,
            ok: res.ok,
            url: `${API_URL}/api/saude/${userId}`
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error('❌ Health API Error:', errorText);
            throw new Error(`HTTP ${res.status}: ${errorText}`);
        }

        const data = await res.json();
        console.log('📊 Health API Data:', data);
        return data;
    } catch (error) {
        console.error('❌ Debug Health API Failed:', error);
        throw error;
    }
};

// Meu Canto de Saúde - DADOS REAIS
export const getDashboardSaude = async (userId) => {
    try {
        const res = await fetch(`${API_URL}/api/saude/${userId}`, {
            headers: getAuthHeaders()
        });

        if (!res.ok) {
            const error = await res.text();
            console.error('❌ getDashboardSaude error:', error);

            // 🔥 SE NÃO EXISTIR, CRIAR NOVO DASHBOARD
            if (res.status === 404) {
                console.log('⚠️ Dashboard não existe, criando novo...');
                return await criarNovoDashboard(userId);
            }

            throw new Error(error || `Erro ${res.status} ao buscar dados de saúde`);
        }

        const data = await res.json();
        console.log('✅ getDashboardSaude success:', data);
        return data;
    } catch (error) {
        console.error('❌ getDashboardSaude failed:', error);
        throw error;
    }
};

// 🔥 CRIAR NOVO DASHBOARD SE NÃO EXISTIR
const criarNovoDashboard = async (userId) => {
    try {
        console.log('🚀 Criando novo dashboard para:', userId);

        const novoDashboard = {
            userId,
            monthlyStats: {
                vegetablesCount: 0,
                fruitsCount: 0,
                proteinsCount: 0,
                startDate: new Date().toISOString()
            },
            limits: {
                sugar: 25,
                salt: 5,
                calories: 2000,
                sugarAlert: false,
                fatAlert: false,
                caloriesAlert: false
            },
            favoriteRecipes: [],
            mealHistory: [],
            lastUpdated: new Date().toISOString()
        };

        // Tentar salvar no backend (se a rota POST existir)
        try {
            const res = await fetch(`${API_URL}/api/saude`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(novoDashboard)
            });

            if (res.ok) {
                console.log('✅ Dashboard criado no backend');
                return await res.json();
            }
        } catch (backendError) {
            console.warn('⚠️ Não foi possível criar no backend, usando local:', backendError);
        }

        // Fallback: retornar dados locais
        return novoDashboard;

    } catch (error) {
        console.error('❌ Erro ao criar dashboard:', error);
        throw error;
    }
};

// 🔥 ADICIONAR REFEIÇÃO REAL
export const adicionarRefeicao = async (userId, mealData) => {
    try {
        console.log('🍽️ Adicionando refeição real:', mealData);

        const res = await fetch(`${API_URL}/api/saude/${userId}/meal`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                recipeId: mealData.recipeId || `recipe_${Date.now()}`,
                recipeTitle: mealData.title || 'Nova Refeição',
                mealType: mealData.mealType || 'lunch',
                date: new Date().toISOString()
            })
        });

        if (!res.ok) {
            const error = await res.text();
            throw new Error(error || 'Erro ao adicionar refeição');
        }

        return await res.json();
    } catch (error) {
        console.error('❌ adicionarRefeicao failed:', error);
        throw error;
    }
};

// 🔥 ATUALIZAR LIMITES REAIS
export const atualizarLimites = async (userId, limits) => {
    try {
        console.log('⚙️ Atualizando limites reais:', limits);

        const res = await fetch(`${API_URL}/api/saude/${userId}/limits`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(limits)
        });

        if (!res.ok) {
            const error = await res.text();
            throw new Error(error || 'Erro ao atualizar limites');
        }

        return await res.json();
    } catch (error) {
        console.error('❌ atualizarLimites failed:', error);
        throw error;
    }
};

// 🔥 ADICIONAR FAVORITO REAL
export const adicionarFavoritoSaude = async (userId, recipeData) => {
    try {
        console.log('⭐ Adicionando favorito REAL via PUT /limits');

        // STRATEGIA REAL: Atualizar o dashboard completo
        // 1. Buscar dashboard atual
        const dashboard = await getDashboardSaude(userId);

        // 2. Adicionar novo favorito
        const novosFavoritos = [
            ...(dashboard.favoriteRecipes || []),
            {
                recipeId: recipeData.recipeId || recipeData.id || `fav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,  // ← CORRIGIDO
                title: recipeData.title || 'Receita Favorita',
                imageUrl: recipeData.imageUrl || '/uploads/default-recipe.jpg',
                addedAt: new Date().toISOString()
            }
        ];

        // 3. Limitar a 10 favoritos
        const favoritosLimitados = novosFavoritos.slice(-10);

        // 4. Atualizar via rota /limits (que JÁ EXISTE)
        const res = await fetch(`${API_URL}/api/saude/${userId}/limits`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                ...dashboard.limits,
                favoriteRecipes: favoritosLimitados  // Adiciona favoritos nos limites
            })
        });

        if (!res.ok) {
            const error = await res.text();
            throw new Error(error || 'Erro ao atualizar favoritos');
        }

        return await res.json();
    } catch (error) {
        console.error('❌ adicionarFavoritoSaude REAL failed:', error);
        throw error;
    }
};
// 🔥 ADICIONAR FAVORITO VIA ROTA CORRETA (POST /favorite)
export const adicionarFavoritoReal = async (userId, recipeData) => {
    try {
        console.log('⭐ Adicionando favorito via rota POST /favorite:', recipeData);

        const res = await fetch(`${API_URL}/api/saude/${userId}/favorite`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                recipeId: recipeData.recipeId || recipeData.id || `fav_${Date.now()}`,
                title: recipeData.title || 'Receita Favorita',
                imageUrl: recipeData.imageUrl || '/uploads/default-recipe.jpg'
            })
        });

        if (!res.ok) {
            const error = await res.text();
            console.error('❌ Erro ao adicionar favorito via POST:', error);
            throw new Error(error || 'Erro ao adicionar favorito');
        }

        const data = await res.json();
        console.log('✅ Favorito adicionado via POST /favorite:', data);
        return data;
    } catch (error) {
        console.error('❌ adicionarFavoritoReal failed:', error);
        throw error;
    }
};

// 🔥 LISTAR FAVORITOS REAIS
export const listarFavoritos = async (userId) => {
    try {
        // USA A ROTA QUE EXISTE: /saude/[userId]
        const dashboard = await getDashboardSaude(userId);

        // OS FAVORITOS ESTÃO EM dashboard.favoriteRecipes
        return dashboard?.favoriteRecipes || [];
    } catch (error) {
        console.error('❌ Erro real ao buscar favoritos:', error);
        return [];
    }
};
// 🔥 GERAR RELATÓRIO REAL
export const gerarRelatorio = async (userId) => {
    try {
        const res = await fetch(`${API_URL}/api/saude/${userId}/report`, {
            headers: getAuthHeaders()
        });

        if (!res.ok) {
            const error = await res.text();
            throw new Error(error || 'Erro ao gerar relatório');
        }

        return await res.json();
    } catch (error) {
        console.error('❌ gerarRelatorio failed:', error);
        throw error;
    }
};
// 🔥 REMOVER FAVORITO REAL (CORRIGIDO)
export const removerFavoritoSaude = async (userId, favoritoId) => {
    try {
        console.log('🗑️ Removendo favorito REAL:', { userId, favoritoId });

        // AGORA USA A ROTA CORRETA: /api/saude/[userId]/favorite/[recipeId]
        const res = await fetch(`${API_URL}/api/saude/${userId}/favorite/${favoritoId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error('❌ Erro ao remover favorito:', errorText);
            throw new Error(`HTTP ${res.status}: ${errorText}`);
        }

        const data = await res.json();
        console.log('✅ Favorito removido com sucesso:', data);
        return data;

    } catch (error) {
        console.error('❌ removerFavoritoSaude failed:', error);
        throw error;
    }
};
// LIMPAR CACHE LOCAL 
export const limparCacheSaude = () => {
    console.log('🧹 Limpando cache local de saúde');
    // Isso força um recarregamento completo
    window.location.reload();
};