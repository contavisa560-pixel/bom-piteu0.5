const express = require("express");
const { callOpenAIText, callOpenAIImage } = require("../services/openaiClients");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const Observacao = require("../models/Observacao");
const { uploadToCloudflare } = require("../services/storageService");

function inferirTags(recipeData) {
    const tags = [];
    if (!recipeData) return tags;

    const titulo = (recipeData.title || '').toLowerCase();
    const ingredientes = (recipeData.ingredients || []).join(' ').toLowerCase();

    //  PALAVRAS‑CHAVE PARA DOCE
    const doces = [
        'bolo', 'bolinhos', 'queque', 'muffin', 'cupcake', 'pão de ló',
        'tarte', 'torta', 'pastel', 'empada', 'charlote',
        'pudim', 'flan', 'mousse', 'gelado', 'sorvete',
        'doce', 'compota', 'geleia', 'creme', 'chantilly',
        'chocolate', 'baunilha', 'canela', 'caramelo', 'mel', 'açúcar',
        'fruta', 'maçã', 'laranja', 'banana', 'morango', 'coco',
        'leite condensado', 'natas', 'iogurte',
        'bombom', 'trufa', 'biscoito', 'cookie', 'brownie'
    ];

    //  PALAVRAS‑CHAVE PARA SALGADO
    const salgados = [
        'carne', 'bife', 'vaca', 'porco', 'frango', 'galinha', 'peru', 'pato',
        'peixe', 'bacalhau', 'atum', 'salmão', 'camarão', 'marisco', 'polvo', 'lula',
        'calulu', 'moamba', 'mufete', 'funge', 'muamba', 'quizaca', 'kitaba',
        'arroz', 'massa', 'esparguete', 'macarrão', 'lasanha', 'nhoque',
        'feijão', 'grão', 'lentilha', 'soja', 'tofu',
        'batata', 'mandioca', 'milho', 'legumes', 'cenoura', 'tomate', 'cebola', 'alho',
        'queijo', 'fiambre', 'presunto', 'salsicha', 'linguiça', 'chouriço',
        'sopa', 'caldo', 'ensopado', 'estufado', 'assado', 'grelhado', 'frito',
        'omelete', 'torta salgada', 'quiche', 'pizza', 'empadão', 'pastel de carne'
    ];

    if (doces.some(palavra => titulo.includes(palavra) || ingredientes.includes(palavra))) {
        tags.push('doce');
    }
    if (salgados.some(palavra => titulo.includes(palavra) || ingredientes.includes(palavra))) {
        tags.push('salgado');
    }

    return tags;
}

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});


const { iniciarDeObservacao } = require("../controllers/autoRecipeController");

// Criar nova observação (Upload de imagem + OCR opcional) - COM R2
router.post("/", upload.single("image"), async (req, res) => {
    try {
        let recipeData = null;
        let imageUrl = null;

        // Se tem imagem, faz upload para R2
        if (req.file) {
            // 1. Upload para Cloudflare R2
            const publicUrl = await uploadToCloudflare(
                req.file.buffer,
                req.file.originalname,
                'observacoes' // pasta no R2
            );
            imageUrl = publicUrl;
        }

        // Se o usuário quer extrair os dados da imagem via IA
        if (req.body.extractRecipe === "true" && req.file) {
            // Converter buffer para base64
            const imageData = req.file.buffer.toString('base64');

            // Usar a função importada
            const recipeText = await callOpenAIImage(imageData);

            // Tentar parsear o JSON (ajuste conforme o retorno real da OpenAI)
            try {
                recipeData = JSON.parse(recipeText);
            } catch (e) {
                // Se falhar, tenta extrair JSON do texto
                const jsonMatch = recipeText.match(/\{.*\}/s);
                recipeData = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
            }
        }

        const novaObs = new Observacao({
            userId: req.body.userId,
            imageUrl: imageUrl || "", // URL do R2 ou vazio
            imageType: req.body.imageType || "recipe",
            tags: req.body.tags ? req.body.tags.split(",") : [],
            recipeData: recipeData
        });
        // INFERIR TAGS AUTOMATICAMENTE (DOCE / SALGADO)
        const tagsInferidas = inferirTags(recipeData);
        const tagsExistentes = novaObs.tags || [];
        novaObs.tags = [...new Set([...tagsExistentes, ...tagsInferidas])];
        await novaObs.save();
        res.status(201).json(novaObs);
    } catch (err) {
        console.error("❌ ERRO criar observação:", err);
        res.status(500).json({ error: err.message });
    }
});


router.post("/:id/enviar-assistente", async (req, res) => {
    try {
        const obs = await Observacao.findById(req.params.id);
        if (!obs || !obs.recipeData) {
            return res.status(400).json({ error: "Esta imagem ainda não tem dados de receita extraídos." });
        }

        // 🔥 Cria a sessão de cozinha guiada
        const session = await iniciarDeObservacao(req.user?.id || obs.userId, obs);

        // ✅ Resposta EXACTAMENTE no formato que o frontend espera
        res.json({
            tipo: "guided_cooking",
            sessionId: session._id.toString(),
            receita: {
                title: session.selectedRecipe.title,
                totalSteps: session.selectedRecipe.steps.length,
                ingredients: session.selectedRecipe.ingredients,
                steps: session.selectedRecipe.steps
            },
            mensagemInicial: `Vamos cozinhar "${session.selectedRecipe.title}"! Pressiona "Próximo Passo" para começarmos.`,
            podeIniciarPassoAPasso: true,
            acaoSugerida: "chamar_proximo_passo"
        });

    } catch (err) {
        console.error("❌ ERRO ao iniciar cozinha guiada da observação:", err);
        res.status(500).json({ error: err.message });
    }
});

