import { useState, useEffect } from "react";

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

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

const TYPE_CONFIG = {
  "final-dish": { label: "Prato Final",   color: "#f59e0b", emoji: "🍽️" },
  "step":        { label: "Passo",         color: "#8b5cf6", emoji: "👨‍🍳" },
  "ingredients": { label: "Ingredientes", color: "#10b981", emoji: "🥘" },
  "recipe":      { label: "Receita",       color: "#38bdf8", emoji: "📋" },
};

function Spinner() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 60 }}>
      <div style={{
        width: 22, height: 22,
        border: "2px solid rgba(139,92,246,.15)",
        borderTopColor: "#8b5cf6", borderRadius: "50%",
        animation: "spin .65s linear infinite",
      }} />
    </div>
  );
}

function StatCard({ label, value, sub, subColor = "#4ade80", accent = "#8b5cf6", icon }) {
  return (
    <div style={{
      background: "#0d1117",
      border: "1px solid rgba(255,255,255,.06)",
      borderRadius: 14, padding: "20px 22px",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, ${accent}60, transparent)`,
      }} />
      <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginBottom: 8, fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" }}>
        {icon && <span style={{ marginRight: 6 }}>{icon}</span>}{label}
      </div>
      <div style={{ fontSize: 30, fontWeight: 700, color: "#f8fafc", lineHeight: 1, fontFamily: "'DM Mono', monospace" }}>{value ?? "—"}</div>
      {sub && <div style={{ fontSize: 11, color: subColor, marginTop: 8, fontWeight: 500 }}>{sub}</div>}
    </div>
  );
}

export default function ImageCacheStats({ toast }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  async function load() {
    setLoading(true);
    try {
      const r = await apiFetch("/admin/image-cache");
      setData(r.data);
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id) {
    setDeletingId(id);
    try {
      await apiFetch(`/admin/image-cache/${id}`, { method: "DELETE" });
      toast("Entrada removida do cache", "success");
      load();
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleClearAll() {
    if (!confirm("Apagar TODO o cache de imagens? Esta ação é irreversível.")) return;
    setClearing(true);
    try {
      const r = await apiFetch("/admin/image-cache", { method: "DELETE" });
      toast(r.message, "success");
      load();
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setClearing(false);
    }
  }

  if (loading) return <Spinner />;
  if (!data) return null;

  const { total, totalReusos, estimatedSavingsUSD, byType, topHits, recentSaved } = data;
  const hitRate = total > 0 ? Math.round((totalReusos / (totalReusos + total)) * 100) : 0;

  const tabs = [
    { id: "overview",  label: "Visão Geral" },
    { id: "top",       label: `Top Reutilizados (${topHits?.length ?? 0})` },
    { id: "recent",    label: "Recentes" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, fontFamily: "'DM Sans', sans-serif" }}>

      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", margin: 0 }}>Cache de Imagens</h2>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,.3)", marginTop: 4 }}>
            Imagens reutilizadas evitam chamadas desnecessárias à OpenAI
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={load} style={{
            padding: "8px 16px", borderRadius: 9,
            border: "1px solid rgba(255,255,255,.1)",
            background: "rgba(255,255,255,.04)", color: "#94a3b8",
            cursor: "pointer", fontSize: 12, fontWeight: 600,
          }}>↻ Atualizar</button>
          <button onClick={handleClearAll} disabled={clearing || total === 0} style={{
            padding: "8px 16px", borderRadius: 9,
            border: "1px solid rgba(239,68,68,.3)",
            background: "rgba(239,68,68,.08)", color: "#f87171",
            cursor: clearing || total === 0 ? "not-allowed" : "pointer",
            fontSize: 12, fontWeight: 600, opacity: total === 0 ? 0.4 : 1,
          }}>{clearing ? "A limpar..." : "🗑 Limpar Cache"}</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        <StatCard
          label="Imagens em Cache"
          value={total}
          sub="URLs permanentes guardadas"
          accent="#8b5cf6"
          icon="🗄️"
        />
        <StatCard
          label="Total de Reusos"
          value={totalReusos}
          sub="Chamadas à OpenAI evitadas"
          subColor="#38bdf8"
          accent="#38bdf8"
          icon="♻️"
        />
        <StatCard
          label="Poupança Estimada"
          value={`$${estimatedSavingsUSD}`}
          sub="~$0.04 por imagem gerada"
          subColor="#4ade80"
          accent="#10b981"
          icon="💰"
        />
        <StatCard
          label="Taxa de Cache Hit"
          value={`${hitRate}%`}
          sub={hitRate >= 50 ? "Eficiência excelente" : hitRate >= 20 ? "A crescer" : "Cache ainda jovem"}
          subColor={hitRate >= 50 ? "#4ade80" : hitRate >= 20 ? "#fbbf24" : "#94a3b8"}
          accent={hitRate >= 50 ? "#10b981" : "#f59e0b"}
          icon="📊"
        />
      </div>

      {/* Por Tipo */}
      {byType && byType.length > 0 && (
        <div style={{
          background: "#0d1117", border: "1px solid rgba(255,255,255,.06)",
          borderRadius: 14, padding: "20px 24px",
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,.25)", marginBottom: 18 }}>
            Distribuição por Tipo
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {byType.map(({ _id, count, totalHits: hits, avgHits }) => {
              const cfg = TYPE_CONFIG[_id] || { label: _id, color: "#94a3b8", emoji: "📁" };
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={_id}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 600, display: "flex", alignItems: "center", gap: 7 }}>
                      <span>{cfg.emoji}</span> {cfg.label}
                    </span>
                    <div style={{ display: "flex", gap: 20, fontSize: 11, fontFamily: "'DM Mono', monospace" }}>
                      <span style={{ color: "rgba(255,255,255,.4)" }}>{count} imagens</span>
                      <span style={{ color: cfg.color }}>{hits} reusos</span>
                      <span style={{ color: "rgba(255,255,255,.3)" }}>avg {avgHits?.toFixed(1)}x</span>
                    </div>
                  </div>
                  <div style={{ height: 5, background: "rgba(255,255,255,.05)", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", width: `${pct}%`,
                      background: `linear-gradient(90deg, ${cfg.color}80, ${cfg.color})`,
                      borderRadius: 99, transition: "width .8s cubic-bezier(.4,0,.2,1)",
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{
        background: "#0d1117", border: "1px solid rgba(255,255,255,.06)",
        borderRadius: 14, overflow: "hidden",
      }}>
        {/* Tab Bar */}
        <div style={{
          display: "flex", borderBottom: "1px solid rgba(255,255,255,.05)",
          padding: "0 20px",
        }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              padding: "14px 16px", background: "none", border: "none",
              borderBottom: activeTab === tab.id ? "2px solid #8b5cf6" : "2px solid transparent",
              color: activeTab === tab.id ? "#a78bfa" : "rgba(255,255,255,.35)",
              cursor: "pointer", fontSize: 12, fontWeight: 600,
              marginBottom: -1, transition: "all .15s",
            }}>{tab.label}</button>
          ))}
        </div>

        {/* Tab: Overview */}
        {activeTab === "overview" && (
          <div style={{ padding: "20px 24px" }}>
            {total === 0 ? (
              <div style={{ textAlign: "center", color: "rgba(255,255,255,.2)", padding: "40px 0", fontSize: 13 }}>
                Ainda não há imagens em cache.<br />
                <span style={{ fontSize: 11, marginTop: 8, display: "block" }}>
                  As imagens serão cacheadas automaticamente após a primeira geração.
                </span>
              </div>
            ) : (
              <div style={{ color: "rgba(255,255,255,.5)", fontSize: 13, lineHeight: 1.8 }}>
                O sistema tem <strong style={{ color: "#a78bfa" }}>{total} imagens</strong> guardadas em cache,
                que foram reutilizadas <strong style={{ color: "#38bdf8" }}>{totalReusos} vezes</strong>,
                evitando chamadas desnecessárias à OpenAI e poupando aproximadamente{" "}
                <strong style={{ color: "#4ade80" }}>${estimatedSavingsUSD}</strong>.
              </div>
            )}
          </div>
        )}

        {/* Tab: Top Reutilizados */}
        {activeTab === "top" && (
          <div>
            {!topHits || topHits.length === 0 ? (
              <div style={{ textAlign: "center", color: "rgba(255,255,255,.2)", padding: "40px 0", fontSize: 13 }}>
                Ainda sem dados de reutilização.
              </div>
            ) : topHits.map((item, i) => {
              const cfg = TYPE_CONFIG[item.imageType] || { label: item.imageType, color: "#94a3b8", emoji: "📁" };
              return (
                <div key={item._id} style={{
                  display: "grid",
                  gridTemplateColumns: "36px 1fr 100px 80px 80px",
                  alignItems: "center", gap: 16,
                  padding: "14px 24px",
                  borderBottom: i < topHits.length - 1 ? "1px solid rgba(255,255,255,.04)" : "none",
                }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.02)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  {/* Rank */}
                  <span style={{
                    fontSize: 13, fontWeight: 700, color: i < 3 ? "#f59e0b" : "rgba(255,255,255,.2)",
                    fontFamily: "'DM Mono', monospace",
                  }}>#{i + 1}</span>

                  {/* Prompt + thumbnail */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt="" style={{
                        width: 40, height: 40, borderRadius: 8, objectFit: "cover",
                        border: "1px solid rgba(255,255,255,.08)", flexShrink: 0,
                      }} onError={e => e.target.style.display = "none"} />
                    )}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12, color: "#e2e8f0", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item.prompt?.substring(0, 70)}
                        {item.prompt?.length > 70 ? "…" : ""}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                        <span style={{ fontSize: 10 }}>{cfg.emoji}</span>
                        <span style={{ fontSize: 10, color: cfg.color, fontWeight: 600 }}>{cfg.label}</span>
                      </div>
                    </div>
                  </div>

                  {/* Hit count */}
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#4ade80", fontFamily: "'DM Mono', monospace" }}>{item.hitCount}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,.25)" }}>reusos</div>
                  </div>

                  {/* Last used */}
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,.3)", fontFamily: "'DM Mono', monospace", textAlign: "center" }}>
                    {timeAgo(item.lastUsedAt)} atrás
                  </span>

                  {/* Delete */}
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <button
                      onClick={() => handleDelete(item._id)}
                      disabled={deletingId === item._id}
                      style={{
                        padding: "5px 10px", borderRadius: 7,
                        border: "1px solid rgba(239,68,68,.25)",
                        background: "rgba(239,68,68,.07)", color: "#f87171",
                        cursor: "pointer", fontSize: 11, fontWeight: 600,
                        opacity: deletingId === item._id ? 0.5 : 1,
                      }}
                    >{deletingId === item._id ? "..." : "Remover"}</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab: Recentes */}
        {activeTab === "recent" && (
          <div>
            {!recentSaved || recentSaved.length === 0 ? (
              <div style={{ textAlign: "center", color: "rgba(255,255,255,.2)", padding: "40px 0", fontSize: 13 }}>
                Ainda não há imagens recentes.
              </div>
            ) : recentSaved.map((item, i) => {
              const cfg = TYPE_CONFIG[item.imageType] || { label: item.imageType, color: "#94a3b8", emoji: "📁" };
              return (
                <div key={item._id} style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 100px 80px 80px",
                  alignItems: "center", gap: 16,
                  padding: "14px 24px",
                  borderBottom: i < recentSaved.length - 1 ? "1px solid rgba(255,255,255,.04)" : "none",
                }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.02)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt="" style={{
                        width: 40, height: 40, borderRadius: 8, objectFit: "cover",
                        border: "1px solid rgba(255,255,255,.08)", flexShrink: 0,
                      }} onError={e => e.target.style.display = "none"} />
                    )}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12, color: "#e2e8f0", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item.prompt?.substring(0, 70)}{item.prompt?.length > 70 ? "…" : ""}
                      </div>
                      <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 3 }}>
                        <span style={{ fontSize: 10 }}>{cfg.emoji}</span>
                        <span style={{ fontSize: 10, color: cfg.color, fontWeight: 600 }}>{cfg.label}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#a78bfa", fontFamily: "'DM Mono', monospace" }}>{item.hitCount}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,.25)" }}>reusos</div>
                  </div>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,.3)", fontFamily: "'DM Mono', monospace", textAlign: "center" }}>
                    {timeAgo(item.createdAt)} atrás
                  </span>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <button
                      onClick={() => handleDelete(item._id)}
                      disabled={deletingId === item._id}
                      style={{
                        padding: "5px 10px", borderRadius: 7,
                        border: "1px solid rgba(239,68,68,.25)",
                        background: "rgba(239,68,68,.07)", color: "#f87171",
                        cursor: "pointer", fontSize: 11, fontWeight: 600,
                        opacity: deletingId === item._id ? 0.5 : 1,
                      }}
                    >{deletingId === item._id ? "..." : "Remover"}</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}