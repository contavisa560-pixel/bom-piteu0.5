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
    ContentType: "image/jpeg", // Ou detectar dinamicamente
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