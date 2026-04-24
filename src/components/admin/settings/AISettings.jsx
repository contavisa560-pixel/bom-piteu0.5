import { useState } from 'react';
import { Card, SectionLabel, ActionBtn } from '../SharedComponents';

const inputStyle = { /* mesmo estilo de GeneralSettings */ };
const labelStyle = { /* mesmo estilo de GeneralSettings */ };

export default function AISettings({ settings, onSave, saving }) {
  const [form, setForm] = useState({
    openaiApiKey: settings.openaiApiKey ? '********' : '',
    openaiModel: settings.openaiModel,
    aiTemperature: settings.aiTemperature,
    aiMaxTokens: settings.aiMaxTokens,
    aiFeatures: { ...settings.aiFeatures },
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('aiFeatures.')) {
      const feature = name.split('.')[1];
      setForm(prev => ({
        ...prev,
        aiFeatures: { ...prev.aiFeatures, [feature]: checked }
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = { ...form };
    if (submitData.openaiApiKey === '********') delete submitData.openaiApiKey;
    onSave(submitData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card style={{ padding: 24, marginBottom: 24 }}>
        <SectionLabel>Configurações da OpenAI</SectionLabel>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Chave API</label>
          <input
            type="password"
            name="openaiApiKey"
            value={form.openaiApiKey}
            onChange={handleChange}
            placeholder="sk-..."
            style={inputStyle}
          />
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', marginTop: 4 }}>
            {settings.openaiApiKey ? 'Chave configurada (oculta)' : 'Não configurada'}
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Modelo</label>
          <select name="openaiModel" value={form.openaiModel} onChange={handleChange} style={inputStyle}>
            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            <option value="gpt-4">GPT-4</option>
          </select>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Temperatura (0.0 - 1.0)</label>
          <input type="number" step="0.1" name="aiTemperature" value={form.aiTemperature} onChange={handleChange} style={inputStyle} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Máx. tokens</label>
          <input type="number" name="aiMaxTokens" value={form.aiMaxTokens} onChange={handleChange} style={inputStyle} />
        </div>
      </Card>

      <Card style={{ padding: 24, marginBottom: 24 }}>
        <SectionLabel>Funcionalidades de IA (Activar/Desactivar)</SectionLabel>
        <div style={{ marginBottom: 12 }}>
          <label>
            <input type="checkbox" name="aiFeatures.chat" checked={form.aiFeatures.chat} onChange={handleChange} />
            Chat (geração de receitas)
          </label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>
            <input type="checkbox" name="aiFeatures.imageGeneration" checked={form.aiFeatures.imageGeneration} onChange={handleChange} />
            Geração de Imagens (DALL·E)
          </label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>
            <input type="checkbox" name="aiFeatures.imageAnalysis" checked={form.aiFeatures.imageAnalysis} onChange={handleChange} />
            Análise de Imagens (Visão)
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