// Listar com filtros
router.get("/", async (req, res) => {
    try {
        const { userId, tags, type } = req.query;

        // userId é obrigatório
        if (!userId) {
            return res.status(400).json({ error: "userId é obrigatório" });
        }

        let query = { userId };

        if (tags) query.tags = { $in: tags.split(",") };
        if (type) query.imageType = type;

        const lista = await Observacao.find(query).sort({ createdAt: -1 });
        res.json(lista);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// reação rápida (emoji)
router.post("/:id/reaction", async (req, res) => {
    try {
        const { emoji, comment } = req.body;
        const observacao = await Observacao.findById(req.params.id);

        if (!observacao) {
            return res.status(404).json({ error: "Observação não encontrada" });
        }

        observacao.notes.push({
            content: comment || "",
            type: "sensation",
            emoji: emoji
        });

        await observacao.save();
        res.json(observacao);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Marcar como favorita
router.post("/:id/favorite", async (req, res) => {
    try {
        const observacao = await Observacao.findById(req.params.id);
        if (!observacao) return res.status(404).json({ error: "Observação não encontrada" });

        observacao.favorite = !observacao.favorite; // Toggle
        await observacao.save();

        res.json({ favorite: observacao.favorite });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Atualizar status readyToCook 
router.patch("/:id", async (req, res) => {
    try {
        const { readyToCook } = req.body;
        const observacao = await Observacao.findById(req.params.id);

        if (!observacao) {
            return res.status(404).json({ error: "Observação não encontrada" });
        }

        observacao.readyToCook = readyToCook;
        await observacao.save();

        res.json(observacao);
    } catch (err) {
        console.error("❌ ERRO ao atualizar readyToCook:", err);
        res.status(500).json({ error: err.message });
    }
});

// Filtrar por data
router.get("/filter/date", async (req, res) => {
    try {
        const { range } = req.query; // "week", "month", "year"
        let dateFilter = {};

        const now = new Date();
        switch (range) {
            case "week":
                dateFilter = { createdAt: { $gte: new Date(now.setDate(now.getDate() - 7)) } };
                break;
            case "month":
                dateFilter = { createdAt: { $gte: new Date(now.setMonth(now.getMonth() - 1)) } };
                break;
            case "year":
                dateFilter = { createdAt: { $gte: new Date(now.setFullYear(now.getFullYear() - 1)) } };
                break;
        }

        const lista = await Observacao.find(dateFilter).sort({ createdAt: -1 });
        res.json(lista);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Filtrar por status
router.get("/filter/status", async (req, res) => {
    try {
        const { status } = req.query; // "favorites", "readyToCook"
        let query = {};

        switch (status) {
            case "favorites":
                query.favorite = true;
                break;
            case "readyToCook":
                query.readyToCook = { $in: ["now", "later"] };
                break;
        }

        const lista = await Observacao.find(query).sort({ createdAt: -1 });
        res.json(lista);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// routes/observacoes.js - ADICIONE ESTA ROTA NO FINAL (antes de module.exports)

// ROTA PARA CRIAR OBSERVAÇÃO VIA JSON (sem upload de imagem)
router.post("/json", async (req, res) => {
    try {
        console.log(" Criando observação via JSON:", req.body);

        const { userId, imageUrl, imageType, tags, recipeData } = req.body;

        if (!userId) {
            return res.status(400).json({ error: "userId é obrigatório" });
        }

        const novaObs = new Observacao({
            userId,
            imageUrl: imageUrl || "/uploads/default.jpg",
            imageType: imageType || "recipe",
            tags: tags ? (Array.isArray(tags) ? tags : tags.split(",")) : [],
            recipeData: recipeData || null
        });
        // INFERIR TAGS AUTOMATICAMENTE (DOCE / SALGADO)
        const tagsInferidas = inferirTags(recipeData);
        const tagsExistentes = novaObs.tags || [];
        novaObs.tags = [...new Set([...tagsExistentes, ...tagsInferidas])];
        await novaObs.save();

        console.log("✅ Observação criada:", novaObs._id);
        res.status(201).json(novaObs);
    } catch (err) {
        console.error("❌ ERRO criar observação JSON:", err);
        res.status(500).json({ error: err.message });
    }
});

// ===== REGISTAR CONSUMO DE RECEITA (PARA SAÚDE) =====
router.post("/:id/register-consumption", async (req, res) => {
    try {
        const observacao = await Observacao.findById(req.params.id);
        if (!observacao) {
            return res.status(404).json({ error: "Observação não encontrada" });
        }

        // Aqui podes chamar um método do IntegrationService ou criar lógica direta
        // Vamos criar uma função nova no IntegrationService: registerRecipeConsumption
        const resultado = await IntegrationService.registerRecipeConsumption({
            userId: req.body.userId,
            recipeData: observacao.recipeData,
            ate: req.body.ate !== false // default true
        });

        res.json(resultado);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.patch("/:id/tags", async (req, res) => {
    try {
        const { tags } = req.body; 
        const observacao = await Observacao.findById(req.params.id);

        if (!observacao) {
            return res.status(404).json({ error: "Observação não encontrada" });
        }

        const outrasTags = observacao.tags.filter(t => t !== 'doce' && t !== 'salgado');
        const novasTags = [...new Set([...outrasTags, ...tags])]; 

        observacao.tags = novasTags;
        await observacao.save();

        res.json({ success: true, tags: observacao.tags });
    } catch (err) {
        console.error("❌ ERRO ao atualizar tags:", err);
        res.status(500).json({ error: err.message });
    }
});
module.exports = router;
