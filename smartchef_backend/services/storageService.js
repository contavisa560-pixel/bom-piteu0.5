const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const path = require("path");

// Configuração do cliente para Cloudflare R2
const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

/**
 * Faz upload de um buffer para o Cloudflare R2
 * @param {Buffer} fileBuffer - O conteúdo do ficheiro
 * @param {String} fileName - Nome original do ficheiro
 * @param {String} folder - Pasta dentro do bucket (ex: 'avatars', 'recipes')
 */
exports.uploadToCloudflare = async (fileBuffer, fileName, folder = "uploads") => {
  const fileKey = `${folder}/${Date.now()}-${path.basename(fileName)}`;

  const params = {
    Bucket: process.env.R2_BUCKET_NAME,
    Key: fileKey,
    Body: fileBuffer,
    ContentType: "image/jpeg", 
  };

  try {
    await s3Client.send(new PutObjectCommand(params));
    // Retorna a URL pública que será guardada no MongoDB
    return `${process.env.R2_PUBLIC_URL}/${fileKey}`;
  } catch (err) {
    console.error("Erro no upload Cloudflare R2:", err);
    throw new Error("Falha ao subir imagem para a nuvem");
  }
};

/**
 * Salva imagem da OpenAI no Cloudflare R2 permanentemente
 * @param {String} openAiImageUrl - URL temporária da OpenAI
 * @param {String} recipeTitle - Título da receita para nome do arquivo
 * @param {String} imageType - 'final-dish', 'step', 'ingredients'
 */
exports.saveOpenAIImageToR2 = async (openAiImageUrl, recipeTitle, imageType = 'recipe') => {
  try {
    console.log(`💾 Salvando imagem OpenAI no R2: ${recipeTitle} (${imageType})`);
    
    // 1. Baixa a imagem da OpenAI
    const response = await fetch(openAiImageUrl);
    if (!response.ok) {
      throw new Error(`Falha ao baixar imagem: ${response.status}`);
    }
    
    // 2. Converte para buffer
    const imageBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(imageBuffer);
    
    // 3. Cria nome único para o arquivo
    const timestamp = Date.now();
    const safeTitle = recipeTitle
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .substring(0, 50);
    
    const fileName = `${imageType}-${safeTitle}-${timestamp}.jpg`;
    const folder = 'generated-recipes'; // Pasta específica para receitas geradas
    
    // 4. Faz upload para R2
    const r2Url = await this.uploadToCloudflare(buffer, fileName, folder);
    
    console.log(`✅ Imagem salva no R2: ${r2Url}`);
    return r2Url;
    
  } catch (error) {
    console.error('❌ Erro ao salvar imagem OpenAI no R2:', error);
    // Fallback: retorna URL original se falhar
    return openAiImageUrl;
  }
};

/**
 * Verifica se é URL da OpenAI e salva se necessário
 */
exports.ensurePermanentImageUrl = async (imageUrl, recipeTitle, imageType = 'recipe') => {
  // Se não tem URL, retorna null
  if (!imageUrl) return null;
  
  // Verifica se é URL da OpenAI (temporária)
  const isOpenAIUrl = imageUrl.includes('oaidalleapiprodscus.blob.core.windows.net');
  
  // Se não for OpenAI, já é permanente
  if (!isOpenAIUrl) {
    return imageUrl;
  }
  
  // É OpenAI - precisa salvar no R2
  console.log(`🔄 Convertendo imagem OpenAI para permanente: ${recipeTitle}`);
  try {
    const permanentUrl = await this.saveOpenAIImageToR2(imageUrl, recipeTitle, imageType);
    return permanentUrl;
  } catch (error) {
    console.error('❌ Falha ao converter imagem OpenAI:', error);
    return imageUrl; // Retorna original em caso de erro
  }
};