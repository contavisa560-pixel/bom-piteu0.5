import { useState, useEffect } from "react";

const API = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api`;
function getToken() { return localStorage.getItem("bomPiteuToken") || ""; }
function authHeaders() { return { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` }; }
async function apiFetch(path, opts = {}) {
  const res = await fetch(`${API}${path}`, { headers: authHeaders(), ...opts });
  if (!res.ok) throw new Error((await res.json()).error || res.statusText);
  return res.json();
}

// ── Design Tokens ─────────────────────────────────────────────────────────────
const inp = {
  width: "100%", background: "#070a0e",
  border: "1px solid rgba(255,255,255,.1)", borderRadius: 8,
  padding: "10px 14px", color: "#f8fafc", fontSize: 13,
  outline: "none", fontFamily: "'DM Sans', sans-serif",
  boxSizing: "border-box", transition: "border-color .15s",
};
const lbl = {
  fontSize: 10, color: "rgba(255,255,255,.3)", fontWeight: 700,
  letterSpacing: "0.09em", textTransform: "uppercase",
  display: "block", marginBottom: 7,
};

// ── Atoms ─────────────────────────────────────────────────────────────────────
function Card({ children, style = {} }) {
  return (
    <div style={{
      background: "#0d1117", border: "1px solid rgba(255,255,255,.06)",
      borderRadius: 12, padding: "22px 24px", ...style,
    }}>{children}</div>
  );
}

function SectionTitle({ children }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
      textTransform: "uppercase", color: "rgba(255,255,255,.25)",
      paddingBottom: 14, marginBottom: 4,
      borderBottom: "1px solid rgba(255,255,255,.05)",
    }}>{children}</div>
  );
}

function Field({ label: l, hint, children, half }) {
  return (
    <div style={{ gridColumn: half ? "span 1" : "span 2" }}>
      {l && <label style={lbl}>{l}</label>}
      {children}
      {hint && <div style={{ fontSize: 11, color: "rgba(255,255,255,.2)", marginTop: 5 }}>{hint}</div>}
    </div>
  );
}

function Toggle({ checked, onChange, label: l, desc, color = "#8b5cf6" }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start",
      justifyContent: "space-between", gap: 16,
      padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,.04)",
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, color: "#f1f5f9", fontWeight: 500 }}>{l}</div>
        {desc && <div style={{ fontSize: 11, color: "rgba(255,255,255,.28)", marginTop: 3, lineHeight: 1.5 }}>{desc}</div>}
      </div>
      <div onClick={onChange} style={{
        width: 44, height: 24, borderRadius: 99, flexShrink: 0,
        background: checked ? color : "rgba(255,255,255,.08)",
        cursor: "pointer", position: "relative", transition: "background .2s",
        border: `1px solid ${checked ? color + "80" : "rgba(255,255,255,.12)"}`,
        marginTop: 2,
      }}>
        <div style={{
          position: "absolute", top: 3, left: checked ? 21 : 3,
          width: 16, height: 16, borderRadius: "50%", background: "#fff",
          transition: "left .2s", boxShadow: "0 1px 4px rgba(0,0,0,.5)",
        }} />
      </div>
    </div>
  );
}

function StatusBadge({ ok, labelOn = "Activo", labelOff = "Inactivo" }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 99,
      background: ok ? "rgba(34,197,94,.1)" : "rgba(239,68,68,.1)",
      color: ok ? "#4ade80" : "#f87171",
      border: `1px solid ${ok ? "rgba(34,197,94,.2)" : "rgba(239,68,68,.2)"}`,
      letterSpacing: "0.05em", textTransform: "uppercase",
    }}>{ok ? labelOn : labelOff}</span>
  );
}

