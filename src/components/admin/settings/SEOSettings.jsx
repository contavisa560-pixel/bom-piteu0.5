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

export default function SEOSettings({ settings, onSave, saving }) {
  const [form, setForm] = useState({
    metaDescription: settings.metaDescription,
    metaKeywords: settings.metaKeywords,
    socialLinks: { ...settings.socialLinks },
    ogImage: settings.ogImage,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('socialLinks.')) {
      const network = name.split('.')[1];
      setForm(prev => ({
        ...prev,
        socialLinks: { ...prev.socialLinks, [network]: value }
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card style={{ padding: 24, marginBottom: 24 }}>
        <SectionLabel>Meta Dados</SectionLabel>
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Descrição (meta description)</label>
          <textarea name="metaDescription" value={form.metaDescription} onChange={handleChange} rows={2} style={inputStyle} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Palavras‑chave (meta keywords)</label>
          <input name="metaKeywords" value={form.metaKeywords} onChange={handleChange} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Imagem Open Graph (URL)</label>
          <input name="ogImage" value={form.ogImage} onChange={handleChange} style={inputStyle} />
        </div>
      </Card>

      <Card style={{ padding: 24, marginBottom: 24 }}>
        <SectionLabel>Redes Sociais</SectionLabel>
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Facebook</label>
          <input name="socialLinks.facebook" value={form.socialLinks.facebook} onChange={handleChange} style={inputStyle} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Instagram</label>
          <input name="socialLinks.instagram" value={form.socialLinks.instagram} onChange={handleChange} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Twitter/X</label>
          <input name="socialLinks.twitter" value={form.socialLinks.twitter} onChange={handleChange} style={inputStyle} />
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