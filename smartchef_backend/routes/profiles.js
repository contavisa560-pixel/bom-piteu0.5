const axios = require('axios');
const express = require("express");
const router = express.Router();
const multer = require("multer");
const Profile = require("../models/Profile");
const { callOpenAIText, callOpenAIImage } = require("../services/openaiClients");
const jwt = require("jsonwebtoken");
const authenticate = require("../middleware/auth");
router.use(authenticate);

const { uploadToCloudflare } = require("../services/storageService");
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

//  CRIAR PERFIL (Infantil ou Sénior) – COM SUPORTE A FOTO
router.post("/", upload.single("profileImage"), async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;
        if (!userId) {
            return res.status(401).json({ error: "Utilizador não autenticado" });
        }

        // Processar dados do formulário
        let profileImageUrl = "";

        if (req.file) {
            profileImageUrl = await uploadToCloudflare(
                req.file.buffer,
                req.file.originalname,
                'profile-pictures'
            );
        }

        const parseArrayField = (field) => {
            if (!field) return [];
            if (Array.isArray(field)) return field;
            try {
                return JSON.parse(field);
            } catch {
                return field.split(',').map(s => s.trim()).filter(Boolean);
            }
        };

        const allergies = parseArrayField(req.body.allergies);
        const intolerances = parseArrayField(req.body.intolerances);
        let conditions = [];
        let difficulties = [];
        let emergencyInfo = "";

        if (req.body.type === 'senior') {
            conditions = parseArrayField(req.body.conditions);
            difficulties = parseArrayField(req.body.difficulties);
            emergencyInfo = req.body.emergencyInfo || "";

        } else {
            // Para infantil, usa healthObservations diretamente
            healthObservations = parseArrayField(req.body.healthObservations);
        }

        // 3. Criar o perfil
        const profile = new Profile({
            userId,
            name: req.body.name,
            type: req.body.type,
            birthDate: req.body.birthDate,
            profileImage: profileImageUrl,
            country: req.body.country || "PT",
            allergies,
            intolerances,
            conditions,
            difficulties,
            emergencyInfo
        });

        const saved = await profile.save();
        res.status(201).json(saved);
    } catch (err) {
        console.error("❌ Erro ao criar perfil:", err);
        res.status(500).json({ error: "Erro ao criar perfil", details: err.message });
    }
});

