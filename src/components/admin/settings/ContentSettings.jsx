import { useState } from 'react';
import { Card, SectionLabel, ActionBtn } from '../SharedComponents';

const inputStyle = {
  width: "100%", background: "#0a0d12",
  border: "1px solid rgba(255,255,255,.08)",
  borderRadius: 10, padding: "11px 14px",
  color: "#f8fafc", fontSize: 13, outline: "none",
  fontFamily: "'DM Sans', sans-serif",
  transition: "border-color .15s", boxSizing: "border-box",
};

const labelStyle = {
  fontSize: 11, color: "rgba(255,255,255,.3)", fontWeight: 600,
  letterSpacing: "0.06em", textTransform: "uppercase",
  display: "block", marginBottom: 8,
};

export default function ContentSettings({ settings, onSave, saving }) {
  const [form, setForm] = useState({
    profanityFilter: settings.profanityFilter,
    allowedCategories: settings.allowedCategories || [],
    defaultRecipeImage: settings.defaultRecipeImage,
    allowUserRecipes: settings.allowUserRecipes,
  });

  const [newCategory, setNewCategory] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const addCategory = () => {
    if (newCategory.trim() && !form.allowedCategories.includes(newCategory.trim())) {
      setForm(prev => ({
        ...prev,
        allowedCategories: [...prev.allowedCategories, newCategory.trim()]
      }));
      setNewCategory('');
    }
  };

  const removeCategory = (cat) => {
    setForm(prev => ({
      ...prev,
      allowedCategories: prev.allowedCategories.filter(c => c !== cat)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card style={{ padding: 24, marginBottom: 24 }}>
        <SectionLabel>Moderação</SectionLabel>
        <div style={{ marginBottom: 16 }}>
          <label>
            <input type="checkbox" name="profanityFilter" checked={form.profanityFilter} onChange={handleChange} />
            Activar filtro de linguagem imprópria
          </label>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>
            <input type="checkbox" name="allowUserRecipes" checked={form.allowUserRecipes} onChange={handleChange} />
            Permitir que utilizadores publiquem receitas
          </label>
        </div>
      </Card>

      <Card style={{ padding: 24, marginBottom: 24 }}>
        <SectionLabel>Categorias Permitidas</SectionLabel>
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Ex: portuguesa, italiana, vegana..."
              style={{ ...inputStyle, flex: 1 }}
            />
            <button type="button" onClick={addCategory} style={{
              padding: "0 16px", borderRadius: 8, border: "1px solid rgba(139,92,246,.4)",
              background: "rgba(139,92,246,.1)", color: "#a78bfa", cursor: "pointer",
              fontSize: 12, fontWeight: 600,
            }}>Adicionar</button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
            {form.allowedCategories.map(cat => (
              <span key={cat} style={{
                background: "rgba(139,92,246,.1)", border: "1px solid rgba(139,92,246,.3)",
                borderRadius: 20, padding: "4px 10px", fontSize: 12,
                display: 'flex', alignItems: 'center', gap: 6
              }}>
                {cat}
                <button type="button" onClick={() => removeCategory(cat)} style={{
                  background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: 14
                }}>×</button>
              </span>
            ))}
          </div>
        </div>
      </Card>

      <Card style={{ padding: 24, marginBottom: 24 }}>
        <SectionLabel>Imagem Padrão</SectionLabel>
        <div>
          <label style={labelStyle}>URL da imagem padrão para receitas</label>
          <input type="url" name="defaultRecipeImage" value={form.defaultRecipeImage} onChange={handleChange} style={inputStyle} />
        </div>
      </Card>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <ActionBtn type="submit" disabled={saving} variant="success">
          {saving ? 'A guardar...' : 'Guardar Alterações'}
        </ActionBtn>
      </div>
    </form>
  );
}