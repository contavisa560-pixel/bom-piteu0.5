const SpecialRecipe = require("../models/SpecialRecipe");
const { uploadToCloudflare } = require("../services/storageService");
const AuditLog = require("../models/AuditLog");

// ── Público ───────────────────────────────────────────────────────────────────

exports.listPublic = async (req, res) => {
    try {
        const { tipo, limit = 100 } = req.query;
        const filter = { ativo: true };
        if (tipo) filter.tipo = tipo;

        const recipes = await SpecialRecipe
            .find(filter)
            .sort({ ordem: 1, createdAt: -1 })
            .limit(Number(limit))
            .select("-createdBy -updatedBy");

        res.json({ success: true, data: recipes });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ── Admin ─────────────────────────────────────────────────────────────────────

exports.listAdmin = async (req, res) => {
    try {
        const { tipo, page = 1, limit = 30, search = "" } = req.query;
        const filter = {};
        if (tipo) filter.tipo = tipo;
        if (search) {
            const regex = { $regex: search, $options: "i" };
            filter.$or = [
                { nome: regex },
                { pais: regex },
                { categoria: regex },
            ];
        }

        const total = await SpecialRecipe.countDocuments(filter);
        const recipes = await SpecialRecipe
            .find(filter)
            .sort({ tipo: 1, ordem: 1, createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        res.json({
            success: true,
            data: recipes,
            pagination: { total, page: Number(page), pages: Math.ceil(total / limit) }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        let imagem_url = req.body.imagem_url || "";
        if (req.file) {
            imagem_url = await uploadToCloudflare(
                req.file.buffer, req.file.originalname, "special-recipes"
            );
        }

        // Converte tags de string para array se necessário
        let tags = req.body.tags || [];
        if (typeof tags === "string") {
            tags = tags.split(",").map(t => t.trim()).filter(Boolean);
        }

        const recipe = await SpecialRecipe.create({
            ...req.body,
            tags,
            imagem_url,
            createdBy: req.user._id,
            updatedBy: req.user._id,
        });

        await AuditLog.create({
            userId: req.user._id,
            action: `admin_create_special_recipe:${recipe._id}`,
            route: req.path, tokensUsed: 0
        });

        res.status(201).json({ success: true, data: recipe });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const updates = { ...req.body, updatedBy: req.user._id };

        if (req.file) {
            updates.imagem_url = await uploadToCloudflare(
                req.file.buffer, req.file.originalname, "special-recipes"
            );
        }

        if (typeof updates.tags === "string") {
            updates.tags = updates.tags.split(",").map(t => t.trim()).filter(Boolean);
        }

        const recipe = await SpecialRecipe.findByIdAndUpdate(
            req.params.id, updates, { new: true, runValidators: true }
        );
        if (!recipe) return res.status(404).json({ error: "Receita não encontrada" });

        await AuditLog.create({
            userId: req.user._id,
            action: `admin_update_special_recipe:${req.params.id}`,
            route: req.path, tokensUsed: 0
        });

        res.json({ success: true, data: recipe });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.remove = async (req, res) => {
    try {
        const recipe = await SpecialRecipe.findByIdAndDelete(req.params.id);
        if (!recipe) return res.status(404).json({ error: "Receita não encontrada" });

        await AuditLog.create({
            userId: req.user._id,
            action: `admin_delete_special_recipe:${req.params.id}`,
            route: req.path, tokensUsed: 0
        });

        res.json({ success: true, message: "Eliminada com sucesso" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.toggleActive = async (req, res) => {
    try {
        const recipe = await SpecialRecipe.findById(req.params.id);
        if (!recipe) return res.status(404).json({ error: "Receita não encontrada" });
        recipe.ativo = !recipe.ativo;
        recipe.updatedBy = req.user._id;
        await recipe.save();
        res.json({ success: true, data: recipe });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.bulkImport = async (req, res) => {
    try {
        const { recipes } = req.body;
        if (!Array.isArray(recipes) || recipes.length === 0) {
            return res.status(400).json({ error: "Array inválido" });
        }
        const docs = recipes.map(r => ({
            ...r,
            createdBy: req.user._id,
            updatedBy: req.user._id,
        }));
        const result = await SpecialRecipe.insertMany(docs, { ordered: false });
        res.json({ success: true, inserted: result.length });
    } catch (err) {
        if (err.code === 11000) {
            return res.json({ success: true, message: "Algumas já existiam" });
        }
        res.status(500).json({ error: err.message });
    }
};