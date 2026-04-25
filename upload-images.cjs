const { S3Client, PutObjectCommand } = require("./smartchef_backend/node_modules/@aws-sdk/client-s3");
const path = require("path");
const fs = require("fs");
require("./smartchef_backend/node_modules/dotenv").config({ 
  path: "./smartchef_backend/.env" 
});
const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const uploadImages = async () => {
  const publicFolder = path.join(__dirname, "public");
  const files = fs.readdirSync(publicFolder)
    .filter(f => f.endsWith(".png") || f.endsWith(".jpg") || 
                 f.endsWith(".jpeg") || f.endsWith(".webp"));

  console.log(`📸 Encontradas ${files.length} imagens`);

  for (const file of files) {
    const filePath = path.join(publicFolder, file);
    const buffer = fs.readFileSync(filePath);
    const ext = path.extname(file).toLowerCase();
    const contentType = ext === '.png' ? 'image/png' : 
                        ext === '.webp' ? 'image/webp' : 'image/jpeg';

    const params = {
      Bucket: process.env.R2_BUCKET_NAME,
      Key: `public-images/${file}`,
      Body: buffer,
      ContentType: contentType,
    };

    try {
      await s3Client.send(new PutObjectCommand(params));
      console.log(`✅ ${file}`);
    } catch (err) {
      console.error(`❌ Erro em ${file}:`, err.message);
    }
  }

  console.log("🎉 Upload concluído!");
  console.log(`🔗 Base URL: ${process.env.R2_PUBLIC_URL}/public-images/`);
};

uploadImages();