import { useState, useEffect, useCallback } from "react";

const API = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api`;

function getToken() {
  return localStorage.getItem("bomPiteuToken") || sessionStorage.getItem("bomPiteuToken") || "";
}
function authHeaders() {
  return { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` };
}
async function apiFetch(path, opts = {}) {
  const res = await fetch(`${API}${path}`, { headers: authHeaders(), ...opts });
  if (!res.ok) throw new Error((await res.json()).error || res.statusText);
  return res.json();
}

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" });
}
function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return `${s}s atrás`;
  if (s < 3600) return `${Math.floor(s / 60)}m atrás`;
  if (s < 86400) return `${Math.floor(s / 3600)}h atrás`;
  return `${Math.floor(s / 86400)}d atrás`;
}
function initials(name = "") {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "??";
}
const PALETTE = [
  ["#0f172a","#e2e8f0"],["#1e1b4b","#a5b4fc"],["#064e3b","#6ee7b7"],
  ["#4c1d95","#ddd6fe"],["#7c2d12","#fed7aa"],["#134e4a","#99f6e4"],
];
function avatarColor(str = "") {
  let h = 0; for (const c of str) h = (h * 31 + c.charCodeAt(0)) % PALETTE.length;
  return PALETTE[h];
}

function isActive(user) {
  if (!user.isPremium) return false;
  if (!user.premiumExpiresAt) return true;
  return new Date(user.premiumExpiresAt) > new Date();
}
function daysLeft(expiresAt) {
  if (!expiresAt) return null;
  const diff = Math.ceil((new Date(expiresAt) - new Date()) / (1000 * 60 * 60 * 24));
  return diff;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Avatar({ name, size = 32 }) {
  const [bg, fg] = avatarColor(name);
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: bg, color: fg,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.33, fontWeight: 700, flexShrink: 0,
      fontFamily: "'DM Mono', monospace",
    }}>{initials(name)}</div>
  );
}

function SubBadge({ user }) {
  if (!user.isPremium) return (
    <span style={{ fontSize: 10, padding: "3px 9px", borderRadius: 99, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace", background: "rgba(148,163,184,.08)", color: "#94a3b8", border: "1px solid rgba(148,163,184,.15)" }}>Free</span>
  );
  const active = isActive(user);
  const days = daysLeft(user.premiumExpiresAt);
  const warning = days !== null && days <= 7 && days > 0;
  return (
    <span style={{
      fontSize: 10, padding: "3px 9px", borderRadius: 99, fontWeight: 700,
      letterSpacing: "0.05em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace",
      background: active ? (warning ? "rgba(245,158,11,.12)" : "rgba(34,197,94,.1)") : "rgba(239,68,68,.1)",
      color: active ? (warning ? "#fbbf24" : "#4ade80") : "#f87171",
      border: `1px solid ${active ? (warning ? "rgba(245,158,11,.3)" : "rgba(34,197,94,.25)") : "rgba(239,68,68,.25)"}`,
    }}>
      {active ? (warning ? `⚠ ${days}d` : "Premium") : "Expirado"}
    </span>
  );
}

function Spinner() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 48 }}>
      <div style={{ width: 20, height: 20, border: "2px solid rgba(139,92,246,.15)", borderTopColor: "#8b5cf6", borderRadius: "50%", animation: "spin .65s linear infinite" }} />
    </div>
  );
}

// ── Activate Modal ────────────────────────────────────────────────────────────

