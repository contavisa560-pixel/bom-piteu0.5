const { uploadToCloudflare } = require("../services/storageService");

/**
 * Salva imagem do chat no Cloudflare e retorna URL
 */
async function saveChatImage(imageData, userId) {
  try {
    let buffer, fileName;
    
    if (imageData.startsWith('data:')) {
      // Base64
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
      buffer = Buffer.from(base64Data, 'base64');
      fileName = `chat-${userId}-${Date.now()}.jpg`;
    } else if (imageData instanceof Buffer) {
      // Buffer
      buffer = imageData;
      fileName = `chat-${userId}-${Date.now()}.jpg`;
    } else {
      // Já é URL
      return imageData;
    }
    
    // Faz upload para pasta específica de chat
    const url = await uploadToCloudflare(buffer, fileName, 'chat-images');
    return url;
  } catch (error) {
    console.error("Erro ao salvar imagem do chat:", error);
    return null;
  }
}

/**
 * Gera URL de thumbnail (opcional - pode ser feito via Cloudflare Transformations)
 */
function generateThumbnailUrl(cloudflareUrl, width = 300) {
  if (!cloudflareUrl) return null;
  
  // Cloudflare Images Transformations
  // https://developers.cloudflare.com/images/transform-images/
  return `${cloudflareUrl}?width=${width}&quality=70&format=webp`;
}

module.exports = {
  saveChatImage,
  generateThumbnailUrl
};