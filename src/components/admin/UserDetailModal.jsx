import { useState, useEffect } from 'react';
import { getAdminUserDetail, getAdminLogs, getUser } from '../../services/api';

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

function StatRow({ label, value, accent }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,.04)",
    }}>
      <span style={{ fontSize: 12, color: "rgba(255,255,255,.35)", fontWeight: 500 }}>{label}</span>
      <span style={{
        fontSize: 12, color: accent || "#e2e8f0", fontWeight: 600,
        fontFamily: "'DM Mono', monospace",
      }}>{value ?? "—"}</span>
    </div>
  );
}

const TABS = [
  { id: "profile", label: "Perfil" },
  { id: "usage",   label: "Utilização" },
  { id: "logs",    label: "Logs" },
];

export default function UserDetailModal({ userId, onClose }) {
  const [user, setUser] = useState(null);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    Promise.all([
      getUser(userId),
      getAdminUserDetail(userId),
      getAdminLogs(1, 50).then(res => (res.data || []).filter(log => log.userId?._id === userId || log.userId === userId)),
    ]).then(([userData, , userLogs]) => {
      setUser(userData.user || userData);
      setLogs(userLogs);
    }).catch(console.error).finally(() => setLoading(false));
  }, [userId]);

  function dotColor(log) {
    if (log.error) return "#ef4444";
    if (log.tokensUsed > 0) return "#22c55e";
    return "#f59e0b";
  }

  const [bg, fg] = avatarColor(user?.name || "");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        @keyframes modalIn { from { opacity:0; transform:scale(.97) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }
      `}</style>

      {/* Overlay */}
      <div onClick={onClose} style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,.7)",
        backdropFilter: "blur(4px)",
        zIndex: 1000,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {/* Modal */}
        <div onClick={e => e.stopPropagation()} style={{
          width: "100%", maxWidth: 560,
          background: "#0d1117",
          border: "1px solid rgba(255,255,255,.08)",
          borderRadius: 18,
          overflow: "hidden",
          animation: "modalIn .2s cubic-bezier(.34,1.56,.64,1)",
          fontFamily: "'DM Sans', sans-serif",
          maxHeight: "85vh",
          display: "flex", flexDirection: "column",
        }}>

          {/* Header */}
          <div style={{
            padding: "24px 28px 0",
            background: "linear-gradient(180deg, rgba(139,92,246,.06) 0%, transparent 100%)",
            borderBottom: "1px solid rgba(255,255,255,.06)",
          }}>
            {loading ? (
              <div style={{ height: 80, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{
                  width: 20, height: 20, border: "2px solid rgba(139,92,246,.2)",
                  borderTopColor: "#8b5cf6", borderRadius: "50%",
                  animation: "spin .65s linear infinite",
                }} />
              </div>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: "50%",
                      background: bg, color: fg,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 16, fontWeight: 700,
                      fontFamily: "'DM Mono', monospace",
                      boxShadow: "0 0 0 3px rgba(255,255,255,.06)",
                    }}>{initials(user?.name)}</div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.01em" }}>
                        {user?.name}
                      </div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,.35)", marginTop: 2 }}>
                        {user?.email}
                      </div>
                    </div>
                  </div>
                  <button onClick={onClose} style={{
                    width: 30, height: 30, borderRadius: 8, border: "1px solid rgba(255,255,255,.1)",
                    background: "rgba(255,255,255,.04)", color: "rgba(255,255,255,.4)",
                    cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
                    lineHeight: 1,
                  }}>×</button>
                </div>

                {/* Tabs */}
                <div style={{ display: "flex", gap: 0 }}>
                  {TABS.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                      padding: "9px 18px", fontSize: 12, fontWeight: 600,
                      color: activeTab === tab.id ? "#a78bfa" : "rgba(255,255,255,.3)",
                      borderBottom: activeTab === tab.id ? "2px solid #8b5cf6" : "2px solid transparent",
                      background: "none", border: "none",
                      borderBottom: activeTab === tab.id ? "2px solid #8b5cf6" : "2px solid transparent",
                      cursor: "pointer", transition: "all .15s",
                      letterSpacing: "0.02em",
                    }}>{tab.label}</button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Body */}
          {!loading && user && (
            <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>

              {activeTab === "profile" && (
                <div>
                  <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
                    {[
                      { label: user.role === "admin" ? "Admin" : user.isPremium ? "Premium" : "Free", color: user.role === "admin" ? "#a78bfa" : user.isPremium ? "#fbbf24" : "#94a3b8", bg: user.role === "admin" ? "rgba(139,92,246,.15)" : user.isPremium ? "rgba(245,158,11,.12)" : "rgba(148,163,184,.08)" },
                      ...(user.isBanned ? [{ label: "Banido", color: "#f87171", bg: "rgba(239,68,68,.12)" }] : []),
                    ].map(({ label, color, bg }) => (
                      <span key={label} style={{
                        fontSize: 10, padding: "4px 12px", borderRadius: 99,
                        background: bg, color, fontWeight: 700,
                        letterSpacing: "0.06em", textTransform: "uppercase",
                        fontFamily: "'DM Mono', monospace",
                        border: `1px solid ${color}30`,
                      }}>{label}</span>
                    ))}
                  </div>

                  <StatRow label="Provider" value={user.provider || "local"} />
                  <StatRow label="Membro desde" value={fmtDate(user.createdAt)} />
                  <StatRow label="Nível" value={user.level ?? 1} accent="#a78bfa" />
                  <StatRow label="Pontos" value={user.points ?? 0} accent="#fbbf24" />
                  <StatRow label="Banido" value={user.isBanned ? "Sim" : "Não"} accent={user.isBanned ? "#f87171" : "#4ade80"} />
                  {user.isBanned && user.bannedReason && (
                    <StatRow label="Motivo do Banimento" value={user.bannedReason} accent="#f87171" />
                  )}
                  {user.premiumExpiresAt && (
                    <StatRow label="Premium expira" value={fmtDate(user.premiumExpiresAt)} accent="#fbbf24" />
                  )}
                </div>
              )}

              {activeTab === "usage" && (
                <div>
                  {[
                    { label: "Pedidos de Texto Hoje", value: user.usage?.dailyTextRequests ?? 0, limit: user.limits?.textLimit, color: "#8b5cf6" },
                    { label: "Imagens Geradas Hoje", value: user.usage?.dailyImageGenerations ?? 0, limit: user.limits?.imageLimit, color: "#f59e0b" },
                    { label: "Análises de Imagem Hoje", value: user.usage?.dailyImageAnalysis ?? 0, limit: user.limits?.analysisLimit, color: "#22d3ee" },
                  ].map(({ label, value, limit, color }) => {
                    const pct = limit ? Math.min(100, Math.round((value / limit) * 100)) : 0;
                    return (
                      <div key={label} style={{ marginBottom: 22 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                          <span style={{ fontSize: 12, color: "rgba(255,255,255,.4)", fontWeight: 500 }}>{label}</span>
                          <span style={{ fontSize: 12, fontFamily: "'DM Mono', monospace", color: "rgba(255,255,255,.6)" }}>
                            {value} / {limit ?? "∞"}
                          </span>
                        </div>
                        <div style={{ height: 5, background: "rgba(255,255,255,.06)", borderRadius: 99, overflow: "hidden" }}>
                          <div style={{
                            height: "100%", width: `${pct}%`,
                            background: `linear-gradient(90deg, ${color}80, ${color})`,
                            borderRadius: 99, transition: "width .6s ease",
                          }} />
                        </div>
                      </div>
                    );
                  })}

                  <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,.05)" }}>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,.2)", marginBottom: 14, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                      Limites Configurados
                    </div>
                    <StatRow label="Limite de Texto" value={user.limits?.textLimit ?? 7} accent="#8b5cf6" />
                    <StatRow label="Limite de Imagens" value={user.limits?.imageLimit ?? 2} accent="#f59e0b" />
                    <StatRow label="Limite de Análise" value={user.limits?.analysisLimit ?? 3} accent="#22d3ee" />
                  </div>
                </div>
              )}

              {activeTab === "logs" && (
                <div>
                  {logs.length === 0 ? (
                    <div style={{ textAlign: "center", color: "rgba(255,255,255,.2)", fontSize: 13, padding: "40px 0" }}>
                      Sem registos para este utilizador
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                      {logs.map((log, i) => (
                        <div key={log._id} style={{
                          padding: "12px 0",
                          borderBottom: i < logs.length - 1 ? "1px solid rgba(255,255,255,.04)" : "none",
                          display: "flex", gap: 12, alignItems: "flex-start",
                        }}>
                          <div style={{
                            width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
                            background: dotColor(log), marginTop: 4,
                            boxShadow: `0 0 6px ${dotColor(log)}80`,
                          }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, color: "#e2e8f0", fontWeight: 500, marginBottom: 3 }}>
                              {log.action}
                            </div>
                            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                              <span style={{ fontSize: 10, color: "rgba(255,255,255,.25)", fontFamily: "'DM Mono', monospace" }}>
                                {log.route}
                              </span>
                              <span style={{ fontSize: 10, color: "rgba(255,255,255,.2)" }}>
                                {timeAgo(log.createdAt)}
                              </span>
                              {log.tokensUsed > 0 && (
                                <span style={{ fontSize: 10, color: "#4ade80", fontFamily: "'DM Mono', monospace" }}>
                                  {log.tokensUsed} tokens
                                </span>
                              )}
                            </div>
                            {log.error && (
                              <div style={{ fontSize: 11, color: "#f87171", marginTop: 4 }}>{log.error}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}