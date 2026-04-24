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

export default function UserSettings({ settings, onSave, saving }) {
  const [form, setForm] = useState({
    defaultLimits: { ...settings.defaultLimits },
    maxLoginAttempts: settings.maxLoginAttempts,
    sessionTimeoutMinutes: settings.sessionTimeoutMinutes,
    allowUserDeletion: settings.allowUserDeletion,
    requireEmailVerification: settings.requireEmailVerification,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('defaultLimits.')) {
      const limit = name.split('.')[1];
      setForm(prev => ({
        ...prev,
        defaultLimits: { ...prev.defaultLimits, [limit]: Number(value) }
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card style={{ padding: 24, marginBottom: 24 }}>
        <SectionLabel>Limites Padrão para Novos Utilizadores</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div>
            <label style={labelStyle}>Texto diário</label>
            <input type="number" name="defaultLimits.textLimit" value={form.defaultLimits.textLimit} onChange={handleChange} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Imagens diárias</label>
            <input type="number" name="defaultLimits.imageLimit" value={form.defaultLimits.imageLimit} onChange={handleChange} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Análises diárias</label>
            <input type="number" name="defaultLimits.analysisLimit" value={form.defaultLimits.analysisLimit} onChange={handleChange} style={inputStyle} />
          </div>
        </div>
      </Card>

      <Card style={{ padding: 24, marginBottom: 24 }}>
        <SectionLabel>Segurança de Conta</SectionLabel>
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Máx. tentativas de login</label>
          <input type="number" name="maxLoginAttempts" value={form.maxLoginAttempts} onChange={handleChange} style={inputStyle} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Timeout de sessão (minutos)</label>
          <input type="number" name="sessionTimeoutMinutes" value={form.sessionTimeoutMinutes} onChange={handleChange} style={inputStyle} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>
            <input type="checkbox" name="allowUserDeletion" checked={form.allowUserDeletion} onChange={handleChange} />
            Permitir que utilizadores apaguem a própria conta
          </label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>
            <input type="checkbox" name="requireEmailVerification" checked={form.requireEmailVerification} onChange={handleChange} />
            Exigir verificação de e‑mail antes do login
          </label>
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