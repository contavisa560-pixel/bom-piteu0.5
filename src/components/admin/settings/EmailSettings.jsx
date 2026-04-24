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

export default function EmailSettings({ settings, onSave, saving }) {
  const [form, setForm] = useState({
    smtp: { ...settings.smtp },
    emailTemplates: { ...settings.emailTemplates },
    enableNotifications: settings.enableNotifications,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('smtp.')) {
      const field = name.split('.')[1];
      setForm(prev => ({
        ...prev,
        smtp: { ...prev.smtp, [field]: value }
      }));
    } else if (name.startsWith('emailTemplates.')) {
      const tpl = name.split('.')[1];
      setForm(prev => ({
        ...prev,
        emailTemplates: { ...prev.emailTemplates, [tpl]: value }
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
        <SectionLabel>Configuração SMTP</SectionLabel>
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Servidor</label>
          <input name="smtp.host" value={form.smtp.host} onChange={handleChange} style={inputStyle} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Porta</label>
          <input type="number" name="smtp.port" value={form.smtp.port} onChange={handleChange} style={inputStyle} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Utilizador</label>
          <input name="smtp.user" value={form.smtp.user} onChange={handleChange} style={inputStyle} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Palavra-passe</label>
          <input type="password" name="smtp.pass" value={form.smtp.pass} onChange={handleChange} style={inputStyle} />
        </div>
        <div>
          <label>
            <input type="checkbox" name="smtp.secure" checked={form.smtp.secure} onChange={handleChange} />
            Usar SSL/TLS
          </label>
        </div>
      </Card>

      <Card style={{ padding: 24, marginBottom: 24 }}>
        <SectionLabel>Templates de Email</SectionLabel>
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Bem‑vindo</label>
          <textarea name="emailTemplates.welcome" value={form.emailTemplates.welcome} onChange={handleChange} rows={3} style={inputStyle} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Recuperação de senha</label>
          <textarea name="emailTemplates.passwordReset" value={form.emailTemplates.passwordReset} onChange={handleChange} rows={3} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Confirmação de subscrição</label>
          <textarea name="emailTemplates.subscriptionConfirmation" value={form.emailTemplates.subscriptionConfirmation} onChange={handleChange} rows={3} style={inputStyle} />
        </div>
      </Card>

      <Card style={{ padding: 24, marginBottom: 24 }}>
        <SectionLabel>Notificações</SectionLabel>
        <div>
          <label>
            <input type="checkbox" name="enableNotifications" checked={form.enableNotifications} onChange={handleChange} />
            Activar notificações por email (gerais)
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