// 2. LISTAR PERFIS POR TIPO (Para separar as páginas no Frontend)
router.get("/type/:type", async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;
        if (!userId) {
            return res.status(401).json({ error: "Utilizador não autenticado" });
        }

        const profiles = await Profile.find({
            type: req.params.type,
            userId: userId // 👈 APENAS DO UTILIZADOR LOGADO
        }).sort({ createdAt: -1 });

        res.status(200).json(profiles);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. ADICIONAR RECEITA/FOTO A UM PERFIL (Versão melhorada)
router.post("/:id/recipe", upload.single("image"), async (req, res) => {
    try {
        const profile = await Profile.findById(req.params.id);
        if (!profile) return res.status(404).json({ error: "Perfil não encontrado" });

        console.log("📸 Recebendo receita:", {
            temArquivo: !!req.file,
            body: req.body,
            contentType: req.headers['content-type']
        });

        // DETECTAR SE É JSON OU FORM-DATA
        let mealType, quantity, readyToCook, imageUrl, notes = [];

        if (req.headers['content-type']?.includes('application/json')) {
            // SE É JSON
            mealType = req.body.mealType || "snack";
            quantity = req.body.quantity || 1;
            readyToCook = req.body.readyToCook || "false";
            imageUrl = req.body.imageUrl || "/uploads/default-recipe.jpg";

            ingredients = req.body.ingredients || [];
            steps = req.body.steps || [];
            time = req.body.time || "30 min";
            difficulty = req.body.difficulty || "Média";

            // Processar notes (pode vir como string, array de strings ou array de objetos)
            if (req.body.notes) {
                if (Array.isArray(req.body.notes)) {
                    notes = req.body.notes.map(n =>
                        typeof n === 'string' ? { content: n, emoji: "" } : n
                    );
                } else if (typeof req.body.notes === 'string') {
                    notes = [{ content: req.body.notes, emoji: "" }];
                }
            }
        } else {

            mealType = req.body.mealType || "snack";
            quantity = req.body.quantity || 1;
            readyToCook = req.body.readyToCook || "false";

            // Processar notes se vier como string JSON
            if (req.body.notes) {
                try {
                    const parsedNotes = JSON.parse(req.body.notes);
                    if (Array.isArray(parsedNotes)) {
                        notes = parsedNotes.map(n =>
                            typeof n === 'string' ? { content: n, emoji: "" } : n
                        );
                    } else {
                        notes = [{ content: req.body.notes, emoji: "" }];
                    }
                } catch (e) {

                    notes = [{ content: req.body.notes, emoji: "" }];
                }
            }

            if (req.file) {
                try {
                    imageUrl = await uploadToCloudflare(
                        req.file.buffer,
                        req.file.originalname,
                        'recipe-photos'
                    );
                } catch (uploadErr) {
                    console.error("❌ Erro upload Cloudflare:", uploadErr);
                    return res.status(500).json({ error: "Erro ao fazer upload da imagem" });
                }
            } else {
                imageUrl = req.body.imageUrl || "/uploads/default-recipe.jpg";
            }
        }

        const newRecipe = {
            imageUrl: imageUrl,
            mealType: mealType,
            quantity: quantity,
            readyToCook: readyToCook,
            notes: notes,
            createdAt: new Date(),
            ingredients: ingredients,
            steps: steps,
            time: time,
            difficulty: difficulty
        };

        profile.recipes.push(newRecipe);
        await profile.save();

        // Retorna a receita criada
        const createdRecipe = profile.recipes[profile.recipes.length - 1];

        res.status(201).json({
            success: true,
            message: "Receita adicionada com sucesso",
            recipe: {
                _id: createdRecipe._id,
                imageUrl: createdRecipe.imageUrl,
                mealType: createdRecipe.mealType,
                quantity: createdRecipe.quantity,
                readyToCook: createdRecipe.readyToCook,
                createdAt: createdRecipe.createdAt,
                notes: createdRecipe.notes
            },
            profileId: profile._id,
            profileName: profile.name
        });

    } catch (err) {
        console.error("❌ ERRO ao adicionar receita:", err);
        res.status(500).json({
            error: "Erro ao salvar receita",
            details: err.message,
            tip: "Tente enviar como JSON com Content-Type: application/json"
        });
    }
});

// 3B. ADICIONAR RECEITA VIA JSON (sem upload de imagem)
router.post("/:id/recipe-json", async (req, res) => {
    try {
        const profile = await Profile.findById(req.params.id);
        if (!profile) return res.status(404).json({ error: "Perfil não encontrado" });

        const { mealType = "snack", quantity = 1, readyToCook = "false", imageUrl } = req.body;

        const newRecipe = {
            imageUrl: imageUrl || "/uploads/default-recipe.jpg",
            mealType: mealType,
            quantity: quantity,
            readyToCook: readyToCook,
            notes: notes,
            createdAt: new Date(),
            ingredients: ingredients,
            steps: steps,
            time: time,
            difficulty: difficulty
        };

        profile.recipes.push(newRecipe);
        await profile.save();

        const createdRecipe = profile.recipes[profile.recipes.length - 1];

        res.status(201).json({
            success: true,
            recipe: createdRecipe,
            profile: {
                id: profile._id,
                name: profile.name,
                type: profile.type
            }
        });

    } catch (err) {
        console.error("Erro recipe-json:", err);
        res.status(500).json({
            error: "Erro ao adicionar receita",
            details: err.message
        });
    }
});
// 4. GERAR RECEITA ADAPTADA (Usando sua IA)

// 🚀 VERSÃO SIMPLIFICADA E FUNCIONAL
router.post("/:profileId/generate-ai", async (req, res) => {
    try {
        console.log("🎯 GERANDO RECEITA ADAPTADA PARA PERFIL");

        const profile = await Profile.findById(req.params.profileId);
        if (!profile) return res.status(404).json({ error: "Perfil não encontrado" });

        const { numberOfPeople = 1, theme, color, availableIngredients = [], userRequest, mealType } = req.body;

        const allergies = profile.allergies || [];
        const intolerances = profile.intolerances || [];
        const conditions = profile.healthObservations || [];
        const country = profile.country || "Portugal";

        const prompt = `Gere uma receita COMPLETA em formato JSON para:
        
PESSOA: ${profile.name}
IDADE: ${profile.age} anos
TIPO: ${profile.type} (${profile.type === 'infantil' ? 'criança' : 'idoso'})
PAÍS: ${country}
PORÇÕES: ${numberOfPeople}
${theme ? `TEMA: ${theme}` : ''}
${color ? `COR PREFERIDA: ${color}` : ''}
${mealType ? `TIPO DE REFEIÇÃO: ${mealType}` : ''}
${userRequest ? `PEDIDO DO USUÁRIO: "${userRequest}"` : ''}


RESTRIÇÕES DE SAÚDE:
${allergies.length > 0 ? `• Alergias: ${allergies.join(', ')}` : '• Nenhuma alergia'}
${intolerances.length > 0 ? `• Intolerâncias: ${intolerances.join(', ')}` : '• Nenhuma intolerância'}
${conditions.length > 0 ? `• Condições: ${conditions.join(', ')}` : '• Nenhuma condição especial'}

${availableIngredients.length > 0 ?
                `INGREDIENTES DISPONÍVEIS: ${availableIngredients.join(', ')}` :
                '• Use ingredientes comuns e saudáveis'}

INSTRUÇÕES PARA A RECEITA:
1. Totalmente segura para as restrições acima
2. ${profile.type === 'infantil' ? 'Divertida e atrativa para crianças' : 'Fácil de mastigar e digerir para idosos'}
3. Nutritiva e balanceada
4. Com tempo de preparo realista
5. Em português de Portugal
${userRequest ? `6. Atenda ao pedido do usuário: "${userRequest}"` : ''}

FORMATO EXATO DO JSON (OBRIGATÓRIO):
{
  "title": "Nome criativo da receita",
  "description": "Breve descrição",
  "ingredients": ["lista", "exata", "de", "ingredientes"],
  "steps": ["Passo 1 detalhado", "Passo 2 detalhado", "Passo 3 detalhado"],
  "time": "XX min",
  "difficulty": "Fácil/Média/Difícil",
  "nutritionalInfo": {
    "calories": "XXX kcal",
    "sugar": "Baixo/Médio/Alto",
    "salt": "Baixo/Médio/Alto"
  },
  "adaptations": ["Adaptação 1", "Adaptação 2"]
}

OBRIGATÓRIO: Responda APENAS com o JSON acima, sem texto adicional.`;

        console.log("🤖 Chamando IA para gerar JSON...");
        const aiResponse = await callOpenAIText(
            prompt,
            null,
            "Você é um gerador de receitas que SEMPRE responde APENAS com JSON válido, sem texto adicional, sem explicações."
        );

        console.log("📄 Resposta bruta:", aiResponse.raw.substring(0, 300) + "...");

        // Parse da resposta
        let recipeData;
        try {
            recipeData = JSON.parse(aiResponse.raw);
        } catch (e1) {
            console.log("⚠️ Parse direto falhou, extraindo JSON...");
            const jsonMatch = aiResponse.raw.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    recipeData = JSON.parse(jsonMatch[0]);
                } catch (e2) {
                    console.error("❌ JSON inválido:", e2.message);
                    recipeData = criarReceitaFallbackPerfil(profile, numberOfPeople, theme);
                }
            } else {
                console.error("❌ Nenhum JSON encontrado");
                recipeData = criarReceitaFallbackPerfil(profile, numberOfPeople, theme);
            }
        }

        // Validar estrutura
        if (!recipeData.title) recipeData.title = `Receita para ${profile.name}`;
        if (!recipeData.ingredients || !Array.isArray(recipeData.ingredients)) {
            recipeData.ingredients = ["Ingredientes selecionados"];
        }
        if (!recipeData.steps || !Array.isArray(recipeData.steps)) {
            recipeData.steps = ["Preparar", "Cozinhar", "Servir"];
        }
        if (!recipeData.time) recipeData.time = "30 min";
        if (!recipeData.difficulty) recipeData.difficulty = "Fácil";

        // Gerar imagem final
        let finalImageUrl = null;
        if (recipeData.title) {
            try {
                const tempImageUrl = await callOpenAIImage(
                    "",
                    recipeData.title,
                    recipeData.description || "Prato final bem apresentado",
                    true
                );
                if (tempImageUrl) {
                    finalImageUrl = await require("../services/storageService").ensurePermanentImageUrl(
                        tempImageUrl,
                        recipeData.title,
                        'final-dish'
                    );
                }
            } catch (imgErr) {
                console.log("❌ Erro ao gerar imagem final:", imgErr.message);
            }
        }

        console.log("✅ Receita gerada com sucesso");
        res.status(200).json({
            ...recipeData,
            finalImage: finalImageUrl
        });

    } catch (err) {
        console.error("❌ ERRO em generate-ai:", err);
        // Fallback
        const fallback = criarReceitaFallbackPerfil(profile, numberOfPeople, theme);
        res.status(200).json(fallback);
    }
});

