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

export default function SecuritySettings({ settings, onSave, saving }) {
  const [form, setForm] = useState({
    require2FAForAdmins: settings.require2FAForAdmins,
    forcePasswordChangeDays: settings.forcePasswordChangeDays,
    adminIpWhitelist: settings.adminIpWhitelist || [],
    rateLimit: { ...settings.rateLimit },
  });

  const [newIp, setNewIp] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('rateLimit.')) {
      const field = name.split('.')[1];
      setForm(prev => ({
        ...prev,
        rateLimit: { ...prev.rateLimit, [field]: Number(value) }
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
  };

  const addIp = () => {
    if (newIp.trim() && !form.adminIpWhitelist.includes(newIp.trim())) {
      setForm(prev => ({
        ...prev,
        adminIpWhitelist: [...prev.adminIpWhitelist, newIp.trim()]
      }));
      setNewIp('');
    }
  };

  const removeIp = (ip) => {
    setForm(prev => ({
      ...prev,
      adminIpWhitelist: prev.adminIpWhitelist.filter(i => i !== ip)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card style={{ padding: 24, marginBottom: 24 }}>
        <SectionLabel>Segurança Avançada</SectionLabel>
        <div style={{ marginBottom: 12 }}>
          <label>
            <input type="checkbox" name="require2FAForAdmins" checked={form.require2FAForAdmins} onChange={handleChange} />
            Exigir 2FA para administradores
          </label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Forçar troca de senha a cada X dias (0 = desactivado)</label>
          <input type="number" name="forcePasswordChangeDays" value={form.forcePasswordChangeDays} onChange={handleChange} style={inputStyle} />
        </div>
      </Card>

      <Card style={{ padding: 24, marginBottom: 24 }}>
        <SectionLabel>Whitelist de IPs (Acesso Admin)</SectionLabel>
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={newIp}
              onChange={(e) => setNewIp(e.target.value)}
              placeholder="Ex: 192.168.1.1"
              style={{ ...inputStyle, flex: 1 }}
            />
            <button type="button" onClick={addIp} style={{
              padding: "0 16px", borderRadius: 8, border: "1px solid rgba(139,92,246,.4)",
              background: "rgba(139,92,246,.1)", color: "#a78bfa", cursor: "pointer",
              fontSize: 12, fontWeight: 600,
            }}>Adicionar</button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
            {form.adminIpWhitelist.map(ip => (
              <span key={ip} style={{
                background: "rgba(139,92,246,.1)", border: "1px solid rgba(139,92,246,.3)",
                borderRadius: 20, padding: "4px 10px", fontSize: 12,
                display: 'flex', alignItems: 'center', gap: 6
              }}>
                {ip}
                <button type="button" onClick={() => removeIp(ip)} style={{
                  background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: 14
                }}>×</button>
              </span>
            ))}
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', marginTop: 8 }}>
            Se a lista estiver vazia, qualquer IP pode aceder.
          </div>
        </div>
      </Card>

      <Card style={{ padding: 24, marginBottom: 24 }}>
        <SectionLabel>Limite de Requisições (Rate Limit)</SectionLabel>
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Janela de tempo (ms)</label>
          <input type="number" name="rateLimit.windowMs" value={form.rateLimit.windowMs} onChange={handleChange} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Máx. requisições por janela</label>
          <input type="number" name="rateLimit.maxRequests" value={form.rateLimit.maxRequests} onChange={handleChange} style={inputStyle} />
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