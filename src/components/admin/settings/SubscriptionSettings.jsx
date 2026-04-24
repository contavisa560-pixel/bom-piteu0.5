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

export default function SubscriptionSettings({ settings, onSave, saving }) {
  const [form, setForm] = useState({
    premiumPrices: { ...settings.premiumPrices },
    trialDays: settings.trialDays,
    freeLimits: { ...settings.freeLimits },
    subscriptionsEnabled: settings.subscriptionsEnabled,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('premiumPrices.')) {
      const plan = name.split('.')[1];
      setForm(prev => ({
        ...prev,
        premiumPrices: { ...prev.premiumPrices, [plan]: Number(value) }
      }));
    } else if (name.startsWith('freeLimits.')) {
      const limit = name.split('.')[1];
      setForm(prev => ({
        ...prev,
        freeLimits: { ...prev.freeLimits, [limit]: Number(value) }
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
        <SectionLabel>Preços dos Planos (€)</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div>
            <label style={labelStyle}>Mensal</label>
            <input type="number" step="0.01" name="premiumPrices.monthly" value={form.premiumPrices.monthly} onChange={handleChange} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Anual</label>
            <input type="number" step="0.01" name="premiumPrices.yearly" value={form.premiumPrices.yearly} onChange={handleChange} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Vitalício</label>
            <input type="number" step="0.01" name="premiumPrices.lifetime" value={form.premiumPrices.lifetime} onChange={handleChange} style={inputStyle} />
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <label style={labelStyle}>Dias de teste</label>
          <input type="number" name="trialDays" value={form.trialDays} onChange={handleChange} style={inputStyle} />
        </div>
      </Card>

      <Card style={{ padding: 24, marginBottom: 24 }}>
        <SectionLabel>Limites para Utilizadores Free</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div>
            <label style={labelStyle}>Texto diário</label>
            <input type="number" name="freeLimits.textLimit" value={form.freeLimits.textLimit} onChange={handleChange} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Imagens diárias</label>
            <input type="number" name="freeLimits.imageLimit" value={form.freeLimits.imageLimit} onChange={handleChange} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Análises diárias</label>
            <input type="number" name="freeLimits.analysisLimit" value={form.freeLimits.analysisLimit} onChange={handleChange} style={inputStyle} />
          </div>
        </div>
      </Card>

      <Card style={{ padding: 24, marginBottom: 24 }}>
        <SectionLabel>Estado Geral</SectionLabel>
        <div>
          <label>
            <input type="checkbox" name="subscriptionsEnabled" checked={form.subscriptionsEnabled} onChange={handleChange} />
            Activar subscrições premium
          </label>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', marginTop: 4 }}>
            Se desactivado, todos os utilizadores terão acesso apenas ao plano gratuito.
          </div>
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