// FUNÇÃO AUXILIAR PARA FALLBACK
function criarReceitaFallbackPerfil(profile, porcoes, tema) {
    return {
        title: tema ? `${tema} para ${profile.name}` : `Receita de ${profile.name}`,
        description: `Receita especial adaptada para ${profile.age} anos`,
        ingredients: [
            `${porcoes * 100}g de ingrediente principal`,
            "Temperos naturais",
            "Azeite ou óleo saudável"
        ],
        steps: [
            "Prepare todos os ingredientes",
            "Cozinhe com cuidado",
            "Tempere a gosto",
            "Sirva com amor"
        ],
        time: "35 min",
        difficulty: "Fácil",
        nutritionalInfo: {
            calories: `${porcoes * 200} kcal`,
            sugar: "Baixo",
            salt: "Moderado"
        },
        adaptations: [
            `Para ${profile.type}`,
            `Idade: ${profile.age} anos`
        ]
    };
}
// Registrar reação da criança/idoso
router.post("/:profileId/recipes/:recipeId/reaction", async (req, res) => {
    try {
        const { emoji, comment } = req.body;
        const profile = await Profile.findById(req.params.profileId);

        if (!profile) return res.status(404).json({ error: "Perfil não encontrado" });

        const recipe = profile.recipes.id(req.params.recipeId);
        if (!recipe) return res.status(404).json({ error: "Receita não encontrada" });

        recipe.notes.push({
            content: comment || "",
            emoji: emoji,
            createdAt: new Date()
        });

        await profile.save();
        res.json(recipe);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Sugerir receitas baseadas na idade (para infantil)
router.get("/:profileId/suggestions", async (req, res) => {
    try {
        const profile = await Profile.findById(req.params.profileId);
        if (!profile) return res.status(404).json({ error: "Perfil não encontrado" });

        let suggestions = [];

        if (profile.type === "infantil") {
            if (profile.age === 1) {
                suggestions = ["Purê de batata doce", "Sopa de abóbora", "Papinha de frango"];
            } else if (profile.age <= 3) {
                suggestions = ["Bolinhos de aveia", "Omelete de legumes", "Escondidinho de carne"];
            } else {
                suggestions = ["Hambúrguer caseiro", "Pizza de pão", "Salada de frutas"];
            }
        } else if (profile.type === "senior") {
            suggestions = ["Sopa de legumes", "Peixe cozido", "Frango desfiado"];
        }

        res.json({ suggestions });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Configurar lembretes de refeições
router.post("/:profileId/reminders", async (req, res) => {
    try {
        const { mealType, time, active } = req.body;
        const profile = await Profile.findById(req.params.profileId);

        if (!profile) return res.status(404).json({ error: "Perfil não encontrado" });

        // Em produção: integrar com sistema de notificações
        res.json({
            success: true,
            reminder: {
                mealType,
                time,
                active,
                profileName: profile.name,
                message: `Lembrete configurado para ${mealType} às ${time}`
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Atualizar perfil (editar)
router.put("/:id", upload.single("profileImage"), async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;
        if (!userId) {
            return res.status(401).json({ error: "Utilizador não autenticado" });
        }

        const profile = await Profile.findById(req.params.id);
        if (!profile) {
            return res.status(404).json({ error: "Perfil não encontrado" });
        }

        if (profile.userId !== userId) {
            return res.status(403).json({ error: "Não tem permissão para editar este perfil" });
        }

        if (req.body.name) profile.name = req.body.name;
        if (req.body.birthDate) profile.birthDate = req.body.birthDate;
        if (req.body.country) profile.country = req.body.country;

        const parseArrayField = (field) => {
            if (!field) return [];
            if (Array.isArray(field)) return field;
            try {
                return JSON.parse(field);
            } catch {
                return field.split(',').map(s => s.trim()).filter(Boolean);
            }
        };

        if (req.body.allergies) profile.allergies = parseArrayField(req.body.allergies);
        if (req.body.intolerances) profile.intolerances = parseArrayField(req.body.intolerances);

        // Para sénior, processar de forma especial
        if (profile.type === 'senior') {
            if (req.body.conditions) {
                profile.conditions = parseArrayField(req.body.conditions);
            }

            if (req.body.difficulties) {
                profile.difficulties = parseArrayField(req.body.difficulties);
            }

            if (req.body.emergencyInfo !== undefined) {
                profile.emergencyInfo = req.body.emergencyInfo;
            }

        } else if (req.body.healthObservations) {
            profile.healthObservations = parseArrayField(req.body.healthObservations);
        }

        if (req.file) {
            const imageUrl = await uploadToCloudflare(
                req.file.buffer,
                req.file.originalname,
                'profile-pictures'
            );
            profile.profileImage = imageUrl;
        }

        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error("❌ Erro ao atualizar perfil:", err);
        res.status(500).json({ error: err.message });
    }
});

// Excluir perfil
router.delete("/:id", async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;
        if (!userId) {
            return res.status(401).json({ error: "Utilizador não autenticado" });
        }

        const profile = await Profile.findById(req.params.id);
        if (!profile) {
            return res.status(404).json({ error: "Perfil não encontrado" });
        }

        // Verificar se o perfil pertence ao usuário logado
        if (profile.userId !== userId) {
            return res.status(403).json({ error: "Não tem permissão para eliminar este perfil" });
        }

        await Profile.findByIdAndDelete(req.params.id);
        res.json({ message: "Perfil eliminado com sucesso" });
    } catch (err) {
        console.error("❌ Erro ao eliminar perfil:", err);
        res.status(500).json({ error: err.message });
    }
});

// Salvar lembretes do perfil
router.put("/:id/lembretes", async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;
        if (!userId) {
            return res.status(401).json({ error: "Utilizador não autenticado" });
        }

        const profile = await Profile.findById(req.params.id);
        if (!profile) {
            return res.status(404).json({ error: "Perfil não encontrado" });
        }

        if (profile.userId !== userId) {
            return res.status(403).json({ error: "Não tem permissão para editar este perfil" });
        }

        // Atualizar os lembretes
        profile.lembretes = req.body.lembretes;
        await profile.save();

        res.json({
            success: true,
            message: "Lembretes atualizados com sucesso",
            lembretes: profile.lembretes
        });
    } catch (err) {
        console.error("❌ Erro ao salvar lembretes:", err);
        res.status(500).json({ error: err.message });
    }
});

// Carregar lembretes do perfil
router.get("/:id/lembretes", async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;
        if (!userId) {
            return res.status(401).json({ error: "Utilizador não autenticado" });
        }

        const profile = await Profile.findById(req.params.id);
        if (!profile) {
            return res.status(404).json({ error: "Perfil não encontrado" });
        }

        res.json({
            success: true,
            lembretes: profile.lembretes || [
                { hora: '08:00', tipo: 'Café da Manhã', ativo: true },
                { hora: '13:00', tipo: 'Almoço', ativo: true },
                { hora: '20:00', tipo: 'Jantar', ativo: true }
            ]
        });
    } catch (err) {
        console.error("❌ Erro ao carregar lembretes:", err);
        res.status(500).json({ error: err.message });
    }
});

// Salvar planejamento semanal
router.put("/:id/planejamento", async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;
        if (!userId) {
            return res.status(401).json({ error: "Utilizador não autenticado" });
        }

        const profile = await Profile.findById(req.params.id);
        if (!profile) {
            return res.status(404).json({ error: "Perfil não encontrado" });
        }

        if (profile.userId !== userId) {
            return res.status(403).json({ error: "Não tem permissão para editar este perfil" });
        }

        // Atualizar o planejamento
        profile.planejamentoSemanal = req.body.planejamento;
        await profile.save();

        res.json({
            success: true,
            message: "Planejamento semanal atualizado com sucesso",
            planejamento: profile.planejamentoSemanal
        });
    } catch (err) {
        console.error("❌ Erro ao salvar planejamento:", err);
        res.status(500).json({ error: err.message });
    }
});

// Carregar planejamento semanal
router.get("/:id/planejamento", async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;
        if (!userId) {
            return res.status(401).json({ error: "Utilizador não autenticado" });
        }

        const profile = await Profile.findById(req.params.id);
        if (!profile) {
            return res.status(404).json({ error: "Perfil não encontrado" });
        }

        res.json({
            success: true,
            planejamento: profile.planejamentoSemanal || {
                segunda: { cafe: true, almoco: true, jantar: true, lanche: false },
                terca: { cafe: true, almoco: true, jantar: true, lanche: false },
                quarta: { cafe: true, almoco: true, jantar: true, lanche: false },
                quinta: { cafe: true, almoco: true, jantar: true, lanche: false },
                sexta: { cafe: true, almoco: true, jantar: true, lanche: false },
                sabado: { cafe: false, almoco: true, jantar: true, lanche: true },
                domingo: { cafe: false, almoco: true, jantar: true, lanche: true }
            }
        });
    } catch (err) {
        console.error("❌ Erro ao carregar planejamento:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;