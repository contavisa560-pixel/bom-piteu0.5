import { useState, useEffect, useRef } from "react";

const API = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api`;
const getToken = () => localStorage.getItem("bomPiteuToken") || "";

// ─── Opções por tipo ──────────────────────────────────────────────────────────
const CONFIG = {
  petisco: {
    label: "Petiscos",
    emoji: "✦",
    color: "#f97316",
    categorias: ["Fritos", "Grelhados", "Frios", "Assados", "Tostas", "Guisados", "Snacks", "Cozinhados", "Partilha"],
    bebidasSugeridas: ["Vinho Tinto", "Vinho Branco", "Vinho Verde", "Cerveja", "Cerveja Artesanal", "Cerveja Gelada", "Margarita", "Sake", "Whisky", "Chá", "Sem Bebida"],
  },
  doce: {
    label: "Doces & Sobremesas",
    emoji: "★",
    color: "#ec4899",
    categorias: ["Bolo", "Biscoito", "Bowl", "Cheesecake", "Creme", "Doce", "Doce de Ovos", "Frito", "Gelado", "Merengue", "Mousse", "Pastelaria", "Pudim", "Sobremesa", "Tarte"],
  },
  cocktail: {
    label: "Cocktails & Bebidas",
    emoji: "●",
    color: "#8b5cf6",
    categorias: ["Cocktail", "Mocktail", "Spritz", "Sour", "Martini", "Collins", "Tropical", "Punch", "Shot", "Brunch", "Refresco", "Batido", "Smoothie", "Bebida Especial", "Bebida Tradicional", "Sumo", "Fermentado"],
    perfisFeed: ["Com Álcool", "Sem Álcool"],
  },
};

const DIFICULDADES = ["Fácil", "Médio", "Difícil"];

const S = {
  input: {
    width: "100%", background: "#0a0d12",
    border: "1px solid rgba(255,255,255,.1)", borderRadius: 8,
    padding: "9px 12px", color: "#f8fafc", fontSize: 13,
    outline: "none", boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif",
  },
  label: {
    fontSize: 11, color: "rgba(255,255,255,.4)", fontWeight: 700,
    letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 5,
  },
  field: { marginBottom: 14 },
  required: { color: "#f87171", marginLeft: 2 },
};

// ─── Formulário ───────────────────────────────────────────────────────────────
function RecipeForm({ tipo, initial, onSave, onCancel }) {
  const cfg = CONFIG[tipo];
  const EMPTY = {
    tipo, nome: "", pais: "", categoria: "", tempo: "", dificuldade: "",
    descricao: "", tags: "", bebida_sugerida: "", vegano: false,
    perfil_alimentar: "", ingredientes: "", passo_passo: "", ativo: true,
  };

  const [form, setForm] = useState(initial
    ? { ...initial, tags: Array.isArray(initial.tags) ? initial.tags.join(", ") : initial.tags }
    : EMPTY
  );
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(initial?.imagem_url || "");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const fileRef = useRef();

  function set(name, value) {
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(e => ({ ...e, [name]: "" }));
  }

  function validate() {
    const errs = {};
    if (!form.nome?.trim()) errs.nome = "Campo obrigatório";
    if (!form.pais?.trim()) errs.pais = "Campo obrigatório";
    if (!form.categoria) errs.categoria = "Seleciona uma categoria";
    if (!form.tempo?.trim()) errs.tempo = "Campo obrigatório";
    if (!form.dificuldade) errs.dificuldade = "Seleciona a dificuldade";
    if (!form.descricao?.trim()) errs.descricao = "Campo obrigatório";
    if (tipo === "cocktail" && !form.perfil_alimentar) errs.perfil_alimentar = "Seleciona o perfil";
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (imageFile) fd.append("imagem", imageFile);

      const isEdit = !!initial?._id;
      const res = await fetch(
        isEdit ? `${API}/special-recipes/${initial._id}` : `${API}/special-recipes`,
        { method: isEdit ? "PUT" : "POST", headers: { Authorization: `Bearer ${getToken()}` }, body: fd }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao guardar");
      onSave(data.data);
    } catch (err) {
      setErrors({ _global: err.message });
    } finally {
      setSaving(false);
    }
  }

  const Err = ({ field }) => errors[field]
    ? <div style={{ color: "#f87171", fontSize: 11, marginTop: 4 }}>{errors[field]}</div> : null;

  return (
    <form onSubmit={handleSubmit}>
      {errors._global && (
        <div style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.3)", color: "#f87171", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13 }}>
          {errors._global}
        </div>
      )}

      {/* Imagem */}
      <div style={S.field}>
        <label style={S.label}>Imagem</label>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 90, height: 65, borderRadius: 8, overflow: "hidden", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {preview ? <img src={preview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 24 }}>{cfg.emoji}</span>}
          </div>
          <div>
            <button type="button" onClick={() => fileRef.current.click()} style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,.15)", background: "rgba(255,255,255,.05)", color: "#94a3b8", cursor: "pointer", fontSize: 12, fontWeight: 600, display: "block", marginBottom: 5 }}>
              {preview ? "Alterar" : "Escolher"}
            </button>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.2)" }}>JPG, PNG · Máx. 5MB</div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={e => { const f = e.target.files[0]; if (f) { setImageFile(f); setPreview(URL.createObjectURL(f)); } }} style={{ display: "none" }} />
        </div>
      </div>

      {/* Nome + País */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <div>
          <label style={S.label}>Nome <span style={S.required}>*</span></label>
          <input value={form.nome} onChange={e => set("nome", e.target.value)} placeholder={`Nome do ${cfg.label.slice(0, -1).toLowerCase()}`} style={{ ...S.input, borderColor: errors.nome ? "rgba(239,68,68,.5)" : "rgba(255,255,255,.1)" }} />
          <Err field="nome" />
        </div>
        <div>
          <label style={S.label}>País <span style={S.required}>*</span></label>
          <input value={form.pais} onChange={e => set("pais", e.target.value)} placeholder="Ex: Portugal" style={{ ...S.input, borderColor: errors.pais ? "rgba(239,68,68,.5)" : "rgba(255,255,255,.1)" }} />
          <Err field="pais" />
        </div>
      </div>

      {/* Categoria + Dificuldade */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <div>
          <label style={S.label}>Categoria <span style={S.required}>*</span></label>
          <select value={form.categoria} onChange={e => set("categoria", e.target.value)} style={{ ...S.input, cursor: "pointer", borderColor: errors.categoria ? "rgba(239,68,68,.5)" : "rgba(255,255,255,.1)" }}>
            <option value="">— Seleciona —</option>
            {cfg.categorias.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <Err field="categoria" />
        </div>
        <div>
          <label style={S.label}>Dificuldade <span style={S.required}>*</span></label>
          <select value={form.dificuldade} onChange={e => set("dificuldade", e.target.value)} style={{ ...S.input, cursor: "pointer", borderColor: errors.dificuldade ? "rgba(239,68,68,.5)" : "rgba(255,255,255,.1)" }}>
            <option value="">— Seleciona —</option>
            {DIFICULDADES.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <Err field="dificuldade" />
        </div>
      </div>

      {/* Tempo */}
      <div style={S.field}>
        <label style={S.label}>Tempo de Preparo <span style={S.required}>*</span></label>
        <input value={form.tempo} onChange={e => set("tempo", e.target.value)} placeholder="Ex: 30 min" style={{ ...S.input, borderColor: errors.tempo ? "rgba(239,68,68,.5)" : "rgba(255,255,255,.1)" }} />
        <Err field="tempo" />
      </div>

      {/* Campo específico: Bebida Sugerida (petisco) */}
      {tipo === "petisco" && (
        <div style={S.field}>
          <label style={S.label}>Bebida Sugerida</label>
          <select value={form.bebida_sugerida} onChange={e => set("bebida_sugerida", e.target.value)} style={{ ...S.input, cursor: "pointer" }}>
            <option value="">— Seleciona —</option>
            {cfg.bebidasSugeridas.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
      )}

      {/* Campo específico: Perfil Alimentar (cocktail) */}
      {tipo === "cocktail" && (
        <div style={S.field}>
          <label style={S.label}>Perfil Alimentar <span style={S.required}>*</span></label>
          <div style={{ display: "flex", gap: 8 }}>
            {cfg.perfisFeed.map(p => (
              <button key={p} type="button" onClick={() => set("perfil_alimentar", p)} style={{
                flex: 1, padding: "9px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
                border: `1px solid ${form.perfil_alimentar === p ? "rgba(139,92,246,.5)" : "rgba(255,255,255,.1)"}`,
                background: form.perfil_alimentar === p ? "rgba(139,92,246,.2)" : "transparent",
                color: form.perfil_alimentar === p ? "#a78bfa" : "rgba(255,255,255,.4)",
              }}>{p}</button>
            ))}
          </div>
          <Err field="perfil_alimentar" />
        </div>
      )}

      {/* Vegano toggle (doce) */}
      {tipo === "doce" && (
        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", marginBottom: 14, padding: "10px 12px", background: "rgba(255,255,255,.03)", borderRadius: 8, border: "1px solid rgba(255,255,255,.06)" }}>
          <div onClick={() => set("vegano", !form.vegano)} style={{ width: 40, height: 22, borderRadius: 99, position: "relative", background: form.vegano ? "#22c55e" : "rgba(255,255,255,.1)", cursor: "pointer", transition: "background .2s", flexShrink: 0 }}>
            <div style={{ position: "absolute", top: 3, left: form.vegano ? 21 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left .2s" }} />
          </div>
          <span style={{ fontSize: 13, color: "#f1f5f9", fontWeight: 600 }}> Receita Vegana</span>
        </label>
      )}

      {/* Descrição */}
      <div style={S.field}>
        <label style={S.label}>Descrição <span style={S.required}>*</span></label>
        <textarea value={form.descricao} onChange={e => set("descricao", e.target.value)} rows={3} placeholder="Breve descrição apetitosa..." style={{ ...S.input, resize: "vertical", borderColor: errors.descricao ? "rgba(239,68,68,.5)" : "rgba(255,255,255,.1)" }} />
        <Err field="descricao" />
      </div>

      {/* Tags */}
      <div style={S.field}>
        <label style={S.label}>Tags (separadas por vírgula)</label>
        <input value={form.tags} onChange={e => set("tags", e.target.value)} placeholder="Ex: Clássico, Rápido, Vegan" style={S.input} />
      </div>

      {/* Ingredientes + Passo a Passo (cocktail) */}
      {tipo === "cocktail" && (
        <>
          <div style={S.field}>
            <label style={S.label}>Ingredientes</label>
            <textarea value={form.ingredientes} onChange={e => set("ingredientes", e.target.value)} rows={2} placeholder="Ex: Rum branco, açúcar, lima, hortelã" style={{ ...S.input, resize: "vertical" }} />
          </div>
          <div style={S.field}>
            <label style={S.label}>Passo a Passo</label>
            <textarea value={form.passo_passo} onChange={e => set("passo_passo", e.target.value)} rows={4} placeholder="1. Primeiro passo; 2. Segundo passo..." style={{ ...S.input, resize: "vertical" }} />
          </div>
        </>
      )}

      {/* Ativo */}
      <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", marginBottom: 20, padding: "10px 12px", background: "rgba(255,255,255,.03)", borderRadius: 8, border: "1px solid rgba(255,255,255,.06)" }}>
        <div onClick={() => set("ativo", !form.ativo)} style={{ width: 40, height: 22, borderRadius: 99, position: "relative", background: form.ativo ? "#8b5cf6" : "rgba(255,255,255,.1)", cursor: "pointer", transition: "background .2s", flexShrink: 0 }}>
          <div style={{ position: "absolute", top: 3, left: form.ativo ? 21 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left .2s" }} />
        </div>
        <div>
          <div style={{ fontSize: 13, color: "#f1f5f9", fontWeight: 600 }}>Ativo</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)" }}>{form.ativo ? "Visível no frontend" : "Oculto"}</div>
        </div>
      </label>

      {/* Botões */}
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button type="button" onClick={onCancel} style={{ padding: "10px 22px", borderRadius: 8, border: "1px solid rgba(255,255,255,.1)", background: "transparent", color: "#94a3b8", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Cancelar</button>
        <button type="submit" disabled={saving} style={{ padding: "10px 28px", borderRadius: 8, border: "none", background: saving ? "rgba(139,92,246,.3)" : `linear-gradient(135deg, ${CONFIG[tipo].color}, ${CONFIG[tipo].color}cc)`, color: "#fff", cursor: saving ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 700 }}>
          {saving ? "A guardar..." : (initial?._id ? "✓ Atualizar" : "✓ Criar")}
        </button>
      </div>
    </form>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function Modal({ title, children, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#0d1117", border: "1px solid rgba(255,255,255,.08)", borderRadius: 16, width: "100%", maxWidth: 680, maxHeight: "92vh", overflowY: "auto", padding: "28px 32px", boxShadow: "0 25px 60px rgba(0,0,0,.6)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,.06)" }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9" }}>{title}</h2>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,.06)", border: "none", color: "rgba(255,255,255,.5)", width: 32, height: 32, borderRadius: 8, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function SpecialRecipesAdmin({ toast }) {
  const [tipoAtivo, setTipoAtivo] = useState("petisco");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [modal, setModal] = useState(null);
  const [acting, setActing] = useState(false);

  const cfg = CONFIG[tipoAtivo];

  async function load(p = 1) {
    setLoading(true);
    try {
      const q = new URLSearchParams({ tipo: tipoAtivo, page: p, limit: 20, ...(search && { search }) });
      const res = await fetch(`${API}/special-recipes?${q}`, { headers: { Authorization: `Bearer ${getToken()}` } });
      const data = await res.json();
      setRecipes(data.data || []);
      setPagination(data.pagination || {});
      setPage(p);
    } catch (err) { toast(err.message, "error"); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(1); }, [tipoAtivo, search]);

  async function handleToggle(id) {
    try {
      const res = await fetch(`${API}/special-recipes/${id}/toggle`, { method: "PATCH", headers: { Authorization: `Bearer ${getToken()}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRecipes(prev => prev.map(r => r._id === id ? data.data : r));
    } catch (err) { toast(err.message, "error"); }
  }

  async function handleDelete(id, nome) {
    if (!confirm(`Apagar "${nome}"?`)) return;
    setActing(true);
    try {
      await fetch(`${API}/special-recipes/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` } });
      setRecipes(prev => prev.filter(r => r._id !== id));
      toast("Eliminado", "success");
    } catch (err) { toast(err.message, "error"); }
    finally { setActing(false); }
  }

  function handleSaved(recipe) {
    if (modal?._id) {
      setRecipes(prev => prev.map(r => r._id === recipe._id ? recipe : r));
      toast("Atualizado!", "success");
    } else {
      setRecipes(prev => [recipe, ...prev]);
      toast("Criado!", "success");
    }
    setModal(null);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Tabs por tipo */}
      <div style={{ display: "flex", gap: 8 }}>
        {Object.entries(CONFIG).map(([key, c]) => (
          <button key={key} onClick={() => { setTipoAtivo(key); setSearch(""); }} style={{
            padding: "8px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer",
            border: `1px solid ${tipoAtivo === key ? `${c.color}60` : "rgba(255,255,255,.08)"}`,
            background: tipoAtivo === key ? `${c.color}18` : "transparent",
            color: tipoAtivo === key ? c.color : "rgba(255,255,255,.4)",
            transition: "all .15s",
          }}>
            {c.emoji} {c.label}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`  Pesquisar ${cfg.label.toLowerCase()}...`}
          style={{ flex: 1, minWidth: 200, background: "#0d1117", border: "1px solid rgba(255,255,255,.08)", borderRadius: 10, padding: "9px 14px", color: "#f8fafc", fontSize: 13, outline: "none" }} />
        <span style={{ fontSize: 12, color: "rgba(255,255,255,.3)" }}>{pagination.total ?? 0} registos</span>
        <button onClick={() => setModal("create")} style={{ padding: "9px 20px", borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${cfg.color}, ${cfg.color}cc)`, color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" }}>
          + Novo 
        </button>
      </div>

      {/* Tabela */}
      <div style={{ background: "#0d1117", border: "1px solid rgba(255,255,255,.06)", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 110px 90px 90px 60px 120px", padding: "11px 18px", borderBottom: "1px solid rgba(255,255,255,.05)", fontSize: 10, color: "rgba(255,255,255,.25)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          <span>Img</span><span>Nome / País</span><span>Categoria</span><span>Tempo</span><span>Dific.</span><span>Ativo</span><span>Ações</span>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,.2)" }}>A carregar...</div>
        ) : recipes.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>{cfg.emoji}</div>
            <div style={{ color: "rgba(255,255,255,.3)", fontSize: 13, marginBottom: 16 }}>Nenhum registo encontrado.</div>
            <button onClick={() => setModal("create")} style={{ padding: "9px 20px", borderRadius: 9, border: `1px solid ${cfg.color}60`, background: `${cfg.color}18`, color: cfg.color, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>+ Criar primeiro</button>
          </div>
        ) : recipes.map((r, i) => (
          <div key={r._id} style={{ display: "grid", gridTemplateColumns: "60px 1fr 110px 90px 90px 60px 120px", padding: "11px 18px", alignItems: "center", borderBottom: i < recipes.length - 1 ? "1px solid rgba(255,255,255,.04)" : "none" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.02)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <div style={{ width: 44, height: 34, borderRadius: 6, overflow: "hidden", background: "rgba(255,255,255,.05)" }}>
              {r.imagem_url ? <img src={r.imagem_url} alt={r.nome} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{cfg.emoji}</div>}
            </div>
            <div style={{ minWidth: 0, paddingRight: 8 }}>
              <div style={{ fontSize: 13, color: "#f1f5f9", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.nome}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.35)", marginTop: 2 }}>{r.pais}</div>
            </div>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,.45)" }}>{r.categoria}</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,.45)" }}>{r.tempo}</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,.45)" }}>{r.dificuldade}</span>
            <button onClick={() => handleToggle(r._id)} style={{ width: 38, height: 22, borderRadius: 99, border: "none", background: r.ativo ? cfg.color : "rgba(255,255,255,.1)", cursor: "pointer", position: "relative", transition: "background .2s" }}>
              <div style={{ position: "absolute", top: 3, left: r.ativo ? 19 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left .2s" }} />
            </button>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setModal(r)} style={{ background: "none", border: "none", color: "#60a5fa", cursor: "pointer", fontSize: 12, fontWeight: 600 }}> Editar</button>
              <button onClick={() => handleDelete(r._id, r.nome)} disabled={acting} style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Deletar</button>
            </div>
          </div>
        ))}
      </div>

      {/* Paginação */}
      {pagination.pages > 1 && (
        <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => load(p)} style={{ width: 34, height: 34, borderRadius: 8, border: page === p ? `1px solid ${cfg.color}80` : "1px solid rgba(255,255,255,.08)", background: page === p ? `${cfg.color}20` : "transparent", color: page === p ? cfg.color : "rgba(255,255,255,.35)", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>{p}</button>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <Modal title={modal === "create" ? ` Novo ${cfg.label.slice(0, -1)}` : `Editar — ${modal.nome}`} onClose={() => setModal(null)}>
          <RecipeForm tipo={tipoAtivo} initial={modal === "create" ? null : modal} onSave={handleSaved} onCancel={() => setModal(null)} />
        </Modal>
      )}
    </div>
  );
}