function ActivateModal({ user, onClose, onSuccess }) {
  const [months, setMonths] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleActivate() {
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch(`/admin/users/${user._id}/activate-premium`, {
        method: "POST",
        body: JSON.stringify({ months }),
      });
      onSuccess(res.message);
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch(`/admin/users/${user._id}/cancel-premium`, { method: "POST" });
      onSuccess(res.message);
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const active = isActive(user);

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.65)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "100%", maxWidth: 440,
        background: "#0d1117", border: "1px solid rgba(255,255,255,.08)",
        borderRadius: 18, overflow: "hidden",
        animation: "modalIn .2s cubic-bezier(.34,1.56,.64,1)",
        fontFamily: "'DM Sans', sans-serif",
      }}>

        {/* Header */}
        <div style={{ padding: "22px 26px 18px", borderBottom: "1px solid rgba(255,255,255,.06)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar name={user.name} size={38} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9" }}>{user.name}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginTop: 2 }}>{user.email}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.04)", color: "rgba(255,255,255,.4)", cursor: "pointer", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>

        <div style={{ padding: "22px 26px" }}>

          {/* Current status */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 10, marginBottom: 22 }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,.4)" }}>Estado actual</span>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <SubBadge user={user} />
              {user.premiumExpiresAt && (
                <span style={{ fontSize: 11, color: "rgba(255,255,255,.25)", fontFamily: "'DM Mono', monospace" }}>
                  {active ? `expira ${fmtDate(user.premiumExpiresAt)}` : `expirou ${fmtDate(user.premiumExpiresAt)}`}
                </span>
              )}
            </div>
          </div>

          {/* Activate section */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, color: "rgba(255,255,255,.3)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 12 }}>
              {active ? "Estender Premium" : "Activar Premium"}
            </label>

            {/* Month picker */}
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              {[1, 3, 6, 12].map(m => (
                <button key={m} onClick={() => setMonths(m)} style={{
                  flex: 1, padding: "10px 0", borderRadius: 9, fontSize: 12, fontWeight: 700,
                  cursor: "pointer", transition: "all .15s",
                  background: months === m ? "rgba(139,92,246,.18)" : "rgba(255,255,255,.04)",
                  border: months === m ? "1px solid rgba(139,92,246,.45)" : "1px solid rgba(255,255,255,.08)",
                  color: months === m ? "#c4b5fd" : "rgba(255,255,255,.4)",
                }}>
                  {m}m
                </button>
              ))}
            </div>

            {/* Preview */}
            <div style={{ padding: "10px 14px", background: "rgba(139,92,246,.06)", border: "1px solid rgba(139,92,246,.15)", borderRadius: 9, marginBottom: 14 }}>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,.4)" }}>Novo prazo: </span>
              <span style={{ fontSize: 12, color: "#a78bfa", fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>
                {(() => {
                  const base = active && user.premiumExpiresAt ? new Date(user.premiumExpiresAt) : new Date();
                  const exp = new Date(base);
                  exp.setMonth(exp.getMonth() + months);
                  return fmtDate(exp);
                })()}
              </span>
              {active && <span style={{ fontSize: 11, color: "rgba(139,92,246,.6)", marginLeft: 8 }}>(estendido)</span>}
            </div>

            <button onClick={handleActivate} disabled={loading} style={{
              width: "100%", padding: "11px 0", borderRadius: 10, fontSize: 13, fontWeight: 700,
              background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
              border: "1px solid rgba(139,92,246,.4)", color: "#ede9fe",
              cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1,
              transition: "all .15s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              {loading ? <><div style={{ width: 12, height: 12, border: "2px solid rgba(255,255,255,.2)", borderTopColor: "#ede9fe", borderRadius: "50%", animation: "spin .65s linear infinite" }} />A processar...</> : `${active ? "Estender" : "Activar"} por ${months} mês${months > 1 ? "es" : ""}`}
            </button>
          </div>

          {/* Divider */}
          {active && (
            <div style={{ borderTop: "1px solid rgba(255,255,255,.05)", paddingTop: 16 }}>
              <button onClick={handleCancel} disabled={loading} style={{
                width: "100%", padding: "10px 0", borderRadius: 10, fontSize: 12, fontWeight: 700,
                background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.2)",
                color: "#f87171", cursor: loading ? "not-allowed" : "pointer",
                transition: "all .15s",
              }}>
                Cancelar Subscrição
              </button>
            </div>
          )}

          {error && (
            <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.2)", borderRadius: 9, fontSize: 12, color: "#f87171" }}>
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── History Panel ─────────────────────────────────────────────────────────────

function HistoryPanel() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/admin/subscriptions/history")
      .then(r => setLogs(r.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function actionLabel(action) {
    if (action.includes("activate")) return { label: "Activado", color: "#4ade80" };
    if (action.includes("cancel")) return { label: "Cancelado", color: "#f87171" };
    return { label: action, color: "#94a3b8" };
  }

  function extractMonths(action) {
    const match = action.match(/:(\d+)meses/);
    return match ? `${match[1]}m` : null;
  }

  if (loading) return <Spinner />;
  if (!logs.length) return (
    <div style={{ padding: "40px", textAlign: "center", color: "rgba(255,255,255,.2)", fontSize: 13 }}>
      Sem histórico de subscrições
    </div>
  );

  return (
    <div>
      {logs.map((log, i) => {
        const { label, color } = actionLabel(log.action);
        const months = extractMonths(log.action);
        return (
          <div key={log._id} style={{
            display: "grid", gridTemplateColumns: "1fr 1fr 80px 90px",
            padding: "12px 22px", borderBottom: i < logs.length - 1 ? "1px solid rgba(255,255,255,.04)" : "none",
            alignItems: "center",
          }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.02)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Avatar name={log.userId?.name || "?"} size={26} />
              <div>
                <div style={{ fontSize: 12, color: "#e2e8f0", fontWeight: 600 }}>{log.userId?.name || "—"}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,.25)" }}>{log.userId?.email}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, fontWeight: 700, background: `${color}15`, color, border: `1px solid ${color}30`, fontFamily: "'DM Mono', monospace", letterSpacing: "0.04em" }}>
                {label}
              </span>
              {months && <span style={{ fontSize: 10, color: "rgba(255,255,255,.3)", fontFamily: "'DM Mono', monospace" }}>{months}</span>}
            </div>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,.2)", fontFamily: "'DM Mono', monospace" }}>admin</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,.25)", fontFamily: "'DM Mono', monospace" }}>
              {timeAgo(log.createdAt)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

const STATUS_TABS = [
  { id: "", label: "Todos" },
  { id: "active", label: "Activos" },
  { id: "expired", label: "Expirados" },
  { id: "free", label: "Free" },
];

export default function Subscriptions({ toast }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [selected, setSelected] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  const load = useCallback(async (p = 1, s = status) => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ page: p, limit: 20, ...(s && { status: s }) });
      const r = await apiFetch(`/admin/subscriptions?${q}`);
      setUsers(r.data);
      setPagination(r.pagination);
      setPage(p);
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => { load(1); }, []);

  function handleStatusChange(s) {
    setStatus(s);
    load(1, s);
  }

  // Stats
  const total = pagination.total ?? 0;
  const activeCount = users.filter(isActive).length;
  const expiringCount = users.filter(u => {
    const d = daysLeft(u.premiumExpiresAt);
    return isActive(u) && d !== null && d <= 7;
  }).length;

  const cols = "1fr 1.4fr 100px 130px 120px 100px";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, fontFamily: "'DM Sans', sans-serif" }}>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
        {[
          { label: "Total de Contas", value: total, color: "#8b5cf6", sub: "nesta página" },
          { label: "Premium Activos", value: activeCount, color: "#4ade80", sub: "nesta página" },
          { label: "A Expirar (7d)", value: expiringCount, color: "#fbbf24", sub: "requerem atenção" },
        ].map(({ label, value, color, sub }) => (
          <div key={label} style={{
            background: "#0d1117", border: "1px solid rgba(255,255,255,.06)",
            borderRadius: 14, padding: "18px 22px", position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${color}50, transparent)` }} />
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>{label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#f8fafc", lineHeight: 1, fontFamily: "'DM Mono', monospace" }}>{value}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.25)", marginTop: 6 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        {/* Status filter */}
        <div style={{ display: "flex", gap: 6 }}>
          {STATUS_TABS.map(tab => (
            <button key={tab.id} onClick={() => handleStatusChange(tab.id)} style={{
              padding: "7px 16px", borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: "pointer",
              transition: "all .15s",
              background: status === tab.id ? "rgba(139,92,246,.15)" : "rgba(255,255,255,.04)",
              border: status === tab.id ? "1px solid rgba(139,92,246,.4)" : "1px solid rgba(255,255,255,.08)",
              color: status === tab.id ? "#a78bfa" : "rgba(255,255,255,.4)",
            }}>{tab.label}</button>
          ))}
        </div>

        <button onClick={() => setShowHistory(v => !v)} style={{
          padding: "7px 16px", borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: "pointer",
          background: showHistory ? "rgba(34,211,238,.1)" : "rgba(255,255,255,.04)",
          border: showHistory ? "1px solid rgba(34,211,238,.3)" : "1px solid rgba(255,255,255,.08)",
          color: showHistory ? "#22d3ee" : "rgba(255,255,255,.4)",
          transition: "all .15s",
        }}>
          {showHistory ? "← Utilizadores" : "Histórico →"}
        </button>
      </div>

      {/* History view */}
      {showHistory ? (
        <div style={{ background: "#0d1117", border: "1px solid rgba(255,255,255,.06)", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "16px 22px", borderBottom: "1px solid rgba(255,255,255,.05)", display: "grid", gridTemplateColumns: "1fr 1fr 80px 90px", fontSize: 10, color: "rgba(255,255,255,.25)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace" }}>
            <span>Utilizador</span><span>Acção</span><span>Por</span><span>Quando</span>
          </div>
          <HistoryPanel />
        </div>
      ) : (
        <>
          {/* Table */}
          <div style={{ background: "#0d1117", border: "1px solid rgba(255,255,255,.06)", borderRadius: 14, overflow: "hidden" }}>
            {/* Header */}
            <div style={{ display: "grid", gridTemplateColumns: cols, padding: "12px 22px", borderBottom: "1px solid rgba(255,255,255,.05)", fontSize: 10, color: "rgba(255,255,255,.25)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace" }}>
              <span>Utilizador</span>
              <span>Email</span>
              <span>Estado</span>
              <span>Expira em</span>
              <span>Pedidos</span>
              <span>Ação</span>
            </div>

            {loading ? <Spinner /> : users.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center", color: "rgba(255,255,255,.2)", fontSize: 13 }}>Nenhum utilizador encontrado</div>
            ) : users.map((u, i) => {
              const active = isActive(u);
              const days = daysLeft(u.premiumExpiresAt);
              const warning = days !== null && days <= 7 && days > 0;
              return (
                <div key={u._id} style={{
                  display: "grid", gridTemplateColumns: cols,
                  padding: "13px 22px", borderBottom: i < users.length - 1 ? "1px solid rgba(255,255,255,.04)" : "none",
                  alignItems: "center", transition: "background .12s",
                }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.02)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    <Avatar name={u.name} size={28} />
                    <span style={{ fontSize: 13, color: "#f1f5f9", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.name}</span>
                  </div>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,.35)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</span>
                  <SubBadge user={u} />
                  <div>
                    {u.premiumExpiresAt ? (
                      <>
                        <div style={{ fontSize: 12, color: warning ? "#fbbf24" : active ? "rgba(255,255,255,.5)" : "#f87171", fontFamily: "'DM Mono', monospace" }}>
                          {fmtDate(u.premiumExpiresAt)}
                        </div>
                        {days !== null && (
                          <div style={{ fontSize: 10, color: "rgba(255,255,255,.2)", marginTop: 2 }}>
                            {days > 0 ? `${days} dias` : "expirado"}
                          </div>
                        )}
                      </>
                    ) : (
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,.2)" }}>
                        {u.isPremium ? "Sem limite" : "—"}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,.4)", fontFamily: "'DM Mono', monospace" }}>
                    {u.usage?.dailyTextRequests ?? 0}
                  </span>
                  <button onClick={() => setSelected(u)} style={{
                    padding: "6px 14px", borderRadius: 8, fontSize: 11, fontWeight: 700,
                    cursor: "pointer", transition: "all .15s", letterSpacing: "0.03em",
                    background: active ? "rgba(139,92,246,.1)" : "rgba(34,197,94,.1)",
                    border: active ? "1px solid rgba(139,92,246,.3)" : "1px solid rgba(34,197,94,.25)",
                    color: active ? "#a78bfa" : "#4ade80",
                  }}>
                    {active ? "Gerir" : "Activar"}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => load(p)} style={{
                  width: 34, height: 34, borderRadius: 8,
                  border: page === p ? "1px solid rgba(139,92,246,.5)" : "1px solid rgba(255,255,255,.08)",
                  background: page === p ? "rgba(139,92,246,.15)" : "transparent",
                  color: page === p ? "#a78bfa" : "rgba(255,255,255,.35)",
                  cursor: "pointer", fontSize: 12, fontWeight: 600,
                  fontFamily: "'DM Mono', monospace", transition: "all .15s",
                }}>{p}</button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Activate Modal */}
      {selected && (
        <ActivateModal
          user={selected}
          onClose={() => setSelected(null)}
          onSuccess={(msg) => { toast(msg, "success"); load(page); }}
        />
      )}
    </div>
  );
}