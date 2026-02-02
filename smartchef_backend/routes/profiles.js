const express = require("express");
const router = express.Router();
const multer = require("multer");
const Profile = require("../models/Profile");
const ai = require("../utils/openaiWrapper"); // Ajuste o caminho para o seu arquivo da OpenAI

// Configuração do Multer para salvar as fotos das receitas
const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

// 1. CRIAR PERFIL (Infantil ou Sénior)
router.post("/", async (req, res) => {
    try {
        const profile = new Profile(req.body);
        const saved = await profile.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(500).json({ error: "Erro ao criar perfil", details: err.message });
    }
});

// 2. LISTAR PERFIS POR TIPO (Para separar as páginas no Frontend)
router.get("/type/:type", async (req, res) => {
    try {
        const profiles = await Profile.find({ type: req.params.type }).sort({ createdAt: -1 });
        res.status(200).json(profiles);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. ADICIONAR RECEITA/FOTO A UM PERFIL
router.post("/:id/recipe", upload.single("image"), async (req, res) => {
    try {
        const profile = await Profile.findById(req.params.id);
        if (!profile) return res.status(404).json({ error: "Perfil não encontrado" });

        const newRecipe = {
            imageUrl: req.file ? req.file.path : "",
            mealType: req.body.mealType || "snack",
            quantity: req.body.quantity || 1,
            readyToCook: req.body.readyToCook || "false"
        };

        profile.recipes.push(newRecipe);
        await profile.save();
        res.status(201).json(profile);
    } catch (err) {
        res.status(500).json({ error: "Erro ao fazer upload da receita" });
    }
});

// 4. GERAR RECEITA ADAPTADA (Usando sua IA)
router.post("/:profileId/generate-ai", async (req, res) => {
    try {
        const profile = await Profile.findById(req.params.profileId);
        if (!profile) return res.status(404).json({ error: "Perfil não encontrado" });

        const numPeople = req.body.numberOfPeople || 1;

        const response = await ai.chat.completions.create({
            messages: [
                { 
                    role: "system", 
                    content: `Você é um nutricionista focado em público ${profile.type}.` 
                },
                { 
                    role: "user", 
                    content: `Gere uma receita para ${profile.name}, idade ${profile.age}. 
                    Restrições: ${profile.allergies.join(", ")}. 
                    Quantidade para ${numPeople} pessoas. Retorne em JSON.` 
                }
            ],
            response_format: { type: "json_object" }
        });

        res.status(200).json(JSON.parse(response.choices[0].message.content));
    } catch (err) {
        res.status(500).json({ error: "Erro na IA", details: err.message });
    }
});

module.exports = router;