function SaveBtn({ onClick, saving }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 4 }}>
      <button onClick={onClick} disabled={saving} style={{
        padding: "10px 28px", borderRadius: 8,
        border: "1px solid rgba(34,197,94,.3)",
        background: "rgba(34,197,94,.1)", color: "#4ade80",
        cursor: saving ? "not-allowed" : "pointer",
        fontSize: 12, fontWeight: 700, letterSpacing: "0.04em",
        opacity: saving ? 0.6 : 1, transition: "all .15s",
      }}>{saving ? "A guardar..." : "Guardar Alterações"}</button>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function SystemSettings({ toast }) {
  const [s, setS] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("sistema");

  useEffect(() => {
    apiFetch("/admin/system-settings")
      .then(r => setS(r.data))
      .catch(e => toast(e.message, "error"))
      .finally(() => setLoading(false));
  }, []);

  function upd(path, value) {
    setS(prev => {
      const next = structuredClone(prev);
      const keys = path.split(".");
      let cur = next;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!cur[keys[i]]) cur[keys[i]] = {};
        cur = cur[keys[i]];
      }
      cur[keys[keys.length - 1]] = value;
      return next;
    });
  }

  async function save(fields) {
    setSaving(true);
    try {
      const payload = {};
      fields.forEach(f => {
        const keys = f.split(".");
        let src = s, dst = payload;
        for (let i = 0; i < keys.length - 1; i++) {
          if (!dst[keys[i]]) dst[keys[i]] = {};
          src = src?.[keys[i]];
          dst = dst[keys[i]];
        }
        dst[keys[keys.length - 1]] = src?.[keys[keys.length - 1]];
      });
      const r = await apiFetch("/admin/system-settings", {
        method: "PUT", body: JSON.stringify(payload),
      });
      setS(r.data);
      toast("✓ Configurações guardadas com sucesso!", "success");
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setSaving(false);
    }
  }

  const TABS = [
    { id: "sistema",      label: "Sistema",        color: "#8b5cf6" },
    { id: "planos",       label: "Planos & Preços", color: "#f59e0b" },
    { id: "seguranca",    label: "Segurança",      color: "#ef4444" },
    { id: "notificacoes", label: "Notificações",   color: "#4ade80" },
  ];

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
      <div style={{ width: 26, height: 26, border: "2px solid rgba(139,92,246,.15)", borderTopColor: "#8b5cf6", borderRadius: "50%", animation: "spin .65s linear infinite" }} />
    </div>
  );
  if (!s) return null;

  const activeColor = TABS.find(t => t.id === tab)?.color || "#8b5cf6";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Tab bar */}
      <div style={{
        display: "flex", gap: 3, background: "#0d1117",
        border: "1px solid rgba(255,255,255,.06)",
        borderRadius: 12, padding: 5, overflowX: "auto",
      }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, minWidth: 100, padding: "9px 12px", borderRadius: 8,
            border: tab === t.id ? `1px solid ${t.color}30` : "1px solid transparent",
            background: tab === t.id ? `${t.color}12` : "transparent",
            color: tab === t.id ? t.color : "rgba(255,255,255,.3)",
            cursor: "pointer", fontSize: 12, fontWeight: 700,
            transition: "all .15s", whiteSpace: "nowrap",
          }}>{t.label}</button>
        ))}
      </div>

      {/* ══════════════ SISTEMA ══════════════ */}
      {tab === "sistema" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Status cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
            {[
              { label: "Site", ok: !s.maintenanceMode, on: "Online", off: "Manutenção" },
              { label: "Registos", ok: s.allowNewRegistrations, on: "Abertos", off: "Fechados" },
              { label: "Subscrições", ok: s.subscriptionsEnabled, on: "Activas", off: "Desactivadas" },
            ].map(({ label: l, ok, on, off }) => (
              <div key={l} style={{
                background: "#0d1117", border: "1px solid rgba(255,255,255,.06)",
                borderRadius: 10, padding: "16px 18px",
              }}>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,.3)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>{l}</div>
                <StatusBadge ok={ok} labelOn={on} labelOff={off} />
              </div>
            ))}
          </div>

          <Card>
            <SectionTitle>Controlo do Site</SectionTitle>
            <div style={{ marginTop: 8 }}>
              <Toggle
                checked={s.maintenanceMode}
                onChange={() => upd("maintenanceMode", !s.maintenanceMode)}
                label="Modo de Manutenção"
                desc="Quando activo, utilizadores vêem uma página de manutenção. Admins continuam a ter acesso normal."
                color="#ef4444"
              />
              <Toggle
                checked={s.allowNewRegistrations}
                onChange={() => upd("allowNewRegistrations", !s.allowNewRegistrations)}
                label="Permitir novos registos"
                desc="Se desactivado, nenhum utilizador novo consegue criar conta. Útil durante migrações ou pausas."
                color="#8b5cf6"
              />
              <Toggle
                checked={s.subscriptionsEnabled ?? true}
                onChange={() => upd("subscriptionsEnabled", !(s.subscriptionsEnabled ?? true))}
                label="Activar subscrições Premium"
                desc="Se desactivado, o botão de upgrade some e todos os utilizadores ficam no plano free."
                color="#f59e0b"
              />
            </div>
          </Card>

          <SaveBtn onClick={() => save(["maintenanceMode", "allowNewRegistrations", "subscriptionsEnabled"])} saving={saving} />
        </div>
      )}

      {/* ══════════════ IA & LIMITES ══════════════ */}
      {tab === "ia" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          <Card>
            <SectionTitle>Funcionalidades de IA</SectionTitle>
            <div style={{ marginTop: 8 }}>
              <Toggle
                checked={s.aiFeatures?.chat ?? true}
                onChange={() => upd("aiFeatures.chat", !(s.aiFeatures?.chat ?? true))}
                label="Chat & Geração de Receitas"
                desc="Permite que utilizadores gerem receitas via chat com IA."
                color="#22d3ee"
              />
              <Toggle
                checked={s.aiFeatures?.imageGeneration ?? true}
                onChange={() => upd("aiFeatures.imageGeneration", !(s.aiFeatures?.imageGeneration ?? true))}
                label="Geração de Imagens"
                desc="Geração de imagens das receitas com Stability AI."
                color="#22d3ee"
              />
              <Toggle
                checked={s.aiFeatures?.imageAnalysis ?? true}
                onChange={() => upd("aiFeatures.imageAnalysis", !(s.aiFeatures?.imageAnalysis ?? true))}
                label="Análise de Imagens (Visão)"
                desc="Identificação de ingredientes por fotografia."
                color="#22d3ee"
              />
            </div>
          </Card>

          <Card>
            <SectionTitle>Modelo & Parâmetros</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
              <Field label="Modelo OpenAI" half>
                <select style={inp} value={s.openaiModel || "gpt-3.5-turbo"} onChange={e => upd("openaiModel", e.target.value)}>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-4o">GPT-4o</option>
                  <option value="gpt-4o-mini">GPT-4o Mini</option>
                </select>
              </Field>
              <Field label="Temperatura" hint="0 = preciso · 1 = criativo" half>
                <input style={inp} type="number" step="0.1" min="0" max="1" value={s.aiTemperature ?? 0.7}
                  onChange={e => upd("aiTemperature", parseFloat(e.target.value))} />
              </Field>
              <Field label="Máx. tokens por resposta">
                <input style={inp} type="number" value={s.aiMaxTokens ?? 500}
                  onChange={e => upd("aiMaxTokens", parseInt(e.target.value))} />
              </Field>
            </div>
          </Card>

          <Card>
            <SectionTitle>Limites Diários — Plano Free</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginTop: 16 }}>
              {[
                { label: "Pedidos de texto/dia", path: "defaultLimits.textLimit", val: s.defaultLimits?.textLimit ?? 7 },
                { label: "Imagens geradas/dia", path: "defaultLimits.imageLimit", val: s.defaultLimits?.imageLimit ?? 2 },
                { label: "Análises de imagem/dia", path: "defaultLimits.analysisLimit", val: s.defaultLimits?.analysisLimit ?? 3 },
              ].map(({ label: l, path, val }) => (
                <div key={path}>
                  <label style={lbl}>{l}</label>
                  <input style={inp} type="number" min="0" value={val} onChange={e => upd(path, parseInt(e.target.value))} />
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14, padding: "12px 16px", background: "rgba(34,197,94,.06)", borderRadius: 8, border: "1px solid rgba(34,197,94,.12)" }}>
              <div style={{ fontSize: 11, color: "rgba(34,197,94,.8)", fontWeight: 600 }}>
                ⚡ Estes limites aplicam-se a novos utilizadores automaticamente. Utilizadores existentes mantêm os seus limites actuais.
              </div>
            </div>
          </Card>

          <SaveBtn onClick={() => save(["aiFeatures", "openaiModel", "aiTemperature", "aiMaxTokens", "defaultLimits"])} saving={saving} />
        </div>
      )}

      {/* ══════════════ PLANOS & PREÇOS ══════════════ */}
      {tab === "planos" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          <Card>
            <SectionTitle>Preços dos Planos (Kz)</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginTop: 16 }}>
              {[
                { label: "Premium Mensal", path: "premiumPrices.monthly", val: s.premiumPrices?.monthly ?? 3500 },
                { label: "Premium Anual", path: "premiumPrices.yearly", val: s.premiumPrices?.yearly ?? 35000 },
                { label: "Familiar Mensal", path: "premiumPrices.lifetime", val: s.premiumPrices?.lifetime ?? 7500 },
              ].map(({ label: l, path, val }) => (
                <div key={path}>
                  <label style={lbl}>{l}</label>
                  <div style={{ position: "relative" }}>
                    <input style={{ ...inp, paddingRight: 40 }} type="number" min="0" value={val}
                      onChange={e => upd(path, parseInt(e.target.value))} />
                    <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: "rgba(255,255,255,.3)", pointerEvents: "none" }}>Kz</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <SectionTitle>Período de Teste (Trial)</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16, marginTop: 16, alignItems: "start" }}>
              <div>
                <label style={lbl}>Dias de trial gratuito</label>
                <input style={inp} type="number" min="0" max="30" value={s.trialDays ?? 0}
                  onChange={e => upd("trialDays", parseInt(e.target.value))} />
              </div>
              <div style={{ padding: "12px 16px", background: "rgba(245,158,11,.06)", borderRadius: 8, border: "1px solid rgba(245,158,11,.12)", marginTop: 22 }}>
                <div style={{ fontSize: 11, color: "rgba(245,158,11,.8)", fontWeight: 600, lineHeight: 1.6 }}>
                  {s.trialDays > 0
                    ? `✓ Novos utilizadores terão ${s.trialDays} dias de Premium gratuito ao criar conta.`
                    : "Trial desactivado. Novos utilizadores começam no plano Free."}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <SectionTitle>Estado das Subscrições</SectionTitle>
            <div style={{ marginTop: 8 }}>
              <Toggle
                checked={s.subscriptionsEnabled ?? true}
                onChange={() => upd("subscriptionsEnabled", !(s.subscriptionsEnabled ?? true))}
                label="Subscrições Premium activas"
                desc="Se desactivado, o upgrade para Premium fica indisponível para todos os utilizadores."
                color="#f59e0b"
              />
            </div>
          </Card>

          <SaveBtn onClick={() => save(["premiumPrices", "trialDays", "subscriptionsEnabled"])} saving={saving} />
        </div>
      )}

      {/* ══════════════ SEGURANÇA ══════════════ */}
      {tab === "seguranca" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          <Card>
            <SectionTitle>Políticas de Acesso</SectionTitle>
            <div style={{ marginTop: 8 }}>
              <Toggle
                checked={s.require2FAForAdmins ?? false}
                onChange={() => upd("require2FAForAdmins", !(s.require2FAForAdmins ?? false))}
                label="Exigir 2FA para todos os Admins"
                desc="Administradores sem 2FA activo serão impedidos de aceder ao painel."
                color="#ef4444"
              />
              <Toggle
                checked={s.requireEmailVerification ?? true}
                onChange={() => upd("requireEmailVerification", !(s.requireEmailVerification ?? true))}
                label="Exigir verificação de email no registo"
                desc="Utilizadores precisam verificar o email antes do primeiro login."
                color="#ef4444"
              />
              <Toggle
                checked={s.allowUserDeletion ?? true}
                onChange={() => upd("allowUserDeletion", !(s.allowUserDeletion ?? true))}
                label="Permitir que utilizadores apaguem a conta"
                desc="Se desactivado, apenas admins podem eliminar contas."
                color="#ef4444"
              />
            </div>
          </Card>

          <Card>
            <SectionTitle>Limites de Sessão & Tentativas</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
              <div>
                <label style={lbl}>Máx. tentativas de login</label>
                <input style={inp} type="number" min="1" max="20" value={s.maxLoginAttempts ?? 5}
                  onChange={e => upd("maxLoginAttempts", parseInt(e.target.value))} />
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.2)", marginTop: 5 }}>Após este número a conta é bloqueada temporariamente</div>
              </div>
              <div>
                <label style={lbl}>Timeout de sessão (minutos)</label>
                <input style={inp} type="number" min="15" value={s.sessionTimeoutMinutes ?? 120}
                  onChange={e => upd("sessionTimeoutMinutes", parseInt(e.target.value))} />
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.2)", marginTop: 5 }}>Sessões inactivas são terminadas após este tempo</div>
              </div>
              <div>
                <label style={lbl}>Forçar troca de senha (dias)</label>
                <input style={inp} type="number" min="0" value={s.forcePasswordChangeDays ?? 0}
                  onChange={e => upd("forcePasswordChangeDays", parseInt(e.target.value))} />
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.2)", marginTop: 5 }}>0 = desactivado</div>
              </div>
              <div>
                <label style={lbl}>Máx. requisições por janela</label>
                <input style={inp} type="number" min="10" value={s.rateLimit?.maxRequests ?? 100}
                  onChange={e => upd("rateLimit.maxRequests", parseInt(e.target.value))} />
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.2)", marginTop: 5 }}>Protecção contra ataques de força bruta</div>
              </div>
            </div>
          </Card>

          <SaveBtn onClick={() => save(["require2FAForAdmins", "requireEmailVerification", "allowUserDeletion", "maxLoginAttempts", "sessionTimeoutMinutes", "forcePasswordChangeDays", "rateLimit"])} saving={saving} />
        </div>
      )}

      {/* ══════════════ NOTIFICAÇÕES ══════════════ */}
      {tab === "notificacoes" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          <Card>
            <SectionTitle>Emails do Sistema</SectionTitle>
            <div style={{ marginTop: 8 }}>
              <Toggle
                checked={s.enableNotifications ?? true}
                onChange={() => upd("enableNotifications", !(s.enableNotifications ?? true))}
                label="Activar emails de sistema"
                desc="Emails de verificação, recuperação de senha e alertas de segurança."
                color="#4ade80"
              />
            </div>
          </Card>

          <Card>
            <SectionTitle>Configuração SMTP</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
              <div style={{ gridColumn: "span 2" }}>
                <label style={lbl}>Servidor SMTP</label>
                <input style={inp} placeholder="smtp.gmail.com" value={s.smtp?.host || ""}
                  onChange={e => upd("smtp.host", e.target.value)} />
              </div>
              <div>
                <label style={lbl}>Porta</label>
                <input style={inp} type="number" value={s.smtp?.port ?? 587}
                  onChange={e => upd("smtp.port", parseInt(e.target.value))} />
              </div>
              <div>
                <label style={lbl}>Utilizador / Email</label>
                <input style={inp} value={s.smtp?.user || ""}
                  onChange={e => upd("smtp.user", e.target.value)} />
              </div>
            </div>
            <div style={{ marginTop: 14 }}>
              <Toggle
                checked={s.smtp?.secure ?? false}
                onChange={() => upd("smtp.secure", !(s.smtp?.secure ?? false))}
                label="Usar SSL/TLS"
                desc="Activar para porta 465. Para porta 587 usar STARTTLS (desactivado)."
                color="#4ade80"
              />
            </div>
            <div style={{ marginTop: 14, padding: "12px 16px", background: s.smtp?.host ? "rgba(34,197,94,.06)" : "rgba(239,68,68,.06)", borderRadius: 8, border: `1px solid ${s.smtp?.host ? "rgba(34,197,94,.15)" : "rgba(239,68,68,.15)"}` }}>
              <div style={{ fontSize: 11, color: s.smtp?.host ? "rgba(34,197,94,.8)" : "rgba(239,68,68,.7)", fontWeight: 600 }}>
                {s.smtp?.host
                  ? `✓ SMTP configurado: ${s.smtp.host}:${s.smtp.port || 587}`
                  : "⚠ SMTP não configurado — emails de sistema estão desactivados"}
              </div>
            </div>
          </Card>

          <SaveBtn onClick={() => save(["enableNotifications", "smtp"])} saving={saving} />
        </div>
      )}
    </div>
  );
}