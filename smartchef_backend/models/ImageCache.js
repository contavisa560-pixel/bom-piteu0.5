const mongoose = require("mongoose");

const ImageCacheSchema = new mongoose.Schema(
    {
        // Hash MD5 do prompt normalizado — chave de busca principal
        hash: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },

        // Prompt original (para debug e auditoria)
        prompt: {
            type: String,
            required: true,
        },

        // Tipo: 'final-dish' | 'step' | 'ingredients'
        imageType: {
            type: String,
            enum: ["final-dish", "step", "ingredients", "recipe"],
            default: "recipe",
        },

        // URL permanente no Cloudflare R2
        imageUrl: {
            type: String,
            required: true,
        },

        // Quantas vezes foi reutilizado (para analytics)
        hitCount: {
            type: Number,
            default: 0,
        },

        // Última vez que foi reutilizado
        lastUsedAt: {
            type: Date,
            default: Date.now,
        },

        // TTL automático: imagem expira após 90 dias sem uso
        expiresAt: {
            type: Date,
            default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        },
    },
    {
        timestamps: true,
    }
);

// Índice TTL — MongoDB apaga automaticamente documentos expirados
ImageCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("ImageCache", ImageCacheSchema);