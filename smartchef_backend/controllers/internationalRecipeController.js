const InternationalRecipe = require("../models/InternationalRecipe");
const { uploadToCloudflare } = require("../services/storageService");
const AuditLog = require("../models/AuditLog");

// ── Público: listar receitas ativas ──────────────────────────────────────────

exports.listPublic = async (req, res) => {
  try {
    const { pais } = req.query;
    const filter = { ativo: true };
    if (pais) filter.pais = pais;

    const recipes = await InternationalRecipe
      .find(filter)
      .sort({ pais: 1, ordem: 1, nome_receita: 1 })
      .select("-createdBy -updatedBy");

    res.json({ success: true, data: recipes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Admin: listar todas (incluindo inativas) ─────────────────────────────────

exports.listAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 30, search = "", pais = "" } = req.query;
    const filter = {};
    if (pais) filter.pais = pais;
    if (search) {
      const regex = { $regex: search, $options: "i" };
      filter.$or = [
        { nome: regex },
        { pais: regex },
        { categoria: regex },
      ];
    }

    const total = await InternationalRecipe.countDocuments(filter);
    const recipes = await InternationalRecipe
      .find(filter)
      .sort({ pais: 1, ordem: 1 })
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

// ── Admin: criar receita ─────────────────────────────────────────────────────

exports.create = async (req, res) => {
  try {
    const body = req.body;
    let imagem_url = body.imagem_url || "";

    // Se vier ficheiro de imagem, faz upload para R2
    if (req.file) {
      imagem_url = await uploadToCloudflare(
        req.file.buffer,
        req.file.originalname,
        "international-recipes"
      );
    }

    const recipe = await InternationalRecipe.create({
      ...body,
      imagem_url,
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });

    await AuditLog.create({
      userId: req.user._id,
      action: `admin_create_intl_recipe:${recipe._id}`,
      route: req.path,
      tokensUsed: 0
    });

    res.status(201).json({ success: true, data: recipe });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Admin: editar receita ────────────────────────────────────────────────────

exports.update = async (req, res) => {
  try {
    const recipe = await InternationalRecipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ error: "Receita não encontrada" });

    const updates = { ...req.body, updatedBy: req.user._id };

    // Upload de nova imagem se enviada
    if (req.file) {
      updates.imagem_url = await uploadToCloudflare(
        req.file.buffer,
        req.file.originalname,
        "international-recipes"
      );
    }

    const updated = await InternationalRecipe.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    await AuditLog.create({
      userId: req.user._id,
      action: `admin_update_intl_recipe:${req.params.id}`,
      route: req.path,
      tokensUsed: 0
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Admin: apagar receita ────────────────────────────────────────────────────

exports.remove = async (req, res) => {
  try {
    const recipe = await InternationalRecipe.findByIdAndDelete(req.params.id);
    if (!recipe) return res.status(404).json({ error: "Receita não encontrada" });

    await AuditLog.create({
      userId: req.user._id,
      action: `admin_delete_intl_recipe:${req.params.id}`,
      route: req.path,
      tokensUsed: 0
    });

    res.json({ success: true, message: "Receita eliminada" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Admin: ativar / desativar ────────────────────────────────────────────────

exports.toggleActive = async (req, res) => {
  try {
    const recipe = await InternationalRecipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ error: "Receita não encontrada" });

    recipe.ativo = !recipe.ativo;
    recipe.updatedBy = req.user._id;
    await recipe.save();

    res.json({ success: true, data: recipe });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Admin: importar em massa (seed inicial) ──────────────────────────────────

exports.bulkImport = async (req, res) => {
  try {
    const { recipes } = req.body;
    if (!Array.isArray(recipes) || recipes.length === 0) {
      return res.status(400).json({ error: "Array de receitas inválido" });
    }

    const withMeta = recipes.map(r => ({
      ...r,
      createdBy: req.user._id,
      updatedBy: req.user._id,
    }));

    // insertMany com ordered:false continua mesmo se algum falhar
    const result = await InternationalRecipe.insertMany(withMeta, { ordered: false });

    res.json({ success: true, inserted: result.length });
  } catch (err) {
    // Erro de duplicados é aceitável
    if (err.code === 11000) {
      return res.json({ success: true, message: "Algumas receitas já existiam", inserted: err.result?.nInserted || 0 });
    }
    res.status(500).json({ error: err.message });
  }

};
// ── sugestões do dia (1 por categoria) ──────────────────────────────
exports.dailySuggestions = async (req, res) => {
  try {
    const categories = ["Pequeno-almoço", "Almoço", "Jantar"];
    const { diets = "", allergies = "" } = req.query;

    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const seededRandom = (n) => {
      const x = Math.sin(seed + n) * 10000;
      return x - Math.floor(x);
    };

    // Alergias a excluir do perfil alimentar
    const allergyList = allergies ? allergies.split(",").map(a => a.trim()).filter(Boolean) : [];

    const results = await Promise.all(
      categories.map(async (cat, i) => {
        const filter = {
          ativo: true,
          categoria: { $regex: cat, $options: "i" },
        };

        // Exclui receitas que contenham alergias do utilizador
        if (allergyList.length > 0) {
          filter.perfil_alimentar = {
            $not: new RegExp(allergyList.join("|"), "i")
          };
        }

        const count = await InternationalRecipe.countDocuments(filter);
        if (count === 0) {
          // Se não encontrar com filtro, devolve sem filtro (fallback)
          const countFallback = await InternationalRecipe.countDocuments({
            ativo: true,
            categoria: { $regex: cat, $options: "i" }
          });
          if (countFallback === 0) return null;
          const index = Math.floor(seededRandom(i) * countFallback);
          return InternationalRecipe.findOne({
            ativo: true,
            categoria: { $regex: cat, $options: "i" }
          }).skip(index).lean();
        }

        const index = Math.floor(seededRandom(i) * count);
        return InternationalRecipe.findOne(filter).skip(index).lean();
      })
    );

    res.json({ success: true, data: results.filter(Boolean) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};