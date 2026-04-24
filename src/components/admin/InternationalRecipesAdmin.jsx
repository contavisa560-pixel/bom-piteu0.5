import { useState, useEffect, useRef } from "react";

const API = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api`;

function getToken() {
  return localStorage.getItem("bomPiteuToken") || "";
}

// ─── Opções fixas do sistema ──────────────────────────────────────────────────
const CATEGORIAS = [
  // ── Refeições principais (usadas nas Sugestões do Dia) ──
  "Pequeno-almoço",
  "Almoço", 
  "Jantar",
  // ── Outras categorias da Viagem Gastronómica ──
  "Jantar Especial",
  "Entrada",
  "Entrada/Petisco",
  "Entrada/Almoço",
  "Entrada/Jantar",
  "Entrada/Lanche",
  "Sopa",
  "Sopa/Jantar",
  "Lanche",
  "Acompanhamento",
  "Acompanhamento/Jantar",
  "Almoço/Jantar",
  "Pequeno-almoço/Almoço",
  "Pequeno-almoço/Lanche",
  "Pequeno-almoço/Jantar",
  "Sobremesa",
  "Sobremesa/Lanche",
  "Petisco",
];

const TEMPOS = [
  "10 min", "15 min", "20 min", "25 min", "30 min", "35 min",
  "40 min", "45 min", "50 min", "55 min", "60 min", "70 min",
  "80 min", "90 min", "120 min", "150 min", "180 min", "240 min",
  "60 min + fermentação", "120 min + marinada"
];

const PERFIS_BASE = [
  "Normal", "Vegetariano", "Vegano", "Sem Glúten",
  "Contém peixe", "Contém marisco", "Contém lactose",
  "Contém amendoim", "Contém nozes", "Contém glúten"
];

const PAISES = [
  "Angola", "Argentina", "Arábia Saudita", "Arménia", "Argélia",
  "Áustria", "Bélgica", "Bósnia", "Brasil", "Bolívia",
  "Cabo Verde", "Camarões", "Canadá", "Cazaquistão", "Chile",
  "China", "Colômbia", "Coreia do Sul", "Cuba", "Dinamarca",
  "Egito", "Equador", "Escócia", "Espanha", "EUA", "Etiópia",
  "Filipinas", "Finlândia", "França", "Gâmbia", "Geórgia",
  "Grécia", "Haiti", "Holanda", "Hungria", "Índia", "Indonésia",
  "Irão", "Irlanda", "Israel", "Itália", "Japão", "Jamaica",
  "Jordânia", "Lesoto", "Líbano", "Madagáscar", "Malásia", "Mali",
  "Marrocos", "México", "Moçambique", "Nepal", "Nigéria", "Noruega",
  "Paquistão", "Peru", "Polónia", "Portugal", "Porto Rico",
  "Quénia", "Reino Unido", "República Checa", "República do Congo",
  "Rússia", "Senegal", "Sérvia", "Singapura", "Suécia", "Suíça",
  "Tailândia", "Tibete", "Trinidad e Tobago", "Turquia", "Ucrânia",
  "Uruguai", "Usbequistão", "Venezuela", "Vietname", "Zimbabwe",
  "Colômbia/Venezuela", "África Do Sul"
];

// ─── Estilos reutilizáveis ────────────────────────────────────────────────────
const S = {
  input: {
    width: "100%", background: "#0a0d12",
    border: "1px solid rgba(255,255,255,.1)", borderRadius: 8,
    padding: "9px 12px", color: "#f8fafc", fontSize: 13,
    outline: "none", boxSizing: "border-box",
    fontFamily: "'DM Sans', sans-serif",
  },
  label: {
    fontSize: 11, color: "rgba(255,255,255,.4)",
    fontWeight: 700, letterSpacing: "0.06em",
    textTransform: "uppercase", display: "block", marginBottom: 5,
  },
  field: { marginBottom: 14 },
  required: { color: "#f87171", marginLeft: 2 },
};

// ─── Selector de perfis alimentares (multi-select com checkboxes) ─────────────
function PerfilSelector({ value, onChange }) {
  const selected = value ? value.split(",").map(s => s.trim()).filter(Boolean) : [];

  function toggle(p) {
    const next = selected.includes(p)
      ? selected.filter(s => s !== p)
      : [...selected, p];
    onChange(next.join(", "));
  }

  return (
    <div style={{
      display: "flex", flexWrap: "wrap", gap: 6,
      background: "#0a0d12", border: "1px solid rgba(255,255,255,.1)",
      borderRadius: 8, padding: "10px 12px",
    }}>
      {PERFIS_BASE.map(p => {
        const active = selected.includes(p);
        return (
          <button key={p} type="button" onClick={() => toggle(p)} style={{
            padding: "4px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600,
            border: `1px solid ${active ? "rgba(139,92,246,.5)" : "rgba(255,255,255,.1)"}`,
            background: active ? "rgba(139,92,246,.2)" : "transparent",
            color: active ? "#a78bfa" : "rgba(255,255,255,.4)",
            cursor: "pointer", transition: "all .15s",
          }}>{p}</button>
        );
      })}
      {selected.length > 0 && (
        <div style={{ width: "100%", marginTop: 6, fontSize: 11, color: "rgba(255,255,255,.3)" }}>
          Selecionado: <span style={{ color: "#a78bfa" }}>{selected.join(", ")}</span>
        </div>
      )}
    </div>
  );
}

// ─── Formulário principal ─────────────────────────────────────────────────────
const EMPTY = {
  nome_receita: "", pais: "", categoria: "", tempo_preparo: "",
  ingredientes: "", passo_passo: "", perfil_alimentar: "", ativo: true,
};

function RecipeForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || EMPTY);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(initial?.imagem_url || "");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [paisOutro, setPaisOutro] = useState(
  initial?._id && !PAISES.includes(initial?.pais) && !!initial?.pais
);
const [tempoOutro, setTempoOutro] = useState(
  initial?._id && !TEMPOS.includes(initial?.tempo_preparo) && !!initial?.tempo_preparo
);
  const fileRef = useRef();

  function set(name, value) {
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(e => ({ ...e, [name]: "" }));
  }

  function handleImage(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  }

  function validate() {
    const errs = {};
    if (!form.nome_receita.trim()) errs.nome_receita = "Campo obrigatório";
    if (!form.pais) errs.pais = "Seleciona um país";
    if (!form.categoria) errs.categoria = "Seleciona uma categoria";
    if (!form.tempo_preparo) errs.tempo_preparo = "Seleciona o tempo";
    if (!form.perfil_alimentar) errs.perfil_alimentar = "Seleciona pelo menos um perfil";
    if (!form.ingredientes.trim()) errs.ingredientes = "Campo obrigatório";
    if (!form.passo_passo.trim()) errs.passo_passo = "Campo obrigatório";
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
      const url = isEdit
        ? `${API}/international-recipes/${initial._id}`
        : `${API}/international-recipes`;

      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: fd,
      });
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
    ? <div style={{ color: "#f87171", fontSize: 11, marginTop: 4 }}>{errors[field]}</div>
    : null;

  return (
    <form onSubmit={handleSubmit}>
      {errors._global && (
        <div style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.3)", color: "#f87171", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13 }}>
          {errors._global}
        </div>
      )}

      {/* Imagem */}
      <div style={S.field}>
        <label style={S.label}>Imagem da Receita</label>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 100, height: 70, borderRadius: 8, overflow: "hidden",
            background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            {preview
              ? <img src={preview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <span style={{ fontSize: 28 }}>◉</span>
            }
          </div>
          <div>
            <button type="button" onClick={() => fileRef.current.click()} style={{
              padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,.15)",
              background: "rgba(255,255,255,.05)", color: "#94a3b8",
              cursor: "pointer", fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6,
            }}>
              {preview ? " Alterar Imagem" : " Escolher Imagem"}
            </button>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.2)" }}>JPG, PNG, WebP · Máx. 5MB</div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} style={{ display: "none" }} />
        </div>
      </div>

     {/* Nome + País */}
<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
  <div>
    <label style={S.label}>Nome da Receita <span style={S.required}>*</span></label>
    <input
      value={form.nome_receita}
      onChange={e => set("nome_receita", e.target.value)}
      placeholder="Ex: Pizza Margherita"
      style={{ ...S.input, borderColor: errors.nome_receita ? "rgba(239,68,68,.5)" : "rgba(255,255,255,.1)" }}
    />
    <Err field="nome_receita" />
  </div>
  <div>
    <label style={S.label}>País <span style={S.required}>*</span></label>
    {!paisOutro ? (
      <select
        value={form.pais}
        onChange={e => {
          if (e.target.value === "__outro__") { setPaisOutro(true); set("pais", ""); }
          else set("pais", e.target.value);
        }}
        style={{ ...S.input, borderColor: errors.pais ? "rgba(239,68,68,.5)" : "rgba(255,255,255,.1)", cursor: "pointer" }}
      >
        <option value="">— Seleciona um país —</option>
        {PAISES.sort().map(p => <option key={p} value={p}>{p}</option>)}
        <option value="__outro__"> Outro país (escrever)...</option>
      </select>
    ) : (
      <div style={{ display: "flex", gap: 6 }}>
        <input
          value={form.pais}
          onChange={e => set("pais", e.target.value)}
          placeholder="Nome do país..."
          autoFocus
          style={{ ...S.input, flex: 1, borderColor: errors.pais ? "rgba(239,68,68,.5)" : "rgba(139,92,246,.4)" }}
        />
        <button type="button" onClick={() => { setPaisOutro(false); set("pais", ""); }} style={{
          padding: "0 10px", borderRadius: 8, border: "1px solid rgba(255,255,255,.1)",
          background: "transparent", color: "#94a3b8", cursor: "pointer", fontSize: 18, lineHeight: 1,
        }}>←</button>
      </div>
    )}
    <Err field="pais" />
  </div>
</div>

      {/* Categoria + Tempo */}
<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
  <div>
    <label style={S.label}>Categoria <span style={S.required}>*</span></label>
    <select
      value={form.categoria}
      onChange={e => set("categoria", e.target.value)}
      style={{ ...S.input, borderColor: errors.categoria ? "rgba(239,68,68,.5)" : "rgba(255,255,255,.1)", cursor: "pointer" }}
    >
      <option value="">— Seleciona —</option>
      {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
    </select>
    <Err field="categoria" />
  </div>
  <div>
    <label style={S.label}>Tempo de Preparo <span style={S.required}>*</span></label>
    {!tempoOutro ? (
      <select
        value={form.tempo_preparo}
        onChange={e => {
          if (e.target.value === "__outro__") { setTempoOutro(true); set("tempo_preparo", ""); }
          else set("tempo_preparo", e.target.value);
        }}
        style={{ ...S.input, borderColor: errors.tempo_preparo ? "rgba(239,68,68,.5)" : "rgba(255,255,255,.1)", cursor: "pointer" }}
      >
        <option value="">— Seleciona —</option>
        {TEMPOS.map(t => <option key={t} value={t}>{t}</option>)}
        <option value="__outro__"> Outro tempo (escrever)...</option>
      </select>
    ) : (
      <div style={{ display: "flex", gap: 6 }}>
        <input
          value={form.tempo_preparo}
          onChange={e => set("tempo_preparo", e.target.value)}
          placeholder="Ex: 2h 30min, 45 min..."
          autoFocus
          style={{ ...S.input, flex: 1, borderColor: errors.tempo_preparo ? "rgba(239,68,68,.5)" : "rgba(139,92,246,.4)" }}
        />
        <button type="button" onClick={() => { setTempoOutro(false); set("tempo_preparo", ""); }} style={{
          padding: "0 10px", borderRadius: 8, border: "1px solid rgba(255,255,255,.1)",
          background: "transparent", color: "#94a3b8", cursor: "pointer", fontSize: 18, lineHeight: 1,
        }}>←</button>
      </div>
    )}
    <Err field="tempo_preparo" />
  </div>
</div>
      {/* Perfil alimentar */}
      <div style={S.field}>
        <label style={S.label}>Perfil Alimentar <span style={S.required}>*</span></label>
        <PerfilSelector
          value={form.perfil_alimentar}
          onChange={v => set("perfil_alimentar", v)}
        />
        <Err field="perfil_alimentar" />
      </div>

      {/* Ingredientes */}
      <div style={S.field}>
        <label style={S.label}>Ingredientes <span style={S.required}>*</span></label>
        <textarea
          value={form.ingredientes}
          onChange={e => set("ingredientes", e.target.value)}
          rows={3}
          placeholder="Ex: Massa de pizza, molho de tomate, queijo mozzarella, manjericão fresco"
          style={{ ...S.input, resize: "vertical", borderColor: errors.ingredientes ? "rgba(239,68,68,.5)" : "rgba(255,255,255,.1)" }}
        />
        <Err field="ingredientes" />
      </div>

      {/* Passo a passo */}
      <div style={S.field}>
        <label style={S.label}>Passo a Passo <span style={S.required}>*</span></label>
        <textarea
          value={form.passo_passo}
          onChange={e => set("passo_passo", e.target.value)}
          rows={5}
          placeholder="1. Primeiro passo; 2. Segundo passo; 3. Terceiro passo..."
          style={{ ...S.input, resize: "vertical", borderColor: errors.passo_passo ? "rgba(239,68,68,.5)" : "rgba(255,255,255,.1)" }}
        />
        <Err field="passo_passo" />
      </div>

      {/* Ativo */}
      <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", marginBottom: 20, padding: "10px 12px", background: "rgba(255,255,255,.03)", borderRadius: 8, border: "1px solid rgba(255,255,255,.06)" }}>
        <div
          onClick={() => set("ativo", !form.ativo)}
          style={{
            width: 40, height: 22, borderRadius: 99, position: "relative",
            background: form.ativo ? "#8b5cf6" : "rgba(255,255,255,.1)",
            cursor: "pointer", transition: "background .2s", flexShrink: 0,
          }}
        >
          <div style={{
            position: "absolute", top: 3, left: form.ativo ? 21 : 3,
            width: 16, height: 16, borderRadius: "50%", background: "#fff",
            transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,.3)",
          }} />
        </div>
        <div>
          <div style={{ fontSize: 13, color: "#f1f5f9", fontWeight: 600 }}>Receita Ativa</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)" }}>
            {form.ativo ? "Visível no frontend para todos os utilizadores" : "Oculta — não aparece na Viagem Gastronómica"}
          </div>
        </div>
      </label>

      {/* Botões */}
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4 }}>
        <button type="button" onClick={onCancel} style={{
          padding: "10px 22px", borderRadius: 8, border: "1px solid rgba(255,255,255,.1)",
          background: "transparent", color: "#94a3b8", cursor: "pointer", fontSize: 13, fontWeight: 600,
        }}>Cancelar</button>
        <button type="submit" disabled={saving} style={{
          padding: "10px 28px", borderRadius: 8, border: "none",
          background: saving ? "rgba(139,92,246,.3)" : "linear-gradient(135deg, #7c3aed, #6d28d9)",
          color: "#ede9fe", cursor: saving ? "not-allowed" : "pointer",
          fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 8,
        }}>
          {saving ? "A guardar..." : (initial?._id ? "✓ Atualizar Receita" : "✓ Criar Receita")}
        </button>
      </div>
    </form>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function Modal({ title, children, onClose }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,.8)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: 20,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: "#0d1117", border: "1px solid rgba(255,255,255,.08)",
        borderRadius: 16, width: "100%", maxWidth: 700,
        maxHeight: "92vh", overflowY: "auto", padding: "28px 32px",
        boxShadow: "0 25px 60px rgba(0,0,0,.6)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,.06)" }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9" }}>{title}</h2>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,.3)", marginTop: 3 }}>Todos os campos com * são obrigatórios</p>
          </div>
          <button onClick={onClose} style={{
            background: "rgba(255,255,255,.06)", border: "none", color: "rgba(255,255,255,.5)",
            width: 32, height: 32, borderRadius: 8, fontSize: 18, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function InternationalRecipesAdmin({ toast }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterPais, setFilterPais] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [modal, setModal] = useState(null);
  const [acting, setActing] = useState(false);

  async function load(p = 1, s = search, pais = filterPais) {
    setLoading(true);
    try {
      const q = new URLSearchParams({ page: p, limit: 20, ...(s && { search: s }), ...(pais && { pais }) });
      const res = await fetch(`${API}/international-recipes?${q}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      setRecipes(data.data || []);
      setPagination(data.pagination || {});
      setPage(p);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(1); }, [search, filterPais]);

  async function handleToggle(id) {
    try {
      const res = await fetch(`${API}/international-recipes/${id}/toggle`, {
        method: "PATCH", headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRecipes(prev => prev.map(r => r._id === id ? data.data : r));
    } catch (err) { toast(err.message, "error"); }
  }

  async function handleDelete(id, nome) {
    if (!confirm(`Apagar "${nome}"? Esta ação é irreversível.`)) return;
    setActing(true);
    try {
      await fetch(`${API}/international-recipes/${id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` }
      });
      setRecipes(prev => prev.filter(r => r._id !== id));
      toast("Receita apagada", "success");
    } catch (err) { toast(err.message, "error"); }
    finally { setActing(false); }
  }

  function handleSaved(recipe) {
    if (modal?._id) {
      setRecipes(prev => prev.map(r => r._id === recipe._id ? recipe : r));
      toast("Receita atualizada!", "success");
    } else {
      setRecipes(prev => [recipe, ...prev]);
      toast("Receita criada!", "success");
    }
    setModal(null);
  }

  const paises = [...new Set(recipes.map(r => r.pais))].sort();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Toolbar */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="  Pesquisar receita..."
          style={{
            flex: 1, minWidth: 200, background: "#0d1117",
            border: "1px solid rgba(255,255,255,.08)", borderRadius: 10,
            padding: "9px 14px", color: "#f8fafc", fontSize: 13, outline: "none",
          }}
        />
        <select
          value={filterPais}
          onChange={e => setFilterPais(e.target.value)}
          style={{
            background: "#0d1117", border: "1px solid rgba(255,255,255,.08)",
            borderRadius: 10, padding: "9px 12px",
            color: filterPais ? "#f8fafc" : "rgba(255,255,255,.3)",
            fontSize: 13, outline: "none", cursor: "pointer",
          }}
        >
          <option value="">Todos os países</option>
          {paises.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <button onClick={() => setModal("create")} style={{
          padding: "9px 20px", borderRadius: 10, border: "none",
          background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
          color: "#ede9fe", cursor: "pointer", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap",
        }}>+ Nova Receita</button>
      </div>

      <div style={{ fontSize: 12, color: "rgba(255,255,255,.3)" }}>
        {pagination.total ?? 0} receitas no total
      </div>

      {/* Tabela */}
      <div style={{ background: "#0d1117", border: "1px solid rgba(255,255,255,.06)", borderRadius: 14, overflow: "hidden" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "70px 1fr 120px 120px 100px 70px 130px",
          padding: "11px 18px", borderBottom: "1px solid rgba(255,255,255,.05)",
          fontSize: 10, color: "rgba(255,255,255,.25)", fontWeight: 700,
          letterSpacing: "0.1em", textTransform: "uppercase",
        }}>
          <span>Imagem</span><span>Receita / País</span><span>Categoria</span>
          <span>Tempo</span><span>Perfil</span><span>Ativo</span><span>Ações</span>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,.2)", fontSize: 13 }}>
            A carregar...
          </div>
        ) : recipes.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>◉</div>
            <div style={{ color: "rgba(255,255,255,.3)", fontSize: 13, marginBottom: 16 }}>
              Nenhuma receita encontrada.
            </div>
            <button onClick={() => setModal("create")} style={{
              padding: "9px 20px", borderRadius: 9, border: "1px solid rgba(139,92,246,.4)",
              background: "rgba(139,92,246,.1)", color: "#a78bfa",
              cursor: "pointer", fontSize: 13, fontWeight: 600,
            }}>+ Criar primeira receita</button>
          </div>
        ) : recipes.map((r, i) => (
          <div key={r._id} style={{
            display: "grid", gridTemplateColumns: "70px 1fr 120px 120px 100px 70px 130px",
            padding: "11px 18px", alignItems: "center",
            borderBottom: i < recipes.length - 1 ? "1px solid rgba(255,255,255,.04)" : "none",
            transition: "background .1s",
          }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.02)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <div style={{ width: 50, height: 38, borderRadius: 7, overflow: "hidden", background: "rgba(255,255,255,.05)" }}>
              {r.imagem_url
                ? <img src={r.imagem_url} alt={r.nome_receita} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>◉</div>
              }
            </div>
            <div style={{ minWidth: 0, paddingRight: 8 }}>
              <div style={{ fontSize: 13, color: "#f1f5f9", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {r.nome_receita}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.35)", marginTop: 2 }}>{r.pais}</div>
            </div>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,.45)" }}>{r.categoria}</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,.45)" }}>{r.tempo_preparo}</span>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,.35)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {r.perfil_alimentar}
            </span>
            <button onClick={() => handleToggle(r._id)} style={{
              width: 38, height: 22, borderRadius: 99, border: "none",
              background: r.ativo ? "#8b5cf6" : "rgba(255,255,255,.1)",
              cursor: "pointer", position: "relative", transition: "background .2s",
            }}>
              <div style={{
                position: "absolute", top: 3, left: r.ativo ? 19 : 3,
                width: 16, height: 16, borderRadius: "50%", background: "#fff",
                transition: "left .2s",
              }} />
            </button>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setModal(r)} style={{
                background: "none", border: "none", color: "#60a5fa",
                cursor: "pointer", fontSize: 12, fontWeight: 600,
              }}> Editar</button>
              <button onClick={() => handleDelete(r._id, r.nome_receita)} disabled={acting} style={{
                background: "none", border: "none", color: "#f87171",
                cursor: "pointer", fontSize: 12, fontWeight: 600,
              }}>Deletar</button>
            </div>
          </div>
        ))}
      </div>

      {pagination.pages > 1 && (
        <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => load(p)} style={{
              width: 34, height: 34, borderRadius: 8,
              border: page === p ? "1px solid rgba(139,92,246,.5)" : "1px solid rgba(255,255,255,.08)",
              background: page === p ? "rgba(139,92,246,.15)" : "transparent",
              color: page === p ? "#a78bfa" : "rgba(255,255,255,.35)",
              cursor: "pointer", fontSize: 12, fontWeight: 600,
            }}>{p}</button>
          ))}
        </div>
      )}

      {modal && (
        <Modal
          title={modal === "create" ? " Nova Receita Internacional" : ` Editar — ${modal.nome_receita}`}
          onClose={() => setModal(null)}
        >
          <RecipeForm
            initial={modal === "create" ? null : modal}
            onSave={handleSaved}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}
    </div>
  );
}