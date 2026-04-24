import { useState } from 'react';
import { sendBulkNotification } from '../../services/api';
import { Card, SectionLabel, Spinner, ActionBtn } from './SharedComponents';
const SEGMENTS = [
  { value: "all",     label: "Todos os Utilizadores" },
  { value: "premium", label: "Premium" },
  { value: "free",    label: "Free" },
];

export default function BulkNotification({ toast }) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [segment, setSegment] = useState('all');
  const [sending, setSending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSending(true);
    try {
      const res = await sendBulkNotification(title, message, segment);
      toast(`Notificação enviada para ${res.sent} utilizadores`, 'success');
      setTitle('');
      setMessage('');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSending(false);
    }
  }

  const inputStyle = {
    width: "100%", background: "#0a0d12",
    border: "1px solid rgba(255,255,255,.08)",
    borderRadius: 10, padding: "11px 14px",
    color: "#f8fafc", fontSize: 13, outline: "none",
    fontFamily: "'DM Sans', sans-serif",
    transition: "border-color .15s", boxSizing: "border-box",
    resize: "none",
  };

  return (
    <div style={{
      background: "#0d1117", border: "1px solid rgba(255,255,255,.06)",
      borderRadius: 14, overflow: "hidden",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Header */}
      <div style={{
        padding: "18px 24px 16px",
        borderBottom: "1px solid rgba(255,255,255,.05)",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: 7,
          background: "rgba(139,92,246,.12)",
          border: "1px solid rgba(139,92,246,.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, color: "#a78bfa",
        }}>✉</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>
            Notificação em Massa
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)" }}>
            Envia mensagens para segmentos de utilizadores
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
        
        {/* Segment */}
        <div>
          <label style={{ fontSize: 11, color: "rgba(255,255,255,.3)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
            Segmento
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            {SEGMENTS.map(s => (
              <button key={s.value} type="button" onClick={() => setSegment(s.value)} style={{
                padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                cursor: "pointer", transition: "all .15s",
                background: segment === s.value ? "rgba(139,92,246,.15)" : "rgba(255,255,255,.04)",
                border: segment === s.value ? "1px solid rgba(139,92,246,.4)" : "1px solid rgba(255,255,255,.08)",
                color: segment === s.value ? "#a78bfa" : "rgba(255,255,255,.4)",
              }}>{s.label}</button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label style={{ fontSize: 11, color: "rgba(255,255,255,.3)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
            Título
          </label>
          <input
            type="text" placeholder="Título da notificação..."
            value={title} onChange={e => setTitle(e.target.value)} required
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = "rgba(139,92,246,.5)"}
            onBlur={e => e.target.style.borderColor = "rgba(255,255,255,.08)"}
          />
        </div>

        {/* Message */}
        <div>
          <label style={{ fontSize: 11, color: "rgba(255,255,255,.3)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
            Mensagem
          </label>
          <textarea
            placeholder="Conteúdo da notificação..."
            value={message} onChange={e => setMessage(e.target.value)} required rows={3}
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = "rgba(139,92,246,.5)"}
            onBlur={e => e.target.style.borderColor = "rgba(255,255,255,.08)"}
          />
        </div>

        {/* Submit */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button type="submit" disabled={sending || !title || !message} style={{
            padding: "10px 24px", borderRadius: 10, fontSize: 13, fontWeight: 700,
            background: sending ? "rgba(139,92,246,.15)" : "linear-gradient(135deg, #7c3aed, #6d28d9)",
            border: "1px solid rgba(139,92,246,.4)",
            color: "#e9d5ff", cursor: (sending || !title || !message) ? "not-allowed" : "pointer",
            opacity: (!title || !message) ? 0.5 : 1,
            transition: "all .15s", letterSpacing: "0.02em",
          }}>
            {sending ? (
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 12, height: 12, border: "2px solid rgba(255,255,255,.2)",
                  borderTopColor: "#e9d5ff", borderRadius: "50%",
                  animation: "spin .65s linear infinite", flexShrink: 0,
                }} />
                A enviar...
              </span>
            ) : "Enviar Notificação"}
          </button>
        </div>
      </form>
    </div>
  );
}