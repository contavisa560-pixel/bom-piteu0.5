// src/utils/imageUtils.js

export const normalizeImageUrl = (url) => {
  if (!url || url === 'undefined' || url === 'null') return null;
  
  // Se já é URL completa
  if (url.startsWith('http')) return url;
  
  // Se é um caminho do Cloudflare sem protocolo
  const cfAccountHash = import.meta.env.VITE_CF_ACCOUNT_HASH;
  if (cfAccountHash && url.includes('/')) {
    return `https://imagedelivery.net/${cfAccountHash}/${url}/public`;
  }
  
  // Se é apenas um hash/ID
  if (cfAccountHash && url.length > 10 && !url.includes('/')) {
    return `https://imagedelivery.net/${cfAccountHash}/${url}/public`;
  }
  
  return url;
};

export const extractCfImageId = (url) => {
  if (!url) return null;
  
  // Extrai ID do Cloudflare URL
  const cfMatch = url.match(/imagedelivery\.net\/[^/]+\/([^/]+)/);
  if (cfMatch) return cfMatch[1];
  
  // Se já é um ID simples
  if (!url.includes('/') && url.length > 10) return url;
  
  return null;
};

// Função para garantir que todas as imagens de uma receita são permanentes
export const ensureRecipeImagesArePermanent = (recipe) => {
  if (!recipe) return recipe;
  
  const processedRecipe = { ...recipe };
  
  // Processa imagem final
  if (processedRecipe.finalImage) {
    processedRecipe.finalImage = normalizeImageUrl(processedRecipe.finalImage);
  }
  
  // Processa passos
  if (Array.isArray(processedRecipe.steps)) {
    processedRecipe.steps = processedRecipe.steps.map(step => ({
      ...step,
      imageUrl: normalizeImageUrl(step.imageUrl)
    }));
  }
  
  return processedRecipe;
};