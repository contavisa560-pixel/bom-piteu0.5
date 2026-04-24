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

export default function GeneralSettings({ settings, onSave, saving }) {
  const [form, setForm] = useState({
    siteTitle: settings.siteTitle,
    siteTagline: settings.siteTagline,
    supportEmail: settings.supportEmail,
    maintenanceMode: settings.maintenanceMode,
    allowNewRegistrations: settings.allowNewRegistrations,
    defaultLanguage: settings.defaultLanguage,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card style={{ padding: 24, marginBottom: 24 }}>
        <SectionLabel>Identidade do Site</SectionLabel>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Título</label>
          <input name="siteTitle" value={form.siteTitle} onChange={handleChange} style={inputStyle} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Slogan</label>
          <input name="siteTagline" value={form.siteTagline} onChange={handleChange} style={inputStyle} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>E‑mail de suporte</label>
          <input name="supportEmail" value={form.supportEmail} onChange={handleChange} style={inputStyle} />
        </div>
      </Card>

      <Card style={{ padding: 24, marginBottom: 24 }}>
        <SectionLabel>Controlo do Sistema</SectionLabel>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>
            <input type="checkbox" name="maintenanceMode" checked={form.maintenanceMode} onChange={handleChange} />
            Modo de Manutenção
          </label>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', marginTop: 4 }}>
            Quando activo, apenas administradores podem aceder ao site.
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>
            <input type="checkbox" name="allowNewRegistrations" checked={form.allowNewRegistrations} onChange={handleChange} />
            Permitir novos registos
          </label>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Idioma padrão</label>
          <select name="defaultLanguage" value={form.defaultLanguage} onChange={handleChange} style={inputStyle}>
            <option value="pt">Português</option>
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
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